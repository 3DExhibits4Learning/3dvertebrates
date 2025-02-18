/**
 * @file src/app/api/modelSubmit/route.tsx
 * @fileoverview These are the route handlers for uploading and editing 3D models
 */

import { prismaClient } from "@/functions/server/queries";
import { LatLngLiteral } from "leaflet";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

// import prisma client
const prisma = prismaClient()

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

        // Get request data and initialize variables
        const data = await request.formData()
        const formData = new FormData

        // Get session data (or redirect if there is no session data)
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            redirect('/api/auth/signin')
        }

        // Data variables
        const artist = data.get('artist') as string
        const species = data.get('species') as string
        const buildMethod = data.get('buildMethod') as string
        const software: string[] = JSON.parse(data.get('software') as string)
        const tags: string[] = JSON.parse(data.get('tags') as string)
        const position: { lat: string, lng: string } = JSON.parse(data.get('position') as string)
        const speciesAcquisitionDate = data.get('speciesAcquisitionDate') as string
        const modelFile = data.get('modelFile') as File | Blob
        const baseOrAnnotation = data.get('baseOrAnnotation') as string
        const commonName = data.get('commonName') ? data.get('commonName') as string : ''

        // Form and fetch Variables 
        formData.set('orgProject', process.env.SKETCHFAB_PROJECT_3DVERTEBRATES as string)
        formData.set('modelFile', modelFile)
        formData.set('visibility', 'private')
        formData.set('options', JSON.stringify({ background: { color: "#000000" } }))
        const orgModelUploadEnd = `https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models`
        var modelUid: any

        // Session variables
        const email = session.user?.email
        const user = session.user.name ?? ''

        // Upload model file to sketchfab and instantiate modelUid
        await fetch(orgModelUploadEnd, {
            headers: { 'Authorization': process.env.SKETCHFAB_API_TOKEN as string },
            method: 'POST',
            body: formData
        }).then((res) => {if (!res.ok) {console.log(res);console.error(res.statusText); throw Error('Bad SF request')}; return res.json()}).then(json => modelUid = json.uid)
            .catch((e) => {
                console.error(e.message)
                throw Error('Bad SF request')
            })


        // Insert data into database
        const insert = await prisma.model.create({
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
        }).catch((e) => {
            console.error(e.message)
            throw Error("Couldn't Insert Metadata into Database")
        })

        // Insert software into database
        for (let i in software) {
            await prisma.software.create({
                data: {
                    uid: modelUid,
                    software: software[i]
                }
            }).catch((e) => {
                console.error(e.message)
                throw Error("Couldn't Insert Software into Database")
            })
        }

        // Insert tags into database
        for (let i in tags) {
            await prisma.tags.create({
                data: {
                    uid: modelUid,
                    tag: tags[i]
                }
            }).catch((e) => {
                console.error(e.message)
                throw Error("Couldn't Insert Tags into Database")
            })
        }

        // Typical success return
        return Response.json({ data: 'Model added successfully', response: insert })
    }

    // Typical fail return 
    catch (e: any) {
        console.error(e.message)
        return Response.json({ data: e.message, response: e.message }, { status: 400, statusText: e.message })
    }
}

/**
 * @function PUT
 * @description This is the PUT route handler, used to replace the model file in sketchfab
 * 
 */

export async function PUT(request: Request) {

    try {

        // Get form data and initialize variables
        const data = await request.formData()
        const modelFile = data.get('modelFile') as File
        const uid = data.get('uid') as string
        const reuploadData = new FormData()

        reuploadData.set('orgProject', process.env.SKETCHFAB_PROJECT_3DVERTEBRATES as string)
        reuploadData.set('modelFile', modelFile)
        reuploadData.set('visibility', 'private')
        reuploadData.set('options', JSON.stringify({ background: { color: "#000000" } }))
        const orgModelUploadEnd = `https://api.sketchfab.com/v3/orgs/${process.env.SKETCHFAB_ORGANIZATION}/models/${uid}`

        // Upload model file to sketchfab and instantiate modelUid
        const reupload = await fetch(orgModelUploadEnd, {
            headers: requestHeader,
            method: 'PUT',
            body: reuploadData
        })
            .then((res) => {
                if (!res.ok) {
                    console.error(res.statusText)
                    throw Error('Bad SF reupload request')
                }
            })
            .then(json => json)
            .catch((e) => {
                console.error(e.message)
                throw Error('Bad SF request')
            })

        // Typical success return
        return Response.json({ data: 'Model added.', response: reupload })
    }

    // Typical fail return 
    catch (e: any) {
        console.error(e.message)
        return Response.json({ data: e.message, response: e.message }, { status: 400, statusText: e.message })
    }

}

/**
 * @function PATCH
 * @description This is the PATCH route handler, used to update the 3D model record in the database
 * 
 */
export async function PATCH(request: Request) {

    try {

        // Get request data
        const data = await request.formData()

        // Get session data (or redirect if there is no session data)
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            redirect('/api/auth/signin')
        }

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

        // Insert data into database
        const update = await prisma.model.update({
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
        }).catch((e) => {
            console.error(e.message)
            throw Error("Couldn't Insert Metadata into Database")
        })

        // Delete all software and tags for the provided uid then insert new software and tags into the database
        const deletionPromises = []
        const softwareAndTagPromises = []

        // Push sofware deletions
        deletionPromises.push(prisma.software.deleteMany({
            where: { uid: uid }
        }))

        // Push tag deletions
        deletionPromises.push(prisma.tags.deleteMany({
            where: { uid: uid }
        }))

        // Await software and tag deletions
        await Promise.all(deletionPromises).catch((e) => {
            console.error(e.message)
            throw Error("Coulnd't delete software or tags")
        })

        // Push software updates
        for (let i in software) {
            softwareAndTagPromises.push(prisma.software.create({
                data: {
                    uid: uid,
                    software: software[i]
                }
            }))
        }

        // Push tag updates
        for (let i in tags) {
            softwareAndTagPromises.push(prisma.tags.create({
                data: {
                    uid: uid,
                    tag: tags[i]
                }
            }))
        }

        // Await software and tag updates
        await Promise.all(softwareAndTagPromises).catch((e) => {
            console.error(e.message)
            throw Error('Error entering software or tags into database')
        })

        // Typical success response
        return Response.json({ data: 'Model added.', response: update })
    }

    // Typical fail response
    catch (e: any) {
        console.error(e.message)
        return Response.json({ data: e.message, response: e.message }, { status: 400, statusText: e.message })
    }
}