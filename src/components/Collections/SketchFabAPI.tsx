/**
 * @file SketchFabAPI.tsx
 * @fileoverview Client component which renders the 3D models and annotations.
 * 
 * @todo extract stand alone functions
 */

"use client"

// Typical imports
import { useEffect, useState, useRef, Ref, createContext } from 'react'
import { model, model_annotation, video_annotation } from '@prisma/client'
import { fullAnnotation, GbifImageResponse, GbifResponse } from '@/interface/interface'
import { useSearchParams } from 'next/navigation'
import { annotationSwitchListener, annotationSwitchMobileListener, initializeAnnotations, initializeExhibit } from '@/functions/client/collections'

// Default imports
import AnnotationModal from '@/components/Collections/AnnotationModal'
import Vertebrates from '@/classes/HerbariumClass'
import FirstAnnotation from './3dExhibit/FirstAnnotation'
import PhotoAnnotation from './3dExhibit/PhotoAnnotation'
import VideoAnnotation from './3dExhibit/VideoAnnotation'
import ModelAnnotation from './3dExhibit/ModelAnnotation'

export interface collectionsContext {
  state: CollectionState,
  props: CollectionsProps,
}

export interface CollectionState {
  s: Vertebrates | undefined
  annotations: fullAnnotation[] | undefined
  api: any
  index: number | null
  mobileIndex: number | null
  imgSrc: string | null
  annotationTitle: string
  imgLoading: boolean
}

export interface CollectionsProps {
  gMatch: {
    hasInfo: boolean
    data?: GbifResponse
  }
  model: model,
  images: GbifImageResponse[]
  imageTitle: string
}

export const CollectionsContext = createContext<collectionsContext | null>(null)

// Main JSX
export default function SFAPI(props: CollectionsProps) {

  // Variable Declarations
  const gMatch = props.gMatch.data as GbifResponse
  const searchParams = useSearchParams()
  const annotationUid = searchParams.get('annotation')

  // Collections state object
  const [collectionState, setCollectionState] = useState<CollectionState>({
    s: undefined,
    annotations: undefined,
    api: undefined,
    index: null,
    mobileIndex: null,
    imgSrc: null,
    annotationTitle: '',
    imgLoading: false
  })

  // Refs
  const sRef = useRef<Vertebrates>(undefined)
  const modelViewer = useRef<HTMLIFrameElement>(undefined)
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
    ui_fadeout: 0
  }

  // Sketchfab viewer desktop success object
  const successObjDesktop = { ...successObj, annotation: 1, ui_fadeout: 1 }

  // Context value
  const value = { state: collectionState, props: { ...props } }

  // Annotation switch event listener
  const annotationSwitchListenerWrapper = (event: Event) => annotationSwitchListener(event, modelViewer, annotationDiv, collectionState.api, collectionState.annotations)
  const annotationSwitchMobileListenerWrapper = (event: Event) => annotationSwitchMobileListener(event, modelViewer, annotationDiv, collectionState.api, collectionState.annotations)

  // Effect chain initizlized exhibit, then annotations and various listeners
  useEffect(() => { initializeExhibit(props, modelViewer, successObj, successObjDesktop, setCollectionState, sRef) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => initializeAnnotations(collectionState, annotationUid, setCollectionState, annotationSwitchListenerWrapper, annotationSwitchMobileListenerWrapper),
    [collectionState.api, collectionState.annotations, collectionState.s])

  function getImageDimensionsFromBlob(blob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()

      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url) // clean up!
      };

      img.onerror = reject
      img.src = url
    })
  }

  const setPhotoUrl = async (path: string) => {
    setCollectionState(prev => ({ ...prev, imgLoading: true }))

    await fetch(path)
      .then(res => res.blob()).then(blob => getImageDimensionsFromBlob(blob)).then(dimensions => console.log(dimensions))

    await fetch(path)
      .then(res => {
        if (!res.ok) setCollectionState(prev => ({ ...prev, imgSrc: '/noImage.png' }))
        else return res.blob()
      })
      .then(blob => setCollectionState(prev => ({ ...prev, imgSrc: URL.createObjectURL(blob as Blob), imgLoading: false })))
  }

  // This effect sets the imgSrc if necessary upon change of annotation index
  useEffect(() => {
    if (!!collectionState.index && collectionState.annotations && collectionState.annotations[collectionState.index - 1].annotation_type == 'photo') {
      const path = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ?
        'X:' + (collectionState.annotations[collectionState.index - 1].url as string).slice(5) :
        'public' + (collectionState.annotations[collectionState.index - 1].url as string)
      setPhotoUrl(`/api/nfs?path=${path}`)
    }

  }, [collectionState.index]) // eslint-disable-line react-hooks/exhaustive-deps

  return <CollectionsContext.Provider value={value}>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>

    {collectionState.s && <AnnotationModal {...props} title={collectionState.annotationTitle} index={collectionState.mobileIndex} specimen={collectionState.s} imgLoading={collectionState.imgLoading} imgSrc={collectionState.imgSrc} />}

    <div id="iframeDiv" className="flex bg-black m-auto min-h-[150px]" style={{ height: "100%", width: "100%" }}>

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
        </div>
      }

    </div>
  </CollectionsContext.Provider>
}
