/**
 * @file src/functions/server/admin/administrator.ts
 * 
 * @fileoverview administrator server actions
 * 
 * @todo include deletion of sketchfab model in prisma transaction for delete model
 */

'use server'

const path = 'src/functions/server/admin/administrator.ts'

// Typical imports
import { serverActionErrorHandler, catchMessage, nonFatalError } from "../error"
import { informStudentOfAssignment, emailNewlyAddedStudent } from "../email"
import { authorized } from "@prisma/client"

// Default imports
import prisma from "@/functions/utils/prisma"

/**
 * 
 * @param student 
 * @param uid 
 * @param email 
 * @returns 
 */
export const assignAnnotation = async (student: string, email: string, uid: string,) => {
    try {
        // Throw error if any data is missing
        if (!(email && uid && student)) throw Error('Input data missing')

        // Annotator update + assignment queries
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: student } })
        const assignModelForAnnotation = prisma.assignment.create({ data: { uid: uid, email: email } })

        // Await transaction and inform student of assignment
        await prisma.$transaction([updateAnnotator, assignModelForAnnotation]).catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction([updateAnnotator, assignModelForAnnotation])', "Couldn't assign model to student"))
        await informStudentOfAssignment(process.env.NODE_ENV === 'production' ? email : "ab632@humboldt.edu", "beta.3dvertebrates.org")

        // Success message
        return `Model assigned to ${student} for annotation`
    }
    catch (e: any) { return e.message }
}

/**
 * 
 * @param email 
 * @param uid 
 * @returns 
 */
export const unassignAnnotation = async (email: string, uid: string) => {
    try {
        // Throw error if any data is missing
        if (!(email && uid)) throw Error('Input data missing')

        // Annotator update + assignment queries
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: null } })
        const unassignModelForAnnotation = prisma.assignment.delete({ where: { uid: uid, email: email } })

        // Await transaction and inform student of assignment
        await prisma.$transaction([updateAnnotator, unassignModelForAnnotation])
            .catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction([updateAnnotator, unassignModelForAnnotation])', "Couldn't unassign model to student"))

        // Success message
        return `Model unassigned`
    }
    catch (e: any) { return e.message }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const approveAnnotations = async (uid: string) => {
    try {
        // Approve model annotations
        await prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: true } })
            .catch(e => serverActionErrorHandler(path, e.message, 'prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: true } })', "Unable to approve model"))

        // Return
        return "Annotations approved"
    }
    catch (e: any) { return e.message }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const unapproveAnnotations = async (uid: string) => {
    try {
        // Approve model annotations
        await prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: false } })
            .catch(e => serverActionErrorHandler(path, e.message, 'prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: false } })', "Unable to unapprove model"))

        // Return succes message
        return "Annotations unapproved"
    }
    catch (e: any) { return e.message }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const approveModel = async (uid: string) => {
    try {
        await prisma.model.update({ where: { uid: uid }, data: { modelApproved: true } }).catch(e => serverActionErrorHandler(path, e.message, 'approveModel()', "Coulnd't mark model as approved"))
        return 'Model approved'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const deleteModel = async (uid: string) => {
    try {

        // Sketchfab request header
        const requestHeader: HeadersInit = new Headers()
        requestHeader.set('Authorization', process.env.SKETCHFAB_API_TOKEN as string)

        // Transactions array
        const transactions = []

        // Get annotations (for annotation id's) and push deletions onto transactions array
        const annotations = await prisma.annotations.findMany({ where: { uid: uid }, orderBy: { annotation_no: 'asc' } })
        for (let i in annotations) transactions.push(prisma.annotations.delete({ where: { annotation_id: annotations[i].annotation_id } }))
        transactions.push(prisma.model.delete({ where: { uid: uid } }))

        // Await transaction
        await prisma.$transaction(transactions).catch(e => serverActionErrorHandler(path, e.message, "prisma.$transaction(transactions)", "Error: Couldn't delete model from database"))

        // Delete 3D model object from sketchfab
        await fetch(`https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models/${uid}`, { headers: requestHeader, method: 'DELETE' }).then(res => {
            if (!res.ok) nonFatalError(path, res.statusText, '`fetch(https://api.sketchfab.com/v3/orgs/) - **MODEL ${uid} NEEDS TO BE DELETED FROM SKETCHFAB**`')
        }).catch(e => nonFatalError(path, e.message, '`fetch(https://api.sketchfab.com/v3/orgs/) - **MODEL ${uid} NEEDS TO BE DELETED FROM SKETCHFAB**`'))

        // Typical success response
        return "Model deleted"
    }
    // Typical fail response
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param email 
 * @param name 
 * @returns 
 */
export const addStudent = async (email: string, name: string) => {
    try {
        if (!email || !name) throw Error('Name or email is missing')

        // Add student to authorized table in the database
        await prisma.authorized.create({ data: { email: email, name: name } }).catch((e) => serverActionErrorHandler(path, e.message, 'addStudent()', "Couldn't add student"))

        // Email student, informing them of their addition to the project
        await emailNewlyAddedStudent(process.env.NODE_ENV === 'production' ? email : "ab632@humboldt.edu", 'beta.3dvertebrates.org').catch((e) => nonFatalError(path, e.message, 'emailNewlyAddedStudent()'))

        // Success response
        return 'Student added'
    }
    // Typical fail response
    catch (e: any) { catchMessage(e.message) }
}

export const deleteStudent = async (email: string) => {
    try {
        if (!email) throw Error('No email provided')

        // Get authorized students, then filter and map to an array of their emails
        const students = await prisma.authorized.findMany().catch((e) => serverActionErrorHandler(path, e.message, 'getAuthorizedUsers()', "Couldn't get authorized students")) as authorized[]
        const studentEmails = students.filter(user => user.role === 'student').map(student => student.email)

        // Return a bad request if the student's email is not in the array
        if (!studentEmails.includes(email)) throw Error('Student is not active on this project')

        // Remove student from authorized table in database
        await prisma.authorized.delete({ where: { email: email } }).catch((e) => serverActionErrorHandler(path, e.message, 'removeStudent()', "Couldn't remove student"))

        // Typical success response
        'Student deleted'
    }
    // Typical catch
    catch (e: any) { catchMessage(e.message) }
}

/**
 * 
 * @returns 
 */
export const getAllPhotoAnnotations = async(id: string) => await prisma.photo_annotation.findMany({where:{annotation_id: id}})

export const updatePhotoAnnotation = async (annotation_id: string, annotation: string) => {
        if (!annotation_id || !annotation) throw Error('No annotation provided')
        await prisma.photo_annotation.update({ where: { annotation_id: annotation_id }, data: { annotation: annotation } })
}

