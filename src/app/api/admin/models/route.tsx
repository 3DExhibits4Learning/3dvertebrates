/**
 * @file src/app/api/admin/models/route.tsx
 * 
 * @fileoverview handler to obtain full 3d models
 */

// Typical imports
import { routeHandlerTypicalCatch } from "@/functions/server/error"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// SINGLETON
import prisma from "@/functions/utils/prisma"

// DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

/**
 * 
 * @returns typical response with success message and full models (or error message)
 */
export async function GET() {

    try {
        
        // Obtain the models and return them
        const models = await prisma.model.findMany({ include: { software: true, tags: true, assignment: true } })
        return routeHandlerTypicalResponse('Models Obtained', models)
    }
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}