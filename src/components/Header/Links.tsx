'use client'

import { NavbarItem } from "@nextui-org/react"

export default function Links(props: {page?: string}) {
    return(
        <>
            <NavbarItem className="pr-[2vw]">
                <a className="text-white dark:text-[#F5F3E7]" href={`/collections/search`}>
                    3D Vertebrates
                </a>
            </NavbarItem>
        </>
    )
}

