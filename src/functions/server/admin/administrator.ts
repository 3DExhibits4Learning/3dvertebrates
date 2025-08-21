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
 * @param email 
 * @returns 
 */
export const deActivateStudent = async (email: string) => await prisma.authorized.update({ where: { email: email }, data: { active: false } }).then(() => 'Student deactivated')
    .catch(e => serverActionErrorHandler(path, e.message, 'deActivateStudent()', "Couldn't deactivate student"))

/**
 * 
 * @param email 
 * @returns 
 */
export const areThereIncompleteAssignments = async (email: string): Promise<boolean> => {
    const assignedModels = await prisma.model.findMany({ where: { assignedEmail: email, annotated: false } })

    if (assignedModels.length) {
        for (let model of assignedModels) {
            const annotations = await prisma.annotations.findMany({ where: { uid: model.uid } })

            if (annotations.length) return true
        }
    }
    return false
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const getModelAnnotator = async (uid: string) => await prisma.model.findUnique({ where: { uid: uid }, select: { annotator: true } }).then(model => model?.annotator)

/**
 * 
 * @param uid 
 * @returns 
 */
export const getModelAnnotations = async (uid: string) => await prisma.annotations.findMany({ where: { uid: uid } })


/**
 * 
 * @param uid 
 * @param assignee 
 * @returns 
 */
export const isModelAssignable = async (uid: string, assignee: string) => {
    const annotator = await getModelAnnotator(uid)
    const annotations = await getModelAnnotations(uid)

    if ((annotator && annotator.toLowerCase() !== assignee.toLowerCase()) && annotations.length) return false

    else if ((annotator && annotator.toLowerCase() !== assignee.toLowerCase()) || !annotator) {
        await prisma.model.update({ where: { uid: uid }, data: { annotator: assignee } }).catch(e => serverActionErrorHandler(path, e.message, 'isModelAssignable()', "Couldn't update model annotator"))
        return true
    }

    else return true
}

/**
 * 
 * @param student 
 * @param uid 
 * @param email 
 * @returns 
 */
export const assignAnnotation = async (student: string, email: string, uid: string, previousAnnotator?: boolean) => {
    try {
        // Throw error if any data is missing
        if (!(email && uid && student)) throw Error('Input data missing')
        console.log(`Assigning model ${uid} to student ${student} with email ${email}`)

        // Get annotator name
        const annotatorName = await prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.name)

        // Annotator update + assignment queries
        const deleteAnnotations = previousAnnotator ? prisma.annotations.deleteMany({ where: { uid: uid } }) : undefined
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: student } })
        const assignModelForAnnotation = prisma.model.update({ where: { uid: uid }, data: { assignedEmail: email, annotator: annotatorName } })
        const tx = deleteAnnotations ? [updateAnnotator, assignModelForAnnotation, deleteAnnotations] : [updateAnnotator, assignModelForAnnotation]

        // Await transaction and inform student of assignment
        await prisma.$transaction(tx).catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction([updateAnnotator, assignModelForAnnotation])', "Couldn't assign model to student"))
        await informStudentOfAssignment(process.env.NODE_ENV === 'production' ? email : "ab632@humboldt.edu", "beta.3dvertebrates.org")

        // Success message
        return `Model assigned to ${student} for annotation`
    }
    catch (e: any) { return e.message }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const getAssignmentEmail = async (uid: string) => await prisma.model.findUnique({ where: { uid: uid } }).then(model => model?.assignedEmail)

/**
 * 
 * @returns 
 */
export const getActiveStudents = async () => await prisma.authorized.findMany({ where: { active: true, role: 'student' } })

/**
 * 
 * @param email 
 * @returns 
 */
export const unassignAndDeactivate = async (email: string) => {
    const assignments = await prisma.model.findMany({ where: { assignedEmail: email } })
    const txArr: any = [prisma.authorized.update({ where: { email: email }, data: { active: false } })]

    for (let assignment of assignments) {
        txArr.push(prisma.model.update({ where: { uid: assignment.uid }, data: { assignedEmail: null, annotator: null } }))
        txArr.push(prisma.annotations.deleteMany({ where: { uid: assignment.uid } }))

        await prisma.$transaction(txArr).catch(e => serverActionErrorHandler(path, e.message, 'unassignAndDeactivate()', "Couldn't unassign model"))
    }
}

/**
 * 
 * @param email 
 * @param uid 
 * @returns 
 */
export const unassignAnnotation = async (uid: string, dev?: boolean) => {
    try {
        // Throw error if any data is missing
        if (!uid) throw Error('Uid missing')

        // Annotator update + assignment queries
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: null } })
        const unassignModelForAnnotation = prisma.model.update({ where: { uid: uid }, data: { annotator: null, assignedEmail: null } })
        const tx = dev ? [updateAnnotator, unassignModelForAnnotation] : [updateAnnotator, unassignModelForAnnotation, prisma.annotations.deleteMany({ where: { uid: uid } })]

        // Await transaction and inform student of assignment
        await prisma.$transaction(tx).catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction([updateAnnotator, unassignModelForAnnotation])', "Couldn't unassign model"))

        // Success message
        return `Model unassigned`
    }
    catch (e: any) { return e.message }
}

/**
 * @param uid 
 * @returns 
 */
export const publishModel = async (uid: string, adminAssigned?: boolean) => {
    try {
        // Approve model annotations
        await prisma.model.update({ where: { uid: uid }, data: { published: true } }).catch(e => serverActionErrorHandler(path, e.message, 'publishModel()', "Unable to approve model"))

        if (adminAssigned) await prisma.model.update({ where: { uid: uid }, data: { annotated: true } }).catch(e => serverActionErrorHandler(path, e.message, 'publishModel()', "Unable to approve model"))

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
export const markModelAsIncomplete = async (uid: string) => {
    try {
        // Mark model as incomplete (or unannotated) and return success
        await prisma.model.update({ where: { uid: uid }, data: { annotated: false } }).catch(e => serverActionErrorHandler(path, e.message, 'unapproveAnnotations()', "Error marking model as incomplete"))
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
        
        // Get authorized users and check if user already exists
        const authorized = await prisma.authorized.findMany()
        const user = authorized.find(user => user.email === email)

        // Reactivate student if they already exist and are not active, else return they already exist
        if(user){
            if(!user.active) {
                await prisma.authorized.update({ where: { email: email }, data: { active: true } })
                return 'Student reactivated'
            }
            else return 'Student already active'
        }

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

/**
 * 
 * @returns 
 */
export const getAllPhotoAnnotations = async (id: string) => await prisma.photo_annotation.findMany({ where: { annotation_id: id } })

/**
 * 
 * @param annotation_id 
 * @param annotation 
 */
export const updatePhotoAnnotation = async (annotation_id: string, annotation: string) => {
    if (!annotation_id || !annotation) throw Error('No annotation provided')
    await prisma.photo_annotation.update({ where: { annotation_id: annotation_id }, data: { annotation: annotation } })
}

