/**
 * @file src/functions/server/admin/administrator.ts
 * 
 * @fileoverview administrator server actions
 */

'use server'

const path = 'src/functions/server/admin/administrator.ts'

// Typical imports
import { serverActionErrorHandler } from "../error"
import { informStudentOfAssignment } from "../email"

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
    catch(e: any) {return e.message}
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
        await prisma.$transaction([updateAnnotator, unassignModelForAnnotation]).catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction([updateAnnotator, unassignModelForAnnotation])', "Couldn't unassign model to student"))

        // Success message
        return `Model unassigned`
    }
    catch(e: any) {return e.message}
}