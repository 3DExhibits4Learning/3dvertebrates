/**
 * @file src/functions/server/admin/annotator.ts
 * 
 * @fileoverview annotator server actions
 */

'use server'

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { nonFatalError, routeHandlerTypicalCatch, serverActionErrorHandler, serverErrorHandler } from "../error"
import { annotationDataEntryObj, annotationDataEntryUpdateObj, AnnotationNumbers, newAnnotationData } from "@/ts/ts"
import { v4 as uuidv4 } from 'uuid'
import { fullAnnotation } from "@/interface/interface"
import { model, model_annotation, photo_annotation, video_annotation } from "@prisma/client"

// SINGLETON
import prisma from "@/functions/utils/prisma"
import { unlink } from "fs/promises"
import { checkEssentialValues, convertCloudPathToLocalPath, convertDbPathToLocalPath, isLocalDevEnv } from "@/functions/server/utils/utils"
import { autoWriteFile } from "@/functions/server/utils/file"

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
 * @param previousMedia 
 * @param oldUrl 
 * @param annotationId 
 * @param uid 
 * @param position 
 * @param url 
 * @param type 
 * @param title 
 * @param length 
 * @param annotation 
 */
export const transitionToVideoAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj) => {
    try {
        // Variable for transaction deletion query
        let deletion

        // Delete photo annotation (if it was a photo annotation)
        if (entryUpdateObj.previousMedia === 'photo') {
            // Eliminate previous annotation photo and store query in deletion
            await unlink(entryUpdateObj.oldUrl as string).catch(e => nonFatalError('annotator.ts', e.message, 'unlink'))
            deletion = prisma.photo_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })
        }
        // Else delete the model annotation
        else deletion = prisma.model_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

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
    catch (e: any) { serverActionErrorHandler(path, e.message, 'updateToVideoAnnotationWithMediaTransition()', "Error: Couldn't update annotation") }
}

/**
 * 
 * @param previousMedia 
 * @param oldUrl 
 * @param annotationId 
 * @param uid 
 * @param position 
 * @param type 
 * @param title 
 * @param modelAnnotationUid 
 * @param annotation 
 * @param email 
 */
export const transitionToModelAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj, email: string) => {
    // Get modeler and annotator
    const annotator = prisma.authorized.findUnique({ where: { email: email } }).then(user => user?.email)
    const modeler = prisma.model.findUnique({ where: { uid: entryUpdateObj.modelAnnotationUid } }).then(model => model?.modeled_by)
    const res = await Promise.all([annotator, modeler])

    // Variable to story deletion query
    let deletion

    // Delete the photo annotation (if the previous media was a photo)
    if (entryUpdateObj.previousMedia === 'photo') {
        // Eliminate previous annotation photo and create deletion query
        await unlink(entryUpdateObj.oldUrl as string).catch((e) => nonFatalError('annotator.ts', e.message, 'unlink'))
        deletion = prisma.photo_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })
    }

    // Or else delete the video annotation
    else deletion = prisma.video_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

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


/**
 * 
 * @param previousMedia 
 * @param url 
 * @param annotationId 
 * @param uid 
 * @param position 
 * @param type 
 * @param title 
 * @param author 
 * @param annotation 
 * @param email 
 * @param photoTitle 
 * @param license 
 * @param website 
 */
export const transitionToPhotoAnnotation = async (entryUpdateObj: annotationDataEntryUpdateObj, email: string) => {
    // Delete previous annotation based on annotation type
    const deletion = entryUpdateObj.previousMedia === 'video' ? prisma.video_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } }) :
        prisma.model_annotation.delete({ where: { annotation_id: entryUpdateObj.annotationId } })

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

    await prisma.$transaction([deletion as any, updatedAnnotation, newPhotoAnnotation])
}

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
            return new Response('Annotation Created')
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

            case 'video':
                // Get and check relevant variable
                checkEssentialValues([annotationEntryData.length])

                // Create new video annotation and return success
                await createNewVideoAnnotation(newAnnotationData, annotationEntryData.length as string, annotationEntryData.annotation)
                return new Response('Video annotation created')

            case 'model':
                // Get and check relevant variables
                checkEssentialValues([annotationEntryData.modelAnnotationUid])

                // Create new model annotation and return success
                await createNewModelAnnotation(newAnnotationData, email, annotationEntryData.modelAnnotationUid as string, annotationEntryData.annotation)
                return new Response('Model nnotation created')

            default: // Default case (annotationType === 'photo')
                // Get and check relevant variables
                const file = annotationEntryData.file as File
                const dataDir = annotationEntryData.dir as string
                const dataPath = annotationEntryData.path as string
                const author = annotationEntryData.author as string
                const license = annotationEntryData.license as string
                checkEssentialValues([file, dataDir, dataPath, author, license])

                // Convert path to local for local development
                const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                // Write photo to disk, create annotation and return success
                await autoWriteFile(file, dir, path)
                await createNewPhotoAnnotation(annotationEntryData, newAnnotationData, email)

                // Typical response
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

        // First annotation handler; always taxonomy and description, insert position with typical try-catch return
        if (updateObject.index === '1') {
            // Update position and return success
            await prisma.model.update({ where: { uid: updateObject.uid }, data: { annotationPosition: updateObject.position } }).catch((e) => serverActionErrorHandler(path, e.message, 'prisma.model.update()', "Couldn't insert first annotation position"))
            return 'Annotation Updated'
        }

        // Conditional based on annotationType for all other annotations
        switch (updateObject.annotationType) {
            case 'video':
                // Run update with transition if there is a media transition, then return success
                if (updateObject.mediaTransition) {
                    await transitionToVideoAnnotation(updateObject)
                    return 'Annotation updated'
                }
                // Else run basic update and return
                await updateVideoAnnotationEntry(updateObject)
                return 'Annotation updated'

            case 'model':
                // Run update with transition if there is a media transition, then return success
                if (updateObject.mediaTransition) {
                    // Media transition update and return
                    transitionToModelAnnotation(updateObject, email)
                    return new Response('Annotation updated')
                }
                // Else run basic update and return
                await updateModelAnnotationEntry(updateObject)
                return new Response('Annotation updated')

            default: // Default case (annotationType === 'photo')
                if (updateObject.file) {
                    // Get file and check relevant variables
                    const file = updateObject.file as File
                    const dataDir = updateObject.dir as string
                    const dataPath = updateObject.path as string

                    // Convert path to local for local development
                    const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                    const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                    // Write photograph to disk
                    await autoWriteFile(file, dir, path)
                }

                // Eliminate previous photo uploaded to data storage container if it exists
                if (updateObject.oldUrl && updateObject.file) await unlink(updateObject.oldUrl).catch((e) => nonFatalError(path, e.message, 'unlink'))

                // If there is a change in media for the update, delete previous child of the annotations table, update, then return
                if (updateObject.mediaTransition) {
                    // Run update with transition if there is a media transition, then return success 
                    transitionToPhotoAnnotation(updateObject, email)
                    return new Response('Annotation updated')
                }
                // Else update annotation and return
                updatePhotoAnnotationEntry(updateObject, email)
                return new Response('Annotation updated')
        }
    }
    catch (e: any) { }
}