// 'use client'

// export default function StudentSelect(props: { setEmail: any, props.student }) {
//     return (
//         <section className="flex flex-col w-1/2 mt-8">
//             <p className="text-xl font-medium">Select Student</p>
//             <select
//                 onChange={(e) => props.setEmail(e.target.value)}
//                 className={`w-4/5 min-w-[300px] max-w-[500px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46]`}
//                 value={student}
//             >
//                 <option hidden key={'defaultStudentOption'} value='select'>Select a student</option>
//                 {
//                     props.students.map((student, index) =>
//                         <option onClick={() => console.log(student.name)} key={index} value={student.email as string}>{`${student.name}\u00A0\u00A0-\u00A0\u00A0(${student.email})`}</option>
//                     )
//                 }
//             </select>
//         </section>
//     )
// }