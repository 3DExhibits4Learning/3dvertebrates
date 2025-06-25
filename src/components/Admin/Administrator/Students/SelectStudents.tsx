/**
 * @file src/components/Admin/Administrator/Students/SelectStudents.tsx
 * 
 * @fileoverview 
 */

'use client'

import { studentsAssignmentsAndModels } from "@/interface/interface"

export default function StudentSelect(props: { setNameAndEmailStates: Function, students: studentsAssignmentsAndModels[] }) {
    return <select
            onChange={e => props.setNameAndEmailStates(e.target.value, props.students.find(student => student.name === e.target.value)?.email)}
            className={`w-fit min-w-[150px] max-w-[500px] rounded-md dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[32px] px-4 text-[14px] outline-[#004C46]`}>

            <option hidden key={'defaultStudentOption'} value='select'>Select a student</option>
            {props.students.map((student, index) => <option key={index} value={student.name}>{student.name}</option>)}
        </select>
}