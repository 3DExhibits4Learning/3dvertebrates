import Header from "@/components/Header/Header"
import Foot from "@/components/Shared/Foot"
import BotanyClient from "@/components/Admin/BotanyClient"
import { getAllAnnotationModels, getModelsToAnnotate, getTestModel } from "@/api/queries"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { management, botanist } from "@/utils/devAuthed"

export default async function Page() {

    const session = await getServerSession(authOptions)
    let email = session?.user?.email as string
    if (!management.includes(email) && !botanist.includes(email)) {
        return <h1>NOT AUTHORIZED</h1>
    }

    const modelsToAnnotate = await getModelsToAnnotate()
    const annotationModels = await getAllAnnotationModels()

    return (
        <>
            <Header pageRoute="collections" headerTitle="Botany Admin" />
            <main className="w-full min-h-[calc(100vh-177px)] h-[calc(100vh-177px)] overflow-y-auto">
                <BotanyClient modelsToAnnotate={modelsToAnnotate} annotationModels={annotationModels} />
            </main>
            <Foot />
        </>
    )
}