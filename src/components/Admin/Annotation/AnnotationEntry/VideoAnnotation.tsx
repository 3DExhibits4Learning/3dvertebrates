/**
 * @file src/components/Admin/Annotation/AnnotationEntry/VideoAnnotation.tsx
 * 
 * @fileoverview
 */

'use client'

// Typical imports
import { useContext } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import Annotation from "./Annotation"

export default function VideoAnnotationEntry() {

    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData

    return <>
        {
            annotationEntryData.annotationType == 'video' &&
            <section className="flex my-12 px-12 justify-between">
                <div className="flex mt-12 flex-col w-1/2 max-w-[750px]">
                    <TextInput value={annotationEntryData.annotationTitle as string} field='annotationTitle' title='Annotation Title' required />
                    <TextInput value={annotationEntryData.videoSource as string} field='videoSource' title='URL' required />
                    <TextInput value={annotationEntryData.length as string} field='length' title='Length' required />
                    <Annotation annotation={annotationEntryData.annotation} field='annotation' notRequired/>
                </div>
                <div className="flex h-[60vh] w-1/2 justify-center pl-12">
                    {
                        annotationEntryData.videoSource?.includes('https://www.youtube.com/embed/') &&
                        <div className="flex h-full w-full">
                            <iframe src={annotationEntryData.videoSource} className="h-full w-full rounded-xl" />
                        </div>
                    }
                </div>
            </section>
        }
    </>
}