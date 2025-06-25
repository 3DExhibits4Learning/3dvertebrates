// @ts-nocheck
'use client'

// Consider turning off ts-nocheck when coding/debugging.
// The only line that expects an error is the conditional line in the DropdownMenu as its type doesn't allow for conditional rendering (or ts-ignore)

// Typical imports
import { signIn, signOut, useSession, } from "next-auth/react"
import { useRouter } from "next/navigation"
import { admin } from "@/functions/utils/devAuthed"
import { NavbarContent, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react"

// Default imports
import Image from "next/image"
import Link from "next/link"

// Main JSX
export default function LogoAndSignIn() {
    const { data: session } = useSession()
    const router = useRouter()

    return <NavbarContent className="hidden lg:flex pl-[0.5vw]" justify="end">
        <Link href='/'><Image src="/libLogo.svg" width={70} height={70} alt="Logo" className="pt-[3px]" aria-label="Go to Home Page" /></Link>
        {
            session &&
            <Dropdown>
                <DropdownTrigger>
                    <Avatar className="cursor-pointer" isFocusable={true} src={session?.user?.image!} name={session?.user?.name!} aria-label="Dropdown Menu Toggle" />
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="Admin" ><Link aria-label="Go to Admin Page" href='/admin'>Admin</Link></DropdownItem>
                    <DropdownItem key="signOut"><button onClick={() => signOut()} aria-label='Sign Out'>Sign Out</button></DropdownItem>
                </DropdownMenu>
            </Dropdown>
        }
    </NavbarContent>
}