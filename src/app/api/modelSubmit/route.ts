/**
 * @file src/app/api/modelSubmit/route.tsx
 * 
 * @fileoverview These are the route handlers for uploading and editing 3D models
 * 
 * @todo throw error on failure of required data check
 * @todo merge PUT and PATCH functions so that model reupload can be included in database transaction
 */

// Typical imports
import { prismaClient } from "@/functions/server/queries"
import { LatLngLiteral } from "leaflet"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { nonFatalError, routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"
import { readFile, unlink } from "fs/promises"
import { getTmpPath } from "@/functions/server/admin/modelSubmit"

// Defualt imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// SINGLETON
const prisma = prismaClient()

// ROUTE
const route = 'src/app/api/modelSubmit/route.tsx'

// Typescript satisfied header (used in POST and PUT methods)
const requestHeader: HeadersInit = new Headers()
requestHeader.set('Authorization', process.env.SKETCHFAB_API_TOKEN as string)

/**
 * @function POST
 * @description This is the POST route handler, used for the initial model upload from the admin model submit form
 * 
 */

export async function POST(request: Request) {

    try {

        // Get request data
        const data = await request.formData().catch(e => routeHandlerErrorHandler(route, e.message, 'request.formData()', "Couldn't get form data")) as FormData

        // Get session data (or redirect if there is no session data)
        const session = await getServerSession(authOptions)
        if (!session || !session.user) redirect('/api/auth/signin')

        // Data variables
        const artist = data.get('artist') as string
        const species = data.get('species') as string
        const buildMethod = data.get('buildMethod') as string
        const software: string[] = JSON.parse(data.get('software') as string)
        const tags: string[] = JSON.parse(data.get('tags') as string)
        const position: { lat: string, lng: string } = JSON.parse(data.get('position') as string)
        const speciesAcquisitionDate = data.get('speciesAcquisitionDate') as string
        const baseOrAnnotation = data.get('baseOrAnnotation') as string
        const commonName = data.get('commonName') ? data.get('commonName') as string : ''
        const tmpId = data.get('tmpId') as string
        const fileName = data.get('fileName') as string

        // Obtain model blob from tmp
        const modelPath = await getTmpPath(tmpId)
        const modelBuffer = await readFile(modelPath).catch(e => routeHandlerErrorHandler(route, e.message, 'readFile(modelPath)', "Couldn't read model file")) as Buffer
        const blob = new Blob([modelBuffer])

        // Form and fetch Variables 
        const formData = new FormData
        formData.set('orgProject', process.env.SKETCHFAB_PROJECT_3DVERTEBRATES as string)
        formData.set('modelFile', blob, fileName)
        formData.set('visibility', 'private')
        formData.set('options', JSON.stringify({ background: { color: "#000000" } }))
        const orgModelUploadEnd = `https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models`
        var modelUid = ''

        // Session variables, database transaction array
        const email = session.user?.email
        const user = session.user.name ?? ''
        const transactions = []

        // Upload model file to sketchfab and instantiate modelUid
        await fetch(orgModelUploadEnd, { headers: requestHeader, method: 'POST', body: formData })
            .then((res) => {
                if (!res.ok) routeHandlerErrorHandler(route, res.statusText, 'fetch(orgModelUploadEnd)', "Bad upload request")
                return res.json()
            })
            .then(json => modelUid = json.uid).catch(e => routeHandlerErrorHandler(route, e.message, 'fetch(orgModelUploadEnd)', "Bad upload request"))

        // Push model query onto transactions
        transactions.push(prisma.model.create({
            data: {
                email: email,
                modeled_by: artist,
                spec_name: species,
                build_process: buildMethod,
                uid: modelUid,
                lat: position.lat ? parseInt(position.lat) : null,
                lng: position.lng ? parseInt(position.lng) : null,
                spec_acquis_date: speciesAcquisitionDate ? speciesAcquisitionDate : null,
                site_ready: true,
                user: user,
                base_model: baseOrAnnotation === 'base' ? true : false,
                pref_comm_name: commonName
            }
        }))

        // Push software and tag queries
        for (let i in software) { transactions.push(prisma.software.create({ data: { uid: modelUid, software: software[i] } })) }
        for (let i in tags) { transactions.push(prisma.tags.create({ data: { uid: modelUid, tag: tags[i] } })) }

        // Await transaction, delete model file from disk
        const transaction = await prisma.$transaction(transactions).catch(e => routeHandlerErrorHandler(route, e.message, 'prisma.transaction(transactions)', "Couldn't enter model into database"))
        await unlink(modelPath).catch(e => nonFatalError(route, e.message, `unlink(${tmpId})`, 'POST'))

        // Typical success return
        return routeHandlerTypicalResponse('Model added successfully', transaction)
    }

    // Typical fail return 
    catch (e: any) { routeHandlerTypicalCatch(e.message) }
}

/**
 * @function PUT
 * @description This is the PUT route handler, used to replace the model file in sketchfab
 * 
 */

export async function PUT(request: Request) {

    try {

        // Get form data and initialize variables
        const data = await request.formData().catch(e => routeHandlerErrorHandler(route, e.message, 'request.formData()', "Couldn't get form data")) as FormData
        const uid = data.get('uid') as string
        const tmpId = data.get('tmpId') as string
        const fileName = data.get('fileName') as string
        const orgModelUploadEnd = `https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models/${uid}`

        // Obtain model blob from tmp
        const modelPath = await getTmpPath(tmpId)
        const modelBuffer = await readFile(modelPath).catch(e => routeHandlerErrorHandler(route, e.message, 'readFile(modelPath)', "Couldn't read model file")) as Buffer
        const blob = new Blob([modelBuffer])

        // Set reupload form data
        const reuploadData = new FormData()
        reuploadData.set('orgProject', process.env.SKETCHFAB_PROJECT_3DVERTEBRATES as string)
        reuploadData.set('modelFile', blob, fileName)
        reuploadData.set('visibility', 'private')
        reuploadData.set('options', JSON.stringify({ background: { color: "#000000" } }))

        // Upload model file to sketchfab and instantiate modelUid
        const reupload = await fetch(orgModelUploadEnd, { headers: requestHeader, method: 'PUT', body: reuploadData })
            .then((res) => {
                if (!res.ok) routeHandlerErrorHandler(route, res.statusText, 'fetch(orgModelUploadEnd)', "Bad upload request")
                return res.json()
            })
            .then(json => json).catch(e => routeHandlerErrorHandler(route, e.message, "fetch(orgModelUploadEnd", "Couldn't reupload model"))
        
        // Delete tmp file
        await unlink(modelPath).catch(e => nonFatalError(route, e.message, `unlink(${tmpId})`, 'PUT'))

        // Typical response
        return routeHandlerTypicalResponse('Model added.', reupload)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }

}

/**
 * @function PATCH
 * @description This is the PATCH route handler, used to update the 3D model record in the database
 * 
 */
export async function PATCH(request: Request) {

    try {

        // Get request data
        const data = await request.formData().catch(e => routeHandlerErrorHandler(route, e.message, 'request.formData()', "Couldn't get form data")) as FormData

        // Get session data (or redirect if there is no session data)
        const session = await getServerSession(authOptions)
        if (!session || !session.user) redirect('/api/auth/signin')

        // Data variables
        const artist = data.get('artist') as string
        const species = data.get('species') as string
        const buildMethod = data.get('buildMethod') as string
        const software: string[] = JSON.parse(data.get('software') as string)
        const tags: string[] = JSON.parse(data.get('tags') as string)
        const position: LatLngLiteral = JSON.parse(data.get('position') as string)
        const speciesAcquisitionDate = data.get('speciesAcquisitionDate') as string
        const uid = data.get('uid') as string
        const commonName = data.get('commonName') ? data.get('commonName') as string : ''

        // Session variables
        const email = session.user?.email
        const user = session.user.name ?? ''

        // Transaction array
        const transaction = []

        // Insert data into database
        transaction.push(prisma.model.update({
            where: { uid: uid },
            data: {
                modeled_by: artist,
                spec_name: species,
                build_process: buildMethod,
                lat: position.lat,
                lng: position.lng,
                spec_acquis_date: speciesAcquisitionDate ? speciesAcquisitionDate : null,
                email: email,
                user: user,
                pref_comm_name: commonName
            }
        }))

        // Push sofware + tag deletions
        transaction.push(prisma.software.deleteMany({ where: { uid: uid } }))
        transaction.push(prisma.tags.deleteMany({ where: { uid: uid } }))

        // Push software + tag updates
        for (let i in software) transaction.push(prisma.software.create({ data: { uid: uid, software: software[i] } }))
        for (let i in tags) transaction.push(prisma.tags.create({ data: { uid: uid, tag: tags[i] } }))

        // Await transaction
        const update = await prisma.$transaction(transaction).catch(e => routeHandlerErrorHandler(route, e.message, "prisma.$transaction(transaction)", "Couldn't update model data"))

        // Typical response
        return routeHandlerTypicalResponse('Model added.', update)
    }
    // Typical catch
    catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}