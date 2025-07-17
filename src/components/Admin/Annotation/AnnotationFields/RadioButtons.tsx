'use client'

import { useContext } from "react"
import { AnnotationEntryData } from "@/components/Admin/Annotation/AnnotationEntry/AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"

export default function RadioButtons() {

    const aeContext = useContext(AnnotationEntryData) as annotationEntryContext
    const aeData = aeContext.annotationEntryData
    const dispatch = aeContext.annotationEntryDataDispatch

    return <div className="flex justify-center items-center">
        <p className="mr-1">Text</p>
        <div className="mr-8 flex items-baseline"><input type='radio' value='text' name='typeOfAnnotation' onChange={() => dispatch({ type: 'textRadioButton' })} checked={aeData.textChecked}></input></div>

        <p className="mr-1">Photo</p>
        <div className="mr-8 flex items-baseline"><input type='radio' value='photo' name='typeOfAnnotation' onChange={() => dispatch({ type: 'photoRadioButton' })} checked={aeData.photoChecked}></input></div>

        <p className="mr-1">Video</p>
        <div className="mr-8 flex items-baseline"><input type='radio' value='video' name='typeOfAnnotation' onChange={() => dispatch({ type: 'videoRadioButton' })} checked={aeData.videoChecked}></input></div>

        <p className="mr-1">Model</p>
        <div className="flex items-baseline"><input type='radio' value='model' name='typeOfAnnotation' onChange={e => dispatch({ type: 'modelRadioButton' })} checked={aeData.modelChecked}></input></div>
    </div>
}