/**
 * @file src/app/api/admin/annotations/approve/route.ts
 * 
 * @fileoverview route handler for admin annotation approval
 */

// Typical imports
import { approveAnnotations } from "@/functions/server/queries";
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error";

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse";

// Main component
export async function PATCH(request: Request) {

    try {
        
        // Variable declarations
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid') as string
        const route = 'src/app/api/admin/annotations/approve/route.ts'

        // Approve annotations
        const approval = await approveAnnotations(uid).catch(e => routeHandlerErrorHandler(route, e.message, 'approveAnnotations()', "Coudln't approve annotations"))

        // Typical response
        return routeHandlerTypicalResponse('Annotations approved', approval)
    }
    // Typical catch
    catch(e: any){return routeHandlerTypicalCatch(e.message)}
}