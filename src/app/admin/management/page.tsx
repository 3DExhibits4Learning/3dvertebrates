/**
 * @file \src\app\admin\management\page.tsx
 * 
 * @fileoverview server page for the management client
 * 
 */

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { fullModel, studentsAndAssignments } from "@/interface/interface"
import { getFullModels, getStudentsAndAssignments, getModelAnnotations, getAuthorizedUsers } from "@/functions/server/queries"
import { authorized, model_annotation } from "@prisma/client"
import { serverErrorHandler } from "@/functions/server/error"
import { annotationWithModel } from "@/interface/interface"
import { isAnnotationModel, isUsedAnnotationModel } from "@/functions/server/utils/filters"

// Default imports
import ManagerClient from "@/components/Admin/Administrator/ManagerClient"
import createStudentsAssignmentsAndModels from "@/functions/client/managerClient/createStudentsAssignmentsAndModels"
import Header from "@/components/Header/Header"
import Foot from "@/components/Shared/Foot"
import FullPageError from "@/components/Error/FullPageError"

import prisma from "@/functions/utils/prisma"

// Path
const path = '/src/app/admin/management/page.tsx'

// Main component
export default async function Page() {

    try {
        // Get session
        const session = await getServerSession(authOptions).catch((e) => serverErrorHandler(path, e.message, "Couldn't get session", 'getServerSession()', false))

        // Get authorized users
        const authorizedUsers = await prisma.authorized.findMany()

        // Authorized user redirect
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email && user.role === 'admin')) return <h1>NOT AUTHORIZED</h1>

        // Get all 3D models
        const models = await prisma.model.findMany({ include: { software: true, tags: true, assignment: true } }) as fullModel[]

        // Get model annoations (annotation record with model_annotation record included)
        const modelAnnotations = await prisma.annotations.findMany({ where: { annotation_type: 'model' }, include: { model_annotation: true } }) as annotationWithModel[]

        // Get students and assignments
        const students = await getStudentsAndAssignments().catch(e => serverErrorHandler(path, e.message, "Couldn't students and assignments", 'getStudetnsAndAssignments()', false)) as studentsAndAssignments[]

        // Stringified model filters (decimal objects (which are included in models table) can't be passed directly to client)
        const modelsString = JSON.stringify(models)
        const modelsNeedingThumbnails = JSON.stringify(models.filter(model => model.thumbnail === null))
        const unusedAnnotationModels = JSON.stringify(models.filter(model => isAnnotationModel(model) && !isUsedAnnotationModel(model, modelAnnotations)))

        // Create and stringify custom data object for admin "current assignments" table
        const studentsAssignmentsAndModels = JSON.stringify(createStudentsAssignmentsAndModels(students, models))

        // Typical client return
        return <>
            <Header pageRoute="collections" headerTitle='Management' />
            <main className="flex flex-col !min-h-[calc(100vh-177px)]">
                <ManagerClient
                    models={modelsString}
                    modelsNeedingThumbnails={modelsNeedingThumbnails}
                    studentsAssignmentsAndModels={studentsAssignmentsAndModels}
                    admin={true}
                    modelAnnotations={unusedAnnotationModels}
                    authorizedUsers={authorizedUsers} />
            </main>
            <Foot />
        </>
    }
    // Typical catch
    catch (e: any) { return <FullPageError clientErrorMessage={e.message} /> }
}