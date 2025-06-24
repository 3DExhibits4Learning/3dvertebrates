/**
 * @file src\components\Admin\Annotation\Annotation Client\AdminAnnotation.tsx
 * 
 * @fileoverview admin only options for the annotation client
 */

// Typical imports
import { annotationClientData, studentsAssignmentsAndModels } from "@/interface/interface"
import { Button } from "@heroui/react"
import { useContext } from "react"
import { AnnotationClientData } from "./AnnotationClient"

// Default imports
import StudentSelect from "../../Administrator/Students/SelectStudents"

// Main JSX
export default function AdminAnnotation(props: { admin: boolean, students: studentsAssignmentsAndModels[] }) {

    // Context, variables
    const context = useContext(AnnotationClientData) as annotationClientData
    const handlers = context.handlers
    const specimenData = context.specimenData
    const annotationsAndPositions = context.annotationsAndPositions
    const student = context.student

    return <>
        {
            // Student select and assign
            props.admin && !specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
            <>
                <StudentSelect students={props.students} setNameAndEmailStates={handlers.setNameAndEmailStates} />
                <div className="flex">
                    <Button
                        size='sm'
                        onPress={() => handlers.assignAnnotationHandler()}
                        className="text-white mt-2 text-md"
                        isDisabled={!(student.name && student.email)}>
                        Assign
                    </Button>
                </div>
            </>
        }
        {
            // Assignment data, approve/unapprove buttons, unassign button
            props.admin && specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
            <>
                <div className="w-full mb-2">
                    <table className="w-full overflow-hidden rounded-b-lg bg-[#D5CB9F] dark:bg-[#212121] text-center">
                        <thead>
                            <tr>
                                <td className="py-1 border-b border-[#004C46] border-r">Assigned to</td>
                                <td className="py-1 border-b border-[#004C46]">{specimenData.annotator}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-1 border-b border-[#004C46] border-r">Student Approved</td>
                                <td className="py-1 border-b border-[#004C46]">{specimenData.annotated ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <td className="py-1 border-[#004C46] border-r">Admin Approved</td>
                                <td className="py-1 border-[#004C46]">{specimenData.annotationsApproved ? 'Yes' : 'No'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {
                    specimenData.annotated && !specimenData.annotationsApproved &&
                    <div className="flex"><Button onPress={() => handlers.approveAnnotationsHandler()} className="text-white mt-2 text-md" size='sm'>Approve</Button></div>
                }
                {
                    specimenData.annotated && specimenData.annotationsApproved &&
                    <div className="flex"><Button onPress={() => handlers.unapproveAnnotationsHandler()} className="text-white mt-2 text-md" size='sm'>Unapprove</Button></div>
                }
                <div className="flex"><Button onPress={() => handlers.unassignAnnotationHandler()} size='sm' className="text-white mt-2 text-md">Unassign</Button></div>
            </>
        }
    </>
}