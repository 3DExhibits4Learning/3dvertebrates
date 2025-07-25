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
import { getNfsPath } from "@/functions/client/utils"
import { AnnotationClientData } from "../Annotation Client/AnnotationClient"
import { photo_annotation } from "@prisma/client"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import License from "@/components/Admin/Annotation/AnnotationFields/License"
import Annotation from "./Annotation"
import FileInput from "@/components/Admin/Annotation/AnnotationFields/ImageInput"

// Main JSX
export default function PhotoAnnotationEntry() {
    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData
    const apData = useContext(AnnotationClientData) as annotationClientData
    const photoPath = getNfsPath(annotationEntryData.url)

    return <>
        {
            annotationEntryData.annotationType == 'photo' &&

            <section className="w-full h-fit px-8 mb-8">

                <div className="flex h-fit w-full">

                    <div className="flex flex-col w-1/2 max-w-[700px]">

                        <div><TextInput value={annotationEntryData.annotationTitle as string} field={'annotationTitle'} title='Annotation Title' required /></div>

                        <div className="mb-4"><FileInput /></div>

                        <div>
                            <TextInput value={annotationEntryData.author as string} field={'author'} title='Author' required />
                            <License license={annotationEntryData.license} field='license' />
                            <TextInput value={annotationEntryData.photoTitle as string} field={'photoTitle'} title='Photo Title' />
                            <TextInput value={annotationEntryData.website as string} field={'website'} title='Website' />
                        </div>

                    </div>

                    {
                        annotationEntryData.imageVisible &&
                        <div className="flex w-full justify-center pt-2">
                            <div className="flex max-w-[600px] h-[530px] px-12 pb-4">
                                <img className='rounded-sm object-fill w-full h-full' src={photoPath} alt={'Annotation Image'}></img>
                            </div>
                        </div>
                    }

                </div>

                <div><Annotation annotation={(apData.annotationsAndPositions.activeAnnotation as photo_annotation)?.annotation ?? ''} field='annotation' /></div>

            </section>
        }
    </>
}