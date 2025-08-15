/**
 * @file src/components/Admin/Administrator/Students/GetStudents.tsx
 * 
 * @fileoverview admin client display table of students and their assignments
 * 
 * @todo add species name of assigned 3d model to the table
 */

'use client'

// Typical imports
import { Button } from "@heroui/react"
import { useState } from "react"
import { authorized} from "@prisma/client"

// Default imports
import DeactivateModal from "@/components/Admin/Administrator/Students/DeactivateModal"

// Main JSX
export default function StudentTable(props:{students: authorized[]}) {
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
    const [deactivateEmail, setDeactivateEmail] = useState<string>('')

    // const checkAssignmentsBeforeDeactivation = async(studentEmail: string) => await check 
    const deactivateStudentHandler = async (studentEmail: string) => {
       setDeactivateEmail(studentEmail)
       setIsDeactivateModalOpen(true)
    }

    return <>
    <DeactivateModal isOpen={isDeactivateModalOpen} setIsOpen={setIsDeactivateModalOpen} email={deactivateEmail}  />
        <section className="flex w-full items-center flex-col">
            <div className="flex w-1/2 rounded-lg overflow-hidden mb-16">
                <table className="w-full bg-[#D5CB9F] dark:bg-[#212121] text-center">
                    <thead>
                        <tr>
                            <th className="text-xl border-b border-[#004C46] border-r py-4">Name</th>
                            <th className="text-xl border-b border-[#004C46] border-r py-4">Email</th>
                            <th className="text-xl border-b border-[#004C46] py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            props.students.map((student, index) =>
                                <tr key={student.email}>
                                    <td className={index === props.students.length - 1 ? "border-[#004C46] py-2 pl-4 border-r" : "border-b border-[#004C46] border-r py-2 pl-4"}>{student.name}</td>
                                    <td className={index === props.students.length - 1 ? "border-[#004C46] py-2 pl-4 border-r" : "border-b border-[#004C46] border-r py-2 pl-4"}>{student.email}</td>
                                    <td className={index === props.students.length - 1 ? "border-[#004C46] py-2 pl-4" : "border-b border-[#004C46] py-2 pl-4"}><Button size="sm" onPress={() => deactivateStudentHandler(student.email)}>Deactivate</Button></td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </section>
    </>
}