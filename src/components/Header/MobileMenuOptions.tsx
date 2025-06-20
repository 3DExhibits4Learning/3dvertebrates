'use client'

import { NavbarMenuItem } from "@heroui/react"

export default function MobileMenuOptions() {

    const menuItems = [
        "Home",
        "Collections",
        "About",
        "Contribute",
        "Contact"
    ]
    
    return <>
        {
            menuItems.map((item, index) =>
                <NavbarMenuItem key={`${item}-${index}`}>
                    <a
                        className="w-full text-[#004C46] dark:text-white"
                        href={index === 0 ? "/" : index === 1 ? "/collections/search" : index === 2 ? `/about` : index === 3 ? `/contribute` : index === 4 ? "/contact" : index === 5 ? "https://libguides.humboldt.edu/accessibility/3dherbarium" : "#"}>
                        {item}
                    </a>
                </NavbarMenuItem>
            )
        }
    </>
}