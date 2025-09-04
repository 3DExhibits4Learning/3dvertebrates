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
import { annotations } from '@prisma/client'
import { number } from 'framer-motion'

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
  numberOfAnnotations: number
  annotations: annotations[]
}) {
  return <MainWrap {...props}/>
}


