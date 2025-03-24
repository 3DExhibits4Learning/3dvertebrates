/**
 * @file src\app\api\collections\herbarium\route.tsx
 * 
 * @fileoverview handler which instantiates the client side Hebarium class
 * 
 * @todo convert to server action
 */

// Typical imports
import { getSoftwares } from '@/functions/server/queries'
import { fetchGbifProfile, fetchGbifVernacularNames, fetchWikiSummary } from "@/functions/server/fetchFunctions"
import { routeHandlerTypicalCatch } from '@/functions/server/error'

// Default imports
import routeHandlerTypicalResponse from '@/functions/server/typicalSuccessResponse'

/**
 * 
 * @param request HTTP
 * @returns typical response with message and promise results
 */
export async function GET(request: Request) {

    try {

        // Get params
        const { searchParams } = new URL(request.url)

        // Variables from params
        const uid = searchParams.get('uid') as string
        const usageKey = parseInt(searchParams.get('usageKey') as string)
        const specimenName = searchParams.get('specimenName') as string

        // Await all promises
        const promises = [fetchGbifVernacularNames(usageKey), getSoftwares(uid), fetchGbifProfile(usageKey), fetchWikiSummary(specimenName)]
        const results = await Promise.all(promises)

        // Typical return
        return routeHandlerTypicalResponse("Success", results)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}