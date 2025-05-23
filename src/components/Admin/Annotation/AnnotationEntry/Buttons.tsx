'use client'

import { Button } from "@nextui-org/react"

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
    return (
        <section className="flex justify-end mb-8">
            {
                props.new &&
                <>
                    <Button onClick={() => props.createAnnotation()} className="text-white text-lg mr-8" isDisabled={props.createDisabled}>Create Annotation</Button>
                </>
            }
            {
                !props.new && props.index !== 1 &&
                <div>
                    <Button onClick={() => props.updateAnnotation()} className="text-white text-lg mr-2" isDisabled={props.saveDisabled}>Save Changes</Button>
                    <Button onClick={() => props.deleteAnnotation()} color="danger" variant="light" className="mr-2">Delete Annotation</Button>
                </div>
            }
        </section>
    )
}