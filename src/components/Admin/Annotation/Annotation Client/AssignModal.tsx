'use client'

// Typical imports
import { assignAnnotation, isModelAssignable } from "@/functions/server/admin/administrator"
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

// Main JSX
export default function AssignModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, uid: string, assignee: string, email: string }) {
    // State variables
    const [isAssignable, setIsAssignable] = useState<boolean | undefined>()
    const [continueClicked, setContinueClicked] = useState<boolean>(false)
    const [assignmentResult, setAssignmentResult] = useState<string>('')

    // Handlers
    const setIsAssignableHandler = async () => setIsAssignable(await isModelAssignable(props.uid, props.assignee))
    const assignmentHandler = async () => setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid))
    const deleteAnnotationsAndAssignHandler = async () => {
        setContinueClicked(true)
        setAssignmentResult(await assignAnnotation(props.assignee, props.email, props.uid, true))
    }

    useEffect(() => { setIsAssignableHandler() }, [])
    useEffect(() => { if (isAssignable) assignmentHandler() }, [isAssignable])

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody >
                {isAssignable === undefined && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {
                    isAssignable === false && !continueClicked &&
                    <>
                        <p className="text-xl text-center text-red-600">Warning</p>
                        <p className="text-xl text-center">This model has been previously assigned to a different annotator. <b>All annotations by the previous annotator will be deleted</b> to assign a new annotator</p>
                        <p className="text-xl text-center text-red-600">Continue?</p>
                        <section className="flex justify-around mt-6">
                            <Button className='text-lg' color="primary" onPress={() => { deleteAnnotationsAndAssignHandler() }}>Continue</Button>
                            <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                        </section>
                    </>
                }
                {continueClicked && !assignmentResult && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {isAssignable === true && !assignmentResult && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {
                    assignmentResult &&
                    <section>
                        <p>{assignmentResult}</p>
                        <Button>Close</Button>
                    </section>
                }
            </ModalBody>
            <ModalFooter className="flex justify-center">
                <Button color="primary" onPress={() => props.setIsOpen(false)}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}