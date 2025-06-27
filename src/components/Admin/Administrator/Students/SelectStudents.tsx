/**
 * @file src/components/Admin/Administrator/Students/SelectStudents.tsx
 * 
 * @fileoverview 
 */

'use client'

import { studentsAssignmentsAndModels } from "@/interface/interface"
import { authorized } from "@prisma/client"

export default function StudentSelect(props: { setNameAndEmailStates: Function, authorizedUsers: authorized[] }) {
    return <select
            onChange={e => props.setNameAndEmailStates(e.target.value, props.authorizedUsers.find(user => user.name === e.target.value)?.email)}
            className={`w-fit min-w-[150px] max-w-[500px] rounded-md dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[32px] px-4 text-[14px] outline-[#004C46]`}>

            <option hidden key={'defaultStudentOption'} value='select'>Select an annotator</option>
            {props.authorizedUsers.map((student, index) => <option key={index} value={student.name}>{student.name}</option>)}
        </select>
}