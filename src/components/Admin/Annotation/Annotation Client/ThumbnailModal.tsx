'use client'

// Typical imports
import { isLocalDevEnvClient } from "@/functions/client/utils"
import { convertDbPathToLocalPath } from "@/functions/server/utils/utils"
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from "@heroui/react"
import { Dispatch, SetStateAction } from "react"

// Main JSX
export default function ThumbnailPreviewModal(props: { path: string | null | undefined, isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, species: string }) {
    const path = props.path ? isLocalDevEnvClient() ? convertDbPathToLocalPath(props.path) : `/${props.path}` : null

    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="text-center">
                <p className="text-3xl">{props.species}</p>
                <p className="text-xl">(Thumbnail Preview)</p>
                {props.path && <div><img src={`/api/nfs?path=${path}`} className="w-500px"></img></div>}
            </ModalBody>
            <ModalFooter className="flex justify-center">
                <Button color="primary" onPress={() => props.setIsOpen(false)}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}