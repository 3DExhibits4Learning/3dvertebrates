'use client'

// Typical imports
import { isLocalDevEnvClient } from "@/functions/client/utils"
import { isModelAssignable } from "@/functions/server/admin/administrator"
import { convertDbPathToLocalPath } from "@/functions/server/utils/utils"
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

// Main JSX
export default function AssignModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, uid: string, assignee: string }) {
    const [isAssigned, setIsAssigned] = useState<boolean>(false)
    const [isAssignable, setIsAssignable] = useState<boolean | undefined>()

    const setIsAssignableHandler = async () => setIsAssignable(await isModelAssignable(props.uid, props.assignee))
    const deleteAnnotationsAndAssignHandler = async () => { console.log('Deleting annotations and assigning model'); setIsAssigned(true); setIsAssignable(true) }

    useEffect(() => { setIsAssignableHandler() }, [])
    useEffect(() => { if (isAssignable) { console.log('Assign handler'); setIsAssigned(true) } }, [isAssignable])


    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody >
                {isAssignable === undefined && <div><Spinner className="w-10 h-10" label="Assigning model for annotation" /></div>}
                {
                    isAssignable === false &&
                    <>
                        <p className="text-xl text-center text-red-600">Warning</p>
                        <p className="text-xl text-center">This model has been previously annotated by a different annotator. <b>All annotations by the previous annotator will be deleted</b> to assign a new annotator</p>
                        <p className="text-xl text-center text-red-600">Continue?</p>
                        <section className="flex justify-around mt-6">
                            <Button className='text-lg' color="primary" onPress={() => deleteAnnotationsAndAssignHandler()}>Continue</Button>
                            <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                        </section>
                    </>
                }
            </ModalBody>
            <ModalFooter className="flex justify-center">
                <Button color="primary" onPress={() => props.setIsOpen(false)}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}