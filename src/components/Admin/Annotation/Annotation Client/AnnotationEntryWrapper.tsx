/**
 * @file src/components/Admin/Annotation/Annotation Client/AnnotationEntryWrapper.tsx
 * 
 * @fileoverview wrapper for annotation entry and associated text prompts
 */

'use client'

// Typical imports
import { useContext } from "react"
import { AnnotationClientData } from "./AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { model } from "@prisma/client"
import { getIndex } from "@/functions/client/annotationClient"

// Default imports
import AnnotationEntry from "../AnnotationEntry/AnnotationEntry"

// Main JSX
export default function AnnotationEntryWrapper(props: {modelsToAnnotate: model[], admin: boolean, annotationModels: model[]}) {

    const context = useContext(AnnotationClientData) as annotationClientData
    const specimenData = context.specimenData
    const annotationsAndPositions = context.annotationsAndPositions

    return <div className="flex flex-col w-4/5">
        <section className="flex w-full h-full flex-col">
            {
                // 'Select a 3d model' banner
                !specimenData.uid && !annotationsAndPositions.activeAnnotation &&
                <div className="flex items-center justify-center text-xl h-full w-full">
                    <p className="mr-[10%] text-lg lg:text-3xl mb-12">{props.modelsToAnnotate.length ? props.admin ? 'Select a 3D model' : 'Select an annotation, or click New Annotation' : "No models assigned"}</p>
                </div>
            }
            {
                // 'Select an annotation' banner
                specimenData.uid && !annotationsAndPositions.activeAnnotation && annotationsAndPositions.activeAnnotationIndex !== 1 && !annotationsAndPositions.newAnnotationEnabled &&
                <div className="flex items-center justify-center text-xl h-full w-full">
                    <p className="mr-[10%] text-lg lg:text-3xl">Select an annotation, or click New Annotation</p>
                </div>
            }
            {
                // Databased annotation
                typeof (annotationsAndPositions.activeAnnotationIndex) === 'number' && <AnnotationEntry index={getIndex(annotationsAndPositions) as number} new={false} annotationModels={props.annotationModels} />
            }
            {
                // New annotation
                typeof (annotationsAndPositions.activeAnnotationIndex) === 'string' && <AnnotationEntry index={getIndex(annotationsAndPositions) as number} new annotationModels={props.annotationModels} />
            }
        </section>
    </div>
}