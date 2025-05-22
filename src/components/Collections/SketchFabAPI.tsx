/**
 * @file SketchFabAPI.tsx
 * @fileoverview Client component which renders the 3D models and annotations.
 * 
 * @todo extract stand alone functions
 */

"use client"

// Typical imports
import { useEffect, useState, useRef, LegacyRef } from 'react'
import { model, model_annotation, video_annotation } from '@prisma/client'
import { fullAnnotation, GbifImageResponse, GbifResponse } from '@/interface/interface'
import { setViewerWidth, annotationControl } from './SketchfabDom'
import { useSearchParams } from 'next/navigation'

// Default imports
import AnnotationModal from '@/components/Collections/AnnotationModal'
import Sketchfab from '@sketchfab/viewer-api'
import Vertebrates from '@/classes/HerbariumClass'
import FirstAnnotation from './3dExhibit/FirstAnnotation'
import PhotoAnnotation from './3dExhibit/PhotoAnnotation'
import VideoAnnotation from './3dExhibit/VideoAnnotation'
import ModelAnnotation from './3dExhibit/ModelAnnotation'

// Main JSX
export default function SFAPI(props: { gMatch: { hasInfo: boolean; data?: GbifResponse }, model: model, images: GbifImageResponse[], imageTitle: string }) {

  // Variable Declarations
  const gMatch = props.gMatch.data as GbifResponse
  const searchParams = useSearchParams()
  const annotationUid = searchParams.get('annotation')

  // States
  const [s, setS] = useState<Vertebrates>() // s = specimen due to constant repetition
  const [annotations, setAnnotations] = useState<fullAnnotation[]>()
  const [api, setApi] = useState<any>()
  const [index, setIndex] = useState<number | null>(null)
  const [mobileIndex, setMobileIndex] = useState<number | null>(null)
  const [imgSrc, setImgSrc] = useState<string>()
  const [annotationTitle, setAnnotationTitle] = useState("")
  const [imgLoading, setImgLoading] = useState(false)

  // Refs
  const sRef = useRef<Vertebrates>()
  const modelViewer = useRef<HTMLIFrameElement>()
  const annotationDiv = useRef<HTMLDivElement>()

  // Get switches - should probably update this to refs
  const annotationSwitch = document.getElementById("annotationSwitch")
  const annotationSwitchMobile = document.getElementById("annotationSwitchMobileHidden")

  // Sketchfab viewer mobile success object
  const successObj = {
    success: (api: any) => {
      api.start()
      api.addEventListener('viewerready', () => setApi(api))
    },
    error: () => { },
    ui_stop: 0,
    ui_infos: 0,
    ui_inspector: 0,
    ui_settings: 0,
    ui_watermark: 0,
    ui_annotations: 0,
    ui_color: "004C46",
    ui_fadeout: 0
  }

  // Sketchfab viewer desktop success object
  const successObjDesktop = { ...successObj, annotation: 1, ui_fadeout: 1 }

  // Annotation switch event listener
  const annotationSwitchListener = (event: Event) => {
    setViewerWidth(modelViewer.current, annotationDiv.current, (event.target as HTMLInputElement).checked)
    annotationControl(api, annotations, (event.target as HTMLInputElement).checked)
  }

  // Annotation switch mobile event listener
  const annotationSwitchMobileListener = (event: Event) => {
    setViewerWidth(modelViewer, annotationDiv, (event.target as HTMLInputElement).checked)
    annotationControl(api, annotations, (event.target as HTMLInputElement).checked)
  }

  // This effect initializes the sketchfab client and instantiates the specimen:Vertebrates object; it also ensures the page begins from the top upon load
  useEffect(() => {
    const sketchFabLink = props.model.uid
    const client = new Sketchfab(modelViewer.current)

    // Choose initialization success object based on screen size
    if (window.matchMedia('(max-width: 1023.5px)').matches || window.matchMedia('(orientation: portrait)').matches) client.init(sketchFabLink, successObj)
    else client.init(sketchFabLink, successObjDesktop)

    // Instantiate/set vertebrates and set annotations
    const instantiateExhibit = async () => {
      sRef.current = await Vertebrates.model(props.gMatch.data?.usageKey as number, props.model, props.images, props.imageTitle)
      setS(sRef.current)
      setAnnotations(sRef.current.annotations.annotations)
    }

    instantiateExhibit()
    document.body.scrollTop = document.documentElement.scrollTop = 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This effect implements any databased annotations and adds annotationSwitch event listeners and sets related mobile states
  useEffect(() => {

    if (s && annotations && api) {

      // Create and go to the first annotation if it exists
      if (s.model.annotationPosition) {
        const position = JSON.parse(s.model.annotationPosition)
        api.createAnnotationFromScenePosition(position[0], position[1], position[2], 'Taxonomy and Description', '', (err: any, index: any) => {
          if (!annotationUid) api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false }, function (err: any, index: any) { })
        })

        // Create any futher annotations that exist
        for (let i = 0; i < annotations.length; i++) {
          if (annotations[i].position) {
            const position = JSON.parse(annotations[i].position as string)
            api.createAnnotationFromScenePosition(position[0], position[1], position[2], `${annotations[i].title}`, '', (err: any, index: any) => { })
          }
        }
      }

      if (annotationUid) {
        const annotation = annotations.find(annotation => annotation.annotation_type === 'model' && (annotation.annotation as model_annotation).uid === annotationUid)
        if (annotation) api.gotoAnnotation(annotation.annotation_no - 1, { preventCameraAnimation: true, preventCameraMove: false }, function (err: any, index: any) { })
        else api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false }, function (err: any, index: any) { })
      }

      // Get annotationList/add event listeners
      (annotationSwitch as HTMLInputElement).addEventListener("change", annotationSwitchListener);
      (annotationSwitchMobile as HTMLInputElement).addEventListener("change", annotationSwitchMobileListener)


      // Set index when an annotation is selected
      api.addEventListener('annotationSelect', function (index: number) {

        const mediaQueryWidth = window.matchMedia('(max-width: 1023.5px)')
        const mediaQueryOrientation = window.matchMedia('(orientation: portrait)')

        // this event is still triggered even when an annotation is not selected; an index of -1 is returned
        if (index != -1) setIndex(index)

        // Mobile annotation state management
        if (index != -1 && mediaQueryWidth.matches || index != -1 && mediaQueryOrientation.matches) {
          document.getElementById("annotationButton")?.click()

          api.getAnnotation(index, function (err: any, information: any) {
            if (!err) {
              setAnnotationTitle(information.name)
              setMobileIndex(index)
            }
          })
        }
      })
    }
  }, [api, annotations, s])

  const setPhotoUrl = async (path: string) => {
    setImgLoading(true)
    
    await fetch(path)
      .then(res => {
        if (!res.ok) setImgSrc('/noImage.png')
        else return res.blob()
      })
      .then(blob => {
        setImgSrc(URL.createObjectURL(blob as Blob))
        setImgLoading(false)
      })
  }

  // This effect sets the imgSrc if necessary upon change of annotation index
  useEffect(() => {
    if (!!index && annotations && annotations[index - 1].annotation_type == 'photo') {
      const path = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'X:' + (annotations[index - 1].url as string).slice(5) : 'public' + (annotations[index - 1].url as string)
      setPhotoUrl(`/api/nfs?path=${path}`)
    }

  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  return <>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>

    {s && <AnnotationModal {...props} title={annotationTitle} index={mobileIndex} specimen={s} />}

    <div id="iframeDiv" className="flex bg-black m-auto min-h-[150px]" style={{ height: "100%", width: "100%" }}>

      <iframe src={props.model.uid} frameBorder="0" id="model-viewer" title={"Model Viewer for " + ''}
        allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking="true"
        execution-while-out-of-viewport="true" execution-while-not-rendered="true" web-share="true"
        allowFullScreen
        style={{ width: "60%", transition: "width 1.5s", zIndex: "2" }}
        ref={modelViewer as LegacyRef<HTMLIFrameElement>} />

      {
        s && annotations &&
        <div id="annotationDiv" ref={annotationDiv as LegacyRef<HTMLDivElement>} style={{ width: "40%", backgroundColor: "black", transition: "width 1.5s", color: "#F5F3E7", zIndex: "1", overflowY: "auto", overflowX: "hidden" }}>
          {index === 0 && <FirstAnnotation gMatch={gMatch} s={s} />}
          {!!index && annotations[index - 1].annotation_type === 'photo' && <PhotoAnnotation annotation={annotations[index - 1]} imgSrc={imgSrc as string} imgLoading={imgLoading} />}
          {!!index && annotations[index - 1].annotation_type === 'video' && <VideoAnnotation videoAnnotation={annotations[index - 1].annotation as video_annotation} />}
          {!!index && annotations[index - 1].annotation_type === 'model' && <ModelAnnotation modelAnnotation={annotations[index - 1].annotation as model_annotation} />}
        </div>
      }

    </div>
  </>
}
