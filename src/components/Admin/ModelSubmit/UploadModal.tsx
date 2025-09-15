'use client'

// Typical imports
import { Modal, ModalContent, ModalBody, ModalFooter, Button, Spinner, Progress } from "@heroui/react"
import { Dispatch, SetStateAction } from "react"

// Default imports
import Link from "next/link"

// Main JSX
export default function UploadModal(props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, writingToDisk: boolean, exportingToSketchfab: boolean, progress: number, result: string }) {
    return <Modal isOpen={props.isOpen} isDismissable={false} hideCloseButton isKeyboardDismissDisabled={true}>
        <ModalContent>
            <ModalBody className="text-center">
                {
                    props.writingToDisk &&
                    <section className="flex flex-col justify-center items-center p-8">
                        <Spinner label='Writing model file to disk...' className="mb-6" size='lg' />
                        <Progress value={props.progress} />
                    </section>
                }
                {
                    props.exportingToSketchfab &&
                    <section className="flex flex-col justify-center items-center p-8">
                        <Spinner label='Exporting model to host...' size='lg' />
                    </section>
                }
                {props.result && <p className="my-6 text-lg">{props.result}</p>}
            </ModalBody>
            <ModalFooter className="flex justify-center">
                {
                    !props.writingToDisk && !props.exportingToSketchfab && props.result &&
                    <Link href={'/admin'}><Button color="primary" className="mb-4">Close</Button></Link>
                }
            </ModalFooter>
        </ModalContent>
    </Modal>
}