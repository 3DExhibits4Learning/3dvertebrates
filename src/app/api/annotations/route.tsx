/**
 * @file src/app/api/annotations/route.tsx
 * 
 * @fileoverview route for annotation creation, update and delete operations; also gets first annotation position
 * 
 */

// Typical imports
import { insertFirstAnnotationPosition, getFirstAnnotationPostion, deleteAnnotation } from "@/functions/server/queries"
import { mkdir, writeFile, unlink } from "fs/promises"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAuthorizedUsers } from "@/functions/server/queries"
import { authorized } from "@prisma/client"
import { nonFatalError, routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"
import { createNewModelAnnotation, createNewPhotoAnnotation, createNewVideoAnnotation } from "@/functions/server/admin/annotator"
import { autoWriteFile } from "@/functions/server/utils/file"

// PATH
const path = 'src/app/api/annotations/route.tsx'

// SINGLETON
import prisma from "@/functions/utils/prisma"

// DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"
import { checkEssentialValues, convertCloudPathToLocalPath, isLocalDevEnv } from "@/functions/server/utils/utils"

// Global-scope route for console error reference
const route = 'src/app/api/annotations/route.tsx'

/**
 * @function GET
 * @param request http request
 * @description gets first annotation position
 * @returns typical response; includes first annotation postion
 */
export async function GET(request: Request) {

    // Grab searchParams
    const { searchParams } = new URL(request.url)

    // Return first annotation position if it exists
    try {

        // Get first annotation position
        const firstAnnotationPosition = await getFirstAnnotationPostion(searchParams.get('uid') as string)
            .catch((e) => routeHandlerErrorHandler(route, e.message, 'GET insertFirstAnnotationPosition()', "Couldn't get first annotation position"))

        // Typical response
        return routeHandlerTypicalResponse('Annotation Position retrieved', firstAnnotationPosition)
    }

    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}

/**
 * @function POST
 * @param request http request
 * @description creates new annotation
 * @returns typical response
 */
export async function POST(request: Request) {

    try {
        // Get session (mainly just for name, quick auth check while we're here) and authorized users
        const session = await getServerSession(authOptions).catch((e) => routeHandlerErrorHandler(route, e.message, 'POST getServerSession', "Couldn't get session"))
        const authorizedUsers = await getAuthorizedUsers().catch((e) => routeHandlerErrorHandler(route, e.message, 'POST getAuthorizedUsers', "Couldn't get authorized users")) as authorized[]

        // Unauthorized user redirect
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email)) return <h1>NOT AUTHORIZED</h1>

        // Get formData
        const data = await request.formData()

        // First annotation handler
        if (data.get('index') === '1') {
            // Get and check relevant variables
            const uid = data.get('uid') as string
            const position = data.get('position') as string

            // Update model record and return success
            await prisma.model.update({ where: { uid: uid }, data: { annotationPosition: position } }).catch((e) => routeHandlerErrorHandler(route, e.message, 'POST prisma.model.update()', "Couldn't insert first annotation position"))
            return new Response('Annotation Created')
        }

        // Declaring annotation for switch below
        const annotation = data.get('annotation') as string

        // Data for new base annotations other than 1
        const newAnnotationData = {
            uid: data.get('uid') as string,
            position: data.get('position') as string,
            url: data.get('url') as string,
            annotation_no: parseInt(data.get('annotation_no') as string),
            annotation_id: data.get('annotation_id') as string,
            annotation_type: data.get('annotation_type') as string,
            title: data.get('title') as string
        }

        // Conditional based on annotationType
        switch (data.get('annotation_type')) {

            case 'video':
                // Get and check relevant variable
                const length = data.get('length') as string
                checkEssentialValues([length])

                // Create new video annotation and return success
                await createNewVideoAnnotation(newAnnotationData, length, annotation)
                return new Response('Video annotation created')

            case 'model':
                // Get and check relevant variables
                const modelAnnotationUid = data.get('modelAnnotationUid') as string

                // Create new model annotation and return success
                await createNewModelAnnotation(newAnnotationData, email, modelAnnotationUid, annotation)
                return new Response('Model nnotation created')

            default: // Default case (annotationType === 'photo')
                // Get and check relevant variables
                const file = data.get('file') as File
                const dataDir = data.get('dir') as string
                const dataPath = data.get('path') as string
                const author = data.get('author') as string
                const license = data.get('license') as string
                checkEssentialValues([file, dataDir, dataPath, author, license])

                // Convert path to local for local development
                const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                // Optional photo_annotation data initializtion
                const website = data.get('website') ? data.get('website') : ''
                const title = data.get('photoTitle') ? data.get('title') : ''

                // Write photo to disk, create annotation and return success
                await autoWriteFile(file, dir, path)
                await createNewPhotoAnnotation(newAnnotationData, author, license, email, annotation, website as string, title as string)

                // Typical response
                return new Response('Photo Annotation created')
        }
    }
    catch (e: any) { return new Response(`Error: ${e.message}`) }
}

/**
 * @function PATCH
 * @param request http request
 * @description updates a 3d model annotation
 * @returns typical response
 */
export async function PATCH(request: Request) {

    // Get session (mainly just for name, quick auth check while we're here)
    const session = await getServerSession(authOptions).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH getServerSession', "Couldn't get session"))

    // Get authorized users
    const authorizedUsers = await getAuthorizedUsers().catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH getAuthorizedUsers', "Couldn't get authorized users")) as authorized[]

    // Authorized user redirect
    const email = session?.user?.email as string
    if (!authorizedUsers.find(user => user.email === email)) return <h1>NOT AUTHORIZED</h1>

    // Get function-scope formData
    const data = await request.formData()
        .catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH request.formData()', "Couldn't get FormData")) as FormData

    // First annotation handler; always taxonomy and description, insert position with typical try-catch return
    if (data.get('index') === '1') {

        try {

            // Update first annotation position
            const update = await insertFirstAnnotationPosition(data.get('uid') as string, data.get('position') as string).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH insertFirstAnnotationPosition()', "Couldn't insert first annotation position"))

            // Typical response
            return new Response('Annotation Updated')
        }

        // Typical catch
        catch (e: any) { return new Response(`Error: ${e.message}`) }
    }

    // Else the annotation must be photo or video (or 3D model coming soon)
    else {

        // Conditional based on annotationType
        switch (data.get('annotation_type')) {

            // annotationType = 'video' handler
            case 'video':

                try {

                    // If there is a change in media for the update, delete previous child of the annotations table, update, then return
                    if (data.get('mediaTransition')) {

                        let deletion

                        // Delete photo annotation (if it was a photo annotation)
                        if (data.get('previousMedia') === 'photo') {

                            // Eliminate previous annotation photo
                            await unlink(`public${data.get('oldUrl')}`).catch((e) => nonFatalError(route, e.message, 'unlink'))
                            // Delete photo annotation record
                            deletion = prisma.photo_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })
                        }

                        // Else delete the model annotation
                        else deletion = prisma.model_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })

                        // Base annotation update
                        const updatedBaseAnnotation0 = prisma.annotations.update({
                            where: { annotation_id: data.get('annotation_id') as string },
                            data: {
                                uid: data.get('uid') as string,
                                position: data.get('position') as string,
                                url: data.get('url') as string,
                                annotation_type: data.get('annotation_type') as string,
                                title: data.get('title') as string
                            },
                        })

                        // Video annotation creation
                        const newVideoAnnotation = prisma.video_annotation.create({
                            data: {
                                url: data.get('url') as string,
                                length: data.get('length') as string,
                                annotation_id: data.get('annotation_id') as string,
                                annotation: data.get('annotation') as string,
                            }
                        })

                        // Await transaction
                        const updatedVideoAnnotation = await prisma.$transaction([deletion as any, updatedBaseAnnotation0, newVideoAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, 'prisma.$transaction([updatedBaseAnnotation0, newVideoAnnotation])', "Couldn't update annotation"))

                        // Successful response returns message as the data value and response objects from prisma as the response values
                        return new Response('Annotation updated')
                    }

                    // Annotation update
                    const updatedAnnotation = prisma.annotations.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: {
                            uid: data.get('uid') as string,
                            position: data.get('position') as string,
                            url: data.get('url') as string,
                            annotation_type: data.get('annotation_type') as string,
                            title: data.get('title') as string
                        },
                    })

                    // Video annotation update
                    const updatedVideoAnnotation = prisma.video_annotation.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: { url: data.get('url') as string, length: data.get('length') as string, annotation: data.get('annotation') as string }
                    })

                    await prisma.$transaction([updatedAnnotation, updatedVideoAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, "prisma.transaction([updatedAnnotation, updatedVideoAnnotation])", "Couldn't update annotation"))

                    // Typical response
                    return new Response('Annotation updated')
                }
                // Typical catch
                catch (e: any) { return new Response(`Error: ${e.message}`) }

            // annotationType = 'model' handler
            case 'model':

                try {

                    // If there is a change in media for the update, delete previous child of the annotations table, update, then return
                    if (data.get('mediaTransition')) {

                        let deletion

                        // Delete the photo annotation (if the previous media was a photo)
                        if (data.get('previousMedia') === 'photo') {

                            // Eliminate previous annotation photo
                            await unlink(`public${data.get('oldUrl')}`).catch((e) => nonFatalError(route, e.message, 'unlink'))
                            // Delete photo annotation record
                            deletion = prisma.photo_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })
                        }

                        // Or else delete the video annotation
                        else deletion = prisma.video_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })

                        // Base annotation update
                        const updatedBaseAnnotation = prisma.annotations.update({
                            where: { annotation_id: data.get('annotation_id') as string },
                            data: {
                                uid: data.get('uid') as string,
                                position: data.get('position') as string,
                                annotation_type: data.get('annotation_type') as string,
                                title: data.get('title') as string
                            },
                        })

                        // Create new model annotation
                        const newModelAnnotation = prisma.model_annotation.create({
                            data: {
                                uid: data.get('modelAnnotationUid') as string,
                                annotation: data.get('annotation') as string,
                                annotation_id: data.get('annotation_id') as string,
                                annotator: session.user.name ?? 'Student',
                                modeler: session.user.name ?? 'Student'
                            }
                        }).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH newModelAnnotation()', "Couldn't create new model annotation"))

                        // Await transaction
                        const updatedModelAnnotationTransaction = await prisma.$transaction([deletion as any, updatedBaseAnnotation, newModelAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, "prisma.transaction([updating model annotation])", "Couldn't update model annotation"))

                        // Typical response
                        return new Response('Annotation updated')
                    }

                    // Annotation update
                    const updatedAnnotation = prisma.annotations.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: {
                            uid: data.get('uid') as string,
                            position: data.get('position') as string,
                            annotation_type: data.get('annotation_type') as string,
                            title: data.get('title') as string
                        },
                    })

                    // Model annotation update
                    const updatedModelAnnotation = prisma.model_annotation.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: {
                            uid: data.get('modelAnnotationUid') as string,
                            annotation: data.get('annotation') as string,
                        }
                    })

                    const updatedModelAnnotationTransaction = await prisma.$transaction([updatedAnnotation, updatedModelAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, "prisma.transaction([updating model annotation])", "Couldn't update model annotation"))

                    // Typical response
                    return routeHandlerTypicalResponse('Annotation updated', updatedModelAnnotationTransaction)
                }
                // Typical catch
                catch (e: any) { return new Response(`Error: ${e.message}`) }

            // Default case (annotationType == 'photo')
            default:

                try {

                    // Optional photo_annotation data initializtion
                    if (data.get('file')) {

                        // Get file
                        const file = data.get('file') as File

                        // Convert file => arrayBuffer => buffer
                        const bytes = await file.arrayBuffer().catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH file.arrayBuffer()', "Couldn't get array buffer")) as ArrayBuffer
                        const photoBuffer = Buffer.from(bytes)

                        // Make directory
                        await mkdir(data.get('dir') as string, { recursive: true }).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH mkdir()', "Couldn't make directory"))

                        //@ts-ignore - ts incorreclty thinks buffers can't be written with writeFile() (needs update)
                        await writeFile(data.get('path') as string, photoBuffer).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH writeFile()', "Couldn't write file"))
                    }

                    // Eliminate previous photo uploaded to data storage container if it exists
                    if (data.get('oldUrl') && data.get('file')) await unlink(`public${data.get('oldUrl')}`).catch((e) => nonFatalError(route, e.message, 'unlink'))

                    // Remaining optional fields
                    const website = data.get('website') ? data.get('website') : undefined
                    const title = data.get('photoTitle') ? data.get('title') : undefined

                    // If there is a change in media for the update, delete previous child of the annotations table, update, then return
                    if (data.get('mediaTransition')) {

                        let deletion

                        // Delete video annotation (if it was a video)
                        if (data.get('previousMedia') === 'video') deletion = prisma.video_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })

                        // Or else delete the model annotation
                        else deletion = prisma.model_annotation.delete({ where: { annotation_id: data.get('annotation_id') as string } })

                        // Update annotation
                        const updatedAnnotation = prisma.annotations.update({
                            where: { annotation_id: data.get('annotation_id') as string },
                            data: {
                                uid: data.get('uid') as string,
                                position: data.get('position') as string,
                                url: data.get('url') as string,
                                annotation_type: data.get('annotation_type') as string,
                                title: data.get('title') as string
                            },
                        }).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH updatedAnnotation()', "Couldn't update annotation"))

                        // Create new photo annotation
                        const newPhotoAnnotation = prisma.photo_annotation.create({
                            data: {
                                url: data.get('url') as string,
                                author: data.get('author') as string,
                                license: data.get('license') as string,
                                annotator: session.user.name ? session.user.name : 'student',
                                annotation_id: data.get('annotation_id') as string,
                                annotation: data.get('annotation') as string,
                                website: website ? website as string : '',
                                title: title ? title as string : '',
                            }
                        }).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH createPhotoAnnotation()', "Couldn't create photo annotation"))

                        await prisma.$transaction([deletion as any, updatedAnnotation, newPhotoAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, "prisma.transaction([updating model annotation])", "Couldn't update model annotation"))

                        // Typical response
                        return new Response('Annotation updated')
                    }

                    // Update annotation
                    const updatedAnnotation = prisma.annotations.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: {
                            uid: data.get('uid') as string,
                            position: data.get('position') as string,
                            url: data.get('url') as string,
                            annotation_type: data.get('annotation_type') as string,
                            title: data.get('title') as string
                        },
                    })

                    // Update photo annotation
                    const updatedPhotoAnnotation = prisma.photo_annotation.update({
                        where: { annotation_id: data.get('annotation_id') as string },
                        data: {
                            url: data.get('url') as string,
                            author: data.get('author') as string,
                            license: data.get('license') as string,
                            annotator: session.user.name ? session.user.name : 'student',
                            annotation: data.get('annotation') as string,
                            website: website ? website as string : '',
                            title: title ? title as string : '',
                        }
                    })

                    const updatedPhotoAnnotationTransaction = await prisma.$transaction([updatedAnnotation, updatedPhotoAnnotation]).catch(e => routeHandlerErrorHandler(path, e.message, "prisma.transaction([updating photo annotation])", "Couldn't update photo annotation"))

                    // Typical response
                    return new Response('Annotation updated')
                }

                // Typical catch
                catch (e: any) { return new Response(e.message) }
        }
    }
}

/**
 * @function DELETE
 * @param request http request
 * @description deletes a 3d model annotation
 * @returns typical response
 */
export async function DELETE(request: Request) {

    try {

        // Get request data
        const data = await request.json().catch((e) => routeHandlerErrorHandler(route, e.message, 'DELETE request.json()', "Couln't get request body json"))
        if (!(data.annotation_id && data.modelUid)) throw Error('Missing annotation_id or modelUid in request body')

        // Eliminate previous photo uploaded to data storage container if it exists
        if (data.oldUrl) await unlink(`public${data.oldUrl}`).catch((e) => nonFatalError(route, e.message, 'unlink'))

        // Delete the annotation, typical return 
        await deleteAnnotation(data.annotation_id, data.modelUid).catch((e) => routeHandlerErrorHandler(route, e.message, 'deleteAnnotation()', "Couldn't delete annotation"))

        // Typical response
        return new Response('Annotation deleted')
    }
    // Catch returns 400 status with 3rd party error message as response value; data and statusText are generic error messages
    catch (e: any) { return new Response(`Error: ${e.message}`) }
}
