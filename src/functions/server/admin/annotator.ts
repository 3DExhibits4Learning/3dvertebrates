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
import { AnnotationNumbers } from "@/ts/ts"

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

/**
 * 
 * @param annotationNumbers 
 * @returns 
 */
export const renumberAnnotationsServer = async (annotationNumbers: AnnotationNumbers[]) => {
    try {
        var tempAnnotationNumber = 100
        const temporaryAnnotationNumberTransactionArr = []
        const newAnnotationNumberTransactionArr = []

        for (let i in annotationNumbers) {
            temporaryAnnotationNumberTransactionArr.push(prisma.annotations.update({
                where: { annotation_id: annotationNumbers[i].id },
                data: { annotation_no: tempAnnotationNumber }
            }))

            newAnnotationNumberTransactionArr.push(prisma.annotations.update({
                where: { annotation_id: annotationNumbers[i].id },
                data: { annotation_no: parseInt(annotationNumbers[i].no) }
            }))
            tempAnnotationNumber++
        }

        const transactionArr = [...temporaryAnnotationNumberTransactionArr, ...newAnnotationNumberTransactionArr]
        await prisma.$transaction(transactionArr)
            .catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction(temporaryAnnotationNumberTransactionArr)', "Couldn't complete annotation number temporary transaction"))

        return 'Annotation numbers updated'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @returns 
 */
export const renumberCurrentAnnotations = async () => {
    try {
        const uids = await prisma.annotations.findMany({ select: { uid: true }, distinct: ['uid'] })
        console.log('Uids: ', uids)

        for (let i in uids) {
            console.log('Getting annotations for uid: ', uids[i].uid)
            const annotations = await prisma.annotations.findMany({ where: { uid: uids[i].uid }, orderBy: { annotation_no: 'asc' } })
            const annotationNumbers = annotations.map((annotation, index) => ({ id: annotation.annotation_id, no: (index + 2).toString() }))
            console.log('Renumbering annotations for uid: ', uids[i].uid)
            await renumberAnnotationsServer(annotationNumbers).catch(e => serverActionErrorHandler(path, e.message, 'renumberAnnotationsServer(annotationNumbers)', "Couldn't renumber annotations"))
            console.log('Annotations renumbered for uid: ', uids[i].uid)
        }

        return "Annotations renumbered"
    }
    catch (e: any) { return `Error: ${e.message}` }
}