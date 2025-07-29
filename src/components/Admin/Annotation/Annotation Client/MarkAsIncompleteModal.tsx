// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react"
import { Dispatch, SetStateAction, useContext } from "react"

// Main JSX
export default function MarkAsIncompleteModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
    const context = useContext(AnnotationClientData) as annotationClientData

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                <p className="text-2xl text-red-600 font-medium text-center">Are you sure?</p>
                <p className="text-xl text-center">The annotator will need to remark this model as complete before it can be published.</p>
                <p className="text-xl text-center">Are you sure you want to mark the model as incomplete?</p>
                <section className="flex justify-around mt-6">
                    <Button className='text-lg text-red-600' color="danger" variant="light" onPress={() => context.handlers.markAsIncompleteHandler()}>Mark Incomplete</Button>
                    <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                </section>
            </ModalBody>
        </ModalContent>
    </Modal>
}