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
import { useState, useEffect, useContext, createContext, useReducer, useMemo } from "react"
import { annotationClientData, annotationEntryContext } from "@/interface/interface"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { getInitialAnnotationEntryData } from "@/interface/initializers"
import { photo_annotation } from '@prisma/client'
import { createNewAnnotationEntry, deleteAnnotationEntry, updateAnnotationEntry } from '@/functions/server/admin/annotator'

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
import TextAnnotation from '@/components/Admin/Annotation/AnnotationEntry/TextAnnotation'

// Data context initialization
export const AnnotationEntryData = createContext<annotationEntryContext | ''>('')

// Main JSX
export default function AnnotationEntry(props: { index: number, new: boolean }) {

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

    // Annotation type radio button must be checked for 'create' button to be rendered
    const isAnnotationRadioChecked = annotationEntryData.modelChecked || annotationEntryData.photoChecked || annotationEntryData.videoChecked || annotationEntryData.textChecked

    // New position boolean value; first annotation create/save enabler
    const isNewPosition = apData.position3D !== undefined ? true : false
    const enableFirstAnnotation = (isDisabled: boolean) => { setCreateDisabled(isDisabled); setSaveDisabled(isDisabled) }

    // Data transfer handlers
    const initializeDataTransferHandler = (loadingLabel: string) => transferStateDispatch({ type: 'initialize', loadingLabel: loadingLabel })
    const terminateDataTransferHandler = (result: string) => transferStateDispatch({ type: 'terminate', result: result })
    const dataTransferWrapper = (fn: Function, args: any[], label: string) => dataTransferHandler(initializeDataTransferHandler, terminateDataTransferHandler, fn, args, label)

    // Annotation creation/update argument objects
    const annotationCreationArg = aeFn.getAnnotationEntryDataObj(annotationEntryData, specimen.uid as string, props.index.toString(), apData.position3D as string, apData)
    const annotationUpdateArg = aeFn.getAnnotationEntryUpdateDataObj(annotationEntryData, props.index.toString(), apData.position3D as string, apData, specimen)
    const getAnnotationDeletionUrl = () => apData.activeAnnotationType === 'photo' ? (apData.activeAnnotation as photo_annotation).url : ''

    // Annotation CUD handlers
    const createAnnotation = () => dataTransferWrapper(createNewAnnotationEntry, [annotationCreationArg], 'Creating Annotation')
    const updateAnnotation = () => dataTransferWrapper(updateAnnotationEntry, [annotationUpdateArg], 'Updating Annotation')
    const deleteAnnotation = () => dataTransferWrapper(deleteAnnotationEntry, [apData.activeAnnotation?.annotation_id as string, specimen.uid as string, getAnnotationDeletionUrl()], 'Deleting Annotation')

    // Image visibility effect dependencies
    const imageVisibilityDependencies = [props.new, annotationEntryData.annotationType, props.index, annotationEntryData.file, apData.activeAnnotation]

    // Create/save annotation enable effect dependencies
    const enableDependencies = [annotationEntryData.annotationTitle, apData.position3D, annotationEntryData.url, annotationEntryData.author,
    annotationEntryData.license, annotationEntryData.annotation, annotationEntryData.file, annotationEntryData.length, annotationEntryData.photoTitle, annotationEntryData.website,
    annotationEntryData.modelAnnotationUid, annotationEntryData.videoSource, annotationEntryData.annotationType]

    // Effects: populate form fields upon annotation selection, set whether annotation photo is visible, enable save/update button, and data clearance respectively
    useEffect(() => aeFn.populateFormFields(apData, annotationEntryDataDispatch), [apData.activeAnnotation, apData.activeAnnotationIndex]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => aeFn.setImageVisibility(props.index, annotationEntryData, props.new, annotationEntryDataDispatch), imageVisibilityDependencies)
    useEffect(() => aeFn.enableSaveOrUpdateButton(apData, annotationEntryData, enableFirstAnnotation, props.index, props.new, setCreateDisabled, setSaveDisabled, isNewPosition), enableDependencies) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => annotationEntryDataDispatch({ type: 'clearAnnotationEntryData' }), [apData.annotationSavedOrDeleted]) // eslint-disable-line react-hooks/exhaustive-deps

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
                <TextAnnotation />
                <PhotoAnnotationEntry />
                <VideoAnnotationEntry />
                <ModelAnnotationEntry />
            </section>
            {isAnnotationRadioChecked && <AnnotationEntryButtons new={props.new} index={props.index} createAnnotation={createAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} createDisabled={createDisabled} saveDisabled={saveDisabled} />}
        </div>
    </AnnotationEntryData.Provider>
}
