'use client'

import { NavbarItem } from "@heroui/react"
import Link from "next/link"

export default function Links() {
    return <NavbarItem className="pr-[2vw]">
        <Link aria-label="Go to 3D Vertebrates Collections" className="text-white dark:text-[#F5F3E7]" href={`/collections/search`}>
            3D Vertebrates
        </Link>
    </NavbarItem>
}

