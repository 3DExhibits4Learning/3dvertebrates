/**
 * @file src/app/api/inat/observation/route.tsx
 * 
 * @fileoverview inat observation route handler
 * 
 * @todo convert to server action
 */

// Typical imports
import { getAccount } from "@/functions/server/queries"
import { Account } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// GLOBAL ROUTE
const route = 'src/app/api/inat/observation/route.tsx'

/**
 * 
 * @param request HTTP
 * @returns 
 */
export async function POST(request: Request) {

    try {

        // Await session, account and reques data
        const session = await getServerSession(authOptions).catch(e => routeHandlerErrorHandler(route, e.message, "getServerSession(authOptions)", "Couldn't get session"))
        const account = await getAccount(session.user.id, 'inaturalist').catch(e => routeHandlerErrorHandler(route, e.message, "getAccount", "Couldn't get session(session.user.id, 'inaturalist')", "Coudldn't get account")) as Account
        const requestData = await request.formData().catch(e => routeHandlerErrorHandler(route, e.message, "request.formData()", "Couldn't get request data")) as FormData

        // Variables
        const iNatToken = account.access_token
        const data = new FormData()

        // Observation post object
        const postObj = {
            observation: {
                species_guess: requestData.get('species') as string,
                latitude: parseFloat(requestData.get('latitude') as string),
                longitude: parseFloat(requestData.get('longitude') as string),
                observed_on_string: requestData.get('observed_on') as string
            }
        }

        // Post iNaturalist observation
        const postObservation = await fetch('https://api.inaturalist.org/v1/observations', {
            method: 'POST',
            headers: { 'Authorization': iNatToken as string },
            body: JSON.stringify(postObj)
        }).then(res => res.json()).then(json => json)

        // Check for error key in observation object to indicate an error
        if (Object.keys(postObservation).includes('error')) routeHandlerErrorHandler(route, postObservation.error, "fetch('https://api.inaturalist.org/v1/observations'", "Coulnd't send message")
        
        // Photo promise array, set observation id data
        let promises = []
        data.set('observation_photo[observation_id]', postObservation.id)

        // Iterate numberOfImages times, pushing a new promise with the corresponding image file each time
        for (let i = 0; i < parseInt(requestData.get('numberOfImages') as string); i++) {
            
            // Set photo
            data.set(`file`, requestData.get(`file${i}`) as Blob)

            // Push promise
            promises.push((fetch('https://api.inaturalist.org/v1/observation_photos', {
                method: 'POST',
                headers: { 'Authorization': iNatToken as string },
                body: data
            }).then(res => res.json()).then(json => json)
            ))
        }

        // Await observation photo promises
        const results = await Promise.all(promises).catch(e => routeHandlerErrorHandler(route, e.message, `Promise.all(promises) - **INAT OBSERVATION ${postObservation.id} DIDN'T HAVE OBSERVATION PHOTOS ADDED**`, "Couldn't add photos to observation")) as any[]

        // Check for error keys in observation photo results
        for (let i = 0; i < results.length; i++) {
            if (Object.keys(results[i]).includes('error')) routeHandlerErrorHandler(route, results[i].error, `Promise.all(promises) - **INAT OBSERVATION ${postObservation.id} DIDN'T HAVE OBSERVATION PHOTOS ADDED**`, "Couldn't add photos to observation")
        }

        // Typical return
        return routeHandlerTypicalResponse('Observation Posted!', results)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}
