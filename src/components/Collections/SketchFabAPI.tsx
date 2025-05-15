/**
 * @file SketchFabAPI.tsx
 * @fileoverview Client component which renders the 3D models and annotations.
 * 
 * @todo extract jsx sections as individual components
 * @todo extract stand alone functions
 */
"use client"

// Typical imports
import { useEffect, useState, useRef, LegacyRef } from 'react'
import { toUpperFirstLetter } from '@/functions/utils/toUpperFirstLetter'
import { model, model_annotation, photo_annotation } from '@prisma/client'
import { fullAnnotation, GbifImageResponse, GbifResponse } from '@/interface/interface'
import { setViewerWidth, annotationControl, boolRinse, addCommas, arrayFromObjects } from './SketchfabDom'
import { useSearchParams } from 'next/navigation'

// Default imports
import AnnotationModal from '@/components/Collections/AnnotationModal'
import Sketchfab from '@sketchfab/viewer-api'
import ModelAnnotation from './AnnotationModel'
import Vertebrates from '@/classes/HerbariumClass'

export default function SFAPI(props: { gMatch: { hasInfo: boolean; data?: GbifResponse }, model: model, images: GbifImageResponse[], imageTitle: string }){

  // Variable Declarations
  const gMatch = props.gMatch.data as GbifResponse
  const searchParams = useSearchParams()
  const annotationUid = searchParams.get('annotation')

  // States
  const [s, setS] = useState<Vertebrates>() // s = specimen due to constant repetition
  const [annotations, setAnnotations] = useState<fullAnnotation[]>()
  const [api, setApi] = useState<any>()
  const [index, setIndex] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState<number | null>(null);
  const [imgSrc, setImgSrc] = useState<string>()
  const [annotationTitle, setAnnotationTitle] = useState("")

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
      api.addEventListener('viewerready', () => {
        setApi(api)
      })
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
    const client = new Sketchfab(modelViewer.current);

    // Choose initialization success object based on screen size
    if (window.matchMedia('(max-width: 1023.5px)').matches || window.matchMedia('(orientation: portrait)').matches) {
      client.init(sketchFabLink, successObj)
    }
    else client.init(sketchFabLink, successObjDesktop)

    // Instantiate/set vertebrates and set annotations
    const instantiateVertebrates = async () => {
      sRef.current = await Vertebrates.model(props.gMatch.data?.usageKey as number, props.model, props.images, props.imageTitle)
      setS(sRef.current)
      setAnnotations(sRef.current.annotations.annotations)
    }

    instantiateVertebrates()

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
        if (index != -1) {
          setIndex(index);
        }

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

  // This effect sets the imgSrc if necessary upon change of annotation index
  useEffect(() => {

    if (!!index && annotations && annotations[index - 1].annotation_type == 'photo') {
      // const path = photoUrlPrefix(annotations[index - 1].url as string)
      const path = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'X:' + (annotations[index - 1].url as string).slice(5) : 'public' + (annotations[index - 1].url as string)
      setImgSrc(`/api/nfs?path=${path}`)
    }

  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>

      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>

      {s && <AnnotationModal {...props} title={annotationTitle} index={mobileIndex} specimen={s} />}

      <div id="iframeDiv" className="flex bg-black m-auto min-h-[150px]" style={{ height: "100%", width: "100%" }}>
        <iframe src={props.model.uid} frameBorder="0" id="model-viewer" title={"Model Viewer for " + ''}
          allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking="true"
          execution-while-out-of-viewport="true" execution-while-not-rendered="true" web-share="true"
          allowFullScreen
          style={{ width: "60%", transition: "width 1.5s", zIndex: "2" }}
          ref={modelViewer as LegacyRef<HTMLIFrameElement>}
        />

        {s && annotations &&
          <>
            <div id="annotationDiv" ref={annotationDiv as LegacyRef<HTMLDivElement>} style={{ width: "40%", backgroundColor: "black", transition: "width 1.5s", color: "#F5F3E7", zIndex: "1", overflowY: "auto", overflowX: "hidden" }}>

              {
                index === 0 &&

                <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
                  <div className='fade flex w-[99%] mt-[25px]'>
                    <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                      <p> Classification </p>
                    </div>
                    <div className='w-[65%] py-[20px] justify-center items-center text-center'>
                      <p>Species: <i><span className='text-[#FFC72C]'>{gMatch.species}</span></i></p>
                      <p>Kingdom: {gMatch.kingdom}</p>
                      <p>Phylum: {gMatch.phylum}</p>
                      <p>Order: {gMatch.order}</p>
                      <p>Family: {gMatch.family}</p>
                      <p>Genus: <i>{gMatch.genus}</i></p>
                    </div>
                  </div>

                  <div className='fade flex w-[99%] mt-[25px]'>
                    <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                      <p> Profile </p>
                    </div>
                    <div className='w-[65%] py-[20px] justify-center items-center text-center px-[2%]'>
                      {s.commonNames.length > 1 && !s.model.comm_name_string && <p>Common Names: {addCommas(s.commonNames)}</p>}
                      {s.commonNames.length === 1 && !s.model.comm_name_string && <p>Common Name: {s.commonNames[0]}</p>}
                      {s.model.comm_name_string && <p>Common Names: {s.model.comm_name_string}</p>}
                      {s.profile.extinct !== '' && <p>Extinct: {boolRinse(s.profile.extinct as string)}</p>}
                      {s.profile.habitat && !s.model.habitat_string && <p>Habitat: {toUpperFirstLetter(s.profile.habitat)}</p>}
                      {s.model.habitat_string && <p>Habitat: {toUpperFirstLetter(s.model.habitat_string)}</p>}
                      {s.profile.freshwater !== '' && <p>Freshwater: {boolRinse(s.profile.freshwater as string)}</p>}
                      {s.profile.marine !== '' && <p>Marine: {boolRinse(s.profile.marine as string)}</p>}
                    </div>
                  </div>

                  <div className='fade flex w-[99%] mt-[25px]'>
                    <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                      <p> 3D Model </p>
                    </div>
                    <div className='w-[65%] py-[20px] justify-center items-center text-center'>
                      <p>Build method: {s.model.build_process}</p>
                      <p>Created with: {arrayFromObjects(s.software)}</p>
                      <p>Modeler: {s.model.modeled_by}</p>
                      <p>Annotator: {s.getAnnotator()}</p>
                    </div>
                  </div>

                  <br></br>

                  {
                    s.wikiSummary &&
                    <>
                      <br></br>
                      <h1 className='fade text-center text-[1.5rem]'>Description</h1>
                      <p dangerouslySetInnerHTML={{ __html: s.wikiSummary.extract_html }} className='fade text-center pr-[1.5%] pl-[0.5%]'></p>
                      <br></br>
                      <p className='fade text-center text-[0.9rem]'>from <a href={s.wikiSummary.content_urls?.desktop?.page} target='_blank'><u>Wikipedia</u></a></p>
                    </>
                  }

                </div>
              }

              {
                !!index && annotations[index - 1].annotation_type === 'photo' &&
                <>
                  <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
                    <div className='w-full h-full text-center fade'>
                      <img key={Math.random()} className='fade center w-[98%] h-full pr-[2%] pt-[1%]'
                        src={imgSrc}
                        alt={`Image for annotation number ${annotations[index - 1].annotation_no}`}
                      >
                      </img>
                    </div>
                  </div>
                  <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: (annotations[index - 1].annotation as photo_annotation).annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                  </div>
                  <div id="annotationDivCitation">
                    <br></br>
                    <p className='fade text-center w-[95%]'>Photo by: {(annotations[index - 1].annotation as photo_annotation).author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{(annotations[index - 1].annotation as photo_annotation).license}</a></p>
                  </div>
                </>
              }

              {
                !!index && annotations[index - 1].annotation_type === 'video' && !annotations[index - 1].annotation.annotation &&
                <div className="w-full h-full" id="annotationDivVideo">
                  {/*@ts-ignore - align works on iframe just fine*/}
                  <iframe align='left' className='fade w-[calc(100%-15px)] h-full' src={annotations[index - 1].url}></iframe>
                </div>
              }

              {
                !!index && annotations[index - 1].annotation_type === 'video' && annotations[index - 1].annotation.annotation &&
                <>
                  <div className="w-full h-[65%]" id="annotationDivVideo">
                    {/*@ts-ignore - align works on iframe just fine*/}
                    <iframe align='left' className='fade w-[calc(100%-15px)] h-full' src={annotations[index - 1].url}></iframe>
                  </div>
                  <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: (annotations[index - 1].annotation as model_annotation).annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                  </div>
                </>
              }

              {
                !!index && annotations[index - 1].annotation_type === 'model' &&
                <>
                  <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
                    <ModelAnnotation uid={(annotations[index - 1].annotation as model_annotation).uid} />
                  </div>
                  <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: (annotations[index - 1].annotation as model_annotation).annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                  </div>
                  <div id="annotationDivCitation">
                    <br></br>
                    <p className='fade text-center w-[95%]'>Model by {(annotations[index - 1].annotation as model_annotation).modeler}</p>
                  </div>
                </>
              }

            </div>
          </>
        }
      </div>
    </>
  )
}
