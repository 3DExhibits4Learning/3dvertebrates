// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { areThereIncompleteAssignments, deActivateStudent, unassignAndDeactivate, unassignAnnotation } from "@/functions/server/admin/administrator"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button, Spinner } from "@heroui/react"
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"

// Main JSX
export default function DeactivateModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, email: string }) {
    const context = useContext(AnnotationClientData) as annotationClientData

    const [incompleteAssignments, setIncompleteAssignments] = useState<boolean>()
    const [unassignWithAssignments, setUnassignWithAssingments] = useState(false)

    const incompleteAssignmentsHandler = async () => await areThereIncompleteAssignments(props.email)
    const deactivateStudent = async () => await deActivateStudent(props.email)
    const unassignAndDeactivateHandler = async() => await unassignAndDeactivate(props.email)

    useEffect(() => { incompleteAssignmentsHandler() }, [])
    useEffect(() => { if (incompleteAssignments === false) deactivateStudent() }, [incompleteAssignments])
    useEffect(() => { if (unassignWithAssignments) unassignAndDeactivateHandler() }, [unassignWithAssignments])

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                {
                    (incompleteAssignments === undefined || incompleteAssignments === false || unassignWithAssignments) &&
                    <Spinner label="Deactivating student" />
                }
                {
                    incompleteAssignments && <>
                        <p className="text-2xl text-red-600 font-medium text-center">Are you sure?</p>
                        <p className="text-xl text-center">This student has an incomplete assignment. All annotations by this student<b>will be permanantly deleted</b>.</p>
                        <p className="text-xl text-center">Delete annotations and deactivate student?</p>
                        <section className="flex justify-around mt-6">
                            <Button className='text-lg text-red-600' color="danger" onPress={() => { setUnassignWithAssingments(true) }} variant="light">Unassign</Button>
                            <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                        </section>
                    </>
                }
            </ModalBody>
        </ModalContent>
    </Modal>
}