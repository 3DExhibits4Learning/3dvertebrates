/**
 * @file src/components/Admin/Administrator/Students/AddStudent.tsx
 * 
 * @fileoverview administration component for adding students to the project
 */

'use client'

// Typcial imports
import { useState, useEffect, useContext } from "react"
import { addStudent } from "@/functions/server/admin/administrator"
import { Button } from "@heroui/react"
import { DataTransferContext } from "../ManagerClient"

// Default imports
import TextInput from "@/components/Shared/Form Fields/TextInput"
import dataTransferHandler from "@/functions/client/dataTransfer/dataTransferHandler"

// Main JSX
export default function AddStudent() {

    const initializeDataTransfer = useContext(DataTransferContext).initializeDataTransferHandler
    const terminateDataTransfer = useContext(DataTransferContext).terminateDataTransferHandler

    const [email, setEmail] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [buttonDisabled, setButtonDiabled] = useState<boolean>(true)

    const addStudentHandler = async () => await dataTransferHandler(initializeDataTransfer, terminateDataTransfer, addStudent, [email, name], 'Adding student')

    useEffect(() => {
        if (email.includes("@humboldt.edu") && name) setButtonDiabled(false)
        else setButtonDiabled(true)
    }, [email])

    return (
        <section className="flex justify-center mb-16">
            <div className="flex flex-col bg-[#D5CB9F] dark:bg-[#212121] w-1/2 rounded-xl border border-[#004C46] py-8">
                <section className="flex-col ml-12">
                    <div className="my-8 flex flex-col w-full "><TextInput value={name} setValue={setName} title='Name' /></div>
                    <div className="my-8 flex flex-col w-full"><TextInput value={email} setValue={setEmail} title='Email' /></div>
                    <Button className="mt-2 mb-8 text-xl text-white" isDisabled={buttonDisabled} onPress={addStudentHandler}>Add Student</Button>
                </section>
            </div>
        </section>
    )
}