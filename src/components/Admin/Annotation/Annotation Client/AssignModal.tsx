'use client'

// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { assignAnnotation, isModelAssignable } from "@/functions/server/admin/administrator"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button, Spinner } from "@heroui/react"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"

// Main JSX
export default function AssignModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, uid: string, assignee: string, email: string }) {
    const router = useRouter()

    // State variables
    const [isAssignable, setIsAssignable] = useState<boolean | undefined>()
    const [continueClicked, setContinueClicked] = useState(false)
    const [assignmentResult, setAssignmentResult] = useState('')
    const [assignmentHandled, setAssignmentHandled] = useState(false)

    // Handlers
    const setIsAssignableHandler = async () => setIsAssignable(await isModelAssignable(props.uid, props.assignee))
    const assignmentHandler = async () => { setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid)); setAssignmentHandled(true) }

    const deleteAnnotationsAndAssignHandler = async () => {
        setContinueClicked(true)
        //setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid, true))
        setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid))
        setAssignmentHandled(true)
    }

    useEffect(() => { if (props.isOpen && props.assignee) setIsAssignableHandler() }, [props.assignee, props.isOpen])
    useEffect(() => { if (isAssignable && !assignmentHandled && props.isOpen) assignmentHandler() }, [isAssignable, assignmentHandled, props.isOpen])

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent className="w-fit min-w-[500px] flex flex-col items-center">
            <ModalBody>
                {isAssignable === undefined && <div className="m-4"><Spinner size='lg' label="Assigning model for annotation" /></div>}
                {
                    isAssignable === false && !continueClicked &&
                    <>
                        <p className="text-xl text-center text-red-600">Warning</p>
                        <p className="text-xl text-center">This model has been previously assigned to a different annotator. <b>All annotations by the previous annotator will be deleted</b> to assign a new annotator.</p>
                        <p className="text-xl text-center">Continue?</p>
                        <section className="flex justify-around my-6">
                            <Button className='text-lg' color="primary" onPress={() => { deleteAnnotationsAndAssignHandler() }}>Continue</Button>
                            <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                        </section>
                    </>
                }
                {continueClicked && !assignmentResult && <div className="m-4"><Spinner size='lg' label="Assigning model for annotation" /></div>}
                {isAssignable === true && !assignmentResult && <div className="m-4"><Spinner size='lg' label="Assigning model for annotation" /></div>}
                {
                    assignmentResult &&
                    <section className="flex flex-col items-center justify-center p-8 w-fit">
                        <p className="mb-8 text-lg">{assignmentResult}</p>
                        <a href='/admin/management'><Button>OK</Button></a>
                    </section>
                }
            </ModalBody>
        </ModalContent>
    </Modal>
}