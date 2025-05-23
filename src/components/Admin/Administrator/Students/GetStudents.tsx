/**
 * @file src/components/Admin/Administrator/Students/GetStudents.tsx
 * 
 * @fileoverview admin client display table of students and their assignments
 * 
 * @todo add species name of assigned 3d model to the table
 */

'use client'

import { studentsAssignmentsAndModels } from "@/interface/interface"

export default function StudentTable(props: { studentsAssignmentsAndModels: studentsAssignmentsAndModels[] }) {

    const sam = props.studentsAssignmentsAndModels

    return (
        <section className="flex w-full items-center flex-col">
            <div className="flex w-1/2 rounded-lg overflow-hidden mb-16">
                <table className="w-full bg-[#D5CB9F] dark:bg-[#212121]">
                    <tr>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Name</th>
                        <th className="text-xl border-b border-[#004C46] py-4">Email</th>
                    </tr>
                    {
                        sam.map((student, index) =>
                                <tr key={index}>
                                    <td className={index === sam.length - 1 ? "border-[#004C46] border-r py-2 pl-4" : "border-b border-[#004C46] border-r py-2 pl-4"} key={index}>{student.name}</td>
                                    <td className={index === sam.length - 1 ? "py-2 pl-4 border-[#004C46]" : "border-b border-[#004C46] py-2 pl-4"} key={index}>{student.email}</td>
                                </tr>
                        )
                    }
                </table>
            </div>
        </section>
    )
}