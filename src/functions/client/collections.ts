'use client'

import { CollectionsProps, CollectionState } from "@/components/Collections/Collections"
import { annotationControl, setViewerWidth } from "@/components/Collections/SketchfabDom"
import { fullAnnotation } from "@/interface/interface"
import { Dispatch, RefObject, SetStateAction } from "react"
import { model_annotation } from "@prisma/client"

import Vertebrates from '@/classes/HerbariumClass'
import Sketchfab from '@sketchfab/viewer-api'
import { getLocalNfsPrefix, isLocalDevEnvClient } from "@/functions/client/utils"


/**
 * 
 * @param event 
 * @param modelViewer 
 * @param annotationDiv 
 * @param api 
 * @param annotations 
 */
export const annotationSwitchListener = (event: Event, modelViewer: RefObject<HTMLIFrameElement | undefined>, annotationDiv: RefObject<HTMLDivElement | undefined>, api: any, annotations: fullAnnotation[] | undefined) => {
    setViewerWidth(modelViewer.current, annotationDiv.current, (event.target as HTMLInputElement).checked)
    annotationControl(api, annotations, (event.target as HTMLInputElement).checked)
}

/**
 * 
 * @param event 
 * @param modelViewer 
 * @param annotationDiv 
 * @param api 
 * @param annotations 
 */
export const annotationSwitchMobileListener = (event: Event, modelViewer: RefObject<HTMLIFrameElement | undefined>, annotationDiv: RefObject<HTMLDivElement | undefined>, api: any, annotations: fullAnnotation[] | undefined) => {
    setViewerWidth(modelViewer, annotationDiv, (event.target as HTMLInputElement).checked)
    annotationControl(api, annotations, (event.target as HTMLInputElement).checked)
}

/**
 * 
 * @param props 
 * @param modelViewer 
 * @param successObj 
 * @param successObjDesktop 
 * @param setCollectionState 
 * @param sRef 
 */
export const initializeExhibit = (props: CollectionsProps, modelViewer: RefObject<HTMLIFrameElement | undefined>, successObj: any, successObjDesktop: any, setCollectionState: Dispatch<SetStateAction<CollectionState>>, sRef: RefObject<Vertebrates | undefined>) => {
    const sketchFabLink = props.model.uid
    const client = new Sketchfab(modelViewer.current)

    // Choose initialization success object based on screen size
    if (window.matchMedia('(max-width: 1023.5px)').matches || window.matchMedia('(orientation: portrait)').matches) client.init(sketchFabLink, successObj)
    else client.init(sketchFabLink, successObjDesktop)

    // Instantiate/set vertebrates and set annotations
    const instantiateExhibit = async () => {
        sRef.current = await Vertebrates.model(props.gMatch.data?.usageKey as number, props.model, props.images, props.imageTitle)
        setCollectionState(prev => ({ ...prev, s: sRef.current, annotations: sRef.current?.annotations.annotations }))
    }

    instantiateExhibit()
    document.body.scrollTop = document.documentElement.scrollTop = 0
}

/**
 * 
 * @param collectionState 
 * @param setCollectionState 
 */
export const addAnnotationEventListener = (collectionState: CollectionState, setCollectionState: Dispatch<SetStateAction<CollectionState>>) => {
    // Set index when an annotation is selected
    collectionState.api.addEventListener('annotationSelect', (index: number) => {

        const mediaQueryWidth = window.matchMedia('(max-width: 1023.5px)')
        const mediaQueryOrientation = window.matchMedia('(orientation: portrait)')

        // this event is still triggered even when an annotation is not selected; an index of -1 is returned
        if (index !== -1) setCollectionState(prev => ({ ...prev, index: index }))

        // Mobile annotation state management
        if (index != -1 && mediaQueryWidth.matches || index != -1 && mediaQueryOrientation.matches) {
            document.getElementById("annotationButton")?.click()

            collectionState.api.getAnnotation(index, function (err: any, information: any) {
                if (!err) setCollectionState(prev => ({ ...prev, annotationTitle: information.name, mobileIndex: index }))
            })
        }
    })
}

/**
 * 
 * @param collectionState 
 * @param annotationUid 
 * @param setCollectionState 
 * @param annotationSwitchListenerWrapper 
 * @param annotationSwitchMobileListenerWrapper 
 */
export const initializeAnnotations = (collectionState: CollectionState, annotationUid: string | null, setCollectionState: Dispatch<SetStateAction<CollectionState>>, annotationSwitchListenerWrapper: (this: HTMLInputElement, ev: Event) => any, annotationSwitchMobileListenerWrapper: (this: HTMLInputElement, ev: Event) => any) => {

    if (collectionState.s && collectionState.annotations && collectionState.api) {

        // Create and go to the first annotation if it exists
        if (collectionState.s.model.annotationPosition) {
            const position = JSON.parse(collectionState.s.model.annotationPosition)
            collectionState.api.createAnnotationFromScenePosition(position[0], position[1], position[2], 'Taxonomy and Description', '', (err: any) => {
                if (!annotationUid) collectionState.api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false })
            })

            // Create any futher annotations that exist
            for (let i = 0; i < collectionState.annotations.length; i++) {
                if (collectionState.annotations[i].position) {
                    const position = JSON.parse(collectionState.annotations[i].position as string)
                    collectionState.api.createAnnotationFromScenePosition(position[0], position[1], position[2], `${collectionState.annotations[i].title}`)
                }
            }
        }

        // Go to specific annotation if it was present in the query string
        if (annotationUid) {
            const annotation = collectionState.annotations.find(annotation => annotation.annotation_type === 'model' && (annotation.annotation as model_annotation).uid === annotationUid)
            if (annotation) collectionState.api.gotoAnnotation(annotation.annotation_no - 1, { preventCameraAnimation: true, preventCameraMove: false }, function (err: any, index: any) { })
            else collectionState.api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false })
        }

        // Annotation swtiches
        const annotationSwitch = document.getElementById("annotationSwitch")
        const annotationSwitchMobile = document.getElementById("annotationSwitchMobileHidden");

        // Add event listeners
        (annotationSwitch as HTMLInputElement).addEventListener("change", annotationSwitchListenerWrapper);
        (annotationSwitchMobile as HTMLInputElement).addEventListener("change", annotationSwitchMobileListenerWrapper)
        addAnnotationEventListener(collectionState, setCollectionState)
    }
}

/**
 * 
 * @param blob 
 * @returns 
 */
export const getImageDimensionsFromBlob = (blob: Blob): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()

        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(url) // clean up!
        }

        img.onerror = reject
        img.src = url
    })
}


/**
 * 
 * @param collectionState 
 * @param setCollectionState 
 */
export const handleSrcForPhotoAnnotation = async (collectionState: CollectionState, setCollectionState: Dispatch<SetStateAction<CollectionState>>, annotationDiv: RefObject<HTMLDivElement | undefined>) => {
    if (!!collectionState.index && collectionState.annotations && collectionState.annotations[collectionState.index - 1].annotation_type === 'photo') {
        // Determine appropriate path
        const path = isLocalDevEnvClient() ?
            getLocalNfsPrefix() + (collectionState.annotations[collectionState.index - 1].url as string).slice(5) :
            'public' + (collectionState.annotations[collectionState.index - 1].url as string)

        // Get blob
        const blob = await fetch(`/api/nfs?path=${path}`).then(res => {
            if (!res.ok) {
                setCollectionState(prev => ({ ...prev, imgSrc: '/noImage.png' }))
                return null
            }
            else return res.blob()
        })

        // Get necessary dimensions and set imgGtRect
        if (blob) {
            const dimensions = await getImageDimensionsFromBlob(blob)
            const rect = annotationDiv.current?.getBoundingClientRect() as DOMRect
            const imgObj = { imgSrc: URL.createObjectURL(blob as Blob), imgLoading: false }
            
            dimensions.height > rect.height || dimensions.width > rect.width ? setCollectionState(prev => ({ ...prev, imgGtRect: true, ...imgObj })) :
                setCollectionState(prev => ({ ...prev, imgGtRect: false, ...imgObj }))
        }
    }
}

export const setPhotoAnnotationDivStyle = () => {

}