/**
 * @file src/components/Admin/Administrator/ManagerClient.tsx
 * 
 * @fileoverview client wrapper for the administrator page; it's simply a nested <Accordion>
 * 
 * @todo add <AccordionItem> that allows administrator to mark or unmark a 3d model as annotated; or add it as a modelUpdate form field
 * 
 * @todo check if and what error is generated upon duplicate assignment of a model due to db constraint violation
 */
'use client'

// Typical imports
import { model } from "@prisma/client"
import { useState, createContext, useMemo, useEffect } from "react"
import { Accordion, AccordionItem } from "@heroui/react"
import { ManagerClientProps} from "@/interface/interface"
import { fullModel } from "@/interface/interface"
import { isMobileOrTablet } from "@/functions/utils/isMobile"
import { getAllPhotoAnnotations } from "@/functions/server/admin/administrator"
import { sanitizeHtml } from "@/functions/client/annotationEntry"
import { updatePhotoAnnotation } from "@/functions/server/admin/administrator"

// Default imports
import AnnotationClient from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import initializeDataTransfer from "@/functions/client/dataTransfer/initializeDataTransfer"
import terminateDataTransfer from "@/functions/client/dataTransfer/terminateDataTransfer"
import AddStudent from "./Students/AddStudent"
import dynamic from "next/dynamic"
import DeleteModel from "./Model/DeleteModel"
import AddThumbnail from "./Thumbnails/AddThumbnail"
import UpdateThumbnailContainer from "./Thumbnails/UpdateThumbnailContainer"
import UpdateModelContainer from "./Model/UpdateModelContainer"
import DataTransferModal from "../../Shared/Modals/DataTransferModal"
import StudentTable from "@/components/Admin/Administrator/Students/StudentTable"
import Assignments from "./Assignments/Assignments"
import FindModel from "./Model/Find"
import ApproveModel from "./Model/Approve"
import Select from "@/components/Shared/Form Fields/Select"

// Dynamic imports
const ModelSubmitForm = dynamic(() => import("@/components/Admin/ModelSubmit/Form"))

// Exported context
export const DataTransferContext = createContext<any>('')

// Main JSX component
export default function ManagerClient(props: ManagerClientProps) {

    // const annotation = async() => await getAllPhotoAnnotations('bf9088e4-b3ab-4818-b9a0-c03dc4bd8cec')
    // const tempfn = async() => {
    //     const a = await annotation()
    //     console.log(a[0].annotation)
    //     const b = sanitizeHtml(a[0].annotation)
    //     console.log(b)
    //     // await updatePhotoAnnotation(a[0].annotation_id, b)
    // }
    // tempfn()

    // Variable Declarations 
    const models: fullModel[] = JSON.parse(props.models)
    const modelsNeedingThumbnails: fullModel[] = (JSON.parse(props.modelsNeedingThumbnails) as fullModel[]).filter(model => model.modelApproved)
    const unapprovedModels = useMemo(() => models.filter(model => !model.modelApproved), [props.models])
    const approvedModels = useMemo(() => models.filter(model => model.modelApproved), [props.models])
    const students = useMemo(() => props.authorizedUsers.filter(user => user.role === 'student' && user.active), [props.authorizedUsers])
    const assignments = useMemo(() => (JSON.parse(props.assignments) as model[]).filter(assignment => !assignment.annotated).sort((a: model, b: model) => (a.annotator as string).localeCompare(b.annotator as string)), [props.assignments])
    const modelsToAnnotate = useMemo(() => approvedModels.filter(model => model.base_model && !model.published), [approvedModels])

    // Data transfer state variables
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [transferring, setTransferring] = useState<boolean>(false)
    const [result, setResult] = useState<string>('')
    const [loadingLabel, setLoadingLabel] = useState<string>('')

    // Data transfer handlers for context
    const initializeDataTransferHandler = (loadingLabel: string) => initializeDataTransfer(setOpenModal, setTransferring, setLoadingLabel, loadingLabel)
    const terminateDataTransferHandler = (result: string) => terminateDataTransfer(setResult, setTransferring, result)

    // Annotation model state (so that annotation client accordion isn't excessively long)
    const [annotationModelUid, setAnnotationModelUid] = useState('')

    // Tailwind variables
    const accordionTitlesCss = 'text-[#004C46] text-2xl dark:text-[#F5F3E7]'

    // For now... annotaion entry simply needs to be removed on mobile
    if (typeof window !== 'undefined' && isMobileOrTablet()) {
        return <>
            <main className='min-h-[calc(100vh-177px)] flex items-center justify-center '>
                <p className='text-3xl text-center'>Please login from a desktop device, admin portal is not designed for mobile devices</p>
            </main>
        </>
    }

    return <>
        {/* Data transfer (fetch or query) modal */}
        <DataTransferModal open={openModal} setOpen={setOpenModal} transferring={transferring} loadingLabel={loadingLabel as string} result={result} href='/admin/management' />

        {/* Data transfer handlers context provider */}
        <DataTransferContext.Provider value={{ initializeDataTransferHandler, terminateDataTransferHandler }}>

            {/* Main admin Accordion */}
            <Accordion className="text-[#004C46] dark:text-[#F5F3E7]">

                {/* AccordionItem holds nested "Students" accordion */}
                <AccordionItem key='adminStudents' aria-label='adminStudents' title='Students and Assignments' classNames={{ title: accordionTitlesCss }}>
                    {/* "Students" nested accordion */}
                    <Accordion>
                        {/* AccordionItem holds nested "Assignments" accordion */}
                        <AccordionItem key={'assignments'} aria-label={'assignments'} title='Assignments' classNames={{ title: accordionTitlesCss }}>
                            <Assignments assignments={assignments} />
                        </AccordionItem>
                        {/* Active students table */}
                        <AccordionItem key='activeStudents' aria-label='activeStudents' title='Active Students' classNames={{ title: accordionTitlesCss }}>
                            <StudentTable students={students} />
                        </AccordionItem>
                        {/* Add student form */}
                        <AccordionItem key='addStudent' aria-label='addStudent' title='Add Student' classNames={{ title: accordionTitlesCss }}>
                            <AddStudent />
                        </AccordionItem>
                    </Accordion>
                </AccordionItem>

                {/* AccordionItem holds nested "Models" accordion */}
                <AccordionItem key={'adminModels'} aria-label={'adminModels'} title='Models' classNames={{ title: accordionTitlesCss }}>
                    {/* "Models" nested accordion */}
                    <Accordion>
                        {/* Model submit form */}
                        <AccordionItem key='findModel' aria-label={'findModel'} title='Find' classNames={{ title: accordionTitlesCss }}>
                            <FindModel models={approvedModels} />
                        </AccordionItem>
                        <AccordionItem key='approveModel' aria-label={'approveModel'} title='Approve' classNames={{ title: accordionTitlesCss }}>
                            <ApproveModel unapprovedModels={unapprovedModels} />
                        </AccordionItem>
                        {/* Model submit form */}
                        <AccordionItem key='uploadModel' aria-label={'uploadModel'} title='Upload' classNames={{ title: accordionTitlesCss }}>
                            <ModelSubmitForm />
                        </AccordionItem>
                        {/* Model update form*/}
                        <AccordionItem key='updateModel' aria-label={'updateModel'} title='Update' classNames={{ title: accordionTitlesCss }}>
                            <UpdateModelContainer models={approvedModels} />
                        </AccordionItem>
                        {/* Model delete form*/}
                        <AccordionItem key='deleteModel' aria-label={'deleteModel'} title='Delete' classNames={{ title: accordionTitlesCss }}>
                            <DeleteModel models={approvedModels} />
                        </AccordionItem>
                    </Accordion>
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
                            <UpdateThumbnailContainer modelsWithThumbnails={approvedModels} />
                        </AccordionItem>
                    </Accordion>
                </AccordionItem>

                {/* AccordionItem holds nested "Annotations" accordion */}
                <AccordionItem key={'adminAnnotations'} aria-label={'New Image Set'} title={"Annotations"} classNames={{ title: 'text-[ #004C46] text-2xl' }}>
                    <Select value={annotationModelUid} setValue={setAnnotationModelUid} models={modelsToAnnotate} width="w-1/5"  />
                    {annotationModelUid && <AnnotationClient
                        modelsToAnnotate={approvedModels.filter(model => model.uid === annotationModelUid)}
                        admin={props.admin}
                        assignments={assignments} 
                        authorizedUsers={props.authorizedUsers}/>}
                </AccordionItem>

            </Accordion>
        </DataTransferContext.Provider>
    </>
}