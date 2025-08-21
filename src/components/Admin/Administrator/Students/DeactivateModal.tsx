// Typical imports
import { areThereIncompleteAssignments, deActivateStudent, unassignAndDeactivate } from "@/functions/server/admin/administrator"
import { Modal, ModalContent, ModalBody, Button, Spinner } from "@heroui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

// Main JSX
export default function DeactivateModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, email: string, setActiveStudentsUpdated: Dispatch<SetStateAction<boolean | undefined>> }) {
    const [incompleteAssignments, setIncompleteAssignments] = useState<boolean>()
    const [unassignWithAssignments, setUnassignWithAssingments] = useState(false)
    const [studentDeactivated, setStudentDeactivated] = useState(false)

    const incompleteAssignmentsHandler = async () => setIncompleteAssignments(await areThereIncompleteAssignments(props.email))
    const deactivateStudent = async () => { await deActivateStudent(props.email); setStudentDeactivated(true) }
    const unassignAndDeactivateHandler = async () => { await unassignAndDeactivate(props.email); setStudentDeactivated(true) }
    const setUpdatedActiveStudentHandler = () => props.setActiveStudentsUpdated(prev => prev === undefined ? true : !prev)

    useEffect(() => { if (props.isOpen) incompleteAssignmentsHandler() }, [props.isOpen])
    useEffect(() => { if (incompleteAssignments === false) deactivateStudent() }, [incompleteAssignments])
    useEffect(() => { if (unassignWithAssignments) unassignAndDeactivateHandler() }, [unassignWithAssignments])

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                {!studentDeactivated && (!incompleteAssignments || (incompleteAssignments && unassignWithAssignments && !studentDeactivated)) && <Spinner label="Deactivating student" />}
                {
                    incompleteAssignments && !unassignWithAssignments && !studentDeactivated && <>
                        <p className="text-2xl text-red-600 font-medium text-center">Are you sure?</p>
                        <p className="text-xl text-center">This student has an incomplete assignment. All annotations by this student<b>will be permanantly deleted</b>.</p>
                        <p className="text-xl text-center">Delete annotations and deactivate student?</p>
                        <section className="flex justify-around mt-6">
                            <Button className='text-lg text-red-600' color="danger" onPress={() => { setUnassignWithAssingments(true) }} variant="light">Unassign</Button>
                            <Button size='sm' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                        </section>
                    </>
                }
                {
                    studentDeactivated && <>
                        <section className="flex flex-col items-center">
                            <p className="text-center m-8">Student deactivated.</p>
                            <Button size='sm' color="primary" onPress={() => { setUpdatedActiveStudentHandler(); props.setIsOpen(false) }} className="mb-8">OK</Button>
                        </section>
                    </>
                }
            </ModalBody>
        </ModalContent>
    </Modal>
}