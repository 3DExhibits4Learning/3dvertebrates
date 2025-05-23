'use client'

import { model } from "@prisma/client"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"

export default function ModelDataTable(props: {model: model}) {
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
                <p className="font-medium">Annotator</p>
                <p className="mb-1">{m.annotator ? m.annotator : 'N/A'}</p>
                <p className="font-medium">Annotated</p>
                <p className="mb-1">{m.annotated ? 'Yes' : 'No'}</p>
                <p className="font-medium">Annotation Approval</p>
                <p className="mb-1">{m.annotationsApproved ? 'Yes' : 'No'}</p>
                <p className="font-medium">Acquisition Date</p>
                <p className="mb-1">{m.spec_acquis_date ? m.spec_acquis_date : 'N/A'}</p>
                <p className="font-medium">Latitude</p>
                <p className="mb-1">{m.lat ? m.lat.toString() : 'N/A'}</p>
                <p className="font-medium">Longitude</p>
                <p className="mb-1">{m.lng ? m.lng.toString() : 'N/A'}</p>
                <p className="font-medium">Build Method</p>
                <p className="mb-1">{toUpperFirstLetter(m.build_process)}</p>
            </section>
        </>
    )
}

/*
model model {
  uid                   String        @id @db.VarChar(100)
  spec_name             String        @db.VarChar(100)
  spec_acquis_date      String?       @db.VarChar(20)
  modeled_by            String        @db.VarChar(25)
  site_ready            Boolean       @default(false)
  pref_comm_name        String        @default("") @db.VarChar(100)
  base_model            Boolean       @default(true)
  annotated             Boolean       @default(false)
  annotationsApproved   Boolean       @default(false)
  modelApproved         Boolean       @default(false)
  annotationPosition    String?       @db.VarChar(250)
  build_process         String        @default("Photogrammetry") @db.VarChar(50)
  thumbnail             String?       @db.VarChar(500)
  annotator             String?       @db.VarChar(75)
  annotatorId           String?       @db.VarChar(50) 
  lat                   Decimal?      
  lng                   Decimal?
  email                 String        @db.VarChar(100)
  user                  String        @db.VarChar(100)
  annotations           annotations[]
  software              software[]
  tags                  tags[]
  assignment            assignment?
  model_annotation      model_annotation?
}
*/