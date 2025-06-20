'use client'

import AnnotationReposition from "../AnnotationFields/AnnotationReposition"
import { Button } from "@heroui/react"


export default function FirstAnnotationEntry(props:{new: boolean, updateAnnotation: Function, createAnnotation: Function, saveDisabled: boolean, createDisabled: boolean }) {
    return (
        <>
            <div className="w-[98%] h-fit flex flex-col border border-[#004C46] dark:border-white mt-4 ml-[1%] rounded-xl">
                <p className="text-2xl mb-4 mt-2 ml-12">Annotation 1 <span className="ml-8">(This annotation is always taxonomy and description)</span></p>
                <section className="flex justify-between mt-4 mb-8">
                    {
                        !props.new &&
                        <>
                            <AnnotationReposition />
                            <div>
                                <Button onClick={() => props.updateAnnotation()} className="text-white text-lg mr-12" isDisabled={props.saveDisabled}>Save Changes</Button>
                            </div>
                        </>
                    }
                    {
                        props.new &&
                        <div className="flex justify-end w-full">
                            <Button onClick={() => props.createAnnotation()} className="text-white text-lg mr-12" isDisabled={props.createDisabled}>Create Annotation</Button>
                        </div>
                    }
                </section>
            </div>
        </>
    )
}