/**
 * @file src/app/api/access/route.tsx
 * 
 * @fileoverview route handler to check validity of a JWT
 * 
 * @todo convert to server action
 */

// Typical imports
import { getAccount } from "@/functions/server/queries"
import { Account } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// THIS IS A DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

// ROUTE
const route = 'src/app/api/access/route.tsx'

/**
 * 
 * @param request HTTP
 * @returns typical response with bool token status and token itself
 */
export async function GET(request: Request) {

    try{
        // Get session
        const session = await getServerSession(authOptions).catch(e => routeHandlerErrorHandler(route, e.message, 'getServerSession(authOptions)', "Coulnd't get server session"))

        // Variables
        let response
        const d = new Date()
        let date = Math.round(d.getTime() / 1000)
        
        // Search params object
        const { searchParams } = new URL(request.url)
        
        // Get account
        const account = await getAccount(session.user.id, searchParams.get('provider') as string).catch(e => routeHandlerErrorHandler(route, e.message, "getAccount(session.user.id, searchParams.get('provider') as string)", "Couldn't get server session")) as Account
        
        // Determine if JWT expiration is less than current date
        if (account.expires_at && account.expires_at <= date) response = false
        else response = true
        
        // Return response with json body, bool validity and access token included
        return Response.json({data:'record found', response: response, token: account.access_token})
    }
    // Typical catch
    catch(e: any) {return routeHandlerTypicalCatch(e.message)}
}