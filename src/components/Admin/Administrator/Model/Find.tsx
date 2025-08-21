'use client'

// Typical imports
import { model } from "@prisma/client"
import { useState, useEffect } from "react"

// Default imports
import Select from "@/components/Shared/Form Fields/Select"
import dynamic from "next/dynamic"
import ModelDataTable from "./FindModelData"
import AdminItemContainer from "../ItemContainer"

// Dynamic imports
const ModelViewer = dynamic(() => import("@/components/Shared/ModelViewer"), { ssr: false })

// Maim JSX
export default function FindModel(props: { models: model[] }) {
    // States
    const [uid, setUid] = useState<string>('')
    const [model, setModel] = useState<model>()
    const [isPublished, setIsPublished] = useState<boolean>(false)

    // Set Model Handler and effect
    const setModelHandler = () => setModel(props.models.find(model => model.uid === uid))
    useEffect(() => { if (uid) setModelHandler() }, [uid])
    useEffect(() => { if (model) setIsPublished(model.published) }, [model])

    return <AdminItemContainer>
        <Select models={props.models} value={uid} setValue={setUid} />
        <div className="flex w-full">
            {uid && <div className="w-full h-full"><ModelViewer uid={uid} minHeight="100%" /></div>}
            {model && <ModelDataTable model={model} />}
        </div>
        {
            isPublished && <section>
                <button className="text-red-600 mt-6">Unpublish 3D Vertebrate</button>
            </section>
        }
    </AdminItemContainer>
}