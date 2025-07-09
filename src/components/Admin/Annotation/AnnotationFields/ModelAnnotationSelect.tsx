'use client'

import { SetStateAction, Dispatch, useContext } from "react"
import { model } from "@prisma/client"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { AnnotationEntryData } from "@/components/Admin/Annotation/AnnotationEntry/AnnotationEntry"

export default function ModelAnnotationSelect(props: { value: string, setValue?: Dispatch<SetStateAction<string>> | Function, modelAnnotations: model[], field?: string }) {

    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    return <>
        <p className="text-xl mb-1">Annotation Model<span className="text-red-600 ml-1">*</span></p>
        <select
            onChange={(e) => props.setValue ? props.setValue(e.target.value) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.target.value }) : null}
            className={`w-4/5 min-w-[300px] max-w-[500px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46]`}
            value={props.value}>
            <option hidden key={Math.random()} value='select'>Select a 3D Model</option>
            {props.modelAnnotations.map((model, index) => <option key={index} value={model.uid}>{`${toUpperFirstLetter(model.spec_name)}`}</option>)}
        </select>
    </>
}