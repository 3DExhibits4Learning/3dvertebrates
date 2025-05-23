/**
 * @file src/components/Admin/AnnotationClient.tsx
 * 
 * @fileoverview annotation client parent component; 
 * its most significant children are AnnotationModelViewer and AnnotationEntry; 
 * these are the three main components of the client annotation CRUD interface
 * 
 * @todo automatically 'click' the the accordion item if their is only one
 * 
 */

'use client'

// Typical imports
import { Accordion, AccordionItem } from "@nextui-org/react"
import { useEffect, useState, useRef, useContext, createContext, useReducer, memo } from "react"
import { model } from "@prisma/client"
import { studentsAssignmentsAndModels, annotationClientData } from "@/interface/interface"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { DataTransferContext } from "@/components/Admin/Administrator/ManagerClient"
import { annotationsAndPositionsReducer } from "@/functions/client/reducers/annotationsAndPositions"
import { annotationClientSpecimenReducer } from "@/functions/client/reducers/annotationClientSpecimen"
import { activeAnnotationChangeHandler, modelOrAnnotationChangeHandler, modelClickHandler } from "@/functions/client/annotationClient"
import { initialAnnotationsAndPositions, initialSpecimenData } from "@/interface/initializers"
import { assignAnnotation, unassignAnnotation, approveAnnotations, unapproveAnnotations } from "@/functions/server/admin/administrator"
import { AnnotationNumbers } from "@/ts/ts"
import { renumberAnnotationsServer } from "@/functions/server/admin/annotator"
import { StudentTransferContext } from "../../Student/StudentClient"

// Default imports
import BotanistRefWrapper from "../Annotation Model Viwer/AnnotationModelViewerRef"
import AreYouSure from "@/components/Shared/Modals/AreYouSure"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"
import AnnotationEntryWrapper from "./AnnotationEntryWrapper"
import AdminAnnotation from "./AdminAnnotation"
import AnnotationButtons from "./AnnotationButtons"
import ModalWrapper from "@/components/Shared/Modals/ModalWrapper"

// Exported context
export const AnnotationClientData = createContext<annotationClientData | ''>('')

// Main JSX
export default function AnnotationClient(props: { modelsToAnnotate: model[], annotationModels: model[], admin: boolean, students?: studentsAssignmentsAndModels[] }) {

    // Data transfer contexts
    const managerContext = useContext(DataTransferContext)
    const studentContext = useContext(StudentTransferContext)
    const initializeDataTransfer = managerContext? managerContext.initializeDataTransferHandler : studentContext.initializeDataTransferHandler
    const terminateDataTransfer = managerContext? managerContext.terminateDataTransferHandler : studentContext.terminateDataTransferHandler

    // Student states
    const [name, setName] = useState<string | null>()
    const [email, setEmail] = useState<string | null>()

    // Data transfer state (for 'Are you sure' modal)
    const [modalOpen, setModalOpen] = useState<boolean>(false)

    // Reorder annotations states
    const [isOpen, setIsOpen] = useState(false)

    // Refs
    const modelClicked = useRef<boolean>()
    const newAnnotationEnabled = useRef<boolean>(false)

    // Reducers
    const [annotationsAndPositions, annotationsAndPositionsDispatch] = useReducer(annotationsAndPositionsReducer, initialAnnotationsAndPositions)
    const [specimenData, specimenDataDispatch] = useReducer(annotationClientSpecimenReducer, initialSpecimenData)

    // Set name and email states fn
    const setNameAndEmailStates = (name: string, email: string) => { setEmail(email); setName(name) }

    // Approve, Unapprove and renumber annotation handlers
    const approveAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, approveAnnotations, [specimenData.uid], 'Approving annotations')
    const unapproveAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, unapproveAnnotations, [specimenData.uid], 'Unapproving annotations')
    const renumberAnnotations = async(annotationNumbers: AnnotationNumbers) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, renumberAnnotationsServer, [annotationNumbers], 'Renumbering annotations')

    // Annotation assign and unassign handlers
    const assignAnnotationHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, assignAnnotation, [name, email, specimenData.uid], 'Assigning annotation of model')
    const getAnnotationUnassignmentEmail = () => (props.students as studentsAssignmentsAndModels[]).find(student => student.assignment.find(assignment => assignment.uid === specimenData.uid))?.email
    const unassignAnnotationHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, unassignAnnotation, [getAnnotationUnassignmentEmail(), specimenData.uid], 'Unassigning annotation of model')

    // Handler object for context; student context object
    const handlers = { approveAnnotationsHandler, unapproveAnnotationsHandler, assignAnnotationHandler, unassignAnnotationHandler, setNameAndEmailStates }
    const student = { name: name, email: email }

    // Context 
    const annotationClientContext: annotationClientData = { annotationsAndPositions, annotationsAndPositionsDispatch, specimenData, specimenDataDispatch, handlers, student }

    // Set the activeAnnotation when its dependency is changed from the BotanistModelViewer, either via clicking an annotation or creating a new one
    useEffect(() => activeAnnotationChangeHandler(annotationsAndPositions, annotationsAndPositionsDispatch), [annotationsAndPositions.activeAnnotationIndex]) // eslint-disable-line react-hooks/exhaustive-deps

    // Set relevant model data onPress of the Accordion or when an annotation record has been changed in the database
    useEffect(() => { newAnnotationEnabled.current = false; modelOrAnnotationChangeHandler(specimenData, annotationsAndPositionsDispatch) }, [specimenData.uid, annotationsAndPositions.annotationSavedOrDeleted])

    const AnnotationMemo = memo(() => <AnnotationEntryWrapper modelsToAnnotate={props.modelsToAnnotate} admin={props.admin} annotationModels={props.annotationModels} />)
    AnnotationMemo.displayName = 'AnnotationMemo'

    //console.log("Annotations and positions: ", annotationsAndPositions.activeAnnotation?.annotation)
    //console.log("Specimen data: ", specimenData)

    return <AnnotationClientData.Provider value={annotationClientContext} >

        <AreYouSure uid={specimenData.uid as string} open={modalOpen} setOpen={setModalOpen} />
        {annotationsAndPositions.annotations && annotationsAndPositions.annotations.length >=2 && specimenData.uid && <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen} renumberAnnotations={renumberAnnotations}/>}

        <div className="flex flex-col w-full h-full text-[#004C46 dark:text-white]">

            <section className="flex">
                <section className="h-full w-1/5 min-w-[325px]">
                    <Accordion className="h-full" onSelectionChange={(keys: any) => modelClicked.current = keys.size ? true : false}>
                        {props.modelsToAnnotate.map((model, i) =>
                            <AccordionItem
                                key={i}
                                aria-label={'Specimen to model'}
                                title={toUpperFirstLetter(model.spec_name)}
                                classNames={{ title: 'text-[ #004C46] text-2xl' }}
                                onPress={() => modelClickHandler(modelClicked.current as boolean, model, annotationsAndPositionsDispatch, specimenDataDispatch)}>
                                {annotationsAndPositions.firstAnnotationPosition !== undefined && <div className="h-[400px]"><BotanistRefWrapper ref={newAnnotationEnabled} /></div>}
                                <AdminAnnotation admin={props.admin} students={props.students as studentsAssignmentsAndModels[]} />
                                <AnnotationButtons setModalOpen={setModalOpen} ref={newAnnotationEnabled} setReorderOpen={setIsOpen}/>
                            </AccordionItem>
                        )}
                    </Accordion>
                </section>

                <AnnotationMemo />
            </section>

        </div>
    </AnnotationClientData.Provider>
}