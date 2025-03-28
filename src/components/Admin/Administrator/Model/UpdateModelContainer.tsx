/**
 * @file src\components\Admin\Administrator\Model\UpdateModelContainer.tsx
 * 
 * @fileoverview parent component of the model update form
 */

'use client'

// Typical imports
import { UpdateModelFormContainerProps } from "@/interface/interface"
import { model } from "@prisma/client"
import { fullModel } from "@/interface/interface"
import { useState, Dispatch, SetStateAction, useEffect } from "react"

// Default imports
import dynamic from "next/dynamic"
import Select from "@/components/Shared/Form Fields/Select"

// Dynamic imports
const UpdateModelForm = dynamic(() => import("@/components/Admin/ModelSubmit/UpdateModelForm"))

// Main JSX
export default function UpdateModelContainer(props: UpdateModelFormContainerProps) {

    // Variable Declarations
    const [uid, setUid] = useState<string>('')
    const [model, setModel] = useState<fullModel | null>()

    // Set active model on Select change
    useEffect(() => {
        if (props.models?.length && uid) {
            const model = props.models?.filter((model) => model.uid === uid)
            setModel(model.length > 0 ? model[0] : null)
        }
    }, [uid])

    // Return select component and updateModel form (if model)
    return <section className="flex flex-col w-full py-8 rounded-md px-4">
        <div className="flex flex-col items-center">
            <Select value={uid} setValue={setUid as Dispatch<SetStateAction<string>>} models={props.models as model[]} title='Select Model' />
        </div>
        {model && <UpdateModelForm model={model} />}
    </section>
}