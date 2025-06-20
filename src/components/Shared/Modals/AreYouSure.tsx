/**
 * @file src/components/Shared/Modals/AreYouSure.tsx
 * 
 * @fileoverview "Are you sure?" modal for marking a 3D model as annotated
 */

'use client'

// Typical imports
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react"
import { SetStateAction, useState, Dispatch } from "react"
import { Spinner } from "@heroui/react"
import { markModelAsAnnotated } from "@/functions/server/admin/annotator"

// Default imports
import Link from "next/link"

// Main JSX
export default function AreYouSure(props: { uid: string, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {

    // Variable initialization
    const [areTheySure, setAreTheySure] = useState<boolean>(false)
    const [markedAsAnnotated, setMarkedAsAnnotated] = useState<boolean>(false)
    const [msg, setMsg] = useState<any>('')

    // Mark as annotated handler
    const markAsAnnotated = async () => {
        const mark = await markModelAsAnnotated(props.uid)
        setMsg(mark)
        setMarkedAsAnnotated(true)
    }

    return <Modal isOpen={props.open}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalBody className="font-medium text-center">
                        {
                            !areTheySure &&
                            <>
                                <p className="mt-8">Are you sure you want to mark your model as annotated?</p>
                                <p className="mb-8">This will remove the 3D model from your dashboard and mark it ready for the production website.</p>
                                <div className="flex justify-around mb-8">
                                    <Button id='editModal' className="text-white" onPress={() => props.setOpen(false)}>Cancel</Button>
                                    <Button id='editModal' className="text-white" onClick={() => {
                                        setAreTheySure(true)
                                        markAsAnnotated()
                                    }}>Mark as Annotated</Button>
                                </div>
                            </>
                        }
                        {
                            areTheySure && !markedAsAnnotated &&
                            <Spinner label='Marking 3D Model as Annotated' />
                        }
                        {
                            areTheySure && markedAsAnnotated &&
                            <>
                                <p className="mb-8">{msg}</p>
                                <div>
                                    <Link href='/admin/student'><Button id='editModal' className="text-white">OK</Button></Link>
                                </div>
                            </>
                        }
                    </ModalBody>
                </>
            )}
        </ModalContent>
    </Modal>
}