/**
 * @file src/app/api/thumbnail/update/route.tsx
 * 
 * @fileoverview route handler to update model thumbnails
 * 
 * @todo make patch method along with post method from /api/thumbmail/add
 */


// Typical imports
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { routeHandlerError, routeHandlerErrorHandler, routeHandlerTypicalCatch } from '@/functions/server/error'

// Default imports
import routeHandlerTypicalResponse from '@/functions/server/typicalSuccessResponse'

// SINGLETON
import prisma from '@/functions/utils/prisma'

// PATH
const path = 'src/app/api/thumbnail/update/route.tsx'

// Main JSX
export async function POST(request: Request) {

    try {

        // Get form data and variables
        const formData = await request.formData().catch(e => routeHandlerErrorHandler(e.message, path, 'request.formData()', "Couldn't get form data")) as FormData
        const file = formData.get('file') as File
        const uid = formData.get('uid') as string

        // Return if any data is missing
        if (!file || !uid) throw Error('File or UID is missing')

        // Get old thumbnail path
        const oldThumbnailObject = await prisma.model.findUnique({ where: { uid: uid }, select: { thumbnail: true } }).catch(e => routeHandlerErrorHandler(e.message, path, 'request.formData()', "Couldn't get form data"))

        // Convert photo to buffer and write to data storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        var path = `public/data/Vertebrates/Thumbnails/${uid}`

        // Since this is an update, this path should already exist; this is a low-cost redundency check
        await mkdir(path, { recursive: true }).catch(e => routeHandlerErrorHandler(e.message, path, 'mkdir()', "Couldn't make directory"))

        // Write file to path
        path = join(path, file.name)

        //@ts-ignore - typescript thinks writeFile doesn't take a buffer
        await writeFile(path, buffer).catch(e => routeHandlerErrorHandler(e.message, path, 'writeFile()', "Couldn't write file"))

        // Update the thumbnail column for the model in the database
        const update = await prisma.model.update({ where: { uid: uid }, data: { thumbnail: path.slice(7) } }).catch(e => routeHandlerErrorHandler(e.message, path, 'prisma.model.update()', "Couldn't update thumbnail in database"))

        // Delete old thumbnail
        await unlink('public/' + oldThumbnailObject?.thumbnail).catch(e => console.log(routeHandlerError(path, e.message, 'unlink', 'POST', true)))

        //Return Successful
        return routeHandlerTypicalResponse('Thumbnail Updated', update)
    }
    catch (e: any) {routeHandlerTypicalCatch(e.message)}
}