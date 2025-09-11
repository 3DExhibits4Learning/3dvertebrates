/**
 * @file src/functions/server/admin/annotator.ts
 * 
 * @fileoverview annotator server actions
 */

'use server'

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { nonFatalError, serverActionErrorHandler } from "../error"
import { annotationDataEntryObj, annotationDataEntryUpdateObj, AnnotationNumbers, newAnnotationData } from "@/ts/ts"
import { v4 as uuidv4 } from 'uuid'
import { fullAnnotation } from "@/interface/interface"
import { model, model_annotation, photo_annotation, PrismaPromise, text_annotation, video_annotation } from "@prisma/client"
import { unlink } from "fs/promises"
import { checkEssentialValues, convertCloudPathToLocalPath, convertDbPathToLocalPath, getPathToUnlink, isLocalDevEnv, serverLog } from "@/functions/server/utils/utils"
import { autoWriteFile } from "@/functions/server/utils/file"
import { deleteAnnotation } from "@/functions/server/queries"

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
 * @param uid 
 * @returns 
 */
export const getFirstAnnotationPosition = async (uid: string) => await prisma.model.findUnique({ where: { uid: uid } }).then(model => model?.annotationPosition ? JSON.parse(model?.annotationPosition as string) : '')

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
        case 'text': return await prisma.text_annotation.findUnique({ where: { annotation_id: annotationId } })
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
        const email = session.user.email
        const name = await prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.name)

        // Mark the 3d model as annotated, update the model annotator
        const updateMark = prisma.model.update({ where: { uid: uid }, data: { annotated: true } })
        const updateAnnotator = prisma.model.update({ where: { uid: uid }, data: { annotator: name } })
        await prisma.$transaction([updateMark, updateAnnotator]).catch(e => serverActionErrorHandler(path, e.message, 'getServerSession(authOptions)', "Coulnd't get server session"))

        serverLog(`Model ${uid} marked as annotated by ${name} (${email})`)
        return 'Model marked as annotated'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param annotationNumbers 
 * @returns 
 */
export const renumberAnnotationsServer = async (annotationNumbers: AnnotationNumbers[], userEmail: string) => {
    try {
        // Temp annotation number and tx arrays
        var tempAnnotationNumber = 100
        const temporaryAnnotationNumberTransactionArr = []
        const newAnnotationNumberTransactionArr = []

        // Iterate through annotation numbers, push to tx arrays
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

        // Await transactions
        const transactionArr = [...temporaryAnnotationNumberTransactionArr, ...newAnnotationNumberTransactionArr]
        await prisma.$transaction(transactionArr).catch(e => serverActionErrorHandler(path, e.message, 'prisma.$transaction(temporaryAnnotationNumberTransactionArr)', "Couldn't complete annotation number temporary transaction"))

        // Log and return
        serverLog(`User ${userEmail} renumbered annotations`)
        return 'Annotation numbers updated'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param annotationId 
 * @returns 
 */
export const getAnnotationText = async (annotationId: string) => {
    try {
        const annotation = await prisma.annotations.findUnique({ where: { annotation_id: annotationId } }).then(annotation => annotation?.annotation_type)
        switch (annotation) {
            case 'model': return await prisma.model_annotation.findUnique({ where: { annotation_id: annotationId } }).then(annotation => annotation?.annotation)
            case 'video': return await prisma.video_annotation.findUnique({ where: { annotation_id: annotationId } }).then(annotation => annotation?.annotation)
            case 'photo': return await prisma.photo_annotation.findUnique({ where: { annotation_id: annotationId } }).then(annotation => annotation?.annotation)
        }
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param originalUid 
 * @param newUid 
 */
export const remapAnnotations = async (originalUid: string, newUid: string, annotationModelUid?: string) => {
    try {
        // Get all annotations of originalUid
        const annotations = await prisma.annotations.findMany({ where: { uid: originalUid } }) as fullAnnotation[]
        if (!annotations) throw Error('No first annotation/annotations')

        // Iterate through annotations
        for (let i in annotations) {
            // Create new annotation ID and update base annotation record

            // Get media annotation based on annotation type
            switch (annotations[i].annotation_type) {
                case 'model': annotations[i].annotation = await prisma.model_annotation.findUnique({ where: { annotation_id: annotations[i].annotation_id } }) as model_annotation; break
                case 'video': annotations[i].annotation = await prisma.video_annotation.findUnique({ where: { annotation_id: annotations[i].annotation_id } }) as video_annotation; break
                default: annotations[i].annotation = await prisma.photo_annotation.findUnique({ where: { annotation_id: annotations[i].annotation_id } }) as photo_annotation; break
            }

            // New annotation ID
            annotations[i].annotation_id = annotations[i].annotation.annotation_id = uuidv4()

            // Create new base annotation for the model of newUid (with new annotation ID)
            await prisma.annotations.create({
                data: {
                    url: annotations[i].url,
                    uid: newUid,
                    annotation_no: annotations[i].annotation_no,
                    annotation_id: annotations[i].annotation_id,
                    annotation_type: annotations[i].annotation_type,
                    position: annotations[i].position,
                    title: annotations[i].title
                }
            })

            // Create new media annotation based on annotation type
            switch (annotations[i].annotation_type) {
                case 'model': const modelAnnotation = annotations[i].annotation as model_annotation
                    await prisma.model_annotation.create({
                        data: {
                            annotation_id: modelAnnotation.annotation_id,
                            modeler: modelAnnotation.modeler,
                            license: modelAnnotation.license,
                            annotator: modelAnnotation.annotator,
                            annotation: modelAnnotation.annotation,
                            uid: annotationModelUid as string
                        }
                    })
                    break

                case 'video': const videoAnnotation = annotations[i].annotation as video_annotation
                    await prisma.video_annotation.create({
                        data: {
                            annotation_id: videoAnnotation.annotation_id,
                            length: videoAnnotation.length,
                            url: videoAnnotation.url,
                            annotation: videoAnnotation.annotation
                        }
                    })
                    break

                default: const photoAnnotation = annotations[i].annotation as photo_annotation
                    await prisma.photo_annotation.create({
                        data: {
                            annotation_id: photoAnnotation.annotation_id,
                            license: photoAnnotation.license,
                            annotator: photoAnnotation.annotator,
                            annotation: photoAnnotation.annotation,
                            website: photoAnnotation.website,
                            author: photoAnnotation.author,
                            title: photoAnnotation.title,
                            url: photoAnnotation.url
                        }
                    })
                    break
            }
        }
    }
    catch (e: any) { console.error(e.message) }
}

/**
 * 
 * @param uid 
 */
export const retargetAnnotations = async (uid: string) => {
    const firstAnnotationPosition = JSON.parse(await prisma.model.findUnique({ where: { uid: uid } }).then(model => model?.annotationPosition) as string)
    const annotations = await prisma.annotations.findMany({ where: { uid: uid }, orderBy: { annotation_no: 'asc' } })

    for (let i in annotations) {
        if (annotations[i].position) {
            const position = JSON.parse(annotations[i].position)
            position[2] = firstAnnotationPosition[2]
            await prisma.annotations.update({ where: { annotation_id: annotations[i].annotation_id }, data: { position: JSON.stringify(position) } })
        }
    }
}

/**
 * 
 * @param uid 
 * @param annotator 
 */
export const updateAnnotator = async (uid: string, annotator: string) => {
    const annotations = await prisma.annotations.findMany({ where: { uid: uid }, orderBy: { annotation_no: 'asc' } })

    for (let i in annotations) {
        // Create new media annotation based on annotation type
        switch (annotations[i].annotation_type) {
            case 'model': await prisma.model_annotation.update({
                where: { annotation_id: annotations[i].annotation_id },
                data: { annotator: annotator }
            })
                break

            case 'video': break

            default: await prisma.photo_annotation.update({
                where: { annotation_id: annotations[i].annotation_id },
                data: { annotator: annotator }
            })
                break
        }
    }
}

/**
 * 
 * @param newAnnotationData 
 * @param length 
 * @param annotation 
 */
export const createNewTextAnnotation = async (newAnnotationData: newAnnotationData, annotation: string) => {
    try {
        const newVideoBaseAnnotation = prisma.annotations.create({ data: newAnnotationData })
        const newVideoAnnotation = prisma.text_annotation.create({ data: { annotation_id: newAnnotationData.annotation_id, annotation: annotation } })
        await prisma.$transaction([newVideoBaseAnnotation, newVideoAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'createNewTextAnnotation()', "Error: Couldn't create text annotation") }
}

/**
 * 
 * @param newAnnotationData 
 * @param length 
 * @param annotation 
 */
export const createNewVideoAnnotation = async (newAnnotationData: newAnnotationData, length: string, annotation: string) => {
    try {
        const newVideoBaseAnnotation = prisma.annotations.create({ data: newAnnotationData })
        const newVideoAnnotation = prisma.video_annotation.create({ data: { url: newAnnotationData.url, length: length, annotation_id: newAnnotationData.annotation_id, annotation: annotation } })
        await prisma.$transaction([newVideoBaseAnnotation, newVideoAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'createNewVideoAnnotation()', "Error: Couldn't create video annotation") }
}

/**
 * 
 * @param newAnnotationData 
 * @param email 
 * @param modelAnnotationUid 
 * @param annotation 
 * @param annotationId 
 */
export const createNewModelAnnotation = async (newAnnotationData: newAnnotationData, email: string, modelAnnotationUid: string, annotation: string) => {
    try {
        // Get modeler and annotator
        const annotator = prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)
        const modeler = prisma.model.findUnique({ where: { uid: modelAnnotationUid } }).then(model => model?.modeled_by)
        const res = await Promise.all([annotator, modeler])

        // Annotation creation
        const newModelBaseAnnotation = prisma.annotations.create({ data: newAnnotationData })
        const newModelAnnotation = prisma.model_annotation.create({
            data: {
                uid: modelAnnotationUid,
                annotation: annotation,
                annotation_id: newAnnotationData.annotation_id,
                annotator: res[0],
                modeler: res[1]
            }
        })
        // Await transaction
        await prisma.$transaction([newModelBaseAnnotation, newModelAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'createNewModelAnnotation()', "Error: Couldn't create model annotation") }
}

/**
 * 
 * @param newAnnotationData 
 * @param author 
 * @param license 
 * @param email 
 * @param annotation 
 * @param website 
 * @param title 
 */
export const createNewPhotoAnnotation = async (annotationEntryData: annotationDataEntryObj, newAnnotationData: newAnnotationData, email: string) => {
    // Get annotator
    const annotator = await prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)

    // Create annotation record
    const newBasePhotoAnnotation = prisma.annotations.create({ data: newAnnotationData })

    // Create photo annotation record
    const newPhotoAnnotation = prisma.photo_annotation.create({
        data: {
            url: annotationEntryData.url as string,
            author: annotationEntryData.author as string,
            license: annotationEntryData.license as string,
            annotator: annotator as string,
            annotation_id: annotationEntryData.annotationId,
            annotation: annotationEntryData.annotation,
            website: annotationEntryData.website,
            title: annotationEntryData.photoTitle
        }
    })

    // Await transaction
    await prisma.$transaction([newBasePhotoAnnotation, newPhotoAnnotation])
}

/**
 * 
 * @param annotationEntryData 
 */
export const updateTextAnnotationEntry = async (annotationEntryData: annotationDataEntryObj) => {
    try {
        // Base annotation update
        const updatedBaseAnnotation = prisma.annotations.update({
            where: { annotation_id: annotationEntryData.annotationId },
            data: {
                uid: annotationEntryData.uid,
                position: annotationEntryData.position,
                url: '',
                annotation_type: annotationEntryData.annotationType,
                title: annotationEntryData.title
            },
        })
        // Video annotation update
        const updatedTextAnnotation = prisma.text_annotation.update({
            where: { annotation_id: annotationEntryData.annotationId },
            data: { annotation: annotationEntryData.annotation }
        })

        await prisma.$transaction([updatedBaseAnnotation, updatedTextAnnotation])
    }
    catch (e: any) { }
}

/**
 * 
 * @param annotationEntryData 
 */
export const updateVideoAnnotationEntry = async (annotationEntryData: annotationDataEntryObj) => {
    try {
        // Base annotation update
        const updatedBaseAnnotation = prisma.annotations.update({
            where: { annotation_id: annotationEntryData.annotationId },
            data: {
                uid: annotationEntryData.uid,
                position: annotationEntryData.position,
                url: annotationEntryData.url,
                annotation_type: annotationEntryData.annotationType,
                title: annotationEntryData.title
            },
        })
        // Video annotation update
        const updatedVideoAnnotation = prisma.video_annotation.update({
            where: { annotation_id: annotationEntryData.annotationId },
            data: { url: annotationEntryData.url, length: annotationEntryData.length, annotation: annotationEntryData.annotation }
        })

        await prisma.$transaction([updatedBaseAnnotation, updatedVideoAnnotation])
    }
    catch (e: any) { }
}

/**
 * 
 * @param annotationEntryData 
 */
export const updateModelAnnotationEntry = async (annotationEntryData: annotationDataEntryObj) => {
    // Annotation update
    const updatedAnnotation = prisma.annotations.update({
        where: { annotation_id: annotationEntryData.annotationId },
        data: {
            uid: annotationEntryData.uid,
            position: annotationEntryData.position,
            annotation_type: annotationEntryData.annotationType,
            title: annotationEntryData.title
        },
    })

    // Model annotation update
    const updatedModelAnnotation = prisma.model_annotation.update({
        where: { annotation_id: annotationEntryData.annotationId },
        data: {
            uid: annotationEntryData.modelAnnotationUid,
            annotation: annotationEntryData.annotation,
        }
    })

    await prisma.$transaction([updatedAnnotation, updatedModelAnnotation])
}

/**
 * 
 * @param annotationEntryData 
 * @param email 
 */
export const updatePhotoAnnotationEntry = async (annotationEntryData: annotationDataEntryObj, email: string) => {
    // Get annotator
    const annotator = await prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)

    // Update annotation
    const updatedAnnotation = prisma.annotations.update({
        where: { annotation_id: annotationEntryData.annotationId },
        data: {
            uid: annotationEntryData.uid,
            position: annotationEntryData.position,
            url: annotationEntryData.url,
            annotation_type: annotationEntryData.annotationType,
            title: annotationEntryData.title
        },
    })

    // Update photo annotation
    const updatedPhotoAnnotation = prisma.photo_annotation.update({
        where: { annotation_id: annotationEntryData.annotationId },
        data: {
            url: annotationEntryData.url,
            author: annotationEntryData.author,
            license: annotationEntryData.license,
            annotator: annotator,
            annotation: annotationEntryData.annotation,
            website: annotationEntryData.website,
            title: annotationEntryData.photoTitle,
        }
    })

    await prisma.$transaction([updatedAnnotation, updatedPhotoAnnotation])
}

/**
 * 
 * @param entryUpdateObj 
 * @returns 
 */
export const deletePreviousAnnotationPhoto = async (path: string) => {
    const pathToUnlink = getPathToUnlink(path)
    await unlink(pathToUnlink).catch(e => nonFatalError('annotator.ts', e.message, 'unlink'))
}

/**
 * 
 * @param entryUpdateObj 
 */
export const transitionToTextAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj) => {
    try {
        // Delete previous annotation based on previous media type
        if (!entryUpdateObj.previousMedia || !['photo', 'model', 'video'].includes(entryUpdateObj.previousMedia)) throw Error(`Invalid previous media type`)

        const deletion = entryUpdateObj.previousMedia === 'photo' ? prisma.photo_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
            entryUpdateObj.previousMedia === 'model' ? prisma.model_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
                prisma.video_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

        // Base annotation update
        const updatedBaseAnnotation = prisma.annotations.update({
            where: { annotation_id: entryUpdateObj.annotationId },
            data: {
                uid: entryUpdateObj.uid,
                position: entryUpdateObj.position,
                url: entryUpdateObj.url,
                annotation_type: entryUpdateObj.annotationType,
                title: entryUpdateObj.title
            },
        })
        // Video annotation creation
        const newTextAnnotation = prisma.text_annotation.create({
            data: {
                annotation_id: entryUpdateObj.annotationId,
                annotation: entryUpdateObj.annotation,
            }
        })
        // Await transaction
        await prisma.$transaction([deletion, updatedBaseAnnotation, newTextAnnotation])
        if (entryUpdateObj.oldUrl) await deletePreviousAnnotationPhoto(entryUpdateObj.oldUrl)
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'transitionToTextAnnotation()', "Error: Couldn't update annotation") }
}

/**
 * 
 * @param entryUpdateObj 
 */
export const transitionToVideoAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj) => {
    try {
        // Delete previous annotation based on previous media type
        if (!entryUpdateObj.previousMedia || !['photo', 'model', 'text'].includes(entryUpdateObj.previousMedia)) throw Error(`Invalid previous media type`)

        const deletion = entryUpdateObj.previousMedia === 'photo' ? prisma.photo_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
            entryUpdateObj.previousMedia === 'model' ? prisma.model_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
                prisma.text_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

        // Base annotation update
        const updatedBaseAnnotation = prisma.annotations.update({
            where: { annotation_id: entryUpdateObj.annotationId },
            data: {
                uid: entryUpdateObj.uid,
                position: entryUpdateObj.position,
                url: entryUpdateObj.url,
                annotation_type: entryUpdateObj.annotationType,
                title: entryUpdateObj.title
            },
        })
        // Video annotation creation
        const newVideoAnnotation = prisma.video_annotation.create({
            data: {
                url: entryUpdateObj.url as string,
                length: entryUpdateObj.length,
                annotation_id: entryUpdateObj.annotationId,
                annotation: entryUpdateObj.annotation,
            }
        })
        // Await transaction
        await prisma.$transaction([deletion as any, updatedBaseAnnotation, newVideoAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'transitionToVideoAnnotation()', "Error: Couldn't update annotation") }
}

/**
 * 
 * @param entryUpdateObj 
 * @param email 
 */
export const transitionToModelAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj, email: string) => {
    try {
        // Get modeler and annotator
        const annotator = prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)
        const modeler = prisma.model.findUnique({ where: { uid: entryUpdateObj.modelAnnotationUid } }).then(model => model?.modeled_by)
        const res = await Promise.all([annotator, modeler])

        // Delete previous annotation based on previous media type
        if (!entryUpdateObj.previousMedia || !['photo', 'video', 'text'].includes(entryUpdateObj.previousMedia)) throw Error(`Invalid previous media type`)

        const deletion = entryUpdateObj.previousMedia === 'photo' ? prisma.photo_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
            entryUpdateObj.previousMedia === 'video' ? prisma.video_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
                prisma.text_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

        // Base annotation update
        const updatedBaseAnnotation = prisma.annotations.update({
            where: { annotation_id: entryUpdateObj.annotationId },
            data: {
                uid: entryUpdateObj.uid,
                position: entryUpdateObj.position,
                annotation_type: entryUpdateObj.annotationType,
                title: entryUpdateObj.title
            },
        })

        // Create new model annotation
        const newModelAnnotation = prisma.model_annotation.create({
            data: {
                uid: entryUpdateObj.modelAnnotationUid as string,
                annotation: entryUpdateObj.annotation,
                annotation_id: entryUpdateObj.annotationId,
                annotator: res[0],
                modeler: res[1]
            }
        })
        // Await transaction
        await prisma.$transaction([deletion as any, updatedBaseAnnotation, newModelAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'transitionToModelAnnotation()', "Error: Couldn't update annotation") }
}

/**
 * 
 * @param entryUpdateObj 
 * @param email 
 */
export const transitionToPhotoAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj, email: string) => {
    try {
        // Delete previous annotation based on previous media type
        if (!entryUpdateObj.previousMedia || !['model', 'video', 'text'].includes(entryUpdateObj.previousMedia)) throw Error(`Invalid previous media type`)

        const deletion = entryUpdateObj.previousMedia === 'video' ? prisma.video_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
            entryUpdateObj.previousMedia === 'model' ? prisma.model_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
                prisma.text_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

        // Update base annotation
        const updatedAnnotation = prisma.annotations.update({
            where: { annotation_id: entryUpdateObj.annotationId },
            data: {
                uid: entryUpdateObj.uid,
                position: entryUpdateObj.position,
                url: entryUpdateObj.url,
                annotation_type: entryUpdateObj.annotationType,
                title: entryUpdateObj.title
            },
        })

        // Get annotator
        const annotator = await prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)

        // Create new photo annotation
        const newPhotoAnnotation = prisma.photo_annotation.create({
            data: {
                url: entryUpdateObj.url as string,
                author: entryUpdateObj.author ?? '',
                license: entryUpdateObj.license ?? '',
                annotator: annotator as string ?? '',
                annotation_id: entryUpdateObj.annotationId,
                annotation: entryUpdateObj.annotation,
                website: entryUpdateObj.website ? entryUpdateObj.website as string : '',
                title: entryUpdateObj.photoTitle ? entryUpdateObj.photoTitle as string : '',
            }
        })
        // Await transaction
        await prisma.$transaction([deletion as any, updatedAnnotation, newPhotoAnnotation])
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'transitionToPhotoAnnotation()', "Error: Couldn't update annotation") }
}

/**
 * 
 * @param annotationEntryData 
 * @returns 
 */
export async function createNewAnnotationEntry(annotationEntryData: annotationDataEntryObj) {
    try {
        // Get session (mainly just for name, quick auth check while we're here) and authorized users
        const session = await getServerSession(authOptions).catch((e) => serverActionErrorHandler(path, e.message, 'POST getServerSession', "Couldn't get session"))
        const authorizedUsers = await prisma.authorized.findMany()

        // Unauthorized error
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email)) { throw Error("Not authorized") }

        // First annotation handler
        if (annotationEntryData.index === '1') {
            // Update model record and return success
            await prisma.model.update({ where: { uid: annotationEntryData.uid }, data: { annotationPosition: annotationEntryData.position } }).catch((e) => serverActionErrorHandler(path, e.message, 'POST prisma.model.update()', "Couldn't insert first annotation position"))
            return 'Annotation Created'
        }

        // Data for new base annotations other than 1
        const newAnnotationData = {
            uid: annotationEntryData.uid,
            position: annotationEntryData.position,
            url: annotationEntryData.url ?? '',
            annotation_no: parseInt(annotationEntryData.annotationNo),
            annotation_id: annotationEntryData.annotationId,
            annotation_type: annotationEntryData.annotationType,
            title: annotationEntryData.title
        }

        // Conditional based on annotationType
        switch (annotationEntryData.annotationType) {
            case 'text':
                // Get and check relevant variable
                checkEssentialValues([annotationEntryData.annotation])

                // Create new text annotation and return success
                await createNewTextAnnotation(newAnnotationData, annotationEntryData.annotation)

                // Log and return
                serverLog(`User ${email} created new text annotation. It's annotation #${annotationEntryData.annotationNo} for model ${annotationEntryData.uid}`)
                return 'Text annotation created'

            case 'video':
                // Get and check relevant variable
                checkEssentialValues([annotationEntryData.length])

                // Create new video annotation and return success
                await createNewVideoAnnotation(newAnnotationData, annotationEntryData.length as string, annotationEntryData.annotation)

                // Log and return
                serverLog(`User ${email} created new video annotation. It's annotation #${annotationEntryData.annotationNo} for model ${annotationEntryData.uid}`)
                return 'Video annotation created'

            case 'model':
                // Get and check relevant variables
                checkEssentialValues([annotationEntryData.modelAnnotationUid])

                // Create new model annotation and return success
                await createNewModelAnnotation(newAnnotationData, email, annotationEntryData.modelAnnotationUid as string, annotationEntryData.annotation)

                // Log and return
                serverLog(`User ${email} created new model annotation. It's annotation #${annotationEntryData.annotationNo} for model ${annotationEntryData.uid}`)
                return 'Model annotation created'

            case 'photo':
                // Get and check relevant variables
                const file = annotationEntryData.file as File
                const dataDir = annotationEntryData.dir as string
                const dataPath = annotationEntryData.path as string
                const author = annotationEntryData.author as string
                const license = annotationEntryData.license as string
                checkEssentialValues([file, dataDir, dataPath, author, license])

                // Convert path to local if necessary
                const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                // Write photo to disk, create annotation and return success
                await autoWriteFile(file, dir, path)
                await createNewPhotoAnnotation(annotationEntryData, newAnnotationData, email)

                // Log and return
                serverLog(`User ${email} created new photo annotation. It's annotation #${annotationEntryData.annotationNo} for model ${annotationEntryData.uid}`)
                return 'Photo Annotation created'
        }
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param updateObject 
 * @returns 
 */
export const updateAnnotationEntry = async (updateObject: annotationDataEntryUpdateObj) => {
    try {
        // Get session and authorized users
        const session = await getServerSession(authOptions).catch(e => serverActionErrorHandler(path, e.message, 'PATCH getServerSession', "Couldn't get session"))
        const authorizedUsers = await prisma.authorized.findMany()

        // Unauthorized error
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email)) { throw Error("Not authorized") }

        // First annotation handler; always taxonomy and description
        if (updateObject.index === '1') {
            // Update position and return success
            await prisma.model.update({ where: { uid: updateObject.uid }, data: { annotationPosition: updateObject.position } }).catch((e) => serverActionErrorHandler(path, e.message, 'prisma.model.update()', "Couldn't insert first annotation position"))
            serverLog(`User ${email} updated first annotation position for model ${updateObject.uid}`)
            return 'Annotation Updated'
        }

        // Conditional based on annotationType for all other annotations
        switch (updateObject.annotationType) {
            case 'text':
                // Run update with transition if there is a media transition, then return success 
                if (updateObject.mediaTransition) {
                    await transitionToTextAnnotation(updateObject)
                    break
                }
                // Else run basic update and return
                await updateTextAnnotationEntry(updateObject)
                break

            case 'video':
                // Run update with transition if there is a media transition, then return success
                if (updateObject.mediaTransition) {
                    await transitionToVideoAnnotation(updateObject)
                    break
                }
                // Else run basic update and return
                await updateVideoAnnotationEntry(updateObject)
                break

            case 'model':
                // Run update with transition if there is a media transition, then return success
                if (updateObject.mediaTransition) {
                    // Media transition update and return
                    await transitionToModelAnnotation(updateObject, email)
                    break
                }
                // Else run basic update and return
                await updateModelAnnotationEntry(updateObject)
                break

            case 'photo':
                if (updateObject.file) {
                    // Get file and check relevant variables
                    const file = updateObject.file as File
                    const dataDir = updateObject.dir as string
                    const dataPath = updateObject.path as string

                    // Convert path to local if necessary
                    const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                    const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                    // Write photograph to disk
                    await autoWriteFile(file, dir, path)
                }

                // Eliminate previous photograph if the 'oldUrl' path is provided and there is a new photograph
                const pathToUnlink = getPathToUnlink(updateObject.oldUrl)
                if (pathToUnlink && updateObject.file) await unlink(pathToUnlink).catch((e) => nonFatalError(path, e.message, 'unlink'))

                // Run transition if necessary
                if (updateObject.mediaTransition) {
                    transitionToPhotoAnnotation(updateObject, email)
                    break
                }

                // Else update annotation and return
                updatePhotoAnnotationEntry(updateObject, email)
                break
        }

        // Log and return
        serverLog(`User ${email} updated annotation ${updateObject.annotationId} annotation. 
            It's previous type was ${updateObject.previousMedia} and it's new type is ${updateObject.annotationType}. It's annotation #${updateObject.annotationNo} for model ${updateObject.uid}`)
        return 'Annotation Updated'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @param annotationId 
 * @param modelUid 
 * @param oldUrl 
 * @returns 
 */
export const deleteAnnotationEntry = async (annotationId: string, modelUid: string, email: string, oldUrl?: string) => {
    try {
        // Eliminate previous photo uploaded to data storage container if it exists, delete annotation, return
        if (oldUrl) await unlink(`public${oldUrl}`).catch((e) => nonFatalError(path, e.message, 'unlink'))

        // Delete annotation
        await deleteAnnotation(annotationId, modelUid)

        // Log and return
        serverLog(`User ${email} deleted annotation ${annotationId} for model ${modelUid}`)
        return 'Annotation deleted'
    }
    catch (e: any) { return `Error: ${e.message}` }
}

/**
 * 
 * @returns 
 */
export const getAnnotationModels = async () => {
    const isUsedAnnotationModel = (annotations: model_annotation[], model: model) => annotations.some(annotation => annotation.uid === model.uid)

    const resolves = await Promise.all([prisma.model.findMany({ where: { base_model: false } }), prisma.model_annotation.findMany()])
    const annotationModels = resolves[0]
    const modelAnnotations = resolves[1]

    const availableAnnotationModels = annotationModels.filter(model => !isUsedAnnotationModel(modelAnnotations, model))
    return JSON.stringify(availableAnnotationModels)
}