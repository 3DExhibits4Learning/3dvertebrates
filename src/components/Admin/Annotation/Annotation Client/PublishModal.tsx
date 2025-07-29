// Typical imports
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient"
import { annotationClientData } from "@/interface/interface"
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react"
import { Dispatch, SetStateAction, useContext } from "react"

// Main JSX
export default function PublishModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) {
    const context = useContext(AnnotationClientData) as annotationClientData

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="p-6">
                <p className="text-xl text-center">This will publish the model, its thumbnail and annotations to the collections page for public viewing.</p>
                <p className="text-xl text-center">Are you sure you want to publish this model?</p>
                <section className="flex justify-around mt-6">
                    <Button className='text-lg' color="primary" onPress={() => context.handlers.publishModelHandler()}>Publish</Button>
                    <Button className='text-lg' color="primary" onPress={() => props.setIsOpen(false)}>Cancel</Button>
                </section>
            </ModalBody>
        </ModalContent>
    </Modal>
}