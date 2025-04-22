/**
 * @file src/components/Shared/Modals/ModalWrapper.tsx
 * 
 * @fileoverview allows annotators to reorder the annotation numbers
 */

// Typical imports
import { Button, Modal, ModalContent } from "@nextui-org/react"
import { Dispatch, SetStateAction, useContext, useState, useEffect, ChangeEvent } from "react"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData, fullAnnotation } from "@/interface/interface"
import { AnnotationNumbers } from "@/ts/ts"

// Default imports
import AnnotationNumber from "@/components/Admin/Annotation/Annotation Client/AnnotationNumber"

// Main JSX
export default function AnnotationReorder(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {

    // Context
    const context = useContext(AnnotationClientData) as annotationClientData
    const annotations = context.annotationsAndPositions.annotations as fullAnnotation[]
    const max = annotations.length + 1
    const initialAnnotationNumbers = annotations.map(annotation => { return { id: annotation.annotation_id, no: annotation.annotation_no.toString() } })

    const [annotationNumbers, setAnnotationNumbers] = useState(initialAnnotationNumbers)
    const [saveDisabled, setSaveDisabled] = useState(false)

    useEffect(() => {
        if (annotationNumbers) {
            const numbers = annotationNumbers.map(annotationNumbers => parseInt(annotationNumbers.no))
            const unique = [...new Set(numbers)]
            setSaveDisabled(!(unique.length === annotationNumbers.length))
        }
    }, [annotationNumbers])

    return <Modal isOpen={props.isOpen} size='xl' hideCloseButton>
        <ModalContent>

            <div className="flex flex-col p-8 justify-center w-full">
                <div className="flex w-full justify-center">
                    <section className="grid grid-cols-[max-content_max-content] w-fit">
                        {
                            annotationNumbers && annotations?.map((annotation, index) => <>
                                <div className="flex border text-2xl items-center px-3" key={index}>{annotation.title}</div>
                                <AnnotationNumber
                                    key={annotation.annotation_id}
                                    max={max.toString()}
                                    annotationNumbers={annotationNumbers}
                                    setAnnotationNumbers={setAnnotationNumbers}
                                    annotation={annotationNumbers.find(annotationNumber => annotation.annotation_id === annotationNumber.id) as AnnotationNumbers} />
                            </>)
                        }
                    </section>
                </div>
            </div>

            <div className="flex w-full justify-center p-8"><Button isDisabled={saveDisabled} className="w-4/5">Save Annotation Numbers</Button></div>

        </ModalContent>
    </Modal>
}