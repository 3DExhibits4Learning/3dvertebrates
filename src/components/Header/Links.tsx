'use client'

import { NavbarItem } from "@heroui/react"
import { usePathname } from "next/navigation"

import Link from "next/link"
import Image from "next/image"

export default function Links() {
    const pathname = usePathname()

    return <NavbarItem className="pr-[2vw]">
        <Link aria-label="Go to 3D Vertebrates Collections" className="text-white dark:text-[#F5F3E7]" href={`/collections/search`}>
            {
                pathname === '/' ?
                    <div className="flex">
                            <p>See the Collection</p>
                            <Image src="whiteExternalLink.svg" alt="Go to collection" width={20} height={0} className="ml-1" />
                    </div> :
                    <span>3D Vertebrates</span>
            }
        </Link>
    </NavbarItem>
}

