'use client'

// Typical imports
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from "@heroui/react"
import { Dispatch, SetStateAction } from "react"

// Main JSX
export default function UploadModal(props: {isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>}) {
    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="text-center">
                <p className="text-xl">(Thumbnail Preview)</p>
            </ModalBody>
            <ModalFooter className="flex justify-center">
                <Button color="primary" onPress={() => props.setIsOpen(false)}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}