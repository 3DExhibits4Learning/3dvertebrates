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
    const setAnnotationModelsFn = async () => setAnnotationModels((JSON.parse(await getAnnotationModels()) as model[]).filter(model => model.spec_name === apData.specimenData.specimenName))

    // Annotation model effect
    useEffect(() => { setAnnotationModelsFn() }, [apData.annotationsAndPositions.annotationSavedOrDeleted])

    return <>
        {
            annotationEntryData.annotationType === 'model' && annotationModels &&
            <section className="flex px-8 w-full mb-8">
                <div className="flex w-1/2 pr-4">
                    <div className="flex flex-col w-full max-w-[750px]">
                        <TextInput value={annotationEntryData.annotationTitle as string} field={'annotationTitle'} title='Annotation Title' required />
                        <ModelAnnotationSelect value={annotationEntryData.modelAnnotationUid} field={'modelAnnotationUid'} modelAnnotations={annotationModels} />
                        <Annotation annotation={apData.annotationsAndPositions.activeAnnotation?.annotation as string ?? ''} field='annotation' />
                    </div>
                </div>
                {
                    annotationEntryData.modelAnnotationUid && annotationEntryData.modelAnnotationUid !== 'select' &&
                    <div className="flex w-1/2 pl-4 pt-2">
                        <div className="w-full"><ModelViewer uid={annotationEntryData.modelAnnotationUid} minHeight="100%" /></div>
                    </div>
                }
            </section>
        }
    </>
}