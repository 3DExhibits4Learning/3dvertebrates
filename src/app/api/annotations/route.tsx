/**
 * @file src/app/api/annotations/route.tsx
 * 
 * @fileoverview route for annotation creation, update and delete operations; also gets first annotation position
 * 
 */

// Typical imports
import { getFirstAnnotationPostion, deleteAnnotation } from "@/functions/server/queries"
import { unlink } from "fs/promises"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAuthorizedUsers } from "@/functions/server/queries"
import { authorized } from "@prisma/client"
import { nonFatalError, routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"
import { createNewModelAnnotation, createNewPhotoAnnotation, createNewVideoAnnotation, transitionToModelAnnotation, transitionToPhotoAnnotation, transitionToVideoAnnotation, updateModelAnnotationEntry, updatePhotoAnnotationEntry, updateVideoAnnotationEntry } from "@/functions/server/admin/annotator"
import { autoWriteFile } from "@/functions/server/utils/file"
import { checkEssentialValues, convertCloudPathToLocalPath, isLocalDevEnv } from "@/functions/server/utils/utils"
import { getOldUrl } from "@/functions/server/utils/utils"

// PATH
const path = 'src/app/api/annotations/route.tsx'

// SINGLETON
import prisma from "@/functions/utils/prisma"

// DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

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
                checkEssentialValues([modelAnnotationUid])

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

                // // Write photo to disk, create annotation and return success
                await autoWriteFile(file, dir, path)
                //await createNewPhotoAnnotation(newAnnotationData, author, license, email, annotation, website as string, title as string)

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
    try {
        // Get session and authorized users
        const session = await getServerSession(authOptions).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH getServerSession', "Couldn't get session"))
        const authorizedUsers = await getAuthorizedUsers().catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH getAuthorizedUsers', "Couldn't get authorized users")) as authorized[]

        // Authorized user redirect
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email)) return <h1>NOT AUTHORIZED</h1>

        // Get formData
        const data = await request.formData().catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH request.formData()', "Couldn't get FormData")) as FormData

        // First annotation handler; always taxonomy and description, insert position with typical try-catch return
        if (data.get('index') === '1') {
            // Get and check relevant variables
            const uid = data.get('uid') as string
            const position = data.get('position') as string
            checkEssentialValues([uid, position])

            // Update position and return success
            await prisma.model.update({ where: { uid: uid }, data: { annotationPosition: position } }).catch((e) => routeHandlerErrorHandler(route, e.message, 'PATCH insertFirstAnnotationPosition()', "Couldn't insert first annotation position"))
            return new Response('Annotation Updated')
        }

        const previousMedia = data.get('previousMedia') as string
        const oldUrl = getOldUrl(data.get('oldUrl'))
        const annotation_id = data.get('annotation_id') as string
        const uid = data.get('uid') as string
        const position = data.get('position') as string
        const url = data.get('url') as string
        const type = data.get('annotation_type') as string
        const title = data.get('title') as string
        const length = data.get('length') as string
        const annotation = data.get('annotation') as string
        const modelAnnotationUid = data.get('modelAnnotationUid') as string

        // Conditional based on annotationType for all other annotations
        switch (data.get('annotation_type')) {
            case 'video':
                // Run update with transition if there is a media transition, then return success
                if (data.get('mediaTransition')) {
                    //await transitionToVideoAnnotation(previousMedia, oldUrl as string, annotation_id, uid, position, url, type, title, length, annotation)
                    return new Response('Annotation updated')
                }
                // Else run basic update and return
                //await updateVideoAnnotationEntry(annotation_id, uid, position, url, type, title, length, annotation)
                return new Response('Annotation updated')

            case 'model':
                // Run update with transition if there is a media transition, then return success
                if (data.get('mediaTransition')) {
                    // Media transition update and return
                    //transitionToModelAnnotation(previousMedia, oldUrl, annotation_id, uid, position, type, title, modelAnnotationUid, annotation, email)
                    return new Response('Annotation updated')
                }
                // Else run basic update and return
                //await updateModelAnnotationEntry(annotation_id, uid, position, type, title, modelAnnotationUid, annotation)
                return new Response('Annotation updated')

            default: // Default case (annotationType === 'photo')
                if (data.get('file')) {
                    // Get file and check relevant variables
                    const file = data.get('file') as File
                    const dataDir = data.get('dir') as string
                    const dataPath = data.get('path') as string

                    // Convert path to local for local development
                    const dir = isLocalDevEnv() ? convertCloudPathToLocalPath(dataDir) : dataDir
                    const path = isLocalDevEnv() ? convertCloudPathToLocalPath(dataPath) : dataPath

                    // Write photo
                    await autoWriteFile(file, dir, path)
                }

                // Get optional fields author and license
                const author = data.get('author') as string
                const license = data.get('license') as string

                // Eliminate previous photo uploaded to data storage container if it exists
                if (data.get('oldUrl') && data.get('file')) await unlink(oldUrl).catch((e) => nonFatalError(route, e.message, 'unlink'))

                // Remaining optional fields
                const website = data.get('website') ? data.get('website') as string : ''
                const photoTitle = data.get('photoTitle') ? data.get('title') as string : ''

                // If there is a change in media for the update, delete previous child of the annotations table, update, then return
                if (data.get('mediaTransition')) {
                    // Run update with transition if there is a media transition, then return success 
                    //transitionToPhotoAnnotation(previousMedia, url, annotation_id, uid, position, type, title, author, annotation, email, photoTitle, author, license)
                    return new Response('Annotation updated')
                }

                // Else update annotation and return
                //updatePhotoAnnotationEntry(url, annotation_id, uid, position, type, title, author, annotation, email, photoTitle, license, website)
                return new Response('Annotation updated')
        }
    }
    catch (e: any) { }
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
