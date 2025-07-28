// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react"
import { Dispatch, SetStateAction, useContext } from "react"

// Main JSX
export default function UnassignmentModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
    const context = useContext(AnnotationClientData) as annotationClientData

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                <p className="text-2xl text-red-600 font-medium text-center">Are you sure?</p>
                <p className="text-xl text-center">This will unassign the model from the annotator <b>and permanantly delete all annotations</b> created for this 3D model.</p>
                <p className="text-xl text-center">Delete the annotations and unassign the model?</p>
                <section className="flex justify-around mt-6">
                    <Button className='text-lg' color="primary" onPress={() => context.handlers.unassignAnnotationHandler()}>Unassign</Button>
                    <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                </section>
            </ModalBody>
        </ModalContent>
    </Modal>
}