/**
 * @file src\components\Admin\Annotation\Annotation Client\AdminAnnotation.tsx
 * 
 * @fileoverview admin only options for the annotation client
 */

// Typical imports
import { annotationClientData } from "@/interface/interface"
import { Button } from "@heroui/react"
import { useContext, useState } from "react"
import { AnnotationClientData } from "./AnnotationClient"
import { authorized } from "@prisma/client"

// Default imports
import StudentSelect from "../../Administrator/Students/SelectStudents"
import ThumbnailPreviewModal from "@/components/Admin/Annotation/Annotation Client/ThumbnailModal"
import UnassignmentModal from "@/components/Admin/Annotation/Annotation Client/UnassignModal"
import AssignModal from "@/components/Admin/Annotation/Annotation Client/AssignModal"

// Main JSX
export default function AdminAnnotation(props: { admin: boolean, authorizedUsers: authorized[] }) {

    // Context, variables
    const context = useContext(AnnotationClientData) as annotationClientData
    const handlers = context.handlers
    const specimenData = context.specimenData
    const annotationsAndPositions = context.annotationsAndPositions
    const student = context.student
    const authorizedUsers = props.authorizedUsers.filter(user => ['admin', 'student'].includes(user.role))
    const thumbnail = context.properties.modelsToAnnotate.find(model => model.uid === specimenData.uid)?.thumbnail

    // Modal state
    const [isThumbnailPreviewOpen, setIsThumbnailPreviewOpen] = useState(false)
    const [assignModalOpen, setAssignModalOpen] = useState(false)

    return <>
        <ThumbnailPreviewModal path={thumbnail} isOpen={isThumbnailPreviewOpen} setIsOpen={setIsThumbnailPreviewOpen} species={specimenData.specimenName as string} />
        <AssignModal isOpen={assignModalOpen} setIsOpen={setAssignModalOpen} assignee={context.student.name as string} uid={specimenData.uid as string} email={context.student.email as string} />
        {
            // Student select and assign
            props.admin && !specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
            <div className="flex flex-col justify-start items-center mt-2 mb-8 w-full">
                <p className="text-xl font-medium mb-1 w-full text-center">Select an annotator for assignment</p>
                <div className="flex w-full items-center justify-center">
                    <StudentSelect authorizedUsers={authorizedUsers} setNameAndEmailStates={handlers.setNameAndEmailStates} />
                    <Button
                        size='sm'
                        onPress={() => handlers.assignAnnotationHandler()}
                        className="text-white text-md rounded-md ml-4"
                        isDisabled={!(student.name && student.email)}>
                        Assign
                    </Button>
                </div>
            </div>
        }
        {
            // Assignment data, approve/unapprove buttons, unassign button
            props.admin && specimenData.annotator && !annotationsAndPositions.newAnnotationEnabled &&
            <section className="grid grid-cols-2 rounded-b-md w-full bg-[#D5CB9F] dark:bg-[#212121]">
                        <div className="py-1 border-b border-r w-full text-center">Assigned to</div>
                        <div className="py-1 border-b text-center">{specimenData.annotator}</div>

                        <div className="py-1 border-b border-r text-center">Completed</div>
                        <div className="py-1 border-b text-center">{specimenData.annotated ? 'Yes' : 'No'}</div>

                        <div className="py-1 border-r text-center">Thumbnail</div>
                        <div className="py-1 text-center">{thumbnail ? <Button onPress={() => setIsThumbnailPreviewOpen(true)} className="text-white text-sm h-[20px] rounded-md">Preview</Button> : 'N/A'}</div>
            </section>
        }
    </>
}