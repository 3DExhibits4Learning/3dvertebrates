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

// Default imports
import AnnotationClient from "../Annotation/Annotation Client/AnnotationClient"
import ModelSubmitForm from "../ModelSubmit/Form"
import UpdateModelForm from "../ModelSubmit/UpdateModelForm"
import UpdateModelContainer from "../Administrator/Model/UpdateModelContainer"

export default function StudentClient(props: { modelsToAnnotate: string, annotationModels: string }) {

    // Tailwind variables
    const accordionTitlesCss = 'text-[#004C46] text-2xl dark:text-[#F5F3E7]'

    if (typeof window !== 'undefined' && isMobileOrTablet()) {
        return <main className='min-h-[calc(100vh-177px)] flex items-center justify-center '>
            <p className='text-3xl text-center'>Please login from a desktop device, admin portal is not designed for mobile devices</p>
        </main>
    }

    return <Accordion className="text-[#004C46] dark:text-[#F5F3E7]">
        <AccordionItem key='assignments' aria-label='Assignments' title='Models to Annotate' classNames={{ title: accordionTitlesCss }}>
            <AnnotationClient modelsToAnnotate={JSON.parse(props.modelsToAnnotate)} annotationModels={JSON.parse(props.annotationModels)} admin={false} />
        </AccordionItem>
        <AccordionItem key='modelSumbit' aria-label='Model Sumbit' title='Submit Model' classNames={{ title: accordionTitlesCss }}>
            <ModelSubmitForm />
        </AccordionItem>
        <AccordionItem key='updateModel' aria-label='Update Model' title='Update Model to Annotate' classNames={{ title: accordionTitlesCss }}>
            <UpdateModelContainer models={JSON.parse(props.modelsToAnnotate)}/>
        </AccordionItem>
    </Accordion>
}