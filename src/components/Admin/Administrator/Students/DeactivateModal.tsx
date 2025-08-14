// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react"
import { Dispatch, SetStateAction, useContext } from "react"

// Main JSX
export default function DeactivateModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, handler: (studentEmail: string) => Promise<void> }) {
    const context = useContext(AnnotationClientData) as annotationClientData

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                <p className="text-2xl text-red-600 font-medium text-center">Are you sure?</p>
                <p className="text-xl text-center">This student has an incomplete assignment. All annotations by this student<b>will be permanantly deleted</b>.</p>
                <p className="text-xl text-center">Delete annotations and deactivate student?</p>
                <section className="flex justify-around mt-6">
                    <Button className='text-lg text-red-600' color="danger" onPress={() => {}} variant="light">Unassign</Button>
                    <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                </section>
            </ModalBody>
        </ModalContent>
    </Modal>
}