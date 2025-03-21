'use client'

import { SetStateAction, Dispatch, useContext } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"

export default function Annotation(props: { annotation: string, setAnnotation?: Dispatch<SetStateAction<string>>, field?: string }) {

    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    return (
        <>
            <p className="text-xl mb-1">Annotation<span className="text-red-600 ml-1">*</span></p>
            <textarea
                className={`w-[95%] min-w-[300px] min-h-[400px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] p-4 text-[14px] outline-[#004C46]`}
                value={props.annotation}
                onChange={(e) => props.setAnnotation ? props.setAnnotation(e.target.value) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.target.value }) : null}
            >
            </textarea>
        </>
    )
}