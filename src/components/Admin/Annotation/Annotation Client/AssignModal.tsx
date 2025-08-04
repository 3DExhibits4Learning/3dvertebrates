'use client'

// Typical imports
import { assignAnnotation, isModelAssignable } from "@/functions/server/admin/administrator"
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

// Main JSX
export default function AssignModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, uid: string, assignee: string, email: string }) {
    // State variables
    const [isAssignable, setIsAssignable] = useState<boolean | undefined>(false)
    const [continueClicked, setContinueClicked] = useState(false)
    const [assignmentResult, setAssignmentResult] = useState('')
    const [assignmentHandled, setAssignmentHandled] = useState(false)

    // Handlers
    const setIsAssignableHandler = async () => { if (props.assignee) setIsAssignable(await isModelAssignable(props.uid, props.assignee)) }
    const assignmentHandler = async () => { setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid)); setAssignmentHandled(true) }

    const deleteAnnotationsAndAssignHandler = async () => {
        setContinueClicked(true)
        //setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid, true))
        setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid))
        setAssignmentHandled(true)
    }

    // useEffect(() => { setIsAssignableHandler() }, [props.assignee])
    useEffect(() => { if (isAssignable && !assignmentHandled && props.isOpen) assignmentHandler() }, [isAssignable, assignmentHandled])

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent className="w-fit min-w-[500px] flex flex-col items-center">
            <ModalBody>
                {isAssignable === undefined && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
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
                {continueClicked && !assignmentResult && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {isAssignable === true && !assignmentResult && <div className="min-h-[400px]"><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {
                    assignmentResult &&
                    <section className="flex flex-col items-center justify-center p-8 w-fit">
                        <p className="mb-8 text-lg">{assignmentResult}</p>
                        <Button onPress={() => props.setIsOpen(false)}>OK</Button>
                    </section>
                }
            </ModalBody>
        </ModalContent>
    </Modal>
}