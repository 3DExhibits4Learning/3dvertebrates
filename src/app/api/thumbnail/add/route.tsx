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
import { getServerSession } from 'next-auth'

// Default imports
import routeHandlerTypicalResponse from '@/functions/server/typicalSuccessResponse'
import prisma from '@/functions/utils/prisma'
import { serverLog } from '@/functions/server/utils/utils'

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

        // Get session and email
        const session = await getServerSession()
        if (!session) throw Error('No session found')
        const email = session.user?.email

        // Variable declarations
        const file = formData.get('file') as File
        const uid = formData.get('uid') as string

        // Return if any data is missing
        if (!file || !uid) throw Error('File or UID is missing')

        // file => arrayBuffer => Buffer
        const bytes = await file.arrayBuffer().catch(e => routeHandlerErrorHandler(e.message, path, 'file.arrayBuffer()', "Couldn't get array buffer")) as ArrayBuffer
        const buffer = Buffer.from(bytes)
        const dir = process.env.LOCAL_ENV === 'development' ? `X:/Vertebrates/Thumbnails/${uid}` : `public/data/Vertebrates/Thumbnails/${uid}`

        // Make directory, update path
        await mkdir(dir, { recursive: true }).catch(e => routeHandlerErrorHandler(e.message, path, 'mkdir()', "Couldn't make directory"))
        const filePath = join(dir, file.name)

        // @ts-ignore - typescript thinks writeFile doesn't take a buffer
        await writeFile(filePath, buffer).catch(e => routeHandlerErrorHandler(e.message, path, 'writeFile()', "Couldn't write file"))
        
        // Update the thumbnail column for the model in the database (remove 'public' and follwing slash, then escape remaining forward slashes in path before DB entry)
        const dbUrl = `data/Vertebrates/Thumbnails/${uid}/${file.name}`
        const update = await prisma.model.update({ where: { uid: uid }, data: { thumbnail: dbUrl.replaceAll('/', '\\') } }).catch(e => routeHandlerErrorHandler(e.message, path, 'prisma.model.update()', "Couldn't update thumbnail in database"))

        // Log and return
        serverLog(`User ${email} added thumbnail for model ${uid} in the database. Path: ${dbUrl}`)
        return routeHandlerTypicalResponse('Thumbnail Added', update)
    }
    // Typical catch
    catch (e: any) {return routeHandlerTypicalCatch(e.message)}
}