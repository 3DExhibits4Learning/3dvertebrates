/**
 * 
 * @deprecated
 * 
 * @file src\components\Admin\Administrator\Annotations\AnnotationAssignment.tsx
 * 
 * @fileoverview client component interface for administrators to assign 3D models to students for annotation
 * 
 * @todo append email string with "@humboldt.edu" (and indicate such on form) as opposed to @ being mandatory in the regEx
 */

'use client'

// Imports
import { fullModel, studentsAssignmentsAndModels } from "@/interface/interface"
import { useState, useEffect, useContext } from "react"
import { Button } from "@heroui/react"
import { DataTransferContext } from "../ManagerClient"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"
import { assignAnnotation } from "@/functions/server/admin/administrator"
import Select from "@/components/Shared/Form Fields/Select"
import StudentSelect from "../Students/SelectStudents"

// Main component
export default function AnnotationAssignment(props: { students: studentsAssignmentsAndModels[], unannotatedModels: fullModel[] }) {

    // Data transfer context
    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    // Form states
    const [student, setStudent] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [assignmentUid, setAssignmentUid] = useState<string>('')

    // Annotation assigned/unassigned state
    const [annotationAssigned, setAnnotationAssigned] = useState<boolean>(false)

    // Set name and email states
    const setNameAndEmailStates = (name: string, email: string) => {
        setStudent(name)
        setEmail(email)
    }

    // Annotation assign (or unassign) handler
    const assignAnnotationHandler = async () => {
        const args = annotationAssigned ? [assignmentUid, null, email] : [assignmentUid, student, email]
        const label = annotationAssigned ? 'Unassigning model to student for annotation' : 'Assigning model to student for annotation'
        await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, assignAnnotation, args, label)
    }

    // Effect determines whether an assignment is assigned to a student (if both an assignment and a student are selected)
    useEffect(() => {
        if (assignmentUid && student) {
            const model = props.unannotatedModels.find(model => model.uid === assignmentUid)
            if (student === model?.annotator) setAnnotationAssigned(true)
        }
    }, [assignmentUid, student])

    return (
        <>
            <section className="flex justify-center w-full h-3/4 flex-col ml-12">

                <section className="flex flex-col w-1/2 mt-8">
                    <Select value={assignmentUid} setValue={setAssignmentUid} models={props.unannotatedModels} title='Select Model' />
                </section>

                <StudentSelect setNameAndEmailStates={setNameAndEmailStates} students={props.students} />

            </section>

            {
                annotationAssigned &&
                <p className="tmb-4 text-xl ml-12 mb-8">* This model is already assigned to this student, click below to unassign the model</p>
            }

            <section className="flex ml-12">
                <Button className="text-white text-xl py-2 mb-8" onPress={assignAnnotationHandler} isDisabled={!(assignmentUid && student)}>
                    {annotationAssigned ? 'Unassign model' : 'Assign model'}
                </Button>
            </section>
        </>
    )
}