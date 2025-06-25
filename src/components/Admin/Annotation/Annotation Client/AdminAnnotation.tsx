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
                <div className="flex flex-col justify-start items-center mt-2 mb-8">
                    <p className="text-xl font-medium mb-1 text-left w-full">Select student for assignment</p>
                    <div className="flex w-full items-center">
                    <StudentSelect students={props.students} setNameAndEmailStates={handlers.setNameAndEmailStates} />
                    <Button
                        size='sm'
                        onPress={() => handlers.assignAnnotationHandler()}
                        className="text-white text-md m-auto rounded-md"
                        isDisabled={!(student.name && student.email)}>
                        Assign
                    </Button>
                    </div>
                </div>
            </>
        }
        {
            // Assignment data, approve/unapprove buttons, unassign button
            props.admin && specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
            <>
                <div className="w-full mb-4">
                    <table className="w-full overflow-hidden rounded-b-lg bg-[#D5CB9F] dark:bg-[#212121] text-center">
                        <thead>
                            <tr>
                                <td className="py-1 border-b border-r w-1/2">Assigned to</td>
                                <td className="py-1 border-b">{specimenData.annotator}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-1 border-b border-r">Completed</td>
                                <td className="py-1 border-b">{specimenData.annotated ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <td colSpan={2}><Button onPress={() => handlers.unassignAnnotationHandler()} size='sm' className="text-white my-2 text-md">Unassign Model</Button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* {
                    specimenData.annotated && !specimenData.annotationsApproved &&
                    <div className="flex"><Button onPress={() => handlers.approveAnnotationsHandler()} className="text-white mt-2 text-md" size='sm'>Approve</Button></div>
                }
                {
                    specimenData.annotated && specimenData.annotationsApproved &&
                    <div className="flex"><Button onPress={() => handlers.unapproveAnnotationsHandler()} className="text-white mt-2 text-md" size='sm'>Unapprove</Button></div>
                } */}
                {/* <div className="flex"><Button onPress={() => handlers.unassignAnnotationHandler()} size='sm' className="text-white mt-2 text-md">Unassign</Button></div> */}
            </>
        }
    </>
}