/**
 * @file src/app/api/admin/annotations/unapprove/route.ts
 * 
 * @fileoverview handler for an admin to unapprove annotations
 */

// Typical imports
import { unapproveAnnotations } from "@/functions/server/queries";
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse";

// Route
const route = 'src/app/api/admin/annotations/unapprove/route.ts'

/**
 * 
 * @param request HTTP
 * @returns typical return with status message and db approval object
 */
export async function PATCH(request: Request) {

    try {

        // Variable declarations
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid') as string

        // Unapprove annotations
        const approval = await unapproveAnnotations(uid).catch(e => routeHandlerErrorHandler(route, e.message, 'unapproveAnnotations()', "Coudln't unapprove annotations"))

        // Typical response
        return routeHandlerTypicalResponse('Annotations unapproved', approval)
    }
    // Typical catch
    catch(e: any){return routeHandlerTypicalCatch(e.message)}
}