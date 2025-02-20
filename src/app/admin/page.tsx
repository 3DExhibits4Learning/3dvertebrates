/**
 * @file src\app\admin\page.tsx
 * 
 * @fileoverview management server component; redirects to the appropriate page per role
 */

// Typical imports
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserById } from "@/functions/server/queries"
import { getAuthorizedUsers } from "@/functions/server/queries"
import { redirect } from "next/navigation"

// Dynamic server component
export const dynamic = 'force-dynamic'

/**
 * 
 * @returns null
 */
export default async function Page() {

    // Get session, authed users, email
    const session = await getServerSession(authOptions)
    const authorizedUsers = await getAuthorizedUsers()
    let email = session?.user?.email as string

    // Redirect or display 'NOT AUTHORIZED'
    if (!authorizedUsers.some(user => user.email === email)) return <h1>NOT AUTHORIZED</h1>
    else {
        const user = await getUserById(session.user.id)
        if(user?.role === 'admin') redirect('/admin/management')
        else if(user?.role === 'student') redirect('/admin/student')
        else return <h1>NOT AUTHORIZED</h1>
    }
}