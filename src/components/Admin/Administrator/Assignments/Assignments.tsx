/**
 * @file src/components/Admin/Administrator/Students/GetStudents.tsx
 * 
 * @fileoverview admin client display table of students and their assignments
 * 
 */

'use client'

import { model } from "@prisma/client"
import { useSession } from "next-auth/react"
import { Fragment } from "react"

export default function Assignments(props: { assignments: model[] }) {
    const session = useSession()
    const isIT = session.data?.user?.email === 'ab632@humboldt.edu' ? true : false
    const assignments = isIT ? props.assignments : props.assignments.filter(assignment => assignment.assignedEmail !== 'ab632@humboldt.edu')

    return assignments.length > 0 ? <section className="flex w-full items-center flex-col mb-16">
        <div className="flex w-3/4 rounded-lg overflow-auto">
            <table className="w-full bg-[#D5CB9F] dark:bg-[#212121] min-w-[800px] text-center">
                <thead>
                    <tr>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Name</th>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Species</th>
                        <th className="text-xl border-b border-[#004C46] py-4">Assignment Uid</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        assignments.map((assignment, index) =>
                            <Fragment key={assignment.uid}>
                                <tr>
                                    <td className={index === assignments.length - 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-[#004C46] border-r py-2 pl-2"}>{assignment.annotator}</td>
                                    <td className={index === assignments.length - 1 ? "py-2 pl-2 border-r border-[#004C46]" : "border-b border-[#004C46] border-r py-2 pl-2"}>{assignment.spec_name}</td>
                                    <td className={index === assignments.length - 1 ? "py-2 pl-2" : "border-b border-[#004C46] py-2 pl-2"}>{assignment.uid}</td>
                                </tr>
                            </Fragment>
                        )
                    }
                </tbody>
            </table>
        </div>
    </section> : <section className="flex w-full items-center flex-col mb-16">
        <p className='text-xl'>No unannotated assignments found</p>
    </section>
}