'use client'

// Typical imports
import { modelClickHandler } from "@/functions/client/annotationClient"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { annotationClientData } from "@/interface/interface"
import { Accordion, AccordionItem, Spinner } from "@heroui/react"
import { useContext } from "react"
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"

// Default imports
import AnnotationEntryWrapper from "@/components/Admin/Annotation/Annotation Client/AnnotationEntryWrapper"
import BotanistRefWrapper from "@/components/Admin/Annotation/Annotation Model Viewer/AnnotationModelViewerRef"
import AnnotationButtons from "@/components/Admin/Annotation/Annotation Client/AnnotationButtons"

export default function StudentAnnotationClient(props: {viewerLoaded: boolean}) {
    const viewerLoaded = props.viewerLoaded

    // Get context
    const context = useContext(AnnotationClientData) as annotationClientData
    const refs = context.refs
    const properties = context.properties
    const setters = context.setters

    // Refs
    const modelClicked = refs.modelClicked
    const newAnnotationEnabled = refs.newAnnotationEnabled

    // Parent props 
    const modelsToAnnotate = properties.modelsToAnnotate

    // Dispatches 
    const annotationsAndPositions = context.annotationsAndPositions
    const annotationsAndPositionsDispatch = context.annotationsAndPositionsDispatch
    const specimenDataDispatch = context.specimenDataDispatch

    // State 
    const setViewerLoaded = setters.setViewerLoaded
    const setModalOpen = setters.setSureModalOpen
    const setIsOpen = setters.setReorderModalOpen

    return <div className="flex flex-col w-full h-full text-[#004C46 dark:text-white]">
        <section className="flex">
            <section className="h-full w-1/5 min-w-[380px]">
                <Accordion className="h-full" onSelectionChange={(keys: any) => modelClicked.current = keys.size ? true : false}>
                    {modelsToAnnotate.map((model, i) => <AccordionItem
                        key={i}
                        aria-label={'Specimen to model'}
                        title={toUpperFirstLetter(model.spec_name)}
                        classNames={{ title: 'text-[ #004C46] text-2xl' }}
                        onPress={() => modelClickHandler(modelClicked.current as boolean, model, annotationsAndPositionsDispatch, specimenDataDispatch, false)}>
                        <div className="relative h-[400px] w-full">
                            {!viewerLoaded && <div className="absolute h-full w-full flex justify-center items-center"><Spinner label="Loading Model Viewer" /></div> /* Manual loading screen for model viewer */}
                            {annotationsAndPositions.firstAnnotationPosition !== undefined && <div className="h-[400px] w-full absolute"><BotanistRefWrapper ref={newAnnotationEnabled} setViewerLoaded={setViewerLoaded} /></div>}
                        </div>
                        {viewerLoaded && <AnnotationButtons setModalOpen={setModalOpen} ref={newAnnotationEnabled} setReorderOpen={setIsOpen} />}
                    </AccordionItem>
                    )}
                </Accordion>
            </section>
            <AnnotationEntryWrapper modelsToAnnotate={modelsToAnnotate} admin={false} viewerLoaded={viewerLoaded} />
        </section>
    </div>
}