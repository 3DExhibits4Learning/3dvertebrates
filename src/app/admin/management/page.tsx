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
        // await reMapAnnotations('267c5b476b5e4e67a34f61aba4d68f4e','36bec4844dc84c9cb23650341e621241')
        // await tmpPositionData('36bec4844dc84c9cb23650341e621241')
        // await updateAnnotator('36bec4844dc84c9cb23650341e621241', 'Abigayle Hendon')

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
                    authorizedUsers={authorizedUsers}/>
            </main>
            <Foot />
        </>
    }
    // Typical catch
    catch (e: any) { return <FullPageError clientErrorMessage={e.message} /> }
}