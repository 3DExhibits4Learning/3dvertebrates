'use client'

// Typical imports
import { model } from "@prisma/client"
import { useState, useEffect, useContext } from "react"
import { DataTransferContext } from "../ManagerClient"
import { Button } from "@heroui/react"
import { approveModel, deleteModel } from "@/functions/server/admin/administrator"

// Default imports
import AdminItemContainer from "../ItemContainer"
import Select from "@/components/Shared/Form Fields/Select"
import dynamic from "next/dynamic"
import ApproveModelData from "./ApproveModelData"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Dynamic import
const ModelViewer = dynamic(() => import("@/components/Shared/ModelViewer"), { ssr: false })

// Main JSX
export default function ApproveModel(props: { unapprovedModels: model[] }) {
    // Context
    const context = useContext(DataTransferContext)
    const adminEmail = context.userEmail
    const initializeDataTransfer = context.initializeDataTransferHandler
    const terminateDataTransfer = context.terminateDataTransferHandler

    // States
    const [uid, setUid] = useState<string>('')
    const [model, setModel] = useState<model>()

    // Handlers
    const setModelHandler = () => setModel(props.unapprovedModels.find(model => model.uid === uid))
    const approveModelHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, approveModel, [uid, adminEmail], "Approving Model")
    const rejectModelHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, deleteModel, [uid, adminEmail], "Deleting Model")

    // Effect
    useEffect(() => { if (uid) setModelHandler() }, [uid])

    return <AdminItemContainer>
        <Select value={uid} setValue={setUid} models={props.unapprovedModels} />
        <div className="flex w-full">
            {uid && <div className="w-full h-full"><ModelViewer uid={uid} minHeight="100%" /></div>}
            {model && <ApproveModelData model={model} />}
        </div>
        {
            model &&
            <section className="flex">
                <div className="mt-12 mr-12">
                    <Button className="text-white" onPress={() => approveModelHandler(uid)}>
                        Approve 3D Model
                    </Button>
                </div>
                <div className="mt-12">
                    <Button className="text-red-600" variant="light" onPress={() => rejectModelHandler(uid)}>
                        Reject 3D Model
                    </Button>
                </div>
            </section>
        }
    </AdminItemContainer>
}