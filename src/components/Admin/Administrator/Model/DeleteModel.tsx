/**
 * @file src/components/Admin/Administrator/Model/DeleteModel.tsx
 * 
 * @fileoverview client component that allows the admin to permanantly delete a 3d model and any associated annotations
 * 
 * @todo swap general text input for a <select> component
 */

'use client'

// Typical imports
import { Button } from "@heroui/react"
import { deleteModel } from "@/functions/server/admin/administrator"
import { useState } from "react"
import { fullModel } from "@/interface/interface"
import { useContext } from "react"
import { DataTransferContext } from "../ManagerClient"

// Default imports
import Select from "@/components/Shared/Form Fields/Select"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Main JSX
export default function DeleteModel(props: { models: fullModel[] | undefined }) {
    // Context
    const context = useContext(DataTransferContext)
    const adminEmail = context.adminEmail
    const initializeDataTransfer = context.initializeDataTransferHandler
    const terminateDataTransfer = context.terminateDataTransferHandler
    
    // State
    const [uid, setUid] = useState<string>('')

    // Handlers
    const deleteModelHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, deleteModel, [uid, adminEmail], "Deleting Model and Annotations")

    return <section className="w-full flex justify-center">
            <div className="w-1/2 flex flex-col border-2 border-[#00856A] rounded-xl bg-[#D5CB9F] dark:bg-[#212121]">
                <section className="ml-12">
                    <p className="my-12 text-xl">This will <b>permanantly delete</b> the 3D model <b>and</b> any annotations associated with it.</p>
                    {
                        props.models &&
                        <Select value={uid} setValue={setUid} models={props.models} title='Select Model' />
                    }
                    <div className="mb-8 mt-12">
                        <Button
                            className="text-white"
                            isDisabled={!uid}
                            onClick={() => deleteModelHandler(uid)}
                        >
                            Delete 3D Model
                        </Button>
                    </div>
                </section>
            </div>
        </section>
}