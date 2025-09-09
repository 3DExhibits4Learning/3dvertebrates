/**
 * @file src/components/Admin/Student/StudentClient.tsx
 * 
 * @fileoverview parent component of student client interface
 * 
 * @todo allow models to be submitted from mobile, only require desktop for annotation
 * @todo add model update component
 */

'use client'

// Typical imports
import { Accordion, AccordionItem } from "@heroui/react"
import { isMobileOrTablet } from "@/functions/utils/isMobile"
import { model } from "@prisma/client"
import { fullModel } from "@/interface/interface"
import { createContext, useState } from "react"

// Default imports
import AnnotationClient from "../Annotation/Annotation Client/AnnotationClient"
import ModelSubmitForm from "../ModelSubmit/Form"
import UpdateModelContainer from "../Administrator/Model/UpdateModelContainer"
import AddThumbnail from "../Administrator/Thumbnails/AddThumbnail"
import UpdateThumbnailContainer from "../Administrator/Thumbnails/UpdateThumbnailContainer"
import initializeDataTransfer from "@/functions/client/dataTransfer/initializeDataTransfer"
import terminateDataTransfer from "@/functions/client/dataTransfer/terminateDataTransfer"
import DataTransferModal from '@/components/Shared/Modals/DataTransferModal'

// Context for data transfer modals
export const StudentTransferContext = createContext<any>('')

// Main JSX
export default function StudentClient(props: { modelsToAnnotate: string, annotationModels: string, assignments: model[] }) {
    // Tailwind variables
    const accordionTitlesCss = 'text-[#004C46] text-2xl dark:text-[#F5F3E7]'

    // Data transfer state variables
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [transferring, setTransferring] = useState<boolean>(false)
    const [result, setResult] = useState<string>('')
    const [loadingLabel, setLoadingLabel] = useState<string>('')

    // Data transfer handlers for context
    const initializeDataTransferHandler = (loadingLabel: string) => initializeDataTransfer(setOpenModal, setTransferring, setLoadingLabel, loadingLabel)
    const terminateDataTransferHandler = (result: string) => terminateDataTransfer(setResult, setTransferring, result)

    // Ts declaration, filter
    const modelsToAnnotate = JSON.parse(props.modelsToAnnotate) as model[] | fullModel[]
    const modelsNeedingThumbnails = modelsToAnnotate.filter(model => model.thumbnail === null)

    if (typeof window !== 'undefined' && isMobileOrTablet()) {
        return <main className='min-h-[calc(100vh-177px)] flex items-center justify-center '>
            <p className='text-3xl text-center'>Please login from a desktop device, admin portal is not designed for mobile devices</p>
        </main>
    }

    return <StudentTransferContext.Provider value={{ initializeDataTransferHandler, terminateDataTransferHandler }}>

        <DataTransferModal open={openModal} setOpen={setOpenModal} transferring={transferring} loadingLabel={loadingLabel as string} result={result} href='/admin/student' />

        <Accordion className="text-[#004C46] dark:text-[#F5F3E7]">

            <AccordionItem key='Submit 3D Vertebrate' aria-label='Submit 3D Vertebrate' title='Submit 3D Vertebrate' classNames={{ title: accordionTitlesCss }}>
                <ModelSubmitForm />
            </AccordionItem>

            <AccordionItem key='Assigned 3D Vertebrates' aria-label='Assigned 3D Vertebrates' title='Assigned 3D Vertebrates' classNames={{ title: accordionTitlesCss }}>
                <AnnotationClient modelsToAnnotate={modelsToAnnotate} admin={false} />
            </AccordionItem>

            <AccordionItem key='Update 3D Vertebrate' aria-label='Update 3D Vertebrate' title='Update 3D Vertebrate' classNames={{ title: accordionTitlesCss }}>
                <UpdateModelContainer models={modelsToAnnotate as fullModel[]} />
            </AccordionItem>

            {/* AccordionItem holds nested "Thumbnails" accordion */}
            <AccordionItem key={'3D Vertebrate Thumbnails'} aria-label={'3D Vertebrate Thumbnails'} title='3D Vertebrate Thumbnails' classNames={{ title: accordionTitlesCss }}>
                {/* "Thumbnails" nested accordion */}
                <Accordion>
                    {/* Add thumbnail form */}
                    <AccordionItem key='3D Vertebrates missing thumbnails' aria-label={'3D Vertebrates missing thumbnails'} title='3D Vertebrates w/o Thumbnails' classNames={{ title: accordionTitlesCss }}>
                        <AddThumbnail modelsNeedingThumbnails={modelsNeedingThumbnails as model[] | undefined} />
                    </AccordionItem>
                    {/* Update thumbnail form */}
                    <AccordionItem key='updateThumbnail' aria-label={'updateThumbnail'} title='Update' classNames={{ title: accordionTitlesCss }}>
                        <UpdateThumbnailContainer modelsWithThumbnails={modelsToAnnotate.filter(model => model.thumbnail !== null)} />
                    </AccordionItem>
                </Accordion>
            </AccordionItem>

        </Accordion>
    </StudentTransferContext.Provider>
}