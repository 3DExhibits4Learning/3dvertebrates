/**
 * @file src/components/Shared/Modals/ModalWrapper.tsx
 * 
 * @fileoverview allows annotators to reorder the annotation numbers
 */

import { Modal, ModalBody, ModalContent } from "@nextui-org/react"
import { Dispatch, SetStateAction, useContext } from "react"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData, fullAnnotation } from "@/interface/interface"

export default function AnnotationReorder(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {

    const context = useContext(AnnotationClientData) as annotationClientData
    const annotations = context.annotationsAndPositions.annotations as fullAnnotation[]

    const AnnotationNumber = () => <div className="flex justify-center border p-4 w-24">
        <input type='number' min='2' max={annotations.length + 1} className="h-12 w-16 text-xl text-center"></input>
    </div>

    return <Modal isOpen={props.isOpen} size='xl' hideCloseButton>
        <ModalContent>

            <article className="flex flex-col p-8">
                <section className="grid grid-cols-2">
                    {
                        annotations?.map((annotation, index) => <>
                            <div className="flex border text-2xl items-center pl-3" key={index}>{annotation.title}</div>
                            <AnnotationNumber />
                        </>)
                    }
                </section>
            </article>

        </ModalContent>
    </Modal>
}