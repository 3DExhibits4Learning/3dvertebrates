/**
 * @file src/components/Admin/Administrator/Students/GetStudents.tsx
 * 
 * @fileoverview admin client display table of students and their assignments
 * 
 * @todo add species name of assigned 3d model to the table
 */

'use client'

import { studentsAssignmentsAndModels } from "@/interface/interface"

export default function Assignments(props: { studentsAssignmentsAndModels: studentsAssignmentsAndModels[] }) {

    const sam = props.studentsAssignmentsAndModels // sam = students, assignments and models

    return (
        <section className="flex w-full items-center flex-col mb-16">
            <div className="flex w-3/4 rounded-lg overflow-auto">
                <table className="w-full bg-[#D5CB9F] dark:bg-[#212121] min-w-[800px]">
                    <tr>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Name</th>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Species</th>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Annotated</th>
                        <th className="text-xl border-b border-[#004C46] border-r py-4">Admin approved</th>
                        <th className="text-xl border-b border-[#004C46] py-4">Assignment Uid</th>
                    </tr>
                    {
                        sam.map((student, index) =>
                            <>
                                <tr key={Math.random()}>
                                    <td className={index === sam.length - 1 && sam[index].assignment.length <= 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-[#004C46] border-r py-2 pl-2"} key={Math.random()}>{student.name}</td>
                                    <td className={index === sam.length - 1 && sam[index].assignment.length <= 1 ? "py-2 pl-2 border-r border-[#004C46]" : "border-b border-[#004C46] border-r py-2 pl-2"} key={Math.random()}>{student.assignment.length ? student.models[0].spec_name : 'N/A'}</td>
                                    <td className={index === sam.length - 1 && sam[index].assignment.length <= 1 ? "py-2 pl-2 border-r border-[#004C46]" : "border-b border-[#004C46] border-r py-2 pl-2"} key={Math.random()}>{student.assignment.length ? student.models[0].annotated ? 'Yes' : 'No' : ''}</td>
                                    <td className={index === sam.length - 1 && sam[index].assignment.length <= 1 ? "py-2 pl-2 border-r border-[#004C46]" : "border-b border-[#004C46] border-r py-2 pl-2"} key={Math.random()}>{student.assignment.length ? student.models[0].annotationsApproved ? 'Yes' : 'No' : ''}</td>
                                    <td className={index === sam.length - 1 && sam[index].assignment.length <= 1 ? "py-2 pl-2" : "border-b border-[#004C46] py-2 pl-2"} key={Math.random()}>{student.assignment.length ? student.assignment[0].uid : ''}</td>
                                </tr>

                                {
                                    student.assignment.length > 1 &&
                                    student.assignment.slice(1).map((assignment, index) =>
                                        <tr key={Math.random()}>
                                            <td className={index === student.assignment.slice(1).length - 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-r border-[#004C46] py-2 pl-2"} key={Math.random()}>{student.name}</td>
                                            <td className={index === student.assignment.slice(1).length - 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-r border-[#004C46] py-2 pl-2"} key={Math.random()}>{student.models[index + 1].spec_name}</td>
                                            <td className={index === student.assignment.slice(1).length - 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-r border-[#004C46] py-2 pl-2"} key={Math.random()}>{student.models[index + 1].annotated ? 'Yes' : 'No'}</td>
                                            <td className={index === student.assignment.slice(1).length - 1 ? "border-[#004C46] border-r py-2 pl-2" : "border-b border-r border-[#004C46] py-2 pl-2"} key={Math.random()}>{student.models[index + 1].annotationsApproved  ? 'Yes' : 'No'}</td>
                                            <td className={index === student.assignment.slice(1).length - 1 ? "py-2 pl-2" : "border-b border-[#004C46] py-2 pl-2"} key={Math.random()}>{assignment.uid}</td>
                                        </tr>
                                    )
                                }
                            </>
                        )
                    }
                </table>
            </div>
        </section>
    )
}