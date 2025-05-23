'use client'

import Header from "../Header/Header"
import Foot from "../Shared/Foot"

export default function NoDataFound(props:{specimenName: string}) {
    return (
        <>
            <Header headerTitle={props.specimenName} pageRoute="collections" />
            <div className="h-[calc(100vh-177px)] w-full flex justify-center items-center text-center text-2xl px-5">
                <p>No data found for search term &quot;{decodeURI(props.specimenName)}.&quot; Try a species, genus or vernacular name.</p>
            </div>
            <Foot />
        </>
    )
}