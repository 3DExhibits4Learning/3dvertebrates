'use client'

import Header from "@/components/Header/Header"
import dynamic from "next/dynamic"
import Foot from "@/components/Shared/Foot"

const HomeModel = dynamic(() => import('@/components/Home/model'), { ssr: false })

export default function HomeWrapper() {
    return <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"></meta>
        <meta name="description" content="An annotated collection of 3D Models by the Cal Poly Humboldt Vertebrate Museum and its students"></meta>
        <title>3D Vertebrate Museum</title>
        <Header headerTitle='Home' pageRoute='collections' />
        <HomeModel />
        <Foot />
    </>
}