'use client'

// Typical imports
import { Button } from "@heroui/react"
import { SetStateAction, Dispatch, useState } from "react"
import { model } from "@prisma/client"

// Default imports
import PhotoInput from "@/components/Shared/Form Fields/PhotoInput"
import ThumbnailPreviewModal from "@/components/Admin/Annotation/Annotation Client/ThumbnailModal"

// Main JSX
export default function UpdateThumbnail(props: { setFile: Dispatch<SetStateAction<File>>, file: File | undefined, updateThumbnail: Function, uid: string, modelsWithThumbnails: model[] | undefined }) {
    // Modal state
    const [isThumbnailPreviewOpen, setIsThumbnailPreviewOpen] = useState(false)
    
    // Find the model for the selected uid
    const model = props.modelsWithThumbnails?.find(model => model.uid === props.uid)

    return <>
        {model && <ThumbnailPreviewModal path={model.thumbnail} isOpen={isThumbnailPreviewOpen} setIsOpen={setIsThumbnailPreviewOpen} species={model.spec_name} />}
        <section className="flex flex-col">
            <div className="rounded-xl w-full px-4 font-medium mb-4 pb-4 bg-[#D5CB9F] pt-4 dark:bg-[#212121]">
                <section className="flex w-full justify-between">
                    <div className="flex flex-col">
                        <PhotoInput setFile={props.setFile as Dispatch<SetStateAction<File>>} />
                        <div className="mt-8">
                            <Button
                                isDisabled={!props.file}
                                className="bg-[#004C46] text-white text-[16px] font-medium rounded-md px-4 h-[34px]"
                                radius='none'
                                onPress={() => { props.updateThumbnail(props.uid, props.file as File) }}>
                                Submit
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Button
                            className="bg-[#004C46] text-white text-[16px] font-medium rounded-md px-4 h-[34px]"
                            radius='none'
                            onPress={() => { setIsThumbnailPreviewOpen(true) }}>
                            Preview Thumbnail
                        </Button>
                    </div>
                </section>
            </div>
        </section>
    </>
}