import ModelSubmitForm from "@/components/ModelSubmit/Form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { AxiosHeaderValue } from "axios"
import Header from '@/components/Header/Header'
import Foot from "@/components/Shared/Foot"
import { getAccountProviders } from "@/api/queries"

export default async function Page() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        redirect('/api/auth/signin')
    }

    const providers = await getAccountProviders(session.user.id as string)
    const user = session.user.name ?? ''

    const isSketchfabLinked = () => {
        let res = false
        for (let index in providers) {
            if (providers[index].provider == 'sketchfab') {
                res = true
            }
        }
        return res
    }

    return (
        <>
            <Header headerTitle='Submit a 3D Model' pageRoute='modelSubmit' />
            <ModelSubmitForm 
            token={process.env.SKETCHFAB_API_TOKEN as AxiosHeaderValue} 
            email={session.user.email as string} 
            isSketchfabLinked={isSketchfabLinked() as boolean} 
            orgUid={process.env.SKETCHFAB_ORGANIZATION as string} 
            projectUid={process.env.SKETCHFAB_PROJECT_3DVERTEBRATES as string}
            user={user}
            />
            <Foot />
        </>
    )
}