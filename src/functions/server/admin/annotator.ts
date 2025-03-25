/**
 * @file src/functions/server/admin/annotator.ts
 * 
 * @fileoverview annotator server actions
 */

'use server'

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { serverActionErrorHandler } from "../error"

// SINGLETON
import prisma from "@/functions/utils/prisma"

// Path
const path = 'src/functions/server/admin/annotator.ts'

/**
 * 
 * @param uid 
 * @returns 
 */
export const getBaseAnnotations = async (uid: string) => await prisma.annotations.findMany({ where: { uid: uid }, orderBy: { annotation_no: 'asc' } })

/**
 * 
 * @param annotationId 
 * @param annotationType 
 * @returns 
 */
export const getMediaAnnotation = async (annotationId: string, annotationType: string) => {
    switch (annotationType) {
        case 'model': return await prisma.model_annotation.findUnique({ where: { annotation_id: annotationId } })
        case 'video': return await prisma.video_annotation.findUnique({ where: { annotation_id: annotationId } })
        default: return await prisma.photo_annotation.findUnique({ where: { annotation_id: annotationId } })
    }
}

/**
 * 
 * @param uid 
 * @returns 
 */
export const markModelAsAnnotated = async (uid: string) => {
    try {
        // Get session, user's name
        const session = await getServerSession(authOptions).catch(e => serverActionErrorHandler(path, e.message, 'getServerSession(authOptions)', "Coulnd't get server session"))
        const name = session.user.name

        // Mark the 3d model as annotated, update the model annotator
        const updateMark = prisma.model.update({ where: { uid: uid }, data: { annotated: true } })
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: name } })
        await prisma.$transaction([updateMark, updateAnnotator]).catch(e => serverActionErrorHandler(path, e.message, 'getServerSession(authOptions)', "Coulnd't get server session"))

        return 'Model marked as annotated'
    }
    catch (e: any) { return `Error: ${e.message}` }
}