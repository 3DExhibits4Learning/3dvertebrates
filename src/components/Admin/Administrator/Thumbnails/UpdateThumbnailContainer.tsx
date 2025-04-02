'use client'

import { model } from "@prisma/client"
import Select from "@/components/Shared/Form Fields/Select"
import dynamic from "next/dynamic"
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'))
import UpdateThumbnail from "./UpdateThumbnail"
import { SetStateAction, Dispatch, useContext, useState } from "react"
import updateThumbnail from "@/functions/client/managerClient/updateThumbnail"
import { DataTransferContext } from "../ManagerClient"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"


export default function UpdateThumbnailContainer(props: { modelsWithThumbnails: model[] | undefined }) {

    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    const [file, setFile] = useState<File>()
    const [uid, setUid] = useState<string>('')

    const updateThumbnailHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, updateThumbnail, [uid, file], 'Updating Thumbnail')

    return <div className="w-full flex justify-center">
            <section className="flex flex-col w-1/2 pt-8 bg-[#D5CB9F] rounded-md px-4 border border-[#004C46] dark:bg-[#212121]">
                {
                    props.modelsWithThumbnails && props.modelsWithThumbnails.length > 0 &&
                    <>
                        <div className="mb-6">
                            <Select value={uid} setValue={setUid} models={props.modelsWithThumbnails} title='Select Model' />
                        </div>
                        
                        {
                            uid &&
                            <div className="my-4">
                                <div className="flex w-full h-[600px] mb-12 justify-center">
                                    <div className="h-full w-[600px]">
                                        <ModelViewer uid={uid} />
                                    </div>
                                </div>
                                <UpdateThumbnail uid={uid} file={file} setFile={setFile as Dispatch<SetStateAction<File>>} updateThumbnail={updateThumbnailHandler} />
                            </div>
                        }
                    </>
                }
            </section>
        </div>
}