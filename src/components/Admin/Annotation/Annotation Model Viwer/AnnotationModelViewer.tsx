/**
 * @file src/components/Admin/AnnotationModelViewer.tsx
 * 
 * @fileoverview model viewer that allows for embedding annotations
 * 
 */

"use client"

// Typical imports
import { MutableRefObject, useEffect, useRef, forwardRef, ForwardedRef, useState, useContext, Dispatch, SetStateAction } from 'react'
import { AnnotationClientData } from '../Annotation Client/AnnotationClient'
import { annotationClientData } from '@/interface/interface'

// Logic import
import * as fn from '@/functions/client/AnnotationModelViewer'

// Main JSX
const BotanistModelViewer = forwardRef((props: { minHeight?: string, setViewerLoaded: Dispatch<SetStateAction<boolean>> }, ref: ForwardedRef<boolean>) => {

    // Annotation client context
    const clientData = useContext(AnnotationClientData) as annotationClientData
    const apData = clientData.annotationsAndPositions
    const apDataDispatch = clientData.annotationsAndPositionsDispatch
    const specimen = clientData.specimenData

    // Refs
    const newAnnotationEnabled = ref as MutableRefObject<boolean>
    const modelViewer = useRef<HTMLIFrameElement>(undefined)
    const temporaryAnnotationIndex = useRef<number>(undefined)
    const apiRef = useRef<any>(undefined)

    // States
    const [sketchfabApi, setSketchfabApi] = useState<any>()

    // Minimum height of model viewer
    const minHeight = props.minHeight ? props.minHeight : '150px'

    // Wrappers
    const createAnnotationWrapper = (info: any) => fn.createAnnotation(info, newAnnotationEnabled, temporaryAnnotationIndex, sketchfabApi, apData, apDataDispatch)
    const repositionAnnotationWrapper = (info: any) => fn.repositionAnnotation(info, apData, sketchfabApi, temporaryAnnotationIndex, apDataDispatch)
    const annotationSelectHandlerWrapper = (index: any) => fn.annotationSelectHandler(index, newAnnotationEnabled, apDataDispatch)
    const instantiateAnnotationsWrapper = () => fn.instantiateAnnotations(apData, apiRef.current)

    // Sketchfab API initialization success object
    const successObj = {
        success: (api: any) => { setSketchfabApi(api); apiRef.current = api; api.start(); api.addEventListener('viewerready', instantiateAnnotationsWrapper) },
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

    // Initialize the viewer
    useEffect(() => fn.initializeViewer(modelViewer.current as HTMLIFrameElement, specimen.uid as string, successObj, props.setViewerLoaded), [specimen.uid, apData.annotations]) // eslint-disable-line react-hooks/exhaustive-deps

    // Remove a temporary annotation when its cancelled
    useEffect(() => fn.cancelAnnotation(sketchfabApi, temporaryAnnotationIndex, apDataDispatch), [apData.cancelledAnnotation]) // eslint-disable-line react-hooks/exhaustive-deps

    // Add the createAnnotation listener onClick when the associated state is enabled (or vice versa); cleanup function to ensure listeners aren't added twice
    useEffect(() => {
        fn.addOrRemoveCreateAnnotationEvent(sketchfabApi, apData, temporaryAnnotationIndex, createAnnotationWrapper)
        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('click', createAnnotationWrapper, { pick: 'fast' }) }
    }, [apData.newAnnotationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // Allow repositioning of the activeAnnotation onClick (or removes it when there is no active annotation, or a new annotation); cleanup function to ensure listeners aren't added twice
    useEffect(() => {
        fn.addOrRemoveRepositionAnnotationEvent(sketchfabApi, apData, repositionAnnotationWrapper)
        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('click', repositionAnnotationWrapper, { pick: 'fast' }) }
    }, [apData.activeAnnotationIndex, apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // This effect repositions an annotation to its original location when the annotation reposition checkbox is unchecked
    useEffect(() => fn.annotationRepositionUncheckedHandler(apData, temporaryAnnotationIndex, sketchfabApi), [apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // Initialize the annotation select event and handle corresponding state changes within the handler; cleanup function to ensure listeners aren't added twice
    // Note that the annotation select event is triggered by any click on the viewer, even those not on an annotation. Such events return and index of -1
    useEffect(() => {
        fn.addOrRemoveAnnotationSelectEvent(sketchfabApi, apData, annotationSelectHandlerWrapper)
        return () => { if (sketchfabApi) sketchfabApi.removeEventListener('annotationSelect', annotationSelectHandlerWrapper) }
    }, [sketchfabApi, apData.activeAnnotationIndex, apData.repositionEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

    // Simple iframe with ref
    return <div className={`flex bg-black m-auto min-h-[${minHeight}]`} style={{ height: "100%", width: "100%" }}>
        <iframe
            ref={modelViewer as MutableRefObject<HTMLIFrameElement>}
            frameBorder="0"
            title={"Model Viewer for " + ''}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            xr-spatial-tracking="true"
            execution-while-out-of-viewport="true"
            execution-while-not-rendered="true"
            web-share="true"
            allowFullScreen
            style={{ width: "100%" }} />
    </div>
})

BotanistModelViewer.displayName = 'BotanistModelViewer'
export default BotanistModelViewer