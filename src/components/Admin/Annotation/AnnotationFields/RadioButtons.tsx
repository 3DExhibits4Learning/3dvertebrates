'use client'

import { useContext } from "react"
import { AnnotationEntryData } from "../Annotation/AnnotationEntry/AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"

export default function RadioButtons() {

    const aeContext = useContext(AnnotationEntryData) as annotationEntryContext
    const aeData = aeContext.annotationEntryData
    const dispatch = aeContext.annotationEntryDataDispatch

    return (
        <>
            <div className="grid grid-cols-6 items-center justify-center">
                <p>Photo</p>
                <div>
                    <input
                        type='radio'
                        value='photo'
                        name='typeOfAnnotation'
                        onChange={() => dispatch({type: 'photoRadioButton'})}
                        checked={aeData.photoChecked}
                    >
                    </input>
                </div>
                <p className="mr-2">Video</p>
                <div>
                    <input
                        type='radio'
                        value='video'
                        name='typeOfAnnotation'
                        onChange={() => dispatch({type: 'videoRadioButton'})}
                        checked={aeData.videoChecked}
                    >
                    </input>
                </div>
                <p className="mr-4">Model</p>
                <div>
                    <input
                        type='radio'
                        value='model'
                        name='typeOfAnnotation'
                        onChange={(e) => dispatch({type: 'modelRadioButton'})}
                        checked={aeData.modelChecked}
                    >
                    </input>
                </div>
            </div>
        </>
    )
}