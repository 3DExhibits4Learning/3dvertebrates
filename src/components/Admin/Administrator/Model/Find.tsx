'use client'

// Typical imports
import { model } from "@prisma/client"
import { useState, useEffect, useContext, useMemo } from "react"
import { DataTransferContext } from "@/components/Admin/Administrator/ManagerClient"
import { unpublishModel } from "@/functions/server/admin/administrator"

// Default imports
import Select from "@/components/Shared/Form Fields/Select"
import dynamic from "next/dynamic"
import ModelDataTable from "./FindModelData"
import AdminItemContainer from "../ItemContainer"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Dynamic imports
const ModelViewer = dynamic(() => import("@/components/Shared/ModelViewer"), { ssr: false })

// Main JSX
export default function FindModel(props: { models: model[] }) {
    // Transfer context
    const context = useContext(DataTransferContext)
    const initializeDataTransfer = context.initializeDataTransferHandler
    const terminateDataTransfer = context.terminateDataTransferHandler
    const adminEmail = context.adminEmail

    // States
    const [uid, setUid] = useState<string>('')
    const [model, setModel] = useState<model>()
    const [isPublished, setIsPublished] = useState<boolean>(false)

    // Memoized sorted models
    const models = useMemo(() => props.models.sort((a, b) => a.spec_name.localeCompare(b.spec_name)), [props.models])

    // Unpublish model handler
    const unpublishModelHandler = async (uid: string) => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, unpublishModel, [uid, adminEmail], 'Unpublishing model...')

    // Set Model Handler and effect
    const setModelHandler = () => setModel(props.models.find(model => model.uid === uid))
    useEffect(() => { if (uid) setModelHandler() }, [uid])
    useEffect(() => { if (model) setIsPublished(model.published) }, [model])

    return <AdminItemContainer>
        <Select models={models} value={uid} setValue={setUid} />
        <div className="flex w-full">
            {uid && <div className="w-full h-full"><ModelViewer uid={uid} minHeight="100%" /></div>}
            {model && <ModelDataTable model={model} />}
        </div>
        {isPublished && <section><button className="text-red-600 mt-6" onClick={() => unpublishModelHandler(uid)}>Unpublish 3D Vertebrate</button></section>}
    </AdminItemContainer>
}