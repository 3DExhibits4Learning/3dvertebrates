'use client'

// Typical imports
import { signOut, useSession, } from "next-auth/react"
import { useRouter } from "next/navigation"
import { NavbarContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react"

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
                <DropdownMenu aria-label="Dropdown menu">
                    <DropdownItem key="Admin" onClick={() => router.push('/admin')} aria-label='Go to admin page'>3D Models</DropdownItem>
                    <DropdownItem key="tutorials" onClick={() => router.push('/tutorials')} aria-label='Go to tutorials page'>Tutorials</DropdownItem>
                    <DropdownItem key="FAQ" onClick={() => router.push('/faq')} aria-label='Go to faq page'>FAQ</DropdownItem>
                    <DropdownItem key="help" onClick={() => router.push('/help')} aria-label='Go to faq page'>Help</DropdownItem>
                    <DropdownItem key="signOut"><button onClick={() => signOut()} aria-label='Sign Out'>Sign Out</button></DropdownItem>
                </DropdownMenu>
            </Dropdown>
        }
    </NavbarContent>
}