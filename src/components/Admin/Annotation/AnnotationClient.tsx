/**
 * @file src/components/Admin/AnnotationClient.tsx
 * 
 * @fileoverview annotation client parent component; 
 * its most significant children are AnnotationModelViewer and AnnotationEntry; 
 * these are the three main components of the client annotation CRUD interface
 * 
 * @todo Extract and import single JSX components
 * 
 */

'use client'

// Typical imports
import { Accordion, AccordionItem } from "@nextui-org/react"
import { useEffect, useState, useRef, useContext, createContext, useReducer } from "react"
import { model } from "@prisma/client"
import { studentsAssignmentsAndModels, annotationClientData } from "@/interface/interface"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { Button } from "@nextui-org/react"
import { DataTransferContext } from "@/components/Admin/Administrator/ManagerClient"
import { approveAnnotations, unapproveAnnotations, rejectAnnotations } from "@/functions/client/managerClient/approveAnnotations"
import { annotationsAndPositionsReducer } from "@/functions/client/reducers/annotationsAndPositions"
import { annotationClientSpecimenReducer } from "@/functions/client/reducers/annotationClientSpecimen"
import { getIndex, getAssignmentArgs, getAssignmentLabel, activeAnnotationChangeHandler, modelOrAnnotationChangeHandler, modelClickHandler } from "@/functions/client/annotationClient"
import { initialAnnotationsAndPositions, initialSpecimenData } from "@/interface/initializers"

// Default imports
import BotanistRefWrapper from "./AnnotationModelViewerRef"
import AreYouSure from "@/components/Shared/Modals/AreYouSure"
import AnnotationEntry from "./AnnotationEntry"
import assignAnnotation from "@/functions/client/managerClient/assignAnnotation"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"
import StudentSelect from "@/components/Admin/Administrator/Students/SelectStudents"

// Exported context
export const AnnotationClientData = createContext<annotationClientData | ''>('')

// Main JSX
export default function AnnotationClient(props: { modelsToAnnotate: model[], annotationModels: model[], admin: boolean, students?: studentsAssignmentsAndModels[] }) {

    // Data transfer contexts
    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    // Student states
    const [name, setName] = useState<string | null>()
    const [email, setEmail] = useState<string | null>()

    // Data transfer state (for 'Are you sure' modal)
    const [modalOpen, setModalOpen] = useState<boolean>(false)

    // Refs
    const modelClicked = useRef<boolean>()
    const newAnnotationEnabled = useRef<boolean>(false)

    // Reducers
    const [annotationsAndPositions, annotationsAndPositionsDispatch] = useReducer(annotationsAndPositionsReducer, initialAnnotationsAndPositions)
    const [specimenData, specimenDataDispatch] = useReducer(annotationClientSpecimenReducer, initialSpecimenData)

    // Context 
    const annotationClientContext: annotationClientData = { annotationsAndPositions, annotationsAndPositionsDispatch, specimenData, specimenDataDispatch }

    // Set name and email states fn
    const setNameAndEmailStates = (name: string, email: string) => { setEmail(email); setName(name) }

    // Approve/Unapprove annotation handlers
    const approveAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, approveAnnotations, [specimenData.uid], 'Approving annotations')
    const rejectAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, rejectAnnotations, [specimenData.uid], 'Rejecting annotations')
    const unapproveAnnotationsHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, unapproveAnnotations, [specimenData.uid], 'Unapproving annotations')

    // Annotation assign (or unassign) handler
    const assignAnnotationHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, assignAnnotation, getAssignmentArgs(specimenData, name, props.students, email), getAssignmentLabel(specimenData))

    // Set the activeAnnotation when its dependency is changed from the BotanistModelViewer, either via clicking an annotation or creating a new one
    useEffect(() => activeAnnotationChangeHandler(annotationsAndPositions, annotationsAndPositionsDispatch), [annotationsAndPositions.activeAnnotationIndex]) // eslint-disable-line react-hooks/exhaustive-deps

    // Set relevant model data onPress of the Accordion or when an annotation record has been changed in the database
    useEffect(() => { newAnnotationEnabled.current = false; modelOrAnnotationChangeHandler(specimenData, annotationsAndPositionsDispatch) }, [specimenData.uid, annotationsAndPositions.annotationSavedOrDeleted])

    return <AnnotationClientData.Provider value={annotationClientContext} >
        <AreYouSure uid={specimenData.uid as string} open={modalOpen} setOpen={setModalOpen} />

        <div className="flex w-full h-full">
            <section className="h-full w-1/5 min-w-[325px]">

                {/* Accordion holds all imported models - this will be replaced with an autocomplete*/}

                <Accordion className="h-full" onSelectionChange={(keys: any) => modelClicked.current = keys.size ? true : false}>
                    {
                        props.modelsToAnnotate.map((model, i) =>
                            <AccordionItem
                                key={i}
                                aria-label={'Specimen to model'}
                                title={toUpperFirstLetter(model.spec_name)}
                                classNames={{ title: 'text-[ #004C46] text-2xl' }}
                                onPress={() => modelClickHandler(modelClicked.current as boolean, model, annotationsAndPositionsDispatch, specimenDataDispatch)}
                            >
                                {
                                    // Conditional render that waits until the first annotation (thus all annotations) is loaded
                                    // RefWrapper required to pass ref to dynamically imported component
                                    annotationsAndPositions.firstAnnotationPosition !== undefined &&
                                    <div className="h-[400px]">
                                        <BotanistRefWrapper ref={newAnnotationEnabled} />
                                    </div>
                                }
                                {
                                    // Admin only - Student select and assign
                                    props.admin && !specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
                                    <>
                                        <StudentSelect students={props.students as studentsAssignmentsAndModels[]} setNameAndEmailStates={setNameAndEmailStates} />
                                        <div className="flex">
                                            <Button
                                                onPress={() => assignAnnotationHandler()}
                                                className="text-white mt-2 text-lg"
                                                isDisabled={!(name && email)}>
                                                Assign
                                            </Button>
                                        </div>
                                    </>
                                }
                                {
                                    // Admin only - assignment data, approve/unapprove buttons, unassign button
                                    props.admin && specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
                                    <>
                                        <div className="w-full mb-2">
                                            <table className="w-full overflow-hidden rounded-b-lg bg-[#D5CB9F] dark:bg-[#212121] text-center">
                                                <tr>
                                                    <td className="py-1 border-b border-[#004C46] border-r">Assigned to</td>
                                                    <td className="py-1 border-b border-[#004C46]">{specimenData.annotator}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 border-b border-[#004C46] border-r">Student Approved</td>
                                                    <td className="py-1 border-b border-[#004C46]">{specimenData.annotated ? 'Yes' : 'No'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 border-[#004C46] border-r">Admin Approved</td>
                                                    <td className="py-1 border-[#004C46]">{specimenData.annotationsApproved ? 'Yes' : 'No'}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        {
                                            // Approval button
                                            specimenData.annotated && !specimenData.annotationsApproved &&
                                            <div className="flex">
                                                <Button onPress={() => approveAnnotationsHandler()}
                                                    className="text-white mt-2 text-lg"
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        }
                                        {
                                            // Unapproval button
                                            specimenData.annotated && specimenData.annotationsApproved &&
                                            <div className="flex">
                                                <Button onPress={() => unapproveAnnotationsHandler()}
                                                    className="text-white mt-2 text-lg"
                                                >
                                                    Unapprove
                                                </Button>
                                            </div>
                                        }
                                        <div className="flex">
                                            <Button onPress={() => assignAnnotationHandler()}
                                                className="text-white mt-2 text-lg"
                                            >
                                                Unassign
                                            </Button>
                                        </div>
                                    </>
                                }
                                {
                                    // New annotation button
                                    !annotationsAndPositions.newAnnotationEnabled &&
                                    annotationsAndPositions.activeAnnotationIndex != 'new' &&
                                    annotationsAndPositions.firstAnnotationPosition != undefined &&
                                    <Button onPress={() => { newAnnotationEnabled.current = true; annotationsAndPositionsDispatch({ type: 'newAnnotation' }) }}
                                        className="text-white mt-2 text-lg"
                                        isDisabled={annotationsAndPositions.repositionEnabled}
                                    >
                                        + New Annotation
                                    </Button>
                                }
                                {
                                    // 'Mark as annotated' button
                                    annotationsAndPositions.annotations &&
                                    annotationsAndPositions.annotations?.length >= 6 &&
                                    <>
                                        <br></br>
                                        <Button onPress={() => setModalOpen(true)}
                                            className="text-white mt-2 text-lg"
                                            isDisabled={annotationsAndPositions.repositionEnabled}
                                        >
                                            Mark as Annotated
                                        </Button>
                                    </>
                                }
                                {
                                    // Click to place annotation or cancel
                                    annotationsAndPositions.newAnnotationEnabled &&
                                    <div className="flex justify-center flex-col items-center">
                                        <p className="text-lg text-center">Click the subject to add an annotation</p>
                                        <p className="text-lg">or</p>
                                        <Button
                                            color="danger"
                                            variant="light"
                                            className="text-red-600 hover:text-white text-lg"
                                            onPress={() => { newAnnotationEnabled.current = false; annotationsAndPositionsDispatch({ type: 'annotationCancelled' }) }}
                                        >
                                            Cancel Annotation
                                        </Button>
                                    </div>
                                }
                            </AccordionItem>
                        )
                    }
                </Accordion>
            </section>

            <div className="flex flex-col w-4/5">
                <section className="flex w-full h-full flex-col">
                    {
                        // 'Select a 3d model' banner
                        !specimenData.uid && !annotationsAndPositions.activeAnnotation &&
                        <div className="flex items-center justify-center text-xl h-full w-full">
                            <p className="mr-[10%] text-lg lg:text-3xl mb-12">{props.modelsToAnnotate.length ? props.admin ? 'Select a 3D model' : 'Select an annotation, or click New Annotation' : "No models assigned"}</p>
                        </div>
                    }
                    {
                        // 'Select an annotation' banner
                        specimenData.uid &&
                        !annotationsAndPositions.activeAnnotation &&
                        annotationsAndPositions.activeAnnotationIndex !== 1 &&
                        !annotationsAndPositions.newAnnotationEnabled &&
                        <div className="flex items-center justify-center text-xl h-full w-full">
                            <p className="mr-[10%] text-lg lg:text-3xl">Select an annotation, or click New Annotation</p>
                        </div>
                    }
                    {
                        // This indicates a databased annotation
                        typeof (annotationsAndPositions.activeAnnotationIndex) === 'number' &&
                        <AnnotationEntry index={getIndex(annotationsAndPositions) as number} new={false} annotationModels={props.annotationModels} />
                    }
                    {
                        // This indicates a new annotation
                        typeof (annotationsAndPositions.activeAnnotationIndex) === 'string' &&
                        <AnnotationEntry index={getIndex(annotationsAndPositions) as number} new annotationModels={props.annotationModels} />
                    }
                </section>
            </div>
        </div>
    </AnnotationClientData.Provider>
}