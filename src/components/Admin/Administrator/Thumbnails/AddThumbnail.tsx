'use client'

import { model } from "@prisma/client"
import PhotoInput from "@/components/Shared/Form Fields/PhotoInput";
import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'))
import { Button } from "@nextui-org/react";
import { SetStateAction, Dispatch, useState } from "react";
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler";
import addThumbnail from "@/functions/client/managerClient/addThumbnail";
import { useContext } from "react";
import { DataTransferContext } from "../ManagerClient";


export default function AddThumbnail(props: { modelsNeedingThumbnails: model[] | undefined }) {

    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    const [file, setFile] = useState<File>()

    const addThumbnailHandler = async (uid: string, file: File) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, addThumbnail, [uid, file], "Adding thumbnail")

    return (
        <>
            {
                props.modelsNeedingThumbnails && props.modelsNeedingThumbnails.length > 0 &&

                <section className="flex">
                    {
                        props.modelsNeedingThumbnails.map((model, index) =>
                            <section key={index} className="flex flex-col items-center">
                                <div className="border border-[#004C46] rounded-xl w-fit px-4 font-medium mb-8 pb-4 bg-[#D5CB9F] pt-4 mx-4 dark:bg-[#212121]">
                                    <p>Species Name: {model.spec_name}</p>
                                    <p className="mb-8">UID: {model.uid}</p>
                                    <div className="w-[500px] h-[500px] mb-8">
                                        <ModelViewer uid={model.uid} noAutoStart/>
                                    </div>
                                    <p className="text-center mb-8 text-xl">Upload Thumbnail:</p>
                                    <div className="flex justify-between">
                                        <PhotoInput setFile={setFile as Dispatch<SetStateAction<File>>} />
                                        <Button
                                            isDisabled={!file}
                                            className="bg-[#004C46] text-white text-[16px] font-medium rounded-md px-4 h-[34px]"
                                            radius='none'
                                            onClick={() => { addThumbnailHandler(model.uid, file as File) }}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}
                </section>
            }

            {
                !props.modelsNeedingThumbnails &&
                <p className="text-xl"> There are no models without thumbnails </p>
            }

            {
                props.modelsNeedingThumbnails && props.modelsNeedingThumbnails.length === 0 &&
                <p className="text-xl"> There are no models without thumbnails </p>
            }
        </>
    )
}