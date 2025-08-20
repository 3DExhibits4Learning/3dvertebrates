'use client'

import { CollectionsProps, CollectionState } from "@/components/Collections/Collections"
import { annotationControl, setViewerWidth } from "@/components/Collections/SketchfabDom"
import { fullAnnotation } from "@/interface/interface"
import { Dispatch, RefObject, SetStateAction } from "react"
import { model_annotation } from "@prisma/client"

import Vertebrates from '@/classes/HerbariumClass'
import Sketchfab from '@sketchfab/viewer-api'
import { getLocalNfsPrefix, isLocalDevEnvClient } from "@/functions/client/utils"
import { isMobileOrTablet } from "@/functions/utils/isMobile"


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

        // this event is still triggered even when an annotation is not selected; an index of -1 is returned; also checking that the same index is not selected
        if (index !== -1) setCollectionState(prev => {
            if (prev.index !== index) return { ...prev, index: index, imgLoading: true }
            else return prev
        })

        // Mobile annotation state management
        if (index !== -1 && mediaQueryWidth.matches || index != -1 && mediaQueryOrientation.matches) {
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
                if (!annotationUid && !isMobileOrTablet()) collectionState.api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false })
            })

            // Create any futher annotations that exist
            for (let i = 0; i < collectionState.annotations.length; i++) {
                if (collectionState.annotations[i].position) {
                    const position = JSON.parse(collectionState.annotations[i].position as string)
                    collectionState.api.createAnnotationFromScenePosition(position[0], position[1], position[2], `${collectionState.annotations[i].title}`, '')
                }
            }
        }

        // Go to specific annotation if it was present in the query string
        if (annotationUid) {
            const annotation = collectionState.annotations.find(annotation => annotation.annotation_type === 'model' && (annotation.annotation as model_annotation).uid === annotationUid)
            if (annotation) collectionState.api.gotoAnnotation(annotation.annotation_no - 1, { preventCameraAnimation: true, preventCameraMove: false }, function (err: any, index: any) { })
            else collectionState.api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false }) 
        }
        else { if (!isMobileOrTablet()) collectionState.api.gotoAnnotation(0, { preventCameraAnimation: true, preventCameraMove: false }) }

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
export const handleSrcForPhotoAnnotation = async (collectionState: CollectionState, setCollectionState: Dispatch<SetStateAction<CollectionState>>, collectionsDiv: RefObject<HTMLDivElement | undefined>) => {
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
            const rect = collectionsDiv.current?.getBoundingClientRect() as DOMRect

            if (rect) {
                const imgObj = { imgSrc: URL.createObjectURL(blob as Blob), imgLoading: false, imgHeight: dimensions.height, imgWidth: dimensions.width }
                const maxImgHeight = 0.65 * rect.height
                const maxImgWidth = 0.4 * rect.width

                if (dimensions.height >= maxImgHeight && dimensions.width >= maxImgWidth) setCollectionState(prev => ({ ...prev, imgHeightGtRect: true, imgWidthGtRect: true, ...imgObj }))
                else if (dimensions.height > maxImgHeight) setCollectionState(prev => ({ ...prev, imgHeightGtRect: true, imgWidthGtRect: false, ...imgObj }))
                else if (dimensions.width > maxImgWidth) setCollectionState(prev => ({ ...prev, imgHeightGtRect: false, imgWidthGtRect: true, ...imgObj }))
                else setCollectionState(prev => ({ ...prev, imgHeightGtRect: false, imgWidthGtRect: false, ...imgObj }))
            }
        }
    }
}


/**
 * 
 * @param annotationDiv 
 * @param collectionState 
 * @param setCollectionState 
 * @returns 
 */
export const resizeEventHandler = (collectionsDiv: RefObject<HTMLDivElement | undefined>, collectionState: CollectionState, setCollectionState: Dispatch<SetStateAction<CollectionState>>) => {
    if (!collectionsDiv.current) return

    if (collectionState.annotations && collectionState.index && collectionState.annotations[collectionState.index - 1]?.annotation_type === 'photo' && collectionState.imgHeight && collectionState.imgWidth) {
        const rect = collectionsDiv.current.getBoundingClientRect()
        const maxImgHeight = 0.65 * rect.height
        const maxImgWidth = 0.4 * rect.width

        if (collectionState.imgHeight >= maxImgHeight && collectionState.imgWidth >= maxImgWidth) setCollectionState(prev => ({ ...prev, imgHeightGtRect: true, imgWidthGtRect: true }))
        else if (collectionState.imgHeight >= maxImgHeight) setCollectionState(prev => ({ ...prev, imgHeightGtRect: true, imgWidthGtRect: false }))
        else if (collectionState.imgWidth >= maxImgWidth) setCollectionState(prev => ({ ...prev, imgHeightGtRect: false, imgWidthGtRect: true }))
        else setCollectionState(prev => ({ ...prev, imgHeightGtRect: false, imgWidthGtRect: false }))

    }
}


