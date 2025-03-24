/**
 * @file src/app/api/inat/route.tsx
 * 
 * @fileoverview handler for getting iNat userId from username (GET), or messaging another iNat user (POST)
 * 
 * @todo convert to server action
 */

// Typical imports
import { getAccount } from "@/functions/server/queries"
import { Account } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// GLOBAL ROUTE
const route = 'src/app/api/inat/route.tsx'

/**
 * 
 * @param request HTTP
 * @returns typical response with message and userID (or error message onCatch)
 */
export async function GET(request: Request) {

    try {

        // Get params and fetch userID
        const { searchParams } = new URL(request.url)
        const userId = await fetch(`https://api.inaturalist.org/v1/users/autocomplete?q=${searchParams.get('username')}`).then(res => res.json()).then(json => json.results[0].id)
            .catch(e => routeHandlerErrorHandler(route, e.message, `fetch(https://api.inaturalist.org/v1/users/autocomplete?`, "Couldn't get user id"))

        // Typical response
        return routeHandlerTypicalResponse('userId Found', userId)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}

/**
 * 
 * @param request HTTP
 * @returns typical response with message and message resposne JSON (or error message onCatch)
 */
export async function POST(request: Request) {

    try {

        // Get request json, session, account ant iNat token
        const data = await request.json().catch(e => routeHandlerErrorHandler(route, e.message, `request.json()`, "Couldn't get request JSON"))
        const session = await getServerSession(authOptions).catch(e => routeHandlerErrorHandler(route, e.message, `getServerSession()`, "Couldn't get session"))
        const account = await getAccount(session.user.id, 'inaturalist').catch(e => routeHandlerErrorHandler(route, e.message, `getServerSession()`, "Couldn't get session")) as Account
        const iNatToken = account.access_token

        // Message object
        const messageObj = {
            message: {
                to_user_id: data.id,
                subject: data.subject,
                body: data.body
            }
        }

        // Send message
        const sendMessage = await fetch('https://api.inaturalist.org/v1/messages', {
            method: 'POST',
            headers: { 'Authorization': iNatToken as string },
            body: JSON.stringify(messageObj)
        }).then(res => res.json()).then(json => json)

        // Check object keys for error
        if (Object.keys(sendMessage).includes('error')) routeHandlerErrorHandler(route, sendMessage.error, "fetch('https://api.inaturalist.org/v1/messages'", "Error sending message")

        // Typical return 
        return routeHandlerTypicalResponse('Message sent', sendMessage)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}