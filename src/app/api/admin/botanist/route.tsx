/**
 * @file src/app/api/admin/botanist/route.tsx
 * 
 * @fileoverview handler for the model annotations class(GET), handler for marking a model as annotated (POST)
 * 
 * @todo import singleton and handle queries directly
 * @todo establish seperate route for base annotations or their children
 * @todo rename the route and change all corresponding fetches
 */

// Typical imports
import { getAnnotations, getPhotoAnnotation, getVideoAnnotation, markAsAnnotated, getModelAnnotation, updateModelAnnotator } from "@/functions/server/queries"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"

// DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

// ROUTE VARIABLE
const route = 'src/app/api/admin/botanist/route.tsx'

/**
 * 
 * @param request HTTP
 * @returns base annotations or child annotation based on type param (or error message)
 */
export async function GET(request: Request) {
    
    try {

        // Get search params
        const { searchParams } = new URL(request.url);

        // Return base annotations for the UID
        if (searchParams.get('type') === 'getAnnotations') {
            const annotations = await getAnnotations(searchParams.get('uid') as string)
            return Response.json({ data: 'Success', response: annotations })
        }

        // Return child annotation based on annotation type
        else if (searchParams.get('type') === 'getAnnotation') {
            let annotation

            if (searchParams.get('annotationType') === 'photo') annotation = await getPhotoAnnotation(searchParams.get('id') as string)
            else if (searchParams.get('annotationType') === 'video') annotation = await getVideoAnnotation(searchParams.get('id') as string)
            else annotation = await getModelAnnotation(searchParams.get('id') as string)

            return Response.json({ data: 'Success', response: annotation })
        }
        else return Response.json({ data: 'request type error', response: 'request type error' }, { status: 400, statusText: 'request type error' })
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}

/**
 * 
 * @param request HTTP
 * @returns status message, database objects (or error message)
 */
export async function PATCH(request: Request) {
    
    try {

        // Get request data, session then user's name
        const data = await request.json()
        const session = await getServerSession(authOptions).catch(e => routeHandlerErrorHandler(route, e.message, 'getServerSession(authOptions)', "Coulnd't get server session"))
        const name = session.user.name

        // Mark the 3d model as annotated, update the model annotator
        const updateMark = markAsAnnotated(data.uid, true)
        const updateAnnotator = updateModelAnnotator(data.uid, name)

        // Response with status message, database objects
        return Response.json({ data: 'Model marked as annotated', response: {updateMark, updateAnnotator} })
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message)}
}