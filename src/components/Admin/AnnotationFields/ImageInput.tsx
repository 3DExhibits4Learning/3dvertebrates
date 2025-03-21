'use client'

import { SetStateAction, Dispatch, useContext } from "react"
import { AnnotationEntryData } from "../Annotation/AnnotationEntry/AnnotationEntry"

export default function ImageInput(props: {setFile?: Dispatch<SetStateAction<File>>}) {

    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    return (
        <>
            <p className="text-xl mb-1">Photo<span className="text-red-600 ml-1">*</span></p>
            <input
                id='formFileInput'
                accept='.jpg,.jpeg,.png,.gif'
                type='file'
                onChange={(e) => {if (e.target.files?.length) props.setFile ? props.setFile(e.target.files[0]) : dispatch ? dispatch({ type: 'setFile', file: e.target.files[0]}) : null}}
            >
            </input>
        </>
    )
}