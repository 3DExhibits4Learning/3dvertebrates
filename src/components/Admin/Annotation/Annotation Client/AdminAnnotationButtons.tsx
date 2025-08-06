/**
 * @file src/components/Admin/Annotation/Annotation Client/AnnotationButtons.tsx
 * 
 * @fileoverview annotation client buttons for: new annotaton, mark as annotated and cancel annotation
 * 
 * @todo remove 'mark as annotated button' after model has been marked as annotated
 */

// Default imports
import Link from "next/link"

// Typical imports
import { Button } from "@heroui/react"
import { AnnotationClientData } from "./AnnotationClient"
import { forwardRef, RefObject, SetStateAction, useContext, Dispatch, useState } from "react"
import { annotationClientData } from "@/interface/interface"

// Default imports
import UnassignmentModal from "@/components/Admin/Annotation/Annotation Client/UnassignModal"
import MarkAsIncompleteModal from "@/components/Admin/Annotation/Annotation Client/MarkAsIncompleteModal"
import PublishModal from "@/components/Admin/Annotation/Annotation Client/PublishModal"

// Main JSX
const AdminAnnotationButtons = forwardRef((props: { setModalOpen: Dispatch<SetStateAction<boolean>>, setReorderOpen: Dispatch<SetStateAction<boolean>> }, ref) => {
    // Context, variables
    const context = useContext(AnnotationClientData) as annotationClientData
    const annotationsAndPositions = context.annotationsAndPositions
    const annotationsAndPositionsDispatch = context.annotationsAndPositionsDispatch

    // Ref
    const newAnnotationEnabled = ref as RefObject<boolean>

    // Modal states
    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false)
    const [isMarkAsIncompleteOpen, setIsMarkAsIncompleteOpen] = useState(false)
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

    // Top colomn padding is based on the design of AdminAnnotation.tsx which is based on the existence of an annotator
    const topColumnPadding = context.specimenData.annotator ? 'py-2' : 'pb-2'

    return <>
        <UnassignmentModal isOpen={isUnassignModalOpen} setIsOpen={setIsUnassignModalOpen} />
        <MarkAsIncompleteModal isOpen={isMarkAsIncompleteOpen} setIsOpen={setIsMarkAsIncompleteOpen} />
        <PublishModal isOpen={isPublishModalOpen} setIsOpen={setIsPublishModalOpen} />

        <section className="grid grid-cols-2 rounded-md w-full">
            {
                // New annotation button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                <div className={`flex justify-start items-center border-r border-b pr-2 ${topColumnPadding}`}>
                    <Button
                        size='sm'
                        onPress={() => { newAnnotationEnabled.current = true; annotationsAndPositionsDispatch({ type: 'newAnnotation' }) }}
                        className="text-white text-md min-w-[171px] rounded-md w-full h-7"
                        isDisabled={annotationsAndPositions.repositionEnabled || !context.adminAssigned}>
                        New Annotation
                    </Button>
                </div>
            }
            {
                annotationsAndPositions.activeAnnotationIndex !== 'new' &&
                <div className={`flex justify-end items-center border-b pl-2 pb-2 !w-full ${topColumnPadding}`}>
                    <Link href={`/collections/${context.specimenData.specimenName}?preview=1`} target='_blank' className="w-full">
                        <Button
                            size='sm'
                            className="text-white text-md min-w-[171px] rounded-md w-full h-7"
                            isDisabled={annotationsAndPositions.repositionEnabled || !context.annotationsAndPositions.firstAnnotationPosition}>
                            Preview Annotations
                        </Button>
                    </Link>
                </div>
            }
            {
                // Renumber annotations button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                annotationsAndPositions.annotations &&
                <div className="flex justify-start items-center border-r border-b pr-2 py-2">
                    <br></br>
                    <Button
                        size='sm'
                        onPress={() => props.setReorderOpen(true)}
                        className="text-white text-md min-w-[171px] rounded-md w-full h-7"
                        isDisabled={annotationsAndPositions.repositionEnabled || !context.adminAssigned || annotationsAndPositions.annotations?.length <= 1} >
                        Reorder Annotations
                    </Button>
                </div>
            }
            {
                // 'Mark as annotated' button
                annotationsAndPositions.annotations && annotationsAndPositions.activeAnnotationIndex !== 'new' &&
                <div className="flex justify-end border-b items-center pl-2 py-2">
                    <br></br>
                    <Button
                        onPress={() => setIsPublishModalOpen(true)}
                        size='sm'
                        className="text-white text-md min-w-[171px] rounded-md w-full h-7"
                        isDisabled={annotationsAndPositions.annotations?.length < 4 || (!context.specimenData.annotated && !context.adminAssigned) }>
                        Publish Model
                    </Button>
                </div>
            }
            {
                // Renumber annotations button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined && annotationsAndPositions.annotations &&
                <div className="flex justify-start items-center border-r pr-2 pt-2">
                    <br></br>
                    <Button
                        size='sm'
                        onPress={() => setIsMarkAsIncompleteOpen(true)}
                        className="text-white text-md min-w-[171px] rounded-md w-full h-7"
                        isDisabled={!context.specimenData.annotated || context.adminAssigned} >
                        Mark As Incomplete
                    </Button>
                </div>
            }
            {
                // Renumber annotations button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                annotationsAndPositions.annotations &&
                <div className="flex justify-end items-center pl-2 pt-2">
                    <br></br>
                    <Button
                        size='sm'
                        onPress={() => setIsUnassignModalOpen(true)}
                        className="text-md min-w-[171px] rounded-md w-full h-7"
                        isDisabled={!context.specimenData.annotator} >
                        Unassign Model
                    </Button>
                </div>
            }
        </section >
        {
            // Click to place annotation or cancel
            annotationsAndPositions.newAnnotationEnabled &&
            <div className="flex justify-center flex-col items-center">
                <p className="text-lg text-center mt-2">Click the subject to add an annotation</p>
                <p className="text-lg">or</p>
                <Button
                    color="danger"
                    variant="light"
                    className="text-red-600 hover:text-white text-lg min-w-[160px]"
                    onPress={() => { newAnnotationEnabled.current = false; annotationsAndPositionsDispatch({ type: 'annotationCancelled' }) }}>
                    Cancel Annotation
                </Button>
            </div>
        }
    </>
})

// Display name, export
AdminAnnotationButtons.displayName = 'AnnotationButtons'
export default AdminAnnotationButtons