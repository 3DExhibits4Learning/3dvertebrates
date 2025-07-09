/**
 * @file src/components/Admin/Annotation/AnnotationEntry/ModelAnnotationEntry.tsx
 * 
 * @fileoverview model annotation entry client
 */

'use client'

// Typical imports
import { useContext, useEffect, useState } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"
import { model } from "@prisma/client"
import { annotationClientData } from "@/interface/interface"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { getAnnotationModels } from "@/functions/server/admin/annotator"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import ModelAnnotationSelect from "../AnnotationFields/ModelAnnotationSelect"
import Annotation from "./Annotation"
import dynamic from "next/dynamic"

// Dynamic imports
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'), { ssr: false })

// Main JSX
export default function ModelAnnotationEntry() {
    // Contexts
    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData
    const apData = useContext(AnnotationClientData) as annotationClientData

    // Annotation model handlers
    const [annotationModels, setAnnotationModels] = useState<model[]>()
    const setAnnotationModelsFn = async () => setAnnotationModels(JSON.parse(await getAnnotationModels()))

    // Annotation model effect
    useEffect(() => { setAnnotationModelsFn() }, [apData.annotationsAndPositions.annotationSavedOrDeleted])

    return <>
        {
            annotationEntryData.annotationType === 'model' && annotationModels &&
            <section className="flex my-12 w-full">
                <div className="flex ml-12 mt-12 flex-col w-3/5 max-w-[750px] mr-12">
                    <TextInput value={annotationEntryData.annotationTitle as string} field={'annotationTitle'} title='Annotation Title' required />
                    <ModelAnnotationSelect value={annotationEntryData.modelAnnotationUid} field={'modelAnnotationUid'} modelAnnotations={annotationModels} />
                    <Annotation annotation={apData.annotationsAndPositions.activeAnnotation?.annotation as string ?? ''} field='annotation' />
                </div>
                {
                    annotationEntryData.modelAnnotationUid && annotationEntryData.modelAnnotationUid !== 'select' &&
                    <div className="w-full mr-12"><ModelViewer uid={annotationEntryData.modelAnnotationUid} minHeight="100%" /></div>
                }
            </section>
        }
    </>
}