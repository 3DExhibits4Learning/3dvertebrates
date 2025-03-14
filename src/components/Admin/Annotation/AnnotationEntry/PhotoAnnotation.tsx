/**
 * @file src/components/Admin/Annotation/AnnotationEntry/PhotoAnnotation.tsx
 * 
 * @fileoverview component which allows an admin to enter a photo annotation
 */

'use client'

// Typical imports
import { useContext } from "react"
import { AnnotationEntryData } from "../AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import License from "../../AnnotationFields/License"
import Annotation from "../Annotation"
import FileInput from "@/components/Admin/AnnotationFields/ImageInput"

// Main JSX
export default function PhotoAnnotationEntry() {

    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData
    const photoPath = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'X:' + annotationEntryData.url.slice(5) : 'public' + annotationEntryData.url

    return <>
        {
            annotationEntryData.annotationType == 'photo' && annotationEntryData.mediaType && annotationEntryData.mediaType === 'upload' &&
            
            <section className="mt-4 w-full h-fit">
                
                <div className="flex h-[530px]">
                    
                    <div className="flex flex-col w-1/2">
                        
                        <div className="ml-12">
                            <TextInput value={annotationEntryData.annotationTitle as string} field={'annotationTitle'} title='Annotation Title' required />
                        </div>

                        <div className="ml-12 mb-4">
                            <FileInput />
                        </div>

                        <div className="ml-12">
                            <TextInput value={annotationEntryData.author as string} field={'author'} title='Author' required />
                            <License license={annotationEntryData.license} field='license' />
                            <TextInput value={annotationEntryData.photoTitle as string} field={'photoTitle'} title='Photo Title' />
                            <TextInput value={annotationEntryData.website as string} field={'website'} title='Website' />
                        </div>

                    </div>
                    
                    {annotationEntryData.imageVisible && <img className='rounded-sm inline-block w-1/2 max-w-[600px] h-full' src={`/api/nfs?path=${photoPath}`} alt={'Annotation Image'}></img>}
               
                </div>
                
                <div className="ml-12">
                    <Annotation annotation={annotationEntryData.annotation} field='annotation' />
                </div>
            
            </section>
        }
    </>
}