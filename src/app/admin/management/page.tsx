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
import { authorized } from "@prisma/client"
import { serverErrorHandler } from "@/functions/server/error"
import { annotationWithModel } from "@/interface/interface"
import { isAnnotationModel, isUsedAnnotationModel } from "@/functions/server/utils/filters"

// Default imports
import ManagerClient from "@/components/Admin/Administrator/ManagerClient"
import createStudentsAssignmentsAndModels from "@/functions/client/managerClient/createStudentsAssignmentsAndModels"
import Header from "@/components/Header/Header"
import Foot from "@/components/Shared/Foot"
import FullPageError from "@/components/Error/FullPageError"
import { reMapAnnotations, renumberCurrentAnnotations, tmpPositionData, updateAnnotator } from "@/functions/server/admin/annotator"
import prisma from "@/functions/utils/prisma"

// Path
const path = '/src/app/admin/management/page.tsx'

// Main component
export default async function Page() {

    try {

        // const res = await renumberCurrentAnnotations()
        // console.log(res)
        //await reMapAnnotations('97c882ad93194ed3966d3edf2f36a23f','fc179dbe8e3240ba9307281fbc99eec0')
        //await tmpPositionData('fc179dbe8e3240ba9307281fbc99eec0')
        //await updateAnnotator('cc989b7d8cb147c687add115d21e7314', 'Jillian Arcadi')

        // Get session
        const session = await getServerSession(authOptions).catch((e) => serverErrorHandler(path, e.message, "Couldn't get session", 'getServerSession()', false))

        // Get authorized users
        const authorizedUsers = await getAuthorizedUsers().catch((e) => serverErrorHandler(path, e.message, "Couldn't get authorized users", 'getAuthorizedUsers()', false)) as authorized[]

        // Authorized user redirect
        const email = session?.user?.email as string
        if (!authorizedUsers.find(user => user.email === email && user.role === 'admin')) return <h1>NOT AUTHORIZED</h1>

        // Get all 3D models
        const models = await getFullModels().catch(e => serverErrorHandler(path, e.message, "Couldn't get models", 'getFullModels()', false)) as fullModel[]

        // Get model annoations (annotation record with model_annotation record included)
        const modelAnnotations = await getModelAnnotations().catch(e => serverErrorHandler(path, e.message, "Couldn't get model annotations", 'getModelAnnoations()', false)) as annotationWithModel[]

        // Get students and assignments
        const students = await getStudentsAndAssignments().catch(e => serverErrorHandler(path, e.message, "Couldn't students and assignments", 'getStudetnsAndAssignments()', false)) as studentsAndAssignments[]

        // Stringified model filters (decimal objects (which are included in models table) can't be passed directly to client)
        const modelsString = JSON.stringify(models)
        const modelsNeedingThumbnails = JSON.stringify(models.filter(model => model.thumbnail === null))
        const unusedModelAnnotations = JSON.stringify(models.filter(model => isAnnotationModel(model) && !isUsedAnnotationModel(model, modelAnnotations)))

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
                    modelAnnotations={unusedModelAnnotations}
                />
            </main>
            <Foot />
        </>
    }
    // Typical catch
    catch (e: any) { return <FullPageError clientErrorMessage={e.message} /> }
}