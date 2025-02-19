/**
 * @file src/app/api/thumbnail/add/route.tsx
 * 
 * @fileoverview handler for adding model thumbnails
 * 
 * @todo move to /api/thumbnail/route with /api/thumbnail/update/route as patch
 */

// Typical imports
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from '@/functions/server/error'

// Default imports
import routeHandlerTypicalResponse from '@/functions/server/typicalSuccessResponse'

// SINGLETON
import prisma from '@/functions/utils/prisma'

// PATH
const path = 'src/app/api/thumbnail/add/route.tsx'

/**
 * 
 * @param request HTTP
 * @returns typical response with message and update object (or typical catch onCatch)
 */
export async function POST(request: Request) {

    try {

        // Get form data and variables
        const formData = await request.formData().catch(e => routeHandlerErrorHandler(e.message, path, 'request.formData()', "Couldn't get form data")) as FormData

        // Variable declarations
        const file = formData.get('file') as File
        const uid = formData.get('uid') as string
        var path = `public/data/Vertebrates/Thumbnails/${uid}`

        // Return if any data is missing
        if (!file || !uid) throw Error('File or UID is missing')

        // file => arrayBuffer => Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        var filePath = process.env.LOCAL_ENV === 'development' ? `X:/Vertebrates/Thumbnails/${uid}` : `public/data/Vertebrates/Thumbnails/${uid}`

        // Make directory, update path
        await mkdir(filePath, { recursive: true }).catch(e => routeHandlerErrorHandler(e.message, filePath, 'mkdir()', "Couldn't make directory"))
        filePath = join(filePath, file.name)

        // @ts-ignore - typescript thinks writeFile doesn't take a buffer
        await writeFile(path, buffer).catch(e => routeHandlerErrorHandler(e.message, path, 'writeFile()', "Couldn't write file"))
        
        // Update the thumbnail column for the model in the database (remove 'public' and follwing slash, then escape remaining forward slashes in path before DB entry)
        const update = await prisma.model.update({ where: { uid: uid }, data: { thumbnail: filePath.slice(7).replace('/', '\/') } }).catch(e => routeHandlerErrorHandler(e.message, path, 'prisma.model.update()', "Couldn't update thumbnail in database"))

        //Return Successful
        return routeHandlerTypicalResponse('Thumbnail Added', update)
    }
    // Typical catch
    catch (e: any) {return routeHandlerTypicalCatch(e.message)}
}