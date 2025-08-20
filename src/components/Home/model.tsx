/**
 * @file src/components/Home/model.tsx
 * 
 * @fileoverview 3D Exhibit home page model
 */

'use client'

// Typical imports
import { isMobileOrTablet } from "@/functions/utils/isMobile"

// Default imports
import dynamic from "next/dynamic"
import Link from "next/link"

// Dynamic imports
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'), { ssr: false })

// Main JSX
export default function HomeModel() {
  const isMobile = isMobileOrTablet()
  const mainSize = isMobile ? 'calc(100vh - 193px)' : 'calc(100vh - 177px)'
  const tailwindMainSize = isMobile ? 'calc(100vh-193px)' : 'calc(100vh-177px)'
  
  return <main className={`flex w-full h-[${tailwindMainSize}] max-h-[${tailwindMainSize}] overflow-hidden`}>

    <div className="w-full lg:w-3/5 h-full">
      <ModelViewer uid={'ee451c036e3d45398f8a1f2ad78367c3'} minHeight={mainSize} />
    </div>

    <div className="hidden lg:flex lg:flex-col lg:w-2/5 p-8 items-center overflow-auto">
      <p className="text-center text-xl mb-12">Welcome to <span className="text-[#FFC72C]">3D</span> Vertebrates</p>

      <p className="mb-12">Welcome to 3D Vertebrates, the second of the 3DExhibits4Learning along with the <Link href='https://3dherbarium.org'><u>3D Herbarium</u></Link>.
        This project is a collaboration of the Cal Poly Humboldt Library and Vertebrate Museum. It began as an idea for a supervised study project (BIOL-499) by student Hannah Wirth.</p>

      <p className="mb-12">The first beta testers and contributors were the Spring 2025 Advanced Mammology class, a class that had not been offered in 14 years!</p>

      <div className="w-full flex justify-center mb-12">
        <figure>
          <img src='/mammologyClass.jpeg' width={500}></img>
          <figcaption className="text-sm italic">Spring '25 Advanced Mammology Class</figcaption>
        </figure>
      </div>

      <p>Check out the awesome squirrel flying through the lab, or see the complete <Link href="/collections/search"><u>3D vertebrates collection</u></Link>. <i>Glaucomys sabrinus</i> (flying squirrel)
        3D model by David Yaranon.</p>

    </div>
  </main>
}