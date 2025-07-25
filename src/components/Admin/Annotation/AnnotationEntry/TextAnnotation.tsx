/**
 * @file src/components/Admin/Annotation/AnnotationEntry/PhotoAnnotation.tsx
 * 
 * @fileoverview component which allows an admin to enter a photo annotation
 * 
 * @todo review css for various screen sizes
 */

'use client'

// Typical imports
import { useContext } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { annotationClientData, annotationEntryContext } from "@/interface/interface"
import { AnnotationClientData } from "../Annotation Client/AnnotationClient"
import { photo_annotation } from "@prisma/client"

// Default imports
import Annotation from "./Annotation"
import TextInput from "@/components/Shared/Form Fields/TextInput"

// Main JSX
export default function TextAnnotation() {
    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData
    const apData = useContext(AnnotationClientData) as annotationClientData

    return <>
        {
            annotationEntryData.annotationType === 'text' &&
            <section className="w-full h-fit px-8 mb-8">
                <div><TextInput value={annotationEntryData.annotationTitle as string} field={'annotationTitle'} title='Annotation Title' required /></div>
                <div><Annotation annotation={(apData.annotationsAndPositions.activeAnnotation as photo_annotation)?.annotation ?? ''} field='annotation' /></div>
            </section>
        }
    </>
}