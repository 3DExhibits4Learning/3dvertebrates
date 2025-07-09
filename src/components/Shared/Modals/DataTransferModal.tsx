'use client'
import { Modal, ModalContent, ModalBody, ModalFooter, Spinner, Button } from "@heroui/react"
import { SetStateAction, Dispatch } from "react"

export default function AnnotationEntryDataTransfer(props: {
    open: boolean,
    transferring: boolean,
    result: string,
    loadingLabel: string,
    href?: string,
    setOpen?: Dispatch<SetStateAction<boolean>>,
    closeFn?: Function,
    closeVar?: boolean,
    modelUpload?: boolean,
    success?: boolean | undefined
}) {
    return <Modal isOpen={props.open} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="text-center">
                {
                    props.transferring &&
                    <Spinner label={props.loadingLabel} />

                }
                {
                    !props.transferring &&
                    <p>{props.result}</p>
                }
                {
                    !props.transferring && props.modelUpload && props.success &&
                    <>
                        <p>It may take a few minutes before your model is viewable.</p>
                        <p>When it is, submit a screen capture of it. This will be the thumbnail that will appear for users to click!</p>
                    </>
                }
            </ModalBody>
            <ModalFooter className="flex justify-center">
                {
                    !props.transferring && props.href &&
                    // Note that onPress={router.refresh} would randomly not work for this button
                    <a href={props.href}><Button color="primary">OK</Button></a>
                }
                {
                    !props.transferring && !props.href && props.setOpen && !props.closeFn &&
                    <Button color="primary" onPress={() => (props.setOpen as Dispatch<SetStateAction<boolean>>)(false)}>OK</Button>
                }
                {
                    !props.transferring && !props.href && props.closeFn &&
                    <Button color="primary" onPress={() => {
                        (props.closeFn as Function)(!props.closeVar)
                    }}>OK</Button>
                }
            </ModalFooter>
        </ModalContent>
    </Modal>
}

