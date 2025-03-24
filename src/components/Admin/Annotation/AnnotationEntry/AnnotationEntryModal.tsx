/**
 * @file src/components/Admin/Annotation/AnnotationEntryModal.tsx
 * 
 * @fileoverview annotation entry data transfer modal
 */

'use client'

// Default imports
import { Modal, ModalContent, ModalBody, ModalFooter, Spinner, Button } from "@nextui-org/react"
import { useContext } from "react";
import { AnnotationEntryData } from "./AnnotationEntry";
import { annotationClientData, annotationEntryContext } from "@/interface/interface";
import { AnnotationClientData } from "@/components/Admin/Annotation/Annotation Client/AnnotationClient";

// Main JSX
export default function AnnotationEntryTransferModal() {

    // Context
    const context = useContext(AnnotationEntryData) as annotationEntryContext
    const dispatch = (useContext(AnnotationClientData) as annotationClientData).annotationsAndPositionsDispatch
    const transferState = context.transferState

    return <Modal isOpen={transferState.transferModalOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="text-center">
                {transferState.transferring && <Spinner label={transferState.loadingLabel} />}
                {!transferState.transferring && <p>{transferState.result}</p>}
            </ModalBody>
            <ModalFooter className="flex justify-center">
                {!transferState.transferring && <Button color="primary" onPress={() => dispatch({ type: 'annotationSavedOrDeleted' })}>OK</Button>}
            </ModalFooter>
        </ModalContent>
    </Modal>
}
