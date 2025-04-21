/**
 * @file src/components/Shared/Modals/ModalWrapper.tsx
 * 
 * @fileoverview allows annotators to reorder the annotation numbers
 */

import { Modal, ModalContent } from "@nextui-org/react"
import { Dispatch, SetStateAction, useContext, useState, useEffect } from "react"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData, fullAnnotation } from "@/interface/interface"

export default function AnnotationReorder(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {

    const context = useContext(AnnotationClientData) as annotationClientData
    const annotations = context.annotationsAndPositions.annotations as fullAnnotation[]
    const initialAnnotationNumbers: { id: string, no: string }[] = []

    const [annotationNumbers, setAnnotationNumbers] = useState<{ id: string, no: string }[]>()

    const AnnotationNumber = (props:{annotation: {id: string, no: string}}) => <div className="flex justify-center border p-4 w-24">
        <input type='number' min='2' max={annotations.length + 1} value={props.annotation.no} className="h-12 w-16 text-xl text-center"></input>
    </div>

    useEffect(() => {
        annotations.every(annotation => initialAnnotationNumbers.push({ id: annotation.annotation_id, no: annotation.annotation_no.toString() }))
        setAnnotationNumbers(initialAnnotationNumbers as { id: string, no: string }[])
    }, [])

    return <Modal isOpen={props.isOpen} size='xl' hideCloseButton>
        <ModalContent>

            <article className="flex flex-col p-8">
                <section className="grid grid-cols-2">
                    {
                        annotationNumbers && annotations?.map((annotation, index) => <>
                            <div className="flex border text-2xl items-center pl-3" key={index}>{annotation.title}</div>
                            <AnnotationNumber annotation={annotationNumbers.find(annotationNumber => annotation.annotation_id === annotationNumber.id) as { id: string, no: string }}/>
                        </>)
                    }
                </section>
            </article>

        </ModalContent>
    </Modal>
}