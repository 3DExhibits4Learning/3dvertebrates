/**
 * @file src/components/Admin/AnnotationEntry.tsx
 * 
 * @fileoverview client interface for annotation CRUD operations
 * 
 */

'use client'

// Import all annotation entry functions (aeFn = Annotation Entry Function)
import * as aeFn from '@/functions/client/annotationEntry' //aeFn = Annotation Entry Function

// Typical imports
import { useState, useEffect, useContext, createContext, useReducer } from "react"
import { annotationClientData, annotationEntryContext } from "@/interface/interface"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { getInitialAnnotationEntryData } from "@/interface/initializers"
import { model } from '@prisma/client'

// Default imports
import annotationEntryReducer from "@/functions/client/reducers/AnnotationEntryData"
import dataTransferHandler from '@/functions/client/dataTransfer/dataTransferHandler'
import annotationDataTransferReducer from '@/functions/client/reducers/annotationEntryDataTransfer'
import AnnotationEntryTransferModal from './AnnotationEntryModal'
import FirstAnnotationEntry from './FirstAnnotationEntry'
import RepositionAndRadio from "./RepositionAndRadio"
import PhotoAnnotationEntry from "./PhotoAnnotation"
import VideoAnnotationEntry from "./VideoAnnotation"
import ModelAnnotationEntry from "./ModelAnnotationEntry"
import AnnotationEntryButtons from "./Buttons"

// Data context initialization
export const AnnotationEntryData = createContext<annotationEntryContext | ''>('')

// Main JSX
export default function AnnotationEntry(props: { index: number, new: boolean, annotationModels: model[] }) {

    // Annotation client context
    const clientData = useContext(AnnotationClientData) as annotationClientData
    const apData = clientData.annotationsAndPositions
    const specimen = clientData.specimenData

    // Annotation entry data initialization
    const initialEntryData = getInitialAnnotationEntryData(apData)
    const initialTransferData = { transferModalOpen: false, transferring: false, result: '', loadingLabel: '' }

    // Reducers
    const [annotationEntryData, annotationEntryDataDispatch] = useReducer(annotationEntryReducer, initialEntryData)
    const [transferState, transferStateDispatch] = useReducer(annotationDataTransferReducer, initialTransferData)

    // Context provider object
    const annotationEntryContext: annotationEntryContext = { annotationEntryData, annotationEntryDataDispatch, transferState, transferStateDispatch }

    // Save/Create button enabled states
    const [createDisabled, setCreateDisabled] = useState<boolean>(true)
    const [saveDisabled, setSaveDisabled] = useState<boolean>(true)

    // New position boolean value; first annotation create/save enabler
    const isNewPosition = apData.position3D !== undefined ? true : false
    const enableFirstAnnotation = (isDisabled: boolean) => { setCreateDisabled(isDisabled); setSaveDisabled(isDisabled) }

    // Data transfer handlers
    const initializeDataTransferHandler = (loadingLabel: string) => transferStateDispatch({ type: 'initialize', loadingLabel: loadingLabel })
    const terminateDataTransferHandler = (result: string) => transferStateDispatch({ type: 'terminate', result: result })
    const dataTransferWrapper = (fn: Function, args: any[], label: string) => dataTransferHandler(initializeDataTransferHandler, terminateDataTransferHandler, fn, args, label)

    // Annotation CUD handlers
    const createAnnotation = () => aeFn.createAnnotation(props.index, specimen.uid as string, apData.position3D as string, dataTransferWrapper, annotationEntryData)
    const updateAnnotation = () => aeFn.updateAnnotation(props.index, dataTransferWrapper, annotationEntryData, apData, specimen)
    const deleteAnnotation = () => aeFn.deleteAnnotation(apData, specimen.uid as string, dataTransferWrapper)

    // Image visibility effect dependencies
    const imageVisibilityDependencies = [props.new, annotationEntryData.annotationType, props.index, annotationEntryData.file, apData.activeAnnotation]

    // Create/save annotation enable effect dependencies
    const enableDependencies = [annotationEntryData.annotationTitle, apData.position3D, annotationEntryData.url, annotationEntryData.author,
    annotationEntryData.license, annotationEntryData.annotation, annotationEntryData.file, annotationEntryData.length, annotationEntryData.photoTitle, annotationEntryData.website,
    annotationEntryData.modelAnnotationUid, annotationEntryData.videoSource, annotationEntryData.annotationType]

    // Effects: set whether annotation photo is visible, populate form fields upon annotation selection, enable save/update button, respectively
    useEffect(() => aeFn.setImageVisibility(props.index, annotationEntryData, props.new, annotationEntryDataDispatch), imageVisibilityDependencies)
    useEffect(() => aeFn.populateFormFields(apData, annotationEntryDataDispatch), [apData.activeAnnotation, apData.activeAnnotationIndex]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => aeFn.enableSaveOrUpdateButton(apData, annotationEntryData, enableFirstAnnotation, props.index, props.new, setCreateDisabled, setSaveDisabled, isNewPosition), enableDependencies) // eslint-disable-line react-hooks/exhaustive-deps  

    console.log("Annotation entry data: ", annotationEntryData.annotation)

    // JSX for first annotation
    if (props.index === 1) return <AnnotationEntryData.Provider value={annotationEntryContext}>
        <AnnotationEntryTransferModal />
        <FirstAnnotationEntry new={props.new} updateAnnotation={updateAnnotation} createAnnotation={createAnnotation} saveDisabled={saveDisabled} createDisabled={createDisabled} />
    </AnnotationEntryData.Provider>

    // JSX for all other annotations
    return <AnnotationEntryData.Provider value={annotationEntryContext}>
        <AnnotationEntryTransferModal />
        <div className="w-[98%] min-w-[925px] max-w-[2000px] h-fit flex flex-col border border-[#004C46] dark:border-white mt-4 ml-[1%] rounded-xl">
            <RepositionAndRadio new={props.new} index={props.index} />
            <section className="w-full h-fit">
                <PhotoAnnotationEntry />
                <VideoAnnotationEntry />
                <ModelAnnotationEntry annotationModels={props.annotationModels} />
            </section>
            <AnnotationEntryButtons new={props.new} index={props.index} createAnnotation={createAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} createDisabled={createDisabled} saveDisabled={saveDisabled} />
        </div>
    </AnnotationEntryData.Provider>
}
