'use client'

import { model } from "@prisma/client"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"

export default function ApproveModelData(props: {model: model}) {
    const m = props.model
    return (
        <>
            <section className="flex flex-col w-[30%] min-w-[285px] items-center ml-8">
                <p className="font-medium text-center">Species Name</p>
                <p className="mb-1">{m.spec_name}</p>
                <p className="font-medium">UID</p>
                <p className="mb-1">{m.uid}</p>
                <p className="font-medium">Modeler</p>
                <p className="mb-1">{m.modeled_by}</p>
                <p className="font-medium">Base Model</p>
                <p className="mb-1">{m.base_model ? 'Yes' : 'No'}</p>
                <p className="font-medium">Acquisition Date</p>
                <p className="mb-1">{m.spec_acquis_date ? m.spec_acquis_date : 'N/A'}</p>
                <p className="font-medium">Latitude</p>
                <p className="mb-1">{m.lat ? m.lat.toString() : 'N/A'}</p>
                <p className="font-medium">Longitude</p>
                <p className="mb-1">{m.lng ? m.lng.toString() : 'N/A'}</p>
                <p className="font-medium">Build Method</p>
                <p className="mb-1">{toUpperFirstLetter(m.build_process)}</p>
                <p className="font-medium">Uploaded by:</p>
                <p className="mb-1">{m.email}</p>
            </section>
        </>
    )
}