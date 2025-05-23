import { studentsAndAssignments, studentsAssignmentsAndModels } from "@/interface/interface";
import { fullModel } from "@/interface/interface";

export default function createStudentsAssignmentsAndModels(students: studentsAndAssignments[], models: fullModel[]) {

    // Create custom object for admin table; start with type free copy of students
    const studentsAssignmentsAndModels: any = [...students]

    // Iterate the copy
    for (let i in studentsAssignmentsAndModels) {

        // If the student has any assignments
        if (studentsAssignmentsAndModels[i].assignment.length) {

            // Create an array to contain the models with same uid's of the assignments
            studentsAssignmentsAndModels[i].models = []

            // Iterate through the assignments
            for (let j in studentsAssignmentsAndModels[i].assignment) {
                
                // add model into the array per iteration
                studentsAssignmentsAndModels[i].models.push(models.find(model => model.uid === studentsAssignmentsAndModels[i].assignment[j].uid))
            }
        }
    }

    // return the array
    return studentsAssignmentsAndModels as studentsAssignmentsAndModels[]
}