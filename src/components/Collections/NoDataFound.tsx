'use client'

import Header from "../Header/Header"
import Foot from "../Shared/Foot"

export default function NoDataFound(props:{specimenName: string}) {
    return (
        <>
            <Header headerTitle={props.specimenName} pageRoute="collections" />
            <div className="h-[calc(100vh-177px)] w-full flex justify-center items-center text-center text-2xl px-5">
                <p>No 3D vertebrate found for &quot;{decodeURI(props.specimenName)}.&quot;</p>
            </div>
            <Foot />
        </>
    )
}