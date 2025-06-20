/**
 * @file src/components/Collections/CollectionsWrapper.tsx
 * 
 * @fileoverview Wrapper for the 3d model collections
 * 
 * @todo Modify to take JSX as children with references to the window resizing context for scale
 */

"use client"

// Typical Imports
import { useState } from 'react'
import { Switch } from "@heroui/react"
import { isMobileOrTablet } from '../../functions/utils/isMobile'
import { GbifResponse, GbifImageResponse } from '@/interface/interface'

// Default Imports
import dynamic from 'next/dynamic'
import Foot from '@/components/Shared/Foot'

// Dynamic Imports
const SketchfabApi = dynamic(() => import('@/components/Collections/SketchFabAPI'), { ssr: false })

// Main JSX 
export default function MainWrap(props: {
  model: string,
  gMatch: { hasInfo: boolean, data?: GbifResponse },
  specimenName: string,
  noModelData: { title: string, images: GbifImageResponse[] }
}) {

  // Parse model (decimals can't be passed to client from server)
  const model = JSON.parse(props.model).length ? JSON.parse(props.model) : []

  // Model height based on user agent
  var modelHeight = isMobileOrTablet() ? "calc(100vh - 160px)" : "calc(100vh - 217px)"

  // Variable heights based on window
  const [viewWidthInPx, setViewWidthInPx] = useState(window.outerWidth)
  const [viewportHeightInPx, setViewportHeightInPx] = useState(window.outerHeight + 200)

  // Annotations selected state
  const [isSelected, setIsSelected] = useState<boolean>(true)

  // Reset heights on window resize (for zoom/scale)
  window.onresize = () => {
    setViewportHeightInPx(window.outerHeight + 200)
    setViewWidthInPx(window.outerWidth)
  }

  return <>
    {
      !!model.length && 
      <>
        <div className="hidden lg:flex h-10 bg-[#00856A] dark:bg-[#212121] text-white items-center justify-end">
          <Switch style={{ paddingRight: "2.5%" }} defaultSelected id="annotationSwitch" isSelected={isSelected} color='secondary' onValueChange={setIsSelected}>
            <span className="text-white">Annotations</span>
          </Switch>
        </div>
        <div className="flex flex-col m-auto" style={{ width: "100vw", maxWidth: viewWidthInPx, margin: "0 auto !important" }}>
          <div style={{ height: modelHeight, maxHeight: viewportHeightInPx }}>
            <SketchfabApi
              model={model[1] ?? model[0]}
              gMatch={props.gMatch}
              images={props.noModelData.images}
              imageTitle={props.noModelData.title} />
          </div>
          <Foot />
        </div>
      </>
    }
    {!model.length &&<section className='w-full h-[calc(100vh-176px)]'>No results</section>}
  </>
}


