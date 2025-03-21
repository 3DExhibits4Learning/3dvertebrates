"use client"

/**
 * @file src/components/Admin/AnnotationModelViewer.tsx
 * 
 * @fileoverview model viewer that allows for embedding annotations
 * 
 * @todo extract and import stand alone functions
 * @todo extract Effect logic in to stand alone functions, extract and import
 */

// Typical imports
import { MutableRefObject, useEffect, useRef, forwardRef, ForwardedRef, useState, useContext } from 'react';
import { AnnotationClientData } from '../Annotation Client/AnnotationClient';
import { annotationClientData, fullAnnotation } from '@/interface/interface';
import { removeHigherAnnotations, replaceHigherAnnotations } from '@/functions/client/AnnotationModelViewer';

// Default imports
import Sketchfab from '@sketchfab/viewer-api';

// Main JSX
const BotanistModelViewer = forwardRef((props: { minHeight?: string }, ref: ForwardedRef<boolean>) => {

    // Annotation client context
    const clientData = useContext(AnnotationClientData) as annotationClientData
    const apData = clientData.annotationsAndPositions
    const apDataDispatch = clientData.annotationsAndPositionsDispatch
    const specimen = clientData.specimenData

    // Refs
    const newAnnotationEnabled = ref as MutableRefObject<boolean>
    const modelViewer = useRef<HTMLIFrameElement>()
    const temporaryAnnotationIndex = useRef<number>()

    // States
    const [sketchfabApi, setSketchfabApi] = useState<any>()

    // Minimum height of model viewer
    const minHeight = props.minHeight ? props.minHeight : '150px'

    /**
     * @function createAnnotation
     * @param info info from click, such as position
     */
    const createAnnotation = (info: any) => {

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
    const repositionAnnotation = (info: any) => {

        if (apData.repositionEnabled) {

            // Remove higher annotations 
            removeHigherAnnotations(apData, sketchfabApi)

            // Remove current annotation
            sketchfabApi.removeAnnotation(apData.activeAnnotationIndex as number - 1, (err: any) => { })

            // Get camera position 
            sketchfabApi.getCameraLookAt((err: any, camera: any) => {

                // Determine title
                const title = (apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2]?.title ? 
                `${(apData.annotations as fullAnnotation[])[apData.activeAnnotationIndex as number - 2].title}` : 
                'Taxonomy and Description'

                // Create annotation and replace higher annotations
                sketchfabApi.createAnnotationFromScenePosition(info.position3D, camera.position, camera.target, `${title}`, '', (err: any, index: any) => {
                    temporaryAnnotationIndex.current = index
                    replaceHigherAnnotations(apData, sketchfabApi, temporaryAnnotationIndex.current as number)
                })

                // If the click was on the 3d model (and not the background) set position/activeAnnotation data, or else set position undefined
                if (info.position3D) {
                    const positionArray = Array.from(info.position3D)
                    apDataDispatch({ type: 'newPosition', position: JSON.stringify([positionArray, camera.position, camera.target]) })
                }
                else apDataDispatch({ type: 'newPosition', position: undefined })
            })
        }
    }

    // Annotation select handler
    const annotationSelectHandler = (index: any) => {
        if (newAnnotationEnabled.current) return
        else if (index != -1) apDataDispatch({ type: 'newAnnotationIndex', index: index + 1 })
    }

    // Sketchfab API initialization success object
    const successObj = {
        success: function onSuccess(api: any) {
            setSketchfabApi(api)
            api.current = api
            api.start()
            api.addEventListener('viewerready', function () {

                // Create the first annotation if it exists
                if (apData.firstAnnotationPosition) {
                    api.createAnnotationFromScenePosition(apData.firstAnnotationPosition[0], apData.firstAnnotationPosition[1], apData.firstAnnotationPosition[2], 'Taxonomy and Description', '', (err: any, index: any) => { })
                }

                // Create any futher annotations that exist
                if (apData.annotations) {
                    for (let i in apData.annotations) {
                        if (apData.annotations[i].position) {
                            const position = JSON.parse(apData.annotations[i].position)
                            api.createAnnotationFromScenePosition(position[0], position[1], position[2], `${apData.annotations[i].title}`, '', (err: any, index: any) => { })
                        }
                    }
                }
            })
        },

        // Sketchfab viewer initialization settings
        error: function onError() { },
        ui_stop: 0,
        ui_infos: 0,
        ui_inspector: 0,
        ui_settings: 0,
        ui_watermark: 0,
        ui_annotations: 0,
        ui_color: "004C46",
        ui_fadeout: 0
    }

    // This effect initializes the viewer
    useEffect(() => {
        const iframe = modelViewer.current as HTMLIFrameElement
        iframe.src = specimen.uid as string
        const client = new Sketchfab(iframe)
        client.init(specimen.uid, successObj)
    }, [specimen.uid, apData.annotations]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect removes the temporary annotation when its cancelled
    useEffect(() => {
        if (sketchfabApi && temporaryAnnotationIndex.current != undefined) {
            sketchfabApi.removeAnnotation(temporaryAnnotationIndex.current, (err: any) => { })
            apDataDispatch({ type: 'newPosition', position: undefined })
        }
    }, [apData.cancelledAnnotation]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect adds the createAnnotation listener onClick when the associated state is enabled (or vice versa)
    useEffect(() => {
        if (sketchfabApi && apData.newAnnotationEnabled === true) {
            temporaryAnnotationIndex.current = undefined
            sketchfabApi.addEventListener('click', createAnnotation, { pick: 'fast' })
        }
        else if (sketchfabApi) sketchfabApi.removeEventListener('click', createAnnotation, { pick: 'fast' })

        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('click', createAnnotation, { pick: 'fast' }) }
    }, [apData.newAnnotationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect allows repositioning of the activeAnnotation onClick (or removes it when there is no active annotation, or a new annotation)
    useEffect(() => {
        if (sketchfabApi && apData.activeAnnotationIndex !== undefined && apData.activeAnnotationIndex !== 'new' && apData.repositionEnabled) {
            sketchfabApi.addEventListener('click', repositionAnnotation, { pick: 'fast' })
        }

        else if (sketchfabApi) sketchfabApi.removeEventListener('click', repositionAnnotation, { pick: 'fast' })

        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('click', repositionAnnotation, { pick: 'fast' }) }
    }, [apData.activeAnnotationIndex, apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect repositions an annotation to its original location when the annotation reposition checkbox is unchecked
    useEffect(() => {

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
    }, [apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect initializes the annotation select event handler and handles corresponding state changes within the handler
    useEffect(() => {

        // Set the activeAnnotationIndex when an annotation is selected
        // Note that this event is triggered by any click, even those not on an annotation. Such events return and index of -1

        if (sketchfabApi && !apData.repositionEnabled) sketchfabApi.addEventListener('annotationSelect', annotationSelectHandler)
        else if (sketchfabApi) sketchfabApi.removeEventListener('annotationSelect', annotationSelectHandler)

        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('annotationSelect', annotationSelectHandler) }
    }, [sketchfabApi, apData.activeAnnotationIndex, apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // Simple iframe with ref
    return (
        <>
            <div className={`flex bg-black m-auto min-h-[${minHeight}]`} style={{ height: "100%", width: "100%" }}>
                <iframe
                    ref={modelViewer as MutableRefObject<HTMLIFrameElement>}
                    src=""
                    frameBorder="0"
                    title={"Model Viewer for " + ''}
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking="true"
                    execution-while-out-of-viewport="true"
                    execution-while-not-rendered="true"
                    web-share="true"
                    allowFullScreen
                    style={{ width: "100%" }}
                />
            </div>
        </>
    )
})

BotanistModelViewer.displayName = 'BotanistModelViewer'
export default BotanistModelViewer