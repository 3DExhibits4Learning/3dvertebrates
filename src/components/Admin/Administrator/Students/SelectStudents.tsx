/**
 * @file src/components/Admin/Administrator/Students/SelectStudents.tsx
 * 
 * @fileoverview 
 */

'use client'

import { studentsAssignmentsAndModels } from "@/interface/interface"

export default function StudentSelect(props: { setNameAndEmailStates: Function, students: studentsAssignmentsAndModels[] }) {
    return <section className="flex flex-col w-full mt-8">

        <p className="text-xl font-medium mb-1">Select Student to Assign</p>

        <select
            onChange={e => props.setNameAndEmailStates(e.target.value, props.students.find(student => student.name === e.target.value)?.email)}
            className={`w-4/5 min-w-[300px] max-w-[500px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46]`}>

            <option hidden key={'defaultStudentOption'} value='select'>Select a student</option>
            {props.students.map((student, index) => <option key={index} value={student.name}>{student.name}</option>)}
        </select>

    </section>
}