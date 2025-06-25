'use client'

import { Button } from "@heroui/react"
import { AnnotationClientData } from "../Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { useContext } from "react"

interface AnnotationEntryButtons {
    new: boolean,
    index: number,
    createAnnotation: Function,
    updateAnnotation: Function,
    deleteAnnotation: Function,
    createDisabled: boolean,
    saveDisabled: boolean
}

export default function AnnotationEntryButtons(props: { new: boolean, index: number, createAnnotation: Function, updateAnnotation: Function, deleteAnnotation: Function, createDisabled: boolean, saveDisabled: boolean }) {
    const context = useContext(AnnotationClientData) as annotationClientData
    const isAssigned = context.specimenData.annotator ? true : false
    const areSaveAndDeleteDisabled = isAssigned && context.admin

    return <section className="flex justify-end mb-8">
            {props.new && <Button onClick={() => props.createAnnotation()} className="text-white text-lg mr-8" isDisabled={props.createDisabled || areSaveAndDeleteDisabled}>Create Annotation</Button>}
            {
                !props.new && props.index !== 1 &&
                <div>
                    <Button onClick={() => props.updateAnnotation()} className="text-white text-lg mr-2" isDisabled={props.saveDisabled || areSaveAndDeleteDisabled}>Save Changes</Button>
                    <Button onClick={() => props.deleteAnnotation()} color="danger" variant="light" className="mr-2" isDisabled={areSaveAndDeleteDisabled}>Delete Annotation</Button>
                </div>
            }
        </section>
}