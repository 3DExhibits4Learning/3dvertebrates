/**
 * @file src/components/Admin/Annotation/Annotation Client/AnnotationButtons.tsx
 * 
 * @fileoverview annotation client buttons for: new annotaton, mark as annotated and cancel annotation
 * 
 * @todo remove 'mark as annotated button' after model has been marked as annotated
 */

// Typical imports
import { Button } from "@nextui-org/react"
import { AnnotationClientData } from "./AnnotationClient"
import { forwardRef, MutableRefObject, SetStateAction, useContext, Dispatch } from "react"
import { annotationClientData } from "@/interface/interface"

// Main JSX
const AnnotationButtons = forwardRef((props: { setModalOpen: Dispatch<SetStateAction<boolean>>, setReorderOpen:  Dispatch<SetStateAction<boolean>>}, ref) => {

    // Context, variables
    const context = useContext(AnnotationClientData) as annotationClientData
    const annotationsAndPositions = context.annotationsAndPositions
    const annotationsAndPositionsDispatch = context.annotationsAndPositionsDispatch

    // Ref
    const newAnnotationEnabled = ref as MutableRefObject<boolean>

    return <>
        {
            // New annotation button
            !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex != 'new' && annotationsAndPositions.firstAnnotationPosition != undefined &&
            <Button
                onPress={() => { newAnnotationEnabled.current = true; annotationsAndPositionsDispatch({ type: 'newAnnotation' }) }}
                className="text-white mt-2 text-lg"
                isDisabled={annotationsAndPositions.repositionEnabled}>
                + New Annotation
            </Button>
        }
        {
            // Renumber annotations button
            !annotationsAndPositions.newAnnotationEnabled && annotationsAndPositions.activeAnnotationIndex !== 'new' && annotationsAndPositions.firstAnnotationPosition !== undefined &&
            annotationsAndPositions.annotations && annotationsAndPositions.annotations?.length >= 2 &&
            <>
                <br></br>
                <Button
                    onPress={() => {props.setReorderOpen(true)}}
                    className="text-white mt-2 text-lg"
                    isDisabled={annotationsAndPositions.repositionEnabled}>
                    Renumber annotations
                </Button>
            </>
        }
        {
            // 'Mark as annotated' button
            annotationsAndPositions.annotations && annotationsAndPositions.annotations?.length >= 4 &&
            <>
                <br></br>
                <Button onPress={() => props.setModalOpen(true)}
                    className="text-white mt-2 text-lg"
                    isDisabled={annotationsAndPositions.repositionEnabled}>
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
                    onPress={() => { newAnnotationEnabled.current = false; annotationsAndPositionsDispatch({ type: 'annotationCancelled' }) }}>
                    Cancel Annotation
                </Button>
            </div>
        }</>
})

// Display name, export
AnnotationButtons.displayName = 'AnnotationButtons'
export default AnnotationButtons