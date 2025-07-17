'use client'

import { useContext } from "react"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"

export default function AnnotationReposition() {
    const context = (useContext(AnnotationClientData) as annotationClientData)
    const apData = context.annotationsAndPositions
    const dispatch = context.annotationsAndPositionsDispatch

    return <div className="flex items-center">
        <input type='checkbox' checked={apData.repositionEnabled} onChange={() => dispatch({ type: 'switchRepositionAndUndefinePosition' })}></input>
        <p className="ml-2">Annotation Reposition</p>
    </div>
}