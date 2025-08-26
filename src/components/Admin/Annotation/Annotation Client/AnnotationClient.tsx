/**
 * @file src/components/Admin/AnnotationClient.tsx
 * 
 * @fileoverview annotation client parent component 
 * its most significant children are AnnotationModelViewer and AnnotationEntry
 * these are the three main components of the client annotation CRUD interface
 * 
 */

'use client'

// Typical imports
import { useEffect, useState, useRef, useContext, createContext, useReducer } from "react"
import { authorized, model } from "@prisma/client"
import { annotationClientData } from "@/interface/interface"
import { DataTransferContext } from "@/components/Admin/Administrator/ManagerClient"
import { annotationsAndPositionsReducer } from "@/functions/client/reducers/annotationsAndPositions"
import { annotationClientSpecimenReducer } from "@/functions/client/reducers/annotationClientSpecimen"
import { activeAnnotationChangeHandler, modelOrAnnotationChangeHandler, modelClickHandler } from "@/functions/client/annotationClient"
import { initialAnnotationsAndPositions, initialSpecimenData } from "@/interface/initializers"
import { assignAnnotation, unassignAnnotation, publishModel, markModelAsIncomplete, getAssignmentEmail} from "@/functions/server/admin/administrator"
import { AnnotationNumbers } from "@/ts/ts"
import { markModelAsAnnotated, renumberAnnotationsServer } from "@/functions/server/admin/annotator"
import { StudentTransferContext } from "../../Student/StudentClient"
import { useSession } from "next-auth/react"
import { simulateAccordionPress } from "@/functions/client/annotationClient"

// Default imports
import AreYouSure from "@/components/Shared/Modals/AreYouSure"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"
import AnnotationReorder from "@/components/Shared/Modals/AnnotationReorder"
import AdminAnnotationClient from "@/components/Admin/Annotation/Annotation Client/AdminAnnotationClient"
import StudentAnnotationClient from "@/components/Admin/Annotation/Annotation Client/StudentAnnotationClient"

// Exported context
export const AnnotationClientData = createContext<annotationClientData | ''>('')

// Main JSX
export default function AnnotationClient(props: { modelsToAnnotate: model[], admin: boolean, authorizedUsers?: authorized[], assignments?: model[] }) {
    // Session and email
    const { data: session } = useSession()
    const userEmail = session?.user?.email

    // Data transfer contexts
    const managerContext = useContext(DataTransferContext)
    const studentContext = useContext(StudentTransferContext)
    const initializeDataTransfer = managerContext ? managerContext.initializeDataTransferHandler : studentContext.initializeDataTransferHandler
    const terminateDataTransfer = managerContext ? managerContext.terminateDataTransferHandler : studentContext.terminateDataTransferHandler

    // Student states
    const [name, setName] = useState<string | null>()
    const [email, setEmail] = useState<string | null>()

    // Data transfer state (for 'Are you sure' modal)
    const [modalOpen, setModalOpen] = useState(false)
    const [viewerLoaded, setViewerLoaded] = useState(false)

    // Annotation reorder open state, admin assigned state
    const [isOpen, setIsOpen] = useState(false)
    const [adminAssigned, setAdminAssigned] = useState(false)

    // Refs
    const modelClicked = useRef(false)
    const newAnnotationEnabled = useRef(false)

    // Reducers
    const [annotationsAndPositions, annotationsAndPositionsDispatch] = useReducer(annotationsAndPositionsReducer, initialAnnotationsAndPositions)
    const [specimenData, specimenDataDispatch] = useReducer(annotationClientSpecimenReducer, initialSpecimenData)

    // Set name and email states fn
    const setNameAndEmailStates = (name: string, email: string) => { setEmail(email); setName(name) }

    // Approve, Unapprove and renumber annotation handlers
    const publishModelHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, publishModel, [specimenData.uid], 'Approving annotations')
    const unapproveAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, markModelAsIncomplete, [specimenData.uid], 'Unapproving annotations')
    const renumberAnnotations = async (annotationNumbers: AnnotationNumbers) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, renumberAnnotationsServer, [annotationNumbers], 'Renumbering annotations')

    // Handlers and utilities
    const assignAnnotationHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, assignAnnotation, [name, email, specimenData.uid], 'Assigning annotation of model')
    const markAsIncompleteHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, markModelAsIncomplete, [specimenData.uid], 'Marking model as incomplete')
    const unassignAnnotationHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, unassignAnnotation, [specimenData.uid, true], 'Unassigning annotation of model')
    const setAdminAssignedFn = async () => setAdminAssigned(await getAssignmentEmail(specimenData.uid as string) === userEmail)
    const markAsAnnotatedHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, markModelAsAnnotated, [specimenData.uid], 'Marking model as annotated')

    // All remaining context objects
    const handlers = { publishModelHandler, unapproveAnnotationsHandler, assignAnnotationHandler, unassignAnnotationHandler, setNameAndEmailStates, markAsIncompleteHandler, markAsAnnotatedHandler }
    const student = { name: name, email: email }
    const admin = props.admin
    const setters = { setViewerLoaded: setViewerLoaded, setSureModalOpen: setModalOpen, setReorderModalOpen: setIsOpen }
    const refs = { modelClicked: modelClicked, newAnnotationEnabled: newAnnotationEnabled }
    const properties = { ...props }

    // Context 
    const annotationClientContext: annotationClientData = { annotationsAndPositions, annotationsAndPositionsDispatch, specimenData, specimenDataDispatch, admin, handlers, student, adminAssigned, setters, refs, properties }

    // Set the activeAnnotation when its dependency is changed from the BotanistModelViewer, either via clicking an annotation or creating a new one
    useEffect(() => activeAnnotationChangeHandler(annotationsAndPositions, annotationsAndPositionsDispatch), [annotationsAndPositions.activeAnnotationIndex]) // eslint-disable-line react-hooks/exhaustive-deps

    // Set relevant model data onPress of the Accordion or when an annotation record has been changed in the database
    useEffect(() => { newAnnotationEnabled.current = false; modelOrAnnotationChangeHandler(specimenData, annotationsAndPositionsDispatch) }, [specimenData.uid, annotationsAndPositions.annotationSavedOrDeleted])

    // Simulate a press of the accrodion for the admin portal; only one model is passed from admin via a <select> (There is a large gap between the model and annotation form otherwise)
    useEffect(() => { if (props.admin) { simulateAccordionPress(setViewerLoaded, annotationsAndPositionsDispatch, specimenDataDispatch, props.modelsToAnnotate[0]) } }, [props.modelsToAnnotate])

    // Sets the 'admin assigned' variable, indicating whethere the active specimen is assigned to the administrator using the portal
    useEffect(() => { if (props.admin && specimenData.uid) { setAdminAssignedFn() } }, [specimenData.uid])

    return <AnnotationClientData.Provider value={annotationClientContext}>

        <AreYouSure uid={specimenData.uid as string} open={modalOpen} setOpen={setModalOpen} />
        {annotationsAndPositions.annotations && annotationsAndPositions.annotations.length >= 2 && specimenData.uid && <AnnotationReorder isOpen={isOpen} setIsOpen={setIsOpen} renumberAnnotations={renumberAnnotations} />}

        {props.admin && <AdminAnnotationClient viewerLoaded={viewerLoaded} />}
        {!props.admin && <StudentAnnotationClient viewerLoaded={viewerLoaded} />}

    </AnnotationClientData.Provider>
}