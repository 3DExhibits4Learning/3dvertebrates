'use client'

import { SetStateAction, Dispatch, useContext } from "react"
import { AnnotationEntryData } from "@/components/Admin/Annotation/AnnotationEntry/AnnotationEntry"

export default function TextInput(props: { value: string, setValue?: Dispatch<SetStateAction<string>> | Function, title: string, required?: boolean, leftMargin?: string, textSize?: string, field?: string }) {
    
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null
    const textSize = props.textSize ?? 'text-xl'
    
    return (
        <>
            <p className={`mb-1 ${props.leftMargin} ${textSize}`}>{props.title}
                
                {
                    props.required &&
                    <span className="text-red-600 ml-1">*</span>
                }

            </p>
            <input
                className={`w-4/5 min-w-[300px] max-w-[500px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46] text-[#004C46] dark:text-white ${props.leftMargin}`}
                type='text'
                onChange={(e) => {
                    if(props.setValue)props.setValue(e.target.value)
                    else if(dispatch && props.field) dispatch({ type: 'setStringValue', field: props.field, string: e.target.value })
                }}
                value={props.value}
            >
            </input>
        </>
    )
}