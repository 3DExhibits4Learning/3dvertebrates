'use client'

import { NavbarItem } from "@nextui-org/react"
import Autocomplete from "../Shared/AutoComplete"
import { forwardRef, MutableRefObject } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "./SearchIcon"

const AutoComplete = forwardRef((props:{autocompleteOptions: any[], fetchAutoCompleteOptions: Function, width?: string, listWidth?: string}, ref) => {
    const searchQuery = ref as MutableRefObject<string>
    const router = useRouter()
    return (
        <>
            <NavbarItem>
                <section className="flex">
                    <Autocomplete
                        search
                        options={props.autocompleteOptions}
                        changeFn={props.fetchAutoCompleteOptions}
                        ref={searchQuery}
                        listWidth={props.listWidth ?? 'w-[15vw] min-w-[250px]'}
                        width={props.width ?? 'w-[10vw] focus:w-[15vw] min-w-[225px] focus:min-w-[250px]'}
                        className="inline-block h-[42px] rounded-l-lg dark:bg-[#27272a] transition-all duration-500 ease-in-out
                                 dark:hover:bg-[#3E3E47] px-4 text-[15px] outline-[#004C46] text-[#004C46] dark:text-white"
                    />
                    <button
                        className="ml-0 text-white bg-gray-100 hover:bg-gray-200 transition duration-300 ease-in-out px-4 rounded-r-lg h-[42px]"
                        onClick={() => {
                            if (searchQuery.current) {
                                router.push(`/collections/${searchQuery.current}`)
                            }
                        }}
                    >
                        <SearchIcon style={{ color: "black" }} size={22} width="" height="" />
                    </button>
                </section>
            </NavbarItem>
        </>
    )
})
AutoComplete.displayName = 'HeaderAutocomplete'
export default AutoComplete