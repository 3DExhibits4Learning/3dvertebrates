/**
 * @file src/app/api/admin/models/delete/route.tsx
 * @fileoverview the route handler for deletion of 3D models (and any associated annotations)
 * 
 * @todo delete 3d model from sketchfab
 */

// Typical imports
import { nonFatalError, routeHandlerError, routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// SINGLETON
import prisma from "@/functions/utils/prisma"
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// ROUTE
const route = 'src/app/api/admin/models/delete/route.tsx'

/**
 * 
 * @param request 
 * @returns typical response with message and db object (or error message onCatch)
 */
export async function DELETE(request: Request) {

    try {

        // Get params, instatiate uid
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid') as string

        // Sketchfab request header
        const requestHeader: HeadersInit = new Headers()
        requestHeader.set('Authorization', process.env.SKETCHFAB_API_TOKEN as string)

        // Transactions array
        const transactions = []

        // Get annotations (for annotation id's) and push deletions onto transactions array
        const annotations = await prisma.annotations.findMany({ where: { uid: uid }, orderBy: { annotation_no: 'asc' } })
        for (let i in annotations) transactions.push(prisma.annotations.delete({ where: { annotation_id: annotations[i].annotation_id } }))
        transactions.push(prisma.model.delete({ where: { uid: uid } }))

        // Await transaction
        const deletion = await prisma.$transaction(transactions).catch(e => routeHandlerErrorHandler(route, e.message, "prisma.$transaction(transactions)", "Error: Couldn't delete model from database"))

        // Delete 3D model object from sketchfab
        await fetch(`https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models/${uid}`, { headers: requestHeader,method: 'DELETE'}).then(res => {
            if (!res.ok) nonFatalError(route, res.statusText, '`fetch(https://api.sketchfab.com/v3/orgs/) - **MODEL ${uid} NEEDS TO BE DELETED FROM SKETCHFAB**`')
        }).catch(e => nonFatalError(route, e.message, '`fetch(https://api.sketchfab.com/v3/orgs/) - **MODEL ${uid} NEEDS TO BE DELETED FROM SKETCHFAB**`'))

        // Typical success response
        return routeHandlerTypicalResponse("Model deleted", deletion)
    }
    // Typical fail response
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}