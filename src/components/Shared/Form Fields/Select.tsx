'use client'

import { SetStateAction, Dispatch } from "react"
import { model } from "@prisma/client"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { fullModel } from "@/interface/interface"

export default function Select(props: { value: string, setValue: Dispatch<SetStateAction<string>>, models: model[] | fullModel[], title?: string, required?: string, width?: string, maxWidth?: string }) {
    const maxWidth = props.maxWidth ? `max-w-[${props.maxWidth}]` :'max-w-[500px]'
    const width = props.width ? props.width : 'w-4/5'
    return <>
        {
            props.title &&
            <p className="text-xl mb-1 font-medium">{props.title}
                {props.required && <span className="text-red-600 ml-1">*</span>}
            </p>
        }
        <select
            onChange={(e) => props.setValue(e.target.value)}
            className={`${width} min-w-[300px] ${maxWidth} rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46]`}
            value={props.value}>
            <option hidden key={'Model Select'} value='select'>Select a 3D Model</option>
            {props.models.map(model => <option key={model.uid} value={model.uid}>{`${toUpperFirstLetter(model.spec_name)} - ${model.uid.slice(0, 5)}`}</option>)}
        </select>
    </>
}