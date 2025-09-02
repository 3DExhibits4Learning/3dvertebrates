/**
 * @file src/components/Admin/Annotation/Annotation Client/AnnotationButtons.tsx
 * 
 * @fileoverview annotation client buttons for: new annotaton, mark as annotated and cancel annotation
 * 
 * @todo remove 'mark as annotated button' after model has been marked as annotated
 */

// Typical imports
import { Button } from "@heroui/react"
import { AnnotationClientData } from "./AnnotationClient"
import { forwardRef, RefObject, SetStateAction, useContext, Dispatch } from "react"
import { annotationClientData } from "@/interface/interface"

// Default imports
import Link from "next/link"

// Main JSX
const AnnotationButtons = forwardRef((props: { setModalOpen: Dispatch<SetStateAction<boolean>>, setReorderOpen: Dispatch<SetStateAction<boolean>> }, ref) => {

    // Context, variables
    const context = useContext(AnnotationClientData) as annotationClientData
    const annotationsAndPositions = context.annotationsAndPositions
    const annotationsAndPositionsDispatch = context.annotationsAndPositionsDispatch

    // Ref
    const newAnnotationEnabled = ref as RefObject<boolean>

    return <>
        <section className="grid grid-cols-2 mt-3 rounded-md w-full min-w-[365px]">
            {
                // New annotation button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                <div className="flex w-full border-r border-b pb-2 pr-2">
                    <Button
                        size='sm'
                        onPress={() => { newAnnotationEnabled.current = true; annotationsAndPositionsDispatch({ type: 'newAnnotation' }) }}
                        className="text-white text-md min-w-[171px] rounded-md w-full"
                        isDisabled={annotationsAndPositions.repositionEnabled}>
                        New Annotation
                    </Button>
                </div>
            }
            {
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                <div className="flex border-b pb-2 pl-2 w-full">
                    <br></br>
                    <Link href={`/collections/${context.specimenData.specimenName}?preview=1`} className="block w-full" target="_blank" rel="noopener noreferrer"> 
                        <Button
                            size='sm'
                            className="text-white text-md min-w-[171px] rounded-md w-full"
                            isDisabled={annotationsAndPositions.repositionEnabled || !annotationsAndPositions.firstAnnotationPosition}>
                            Preview Annotations
                        </Button>
                    </Link>
                </div>
            }
            {
                // Renumber annotations button
                !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                <div className="flex border-r pt-2 w-full pr-2">
                    <br></br>
                    <Button
                        size='sm'
                        onPress={() => { props.setReorderOpen(true) }}
                        className="text-white text-md min-w-[171px] rounded-md w-full"
                        isDisabled={annotationsAndPositions.repositionEnabled || !(annotationsAndPositions.annotations && annotationsAndPositions.annotations?.length >= 2)}>
                        Reorder Annotations
                    </Button>
                </div>
            }
            {
                // 'Mark as annotated' button
                annotationsAndPositions.annotations && !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
                <div className="flex w-full pt-2 pl-2">
                    <br></br>
                    <Button
                        onPress={() => props.setModalOpen(true)}
                        size='sm'
                        className="text-white text-md min-w-[171px] rounded-md w-full"
                        isDisabled={annotationsAndPositions.repositionEnabled || annotationsAndPositions.annotations?.length <= 4}>
                        Mark as Annotated
                    </Button>
                </div>
            }

        </section>
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
AnnotationButtons.displayName = 'AnnotationButtons'
export default AnnotationButtons