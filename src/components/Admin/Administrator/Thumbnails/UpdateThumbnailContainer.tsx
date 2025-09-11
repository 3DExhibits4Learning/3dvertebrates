/**
 * @file src/components/Admin/Administrator/Thumbnails/UpdateThumbnailContainer.tsx
 * 
 * @fileoverview container for thumbnail update form
 */

'use client'

// Typical imports
import { model } from "@prisma/client"
import { SetStateAction, Dispatch, useContext, useState, useMemo, } from "react"
import { StudentTransferContext } from "@/components/Admin/Student/StudentClient"
import { DataTransferContext } from "@/components/Admin/Administrator/ManagerClient"
import { useSession } from "next-auth/react"
import { isIT } from "@/functions/client/utils"

// Default imports
import Select from "@/components/Shared/Form Fields/Select"
import dynamic from "next/dynamic"
import UpdateThumbnail from "./UpdateThumbnail"
import updateThumbnail from "@/functions/client/managerClient/updateThumbnail"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Dynamic imports
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'))

// Main JSX
export default function UpdateThumbnailContainer(props: { modelsWithThumbnails: model[] | undefined }) {
    // Context
    const dataTransferContext = useContext(DataTransferContext)
    const studentTransferContext = useContext(StudentTransferContext)
    const initializeDataTransfer = dataTransferContext ? dataTransferContext.initializeDataTransferHandler : studentTransferContext.initializeDataTransferHandler
    const terminateDataTransfer = dataTransferContext ? dataTransferContext.terminateDataTransferHandler : studentTransferContext.terminateDataTransferHandler

    // Get sesh for IT check
    const session = useSession()
    const isIt = isIT(session.data?.user?.email)

    // Filter out the home page model if you're not IT
    const models = isIt ? props.modelsWithThumbnails : props.modelsWithThumbnails?.filter(model => model.uid !== 'ee451c036e3d45398f8a1f2ad78367c3')

    // States
    const [file, setFile] = useState<File>()
    const [uid, setUid] = useState<string>('')

    // Update handler
    const updateThumbnailHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, updateThumbnail, [uid, file], 'Updating Thumbnail')

    return <div className="w-full flex justify-center">
        <section className="flex flex-col w-1/2 pt-8 bg-[#D5CB9F] rounded-md px-4 border border-[#004C46] dark:bg-[#212121]">
            {
                models && models.length > 0 &&
                <>
                    <div className="mb-6"><Select value={uid} setValue={setUid} models={models} title='Select Model' /></div>

                    {
                        uid &&
                        <div className="my-4">
                            <div className="flex w-full h-[600px] mb-12 justify-center">
                                <div className="h-full w-[600px]">
                                    <ModelViewer uid={uid} minHeight="100%" />
                                </div>
                            </div>
                            <UpdateThumbnail uid={uid} file={file} setFile={setFile as Dispatch<SetStateAction<File>>} updateThumbnail={updateThumbnailHandler} modelsWithThumbnails={props.modelsWithThumbnails} />
                        </div>
                    }
                </>
            }
        </section>
    </div>
}