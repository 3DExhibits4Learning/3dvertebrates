/**
 * @file src/app/admin/student/page.tsx
 * 
 * @fileoverview server page for student client
 * 
 * @todo condense sequential promises to array and use Promise.all()
 */

// Typical imports
import { getAllAnnotationModels, getAssignments, getModelsToAnnotate, getModelAnnotations } from "@/functions/server/queries"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAuthorizedUsers } from "@/functions/server/queries"
import { serverErrorHandler } from "@/functions/server/error"
import { model, assignment, authorized } from "@prisma/client"
import { annotationWithModel, fullModel } from "@/interface/interface"
import { isAnnotationModel, isUsedAnnotationModel } from "@/functions/server/utils/filters";

// Default imports
import StudentClient from "@/components/Admin/Student/StudentClient"
import Header from "@/components/Header/Header"
import Foot from "@/components/Shared/Foot"
import FullPageError from "@/components/Error/FullPageError"

// Path
const path = 'src/app/admin/student/page.tsx'

// Main JSX
export default async function Page() {

    try {
        // Get server session
        const session = await getServerSession(authOptions).catch(e => serverErrorHandler(path, e.message, "Couldn't get session", 'getServerSession()', false))

        // Get authorized users
        const authorizedUsers = await getAuthorizedUsers().catch(e => serverErrorHandler(path, e.message, "Couldn't get authorized users", 'getAuthorizedUsers()', false)) as authorized[]
 
        // Get email
        const email = session?.user?.email as string
        // var email = 'jaa209@humboldt.edu' // Test email

        // Authorized user
        if (!(email || authorizedUsers.some(user => user.email === email))) return <h1>NOT AUTHORIZED</h1>

        // Get models to annotate, annotation models (models used as annotations themselves), and assignments
        const modelsToAnnotate = await getModelsToAnnotate().catch(e => serverErrorHandler(path, e.message, "Couldn't get models to annotate", 'getModelsToAnnotate()', false)) as fullModel[]
        const annotationModels = await getAllAnnotationModels().catch(e => serverErrorHandler(path, e.message, "Couldn't get annotation models", 'getModelsToAnnotate()', false)) as model[]
        const assignments = await getAssignments().catch(e => serverErrorHandler(path, e.message, "Couldn't get assignments", 'getAssignments()', false)) as assignment[]

        // Get modelAnnotations and filter for unused annotations
        const modelAnnotations = await getModelAnnotations().catch(e => serverErrorHandler(path, e.message, "Couldn't get assignments", 'getAssignments()', false)) as annotationWithModel[]
        const unusedModelAnnotations = annotationModels.filter(model => isAnnotationModel(model) && !isUsedAnnotationModel(model, modelAnnotations))

        // Filter assigned models
        const studentAssignmentUids = assignments.filter(assignment => assignment.email === email).map(assignment => assignment.uid)
        const assignedModels = email === 'ab632@humboldt.edu' ? modelsToAnnotate.filter(model => model.uid === 'ee451c036e3d45398f8a1f2ad78367c3') : modelsToAnnotate.filter(model => studentAssignmentUids.includes(model.uid))

        // Typical client
        return <>
            <Header pageRoute="collections" headerTitle="Botany Admin" />
            <main className="w-full min-h-[calc(100vh-177px)] h-[calc(100vh-177px)] overflow-y-auto">
                <StudentClient modelsToAnnotate={JSON.stringify(assignedModels)} annotationModels={JSON.stringify(unusedModelAnnotations)} />
            </main>
            <Foot />
        </>
    }
    //Typical catch
    catch (e: any) { return <FullPageError clientErrorMessage={e.message} /> }
}