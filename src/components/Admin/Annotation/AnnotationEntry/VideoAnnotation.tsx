'use client'

import { useContext } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { annotationEntryContext } from "@/interface/interface"
import TextInput from "@/components/Shared/Form Fields/TextInput"

export default function VideoAnnotationEntry() {

    const annotationEntryData = (useContext(AnnotationEntryData) as annotationEntryContext).annotationEntryData

    return (
        <>
            {
                annotationEntryData.annotationType == 'video' &&
                <section className="flex my-12">
                    <div className="flex ml-12 mt-12 flex-col w-1/2 max-w-[750px]">
                        <TextInput value={annotationEntryData.annotationTitle as string} field='annotationTitle' title='Annotation Title' required />
                        <TextInput value={annotationEntryData.videoSource as string} field='videoSource' title='URL' required />
                        <TextInput value={annotationEntryData.length as string} field='length' title='Length' required />
                    </div>
                    <div className="flex h-[50vh] w-[45%]">
                        {
                            annotationEntryData.videoSource?.includes('https://www.youtube.com/embed/') &&
                            <iframe
                                src={annotationEntryData.videoSource}
                                className="h-full w-full ml-[1%] rounded-xl mr-12"
                            >
                            </iframe>
                        }
                    </div>
                </section>
            }
        </>
    )
}