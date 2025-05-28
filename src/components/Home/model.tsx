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

// Dynamic imports
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'), { ssr: false })

// Main JSX
export default function HomeModel() {
  const mainSize = isMobileOrTablet() ? 'calc(100vh - 193px)' : 'calc(100vh - 176px)'
  return <main className={`w-full ${mainSize}`}><ModelViewer uid={'ee451c036e3d45398f8a1f2ad78367c3'} minHeight={mainSize} /></main>
}