/**
 * @file SketchFabAPI.tsx
 * @fileoverview Client component which renders the 3D models and annotations.
 * 
 * @todo extract stand alone functions
 */

"use client"

// Typical imports
import { useEffect, useState, useRef, Ref, createContext } from 'react'
import { annotations, model, model_annotation, text_annotation, video_annotation } from '@prisma/client'
import { fullAnnotation, GbifImageResponse, GbifResponse } from '@/interface/interface'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { annotationSwitchListener, annotationSwitchMobileListener, handleSrcForPhotoAnnotation, initializeAnnotations, initializeExhibit, isAnnotationParamValid, replaceAnnotationNumberInPath, resizeEventHandler } from '@/functions/client/collections'

// Default imports
import AnnotationModal from '@/components/Collections/AnnotationModal'
import Vertebrates from '@/classes/HerbariumClass'
import FirstAnnotation from './3dExhibit/FirstAnnotation'
import PhotoAnnotation from './3dExhibit/PhotoAnnotation'
import VideoAnnotation from './3dExhibit/VideoAnnotation'
import ModelAnnotation from './3dExhibit/ModelAnnotation'
import TextAnnotation from '@/components/Collections/3dExhibit/TextAnnotation'

export interface collectionsContext {
  state: CollectionState,
  props: CollectionsProps,
}

export interface CollectionState {
  s: Vertebrates | undefined // s = specimen
  annotations: fullAnnotation[] | undefined
  api: any
  index: number | null
  mobileIndex: number | null
  imgSrc: string | null
  annotationTitle: string
  imgLoading: boolean
  imgHeight: number | undefined
  imgWidth: number | undefined
  imgGtRect: boolean
  imgHeightGtRect: boolean
  imgWidthGtRect: boolean
  urlChange: boolean
}

export interface CollectionsProps {
  gMatch: {
    hasInfo: boolean
    data?: GbifResponse
  }
  model: model,
  images: GbifImageResponse[]
  imageTitle: string
  numberOfAnnotations: number
  annotations: annotations[]
}

export const CollectionsContext = createContext<collectionsContext | null>(null)

// Main JSX
export default function Collection(props: CollectionsProps) {

  // Get path, router, params
  const path = usePathname()
  const router = useRouter()
  const params = useSearchParams()

  // Get and validate annotation url param
  const annotationParam = params.get('annotation')
  const annotationNumberParam = annotationParam && isAnnotationParamValid(annotationParam, props.numberOfAnnotations) ? annotationParam : undefined

  // Determine if url param is a model annotation
  const isModelParam = annotationNumberParam && props.annotations.find(annotation => annotation.annotation_no === parseInt(annotationNumberParam))?.annotation_type === 'model' ? true : false

  // Variable Declarations
  const gMatch = props.gMatch.data as GbifResponse

  // State
  const [collectionState, setCollectionState] = useState<CollectionState>({
    s: undefined, // s = specimen
    annotations: undefined,
    api: undefined,
    index: null,
    mobileIndex: null,
    imgSrc: null,
    annotationTitle: '',
    imgLoading: false,
    imgHeight: undefined,
    imgWidth: undefined,
    imgGtRect: false,
    imgHeightGtRect: false,
    imgWidthGtRect: false,
    urlChange: false
  })

  // Refs
  const sRef = useRef<Vertebrates>(undefined)
  const modelViewer = useRef<HTMLIFrameElement>(undefined)
  const collectionsDiv = useRef<HTMLDivElement>(undefined)
  const annotationDiv = useRef<HTMLDivElement>(undefined)

  // Sketchfab viewer mobile success object
  const successObj = {
    success: (api: any) => {
      api.start()
      api.addEventListener('viewerready', () => setCollectionState(prev => ({ ...prev, api: api })))
    },
    error: () => { },
    ui_stop: 0,
    ui_infos: 0,
    ui_inspector: 0,
    ui_settings: 0,
    ui_watermark: 0,
    ui_annotations: 0,
    ui_color: "004C46",
    ui_fadeout: 0,
    orbit_constraint_zoom_in: props.model.max_zoom_in ?? 1,
    orbit_constraint_zoom_out: props.model.max_zoom_out ?? 30
  }

  // Sketchfab viewer desktop success object
  const successObjDesktop = { ...successObj, annotation: 1, ui_fadeout: 1 }
  if (isModelParam) Object.assign(successObj, { annotation: parseInt(annotationNumberParam as string) })

  // Context value
  const value = { state: collectionState, props: { ...props } }

  // Annotation switch event listener wrappers
  const annotationSwitchListenerWrapper = (event: Event) => annotationSwitchListener(event, modelViewer, annotationDiv, collectionState.api, collectionState.annotations)
  const annotationSwitchMobileListenerWrapper = (event: Event) => annotationSwitchMobileListener(event, modelViewer, annotationDiv, collectionState.api, collectionState.annotations)

  // Window resize event handler wrapper
  const resizeEventHandlerWrapper = () => resizeEventHandler(collectionsDiv, collectionState, setCollectionState)

  // Effect chain initializes exhibit, then annotations and various listeners
  useEffect(() => { initializeExhibit(props, modelViewer, successObj, successObjDesktop, setCollectionState, sRef) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => initializeAnnotations(collectionState, setCollectionState, annotationSwitchListenerWrapper, annotationSwitchMobileListenerWrapper, params, path, router, annotationNumberParam),
    [collectionState.api, collectionState.annotations, collectionState.s])

  // Set imgSrc if necessary upon selection of a new annotaion
  useEffect(() => { handleSrcForPhotoAnnotation(collectionState, setCollectionState, collectionsDiv) }, [collectionState.index]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle window resize wrt annotation div for photo annotations
  useEffect(() => {
    window.addEventListener('resize', resizeEventHandlerWrapper)
    return () => window.removeEventListener('resize', resizeEventHandlerWrapper)
  }, [collectionState.imgWidth])

  // Replace annotation number in path when index changes
  useEffect(() => { if (collectionState.index) replaceAnnotationNumberInPath(collectionState.index + 1, params, path, router) }, [collectionState.index]) // eslint-disable-line react-hooks/exhaustive-deps

  return <CollectionsContext.Provider value={value}>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
    <title>{`${props.model.spec_name} 3D Model`}</title>

    {collectionState.s && <AnnotationModal {...props} title={collectionState.annotationTitle} index={collectionState.mobileIndex} specimen={collectionState.s} imgLoading={collectionState.imgLoading} imgSrc={collectionState.imgSrc} />}

    <div id="iframeDiv" ref={collectionsDiv as Ref<HTMLDivElement>} className="flex bg-black m-auto min-h-[150px]" style={{ height: "100%", width: "100%" }}>

      <iframe
        src={props.model.uid}
        frameBorder="0"
        id="model-viewer"
        title={"Model Viewer for " + ''}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        xr-spatial-tracking="true"
        execution-while-out-of-viewport="true"
        execution-while-not-rendered="true"
        web-share="true"
        allowFullScreen
        style={{ width: "60%", transition: "width 1.5s", zIndex: "2" }}
        ref={modelViewer as Ref<HTMLIFrameElement>} />

      {
        collectionState.s && collectionState.annotations &&
        <div id="annotationDiv"
          ref={annotationDiv as Ref<HTMLDivElement>}
          style={{ width: "40%", backgroundColor: "black", transition: "width 1.5s", color: "#F5F3E7", zIndex: "1", overflowY: "auto", overflowX: "hidden" }}>
          {collectionState.index === 0 && <FirstAnnotation gMatch={gMatch} s={collectionState.s} />}
          {!!collectionState.index && collectionState.annotations[collectionState.index - 1].annotation_type === 'photo' && <PhotoAnnotation />}
          {!!collectionState.index && collectionState.annotations[collectionState.index - 1].annotation_type === 'video' && <VideoAnnotation videoAnnotation={collectionState.annotations[collectionState.index - 1].annotation as video_annotation} />}
          {!!collectionState.index && collectionState.annotations[collectionState.index - 1].annotation_type === 'model' && <ModelAnnotation modelAnnotation={collectionState.annotations[collectionState.index - 1].annotation as model_annotation} />}
          {!!collectionState.index && collectionState.annotations[collectionState.index - 1].annotation_type === 'text' && <TextAnnotation textAnnotation={collectionState.annotations[collectionState.index - 1].annotation as text_annotation} />}
        </div>
      }

    </div>
  </CollectionsContext.Provider>
}
