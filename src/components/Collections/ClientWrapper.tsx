/**
 * @file src/components/Collections/CollectionsWrapper.tsx
 * 
 * @fileoverview Wrapper for the 3d model collections
 * 
 * @todo Modify to take JSX as children with references to the window resizing context for scale
 */

"use client"

// Typical Imports
import { GbifResponse, GbifImageResponse } from '@/interface/interface'

// Default Imports
import dynamic from 'next/dynamic'

// Dynamic Imports
const MainWrap = dynamic(() => import('@/components/Collections/CollectionsWrapper'), { ssr: false })

// Main JSX 
export default function ClientWrapper(props: {
  model: string,
  gMatch: { hasInfo: boolean, data?: GbifResponse },
  specimenName: string,
  noModelData: { title: string, images: GbifImageResponse[] }
}) {
  return <MainWrap {...props}/>
}


