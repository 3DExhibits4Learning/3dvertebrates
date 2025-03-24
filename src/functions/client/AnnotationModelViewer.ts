/**
 * @file src/functions/client/AnnotationModelViewer.ts
 * 
 * @fileoverview logic file for the annotation model viewer
 */

// Typical imports
import { annotationsAndPositions } from "@/interface/interface"
import { MutableRefObject, Dispatch } from "react"
import { fullAnnotation } from "@/interface/interface"

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
 * @param info 
 * @param newAnnotationEnabled 
 * @param temporaryAnnotationIndex 
 * @param sketchfabApi 
 * @param apData 
 * @param apDataDispatch 
 */
export const createAnnotation = (info: any, newAnnotationEnabled: MutableRefObject<boolean>, temporaryAnnotationIndex: MutableRefObject<number | undefined>, sketchfabApi: any, apData: annotationsAndPositions, apDataDispatch: Dispatch<any>) => {

    // Check flags before anything
    if (newAnnotationEnabled) {

        // Remove previous annotation if there is a new click
        if (temporaryAnnotationIndex.current !== undefined) sketchfabApi.removeAnnotation(temporaryAnnotationIndex.current, (err: any) => { if (err) throw Error('Model Viewer Error') })

        // Get camera position and create annotation
        sketchfabApi.getCameraLookAt((err: any, camera: any) => {
            if (err) throw Error('Model Viewer Error')

            // Create annotation in viewer
            sketchfabApi.createAnnotationFromScenePosition(info.position3D, camera.position, camera.target, '', '', (err: any, index: any) => {
                if (err) throw Error('Model Viewer Error')
                temporaryAnnotationIndex.current = index
            })

            // If the click was on the 3d model (and not the background) set position/activeAnnotation data, or else set position undefined
            if (info.position3D) dispatchNewPosition(info, apDataDispatch, camera, apData.activeAnnotationIndex)
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
