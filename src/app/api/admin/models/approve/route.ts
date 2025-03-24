/**
 * @file src/app/api/admin/models/approve/route.ts
 * 
 * @fileoverview handler for admins to approve 3D models
 * 
 * @todo convert to server action
 * 
 */

// Typical imports
import { approveModel } from "@/functions/server/queries"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// ROUTE VAR
const route = 'src/app/api/admin/models/approve/route.ts'

/**
 * 
 * @param request HTTP
 * @returns status message, db object (or error message)
 */
export async function POST(request: Request) {

    try {

        // Get params
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid') as string

        // Check data
        if (!uid) throw Error("UID Missing")
        
        // Approve model
        const approve = await approveModel(uid).catch(e => routeHandlerErrorHandler(route, e.message, 'approveModel()', "Couldn't approve model"))

        // Typical response
        return routeHandlerTypicalResponse("Model approved", approve)
    }
// Typical catch
catch(e: any){routeHandlerTypicalCatch(e.message)}
}