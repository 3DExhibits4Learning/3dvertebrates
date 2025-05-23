'use client'

import Select from "@/components/Shared/Form Fields/Select"
import { model } from "@prisma/client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ModelDataTable from "./FindModelData"
import AdminItemContainer from "../ItemContainer"

const ModelViewer = dynamic(() => import("@/components/Shared/ModelViewer"), { ssr: false })


export default function FindModel(props: { models: model[] }) {

    const [uid, setUid] = useState<string>('')
    const [model, setModel] = useState<model>()

    const setModelHandler = () => setModel(props.models.find(model => model.uid === uid))

    useEffect(() => {if (uid) setModelHandler()}, [uid])

    return (
        <AdminItemContainer>
            <Select models={props.models} value={uid} setValue={setUid} />
            <div className="flex w-full">
                {
                    uid &&
                    <div className="w-full h-full">
                        <ModelViewer uid={uid} />
                    </div>
                }
                {
                    model &&
                    <ModelDataTable model={model} />
                }
            </div>
        </AdminItemContainer>
    )
}