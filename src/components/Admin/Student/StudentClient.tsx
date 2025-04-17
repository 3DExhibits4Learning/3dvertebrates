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
import { Accordion, AccordionItem } from "@nextui-org/react"
import { isMobileOrTablet } from "@/functions/utils/isMobile"
import { model } from "@prisma/client"
import { fullModel } from "@/interface/interface"

// Default imports
import AnnotationClient from "../Annotation/Annotation Client/AnnotationClient"
import ModelSubmitForm from "../ModelSubmit/Form"
import UpdateModelContainer from "../Administrator/Model/UpdateModelContainer"
import AddThumbnail from "../Administrator/Thumbnails/AddThumbnail"
import UpdateThumbnailContainer from "../Administrator/Thumbnails/UpdateThumbnailContainer"

// Main JSX
export default function StudentClient(props: { modelsToAnnotate: string, annotationModels: string }) {

    // Tailwind variables
    const accordionTitlesCss = 'text-[#004C46] text-2xl dark:text-[#F5F3E7]'

    if (typeof window !== 'undefined' && isMobileOrTablet()) {
        return <main className='min-h-[calc(100vh-177px)] flex items-center justify-center '>
            <p className='text-3xl text-center'>Please login from a desktop device, admin portal is not designed for mobile devices</p>
        </main>
    }

    // Ts declaration, filter
    const modelsToAnnotate = JSON.parse(props.modelsToAnnotate) as model[] | fullModel[]
    const modelsNeedingThumbnails = modelsToAnnotate.filter(model => model.thumbnail === null)

    return <Accordion className="text-[#004C46] dark:text-[#F5F3E7]">
        
        <AccordionItem key='modelSumbit' aria-label='Model Sumbit' title='Submit Model' classNames={{ title: accordionTitlesCss }}>
            <ModelSubmitForm />
        </AccordionItem>
        
        <AccordionItem key='assignments' aria-label='Assignments' title='Assigned Models' classNames={{ title: accordionTitlesCss }}>
            <AnnotationClient modelsToAnnotate={modelsToAnnotate} annotationModels={JSON.parse(JSON.parse(props.annotationModels))} admin={false} />
        </AccordionItem>
        
        <AccordionItem key='updateModel' aria-label='Update Model' title='Update Model' classNames={{ title: accordionTitlesCss }}>
            <UpdateModelContainer models={modelsToAnnotate as fullModel[]} />
        </AccordionItem>

        {/* AccordionItem holds nested "Thumbnails" accordion */}
        <AccordionItem key={'adminThumbnails'} aria-label={'New Specimen'} title='Thumbnails' classNames={{ title: accordionTitlesCss }}>
            {/* "Thumbnails" nested accordion */}
            <Accordion>
                {/* Add thumbnail form */}
                <AccordionItem key='modelsWithoutThumbnails' aria-label={'modelsWithoutThumbnails'} title='Models' classNames={{ title: accordionTitlesCss }}>
                    <AddThumbnail modelsNeedingThumbnails={modelsNeedingThumbnails as model[] | undefined} />
                </AccordionItem>
                {/* Update thumbnail form */}
                <AccordionItem key='updateThumbnail' aria-label={'updateThumbnail'} title='Update' classNames={{ title: accordionTitlesCss }}>
                    <UpdateThumbnailContainer modelsWithThumbnails={modelsToAnnotate.filter(model => model.thumbnail !== null)} />
                </AccordionItem>
            </Accordion>
        </AccordionItem>
    
    </Accordion>
}