/**
 * @file src/functions/client/AnnotationModelViewer.ts
 * 
 * @fileoverview logic file for the annotation model viewer
 */

'use client'

// Typical imports
import { annotationsAndPositions } from "@/interface/interface"
import { MutableRefObject, Dispatch } from "react"
import { fullAnnotation } from "@/interface/interface"

// Default imports
import Sketchfab from '@sketchfab/viewer-api'

/**
 * 
 * @param apData annotationsAndPositions from annotation client
 * @param sketchfabApi sketchfab API object
 * @description removes all annotations higher than than the annotation with index = activeAnnotationIndex
 */
export const removeHigherAnnotations = (apData: annotationsAndPositions, sketchfabApi: any) => {
    if (apData.annotations && apData.annotations.length + 1 !== apData.activeAnnotationIndex) {
        for (let i = apData.annotations.length; i >= (apData.activeAnnotationIndex as number); i--) {
            sketchfabApi.removeAnnotation(i, (err: any) => { })
        }
    }
}

/**
 * 
 * @param apData annotationsAndPositions from annotation client
 * @param sketchfabApi sketchfab API object
 * @param temporaryAnnotationIndex keeps track of index while annotations are replaced
 */
export const replaceHigherAnnotations = (apData: annotationsAndPositions, sketchfabApi: any, temporaryAnnotationIndex: number) => {
    if (apData.annotations && apData.annotations.length + 1 !== apData.activeAnnotationIndex) {
        for (let i = apData.activeAnnotationIndex as number - 1; i < apData.annotations.length; i++) {
            const position = JSON.parse(apData.annotations[i].position as string)
            sketchfabApi.createAnnotationFromScenePosition(position[0], position[1], position[2], `${apData.annotations[i].title}`, '', (err: any, index: any) => { temporaryAnnotationIndex = index })
        }
    }
}

/**
 * 
 * @param info 
 * @param dispatch 
 * @param camera 
 * @param activeAnnotationIndex 
 */
export const dispatchNewPosition = (info: any, dispatch: any, camera: any, activeAnnotationIndex: number | 'new' | undefined) => {
    const positionArray = Array.from(info.position3D)
    dispatch({ type: 'newPosition', position: JSON.stringify([positionArray, camera.position, camera.target]) })
    if (activeAnnotationIndex !== 'new') dispatch({ type: 'newAnnotationIndex', index: 'new' })
}

/**
 * 
 * @param sketchfabApi 
 * @param index 
 * @returns 
 */
export const removeAnnotation = async (sketchfabApi: any, index: number) => {
    return new Promise((res) => {
        sketchfabApi.removeAnnotation(index, (err: any) => {
            if (!err) res
            else throw Error('Model Viewer Error')
        })
    })
}

/**
 * 
 * @param index 
 * @param newAnnotationEnabled 
 * @param apDataDispatch 
 * @returns 
 */
export const annotationSelectHandler = (index: any, newAnnotationEnabled: MutableRefObject<boolean>, apDataDispatch: Dispatch<any>) => {
    if (newAnnotationEnabled.current) return
    else if (index !== -1) apDataDispatch({ type: 'newAnnotationIndex', index: index + 1 })
}

/**
 * 
 * @param iframe 
 * @param uid 
 * @param successObj 
 */
export const initializeViewer = (iframe: HTMLIFrameElement, uid: string, successObj: any) => {
    iframe.src = uid
    const client = new Sketchfab(iframe)
    client.init(uid, successObj)
}

/**
 * 
 * @param sketchfabApi 
 * @param temporaryAnnotationIndex 
 * @param apDataDispatch 
 */
export const cancelAnnotation = (sketchfabApi: any, temporaryAnnotationIndex: MutableRefObject<number | undefined>, apDataDispatch: Dispatch<any>) => {
    if (sketchfabApi && temporaryAnnotationIndex.current != undefined) {
        sketchfabApi.removeAnnotation(temporaryAnnotationIndex.current, (err: any) => { })
        apDataDispatch({ type: 'newPosition', position: undefined })
    }
}

/**
 * 
 * @param sketchfabApi 
 * @param apData 
 * @param temporaryAnnotationIndex 
 * @param createAnnotationWrapper 
 */
export const addOrRemoveCreateAnnotationEvent = (sketchfabApi: any, apData: annotationsAndPositions, temporaryAnnotationIndex: MutableRefObject<number | undefined>, createAnnotationWrapper: Function) => {
    if (sketchfabApi && apData.newAnnotationEnabled === true) {
        temporaryAnnotationIndex.current = undefined
        sketchfabApi.addEventListener('click', createAnnotationWrapper, { pick: 'fast' })
    }
    else if (sketchfabApi) sketchfabApi.removeEventListener('click', createAnnotationWrapper, { pick: 'fast' })
}

/**
 * 
 * @param sketchfabApi 
 * @param apData 
 * @param repositionAnnotationWrapper 
 */
export const addOrRemoveRepositionAnnotationEvent = ((sketchfabApi: any, apData: annotationsAndPositions, repositionAnnotationWrapper: Function) => {
    if (sketchfabApi && apData.activeAnnotationIndex !== undefined && apData.activeAnnotationIndex !== 'new' && apData.repositionEnabled) {
        sketchfabApi.addEventListener('click', repositionAnnotationWrapper, { pick: 'fast' })
    }
    else if (sketchfabApi) sketchfabApi.removeEventListener('click', repositionAnnotationWrapper, { pick: 'fast' })
})

/**
 * 
 * @param sketchfabApi 
 * @param apData 
 * @param annotationSelectHandlerWrapper 
 */
export const addOrRemoveAnnotationSelectEvent = (sketchfabApi: any, apData: annotationsAndPositions, annotationSelectHandlerWrapper: Function) => {
    if (sketchfabApi && !apData.repositionEnabled) sketchfabApi.addEventListener('annotationSelect', annotationSelectHandlerWrapper)
    else if (sketchfabApi) sketchfabApi.removeEventListener('annotationSelect', annotationSelectHandlerWrapper)
}

/**
 * 
 * @param apData 
 * @param temporaryAnnotationIndex 
 * @param sketchfabApi 
 */
export const annotationRepositionUncheckedHandler = (apData: annotationsAndPositions, temporaryAnnotationIndex: MutableRefObject<number | undefined>, sketchfabApi: any,) => {
    if (apData.activeAnnotationIndex === 1) {
        temporaryAnnotationIndex.current = undefined
        removeHigherAnnotations(apData, sketchfabApi)
        sketchfabApi.removeAnnotation(apData.activeAnnotationIndex as number - 1, (err: any) => { })
        const position = apData.firstAnnotationPosition as string
        sketchfabApi.createAnnotationFromScenePosition(position[0], position[1], position[2], 'Placeholder', '', (err: any, index: any) => { replaceHigherAnnotations(apData, sketchfabApi, temporaryAnnotationIndex.current as number) })
    }
    else if (sketchfabApi && apData.position3D !== (apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2]?.position && !apData.repositionEnabled) {
        temporaryAnnotationIndex.current = undefined
        removeHigherAnnotations(apData, sketchfabApi)
        sketchfabApi.removeAnnotation(apData.activeAnnotationIndex as number - 1, (err: any) => { })
        const position = JSON.parse((apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2].position as string)
        sketchfabApi.createAnnotationFromScenePosition(position[0], position[1], position[2], 'Placeholder', '', (err: any, index: any) => { replaceHigherAnnotations(apData, sketchfabApi, temporaryAnnotationIndex.current as number) })
    }
}

/**
 * 
 * @param apData 
 * @param api 
 */
export const instantiateAnnotations = (apData: annotationsAndPositions, api: any) => {
    // Create the first annotation if it exists
    if (apData.firstAnnotationPosition) {
        api.createAnnotationFromScenePosition(apData.firstAnnotationPosition[0], apData.firstAnnotationPosition[1], apData.firstAnnotationPosition[2], 'Taxonomy and Description', '', (err: any, index: any) => {

            // Create any futher annotations that exist
            if (apData.annotations) {
                for (let i in apData.annotations) {
                    if (apData.annotations[i].position) {
                        const position = JSON.parse(apData.annotations[i].position as string)
                        api.createAnnotationFromScenePosition(position[0], position[1], position[2], `${apData.annotations[i].title}`, '', (err: any, index: any) => { })
                    }
                }
            }
        })
    }
}

/**
 * 
 * @param info 
 * @param newAnnotationEnabled 
 * @param temporaryAnnotationIndex 
 * @param sketchfabApi 
 * @param apData 
 * @param apDataDispatch 
 */
export const createAnnotation = (info: any, newAnnotationEnabled: MutableRefObject<boolean>, temporaryAnnotationIndex: MutableRefObject<number | undefined>, sketchfabApi: any, apData: annotationsAndPositions, apDataDispatch: Dispatch<any>) => {

    // Check flag before anything
    if (newAnnotationEnabled.current) {
        // Remove previous annotation if there is a new click
        if (temporaryAnnotationIndex.current != undefined) sketchfabApi.removeAnnotation(temporaryAnnotationIndex.current, (err: any) => { })

        // Get camera position and create annotation
        sketchfabApi.getCameraLookAt((err: any, camera: any) => {
            sketchfabApi.createAnnotationFromScenePosition(info.position3D, camera.position, camera.target, '', '', (err: any, index: any) => { temporaryAnnotationIndex.current = index })

            // If the click was on the 3d model (and not the background) set position/activeAnnotation data, or else set position undefined
            if (info.position3D) {
                const positionArray = Array.from(info.position3D)
                apDataDispatch({ type: 'newPosition', position: JSON.stringify([positionArray, camera.position, camera.target]) })
                if (apData.activeAnnotationIndex !== 'new') apDataDispatch({ type: 'newAnnotationIndex', index: 'new' })
            }
            else apDataDispatch({ type: 'newPosition', position: undefined })
        })
    }
}

/**
 * 
 * @param info 
 */
export const repositionAnnotation = (info: any, apData: annotationsAndPositions, sketchfabApi: any, temporaryAnnotationIndex: MutableRefObject<number | 'new' | undefined>, dispatch: any) => {

    if (apData.repositionEnabled) {

        // Remove higher annotations 
        removeHigherAnnotations(apData, sketchfabApi)

        // Remove current annotation
        sketchfabApi.removeAnnotation(apData.activeAnnotationIndex as number - 1, (err: any) => { if (err) throw Error('Model Viewer Error') })

        // Get camera position 
        sketchfabApi.getCameraLookAt((err: any, camera: any) => {
            if (err) throw Error('Model Viewer Error')

            // Determine title
            const title = (apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2]?.title ?
                `${(apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2].title}` :
                'Taxonomy and Description'

            // Create annotation and replace higher annotations
            sketchfabApi.createAnnotationFromScenePosition(info.position3D, camera.position, camera.target, `${title}`, '', (err: any, index: any) => {
                if (err) throw Error('Model Viewer Error')
                temporaryAnnotationIndex.current = index
                replaceHigherAnnotations(apData, sketchfabApi, temporaryAnnotationIndex.current as number)
            })

            // If the click was on the 3d model (and not the background) set position/activeAnnotation data, or else set position undefined
            if (info.position3D) {
                const positionArray = Array.from(info.position3D)
                dispatch({ type: 'newPosition', position: JSON.stringify([positionArray, camera.position, camera.target]) })
            }
            else dispatch({ type: 'newPosition', position: undefined })
        })
    }
}
