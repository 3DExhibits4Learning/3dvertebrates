'use client'

import AnnotationClient from "../Annotation/AnnotationClient"
import ModelSubmitForm from "../ModelSubmit/Form"
import { Accordion, AccordionItem } from "@nextui-org/react"
import { isMobileOrTablet } from "@/functions/utils/isMobile"

export default function StudentClient(props: { modelsToAnnotate: string, annotationModels: string }) {

    // Tailwind variables
    const accordionTitlesCss = 'text-[#004C46] text-2xl dark:text-[#F5F3E7]'

    if (typeof window !== 'undefined' && isMobileOrTablet()) {
        return <>
            <main className='min-h-[calc(100vh-177px)] flex items-center justify-center '>
                <p className='text-3xl text-center'>Please login from a desktop device, admin portal is not designed for mobile devices</p>
            </main>
        </>
    }

    return (
        <Accordion className="text-[#004C46] dark:text-[#F5F3E7]">
            <AccordionItem key='assignments' aria-label='assignments' title='Models to Annotate' classNames={{ title: accordionTitlesCss }}>
                <AnnotationClient modelsToAnnotate={JSON.parse(props.modelsToAnnotate)} annotationModels={JSON.parse(props.annotationModels)} admin={false} />
            </AccordionItem>
            <AccordionItem key='modelSumbit' aria-label='modelSumbit' title='Submit Model' classNames={{ title: accordionTitlesCss }}>
                <ModelSubmitForm />
            </AccordionItem>
        </Accordion>
    )
}