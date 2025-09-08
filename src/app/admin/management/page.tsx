/**
 * @file \src\app\admin\management\page.tsx
 * 
 * @fileoverview server page for the management client
 * 
 */

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { fullModel } from "@/interface/interface"
import { serverErrorHandler } from "@/functions/server/error"
import { isIT } from "@/functions/server/utils/utils"

// Default imports
import ManagerClient from "@/components/Admin/Administrator/ManagerClient"
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
        const email = session?.user?.email
        if (!authorizedUsers.find(user => user.email === email && user.role === 'admin')) return <h1>NOT AUTHORIZED</h1>

        // Get all 3D models
        const models = await prisma.model.findMany({ include: { software: true, tags: true } }) as fullModel[]

        // Stringified model filters (decimal objects (which are included in models table) can't be passed directly to client)
        const modelsString = JSON.stringify(models)
        const modelsNeedingThumbnails = JSON.stringify(models.filter(model => model.thumbnail === null))
        const assignments = JSON.stringify(models.filter(model => model.assignedEmail && model.base_model))

        const isIt = isIT(session.user?.email)
        const modelsToAnnotate = isIt ? models.filter(model => model.base_model && !model.published && model.modelApproved)
            : models.filter(model => model.base_model && !model.published && model.modelApproved && model.assignedEmail !== process.env.NEXT_PUBLIC_IT_EMAIL)
        const modelsToAnnotateString = JSON.stringify(modelsToAnnotate)

        // Typical client return
        return <>
            <Header pageRoute="collections" headerTitle='Management' />
            <main className="flex flex-col !min-h-[calc(100vh-177px)]">
                <ManagerClient
                    models={modelsString}
                    modelsToAnnotate={modelsToAnnotateString}
                    modelsNeedingThumbnails={modelsNeedingThumbnails}
                    admin={true}
                    authorizedUsers={authorizedUsers}
                    assignments={assignments} 
                    email={email}/>
            </main>
            <Foot />
        </>
    }
    // Typical catch
    catch (e: any) { return <FullPageError clientErrorMessage={e.message} /> }
}