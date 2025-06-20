/**
 * @file src\components\Admin\Administrator\Students\RemoveStudent.tsx
 * 
 * @fileoverview administration component for removal of student(s) from the project
 */

'use client'

// Typical imports
import { useState, useEffect, useContext } from "react"
import { deleteStudent } from "@/functions/server/admin/administrator"
import { Button } from "@heroui/react"
import { DataTransferContext } from "../ManagerClient"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Main JSX
export default function RemoveStudent() {

    // Data transfer contexts
    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    // States
    const [email, setEmail] = useState<string>('')
    const [buttonDisabled, setButtonDiabled] = useState<boolean>(true)

    // Remove student handler
    const removeStudentHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, deleteStudent, [email], 'Removing student')

    // Effect enabling buuton based on email domain
    useEffect(() => {
        if (email.includes('@humboldt.edu')) setButtonDiabled(false)
        else setButtonDiabled(true)
    }, [email])

    return <section className="flex justify-center mb-16">
        <div className="flex bg-[#D5CB9F] flex-col w-1/2 rounded-xl border border-[#004C46] py-8 dark:bg-[#212121]">
            <section className="ml-12 flex-col">
                <TextInput value={email} setValue={setEmail} title='Email' />
                <div><Button className="mt-4 text-xl text-white" isDisabled={buttonDisabled} onPress={removeStudentHandler}>Remove Student</Button></div>
            </section>
        </div>
    </section>
}