'use client'

import AnnotationReposition from "../AnnotationFields/AnnotationReposition"
import { Button } from "@heroui/react"


export default function FirstAnnotationEntry(props: { new: boolean, updateAnnotation: Function, createAnnotation: Function, saveDisabled: boolean, createDisabled: boolean }) {
    return <>
        <div className="w-[98%] flex flex-col border border-[#004C46] dark:border-white ml-[1%] rounded-xl justify-between">
            <section className="flex w-full justify-between border-b px-8 py-3">
                {!props.new && <AnnotationReposition />}
                <p className="text-2xl">Annotation 1</p>
                <p className="text-xl">(First annotation data is autopopulated)</p>
            </section>
                {!props.new &&
                    <div className="flex justify-end w-full my-4">
                        <Button onClick={() => props.updateAnnotation()} className="text-white text-lg mr-12" isDisabled={props.saveDisabled}>Save Changes</Button>
                    </div>
                }
                {
                    props.new &&
                    <div className="flex justify-end w-full my-4">
                        <Button onClick={() => props.createAnnotation()} className="text-white text-lg mr-12" isDisabled={props.createDisabled}>Create Annotation</Button>
                    </div>
                }
        </div>
    </>
}