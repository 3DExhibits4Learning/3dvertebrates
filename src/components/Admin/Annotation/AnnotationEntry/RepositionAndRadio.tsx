'use client'

import AnnotationReposition from "@/components/Admin/Annotation/AnnotationFields/AnnotationReposition"
import RadioButtons from "@/components/Admin/Annotation/AnnotationFields/RadioButtons"

export default function RepositionAndRadio(props: { new: boolean, index: number }) {
    return <section className={`flex justify-between w-full px-8`}>
        {!props.new && <AnnotationReposition />}
        <p className="text-3xl mb-4 mt-2">Annotation {props.index}</p>
        <RadioButtons />
    </section>
}