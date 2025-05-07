// TODO: Update get getModelsToAnnotate to be filtered by userId

import Header from "@/components/Header/Header"
import Foot from "@/components/Shared/Foot"
import BotanyClient from "@/components/Admin/BotanyClient"
import { getAllAnnotationModels, getModelsToAnnotate, getTestModel } from "@/api/queries"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAuthorizedUsers } from "@/api/queries"

export default async function Page() {

    const session = await getServerSession(authOptions)
    const authorizedUsers = await getAuthorizedUsers()
    let email = session?.user?.email as string

        // Authorized user
        if (!(email || authorizedUsers.some(user => user.email === email))) return <h1>NOT AUTHORIZED</h1>

        // Get models to annotate, annotation models (models used as annotations themselves), and assignments
        const modelsToAnnotate = await getModelsToAnnotate().catch(e => serverErrorHandler(path, e.message, "Couldn't get models to annotate", 'getModelsToAnnotate()', false)) as fullModel[]
        const annotationModels = await getAllAnnotationModels().catch(e => serverErrorHandler(path, e.message, "Couldn't get annotation models", 'getModelsToAnnotate()', false)) as model[]
        //const abiModels = annotationModels.filter(model => model.spec_name === 'Martes americana')
        const assignments = await getAssignments().catch(e => serverErrorHandler(path, e.message, "Couldn't get assignments", 'getAssignments()', false)) as assignment[]

        // Get modelAnnotations and filter for unused annotations
        const modelAnnotations = await getModelAnnotations().catch(e => serverErrorHandler(path, e.message, "Couldn't get assignments", 'getAssignments()', false)) as annotationWithModel[]
        const unusedModelAnnotations = annotationModels.filter(model => isAnnotationModel(model) && !isUsedAnnotationModel(model, modelAnnotations))
        //for (let i in abiModels) unusedModelAnnotations.push(abiModels[i])

        // Filter assigned models
        const studentAssignmentUids = assignments.filter(assignment => assignment.email === email).map(assignment => assignment.uid)
        const assignedModels = email === 'ab632@humboldt.edu' ? modelsToAnnotate.filter(model => model.uid === 'ee451c036e3d45398f8a1f2ad78367c3') : modelsToAnnotate.filter(model => studentAssignmentUids.includes(model.uid))

        // Typical client
        return <>
            <Header pageRoute="collections" headerTitle="Botany Admin" />
            <main className="w-full min-h-[calc(100vh-177px)] h-[calc(100vh-177px)] overflow-y-auto">
                <BotanyClient modelsToAnnotate={modelsToAnnotate} annotationModels={annotationModels} />
            </main>
            <Foot />
        </>
    )
}