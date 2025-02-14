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
import { Switch } from "@nextui-org/react"
import { isMobileOrTablet } from '../../functions/utils/isMobile'
import { GbifResponse, GbifImageResponse } from '@/interface/interface'

// Default Imports
import Inaturalist from '@/components/Collections/iNaturalist'
import dynamic from 'next/dynamic'
import ComponentDivider from '@/components/Shared/ComponentDivider'
import OccurrenceSwiper from "@/components/Collections/GbifSwiper"
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
  var modelHeight = isMobileOrTablet() ? "calc(100vh - 160px)" : "calc(100vh - 104.67px)"

  // Variable heights based on window
  const [viewWidthInPx, setViewWidthInPx] = useState(window.outerWidth)
  const [viewportHeightInPx, setViewportHeightInPx] = useState(window.outerHeight + 200)
  const [swiperHeight, setSwiperHeight] = useState(window.outerHeight - 96)
  const [imgHeight, setImageHeight] = useState(window.outerHeight - 208)

  // Annotations selected state
  const [isSelected, setIsSelected] = useState<boolean>(true)

  // Reset heights on window resize (for zoom/scale)
  window.onresize = () => {
    setViewportHeightInPx(window.outerHeight + 200)
    setViewWidthInPx(window.outerWidth)
    setSwiperHeight(window.outerHeight)
    setImageHeight(window.outerHeight - 112)
  }

  return (
    <>
      {
        !!model.length && props.gMatch.hasInfo &&
        <>
          <div className="hidden lg:flex h-10 bg-[#00856A] dark:bg-[#212121] text-white items-center justify-between ">
            <p style={{ paddingLeft: "2.5%" }}>Also on this page: <a className="mx-4" href="#imageSection"><u>Images</u></a> <a href="#mapSection"><u>iNaturalist Observations</u></a></p>
            <div className='flex mr-4'>
              <Switch style={{ paddingRight: "2.5%" }} defaultSelected id="annotationSwitch" isSelected={isSelected} color='secondary' onValueChange={setIsSelected}>
                <span className="text-white">Annotations</span>
              </Switch>
            </div>
          </div>
          <div className="flex flex-col m-auto" style={{ width: "100vw", maxWidth: viewWidthInPx, margin: "0 auto !important" }}>
            <div style={{ height: modelHeight, maxHeight: viewportHeightInPx }}>
              <SketchfabApi
                model={model[0]}
                gMatch={props.gMatch}
                images={props.noModelData.images}
                imageTitle={props.noModelData.title}
              />
            </div>
            {/* Tailwind utility class "mb" was literally broken here. Anything less than mb-4 was treated as zero margin. Only style would work. */}
            <div id="imageSection" style={{ marginBottom: "14px" }} className="mt-4">
              <ComponentDivider title={props.noModelData.title} />
            </div>
            <div style={{ maxHeight: viewportHeightInPx }}>
              <OccurrenceSwiper
                info={props.noModelData.images} swiperHeight={swiperHeight} imageHeight={imgHeight} />
            </div>
            <div className="mt-4">
              <ComponentDivider title={'Observations from iNaturalist'} />
            </div>
            <div style={{ height: "calc(100vh - 176px)", maxHeight: viewportHeightInPx, minHeight: '750px' }}>
              <Inaturalist activeSpecies={props.specimenName} />
            </div>
            <Foot />
          </div>
        </>
      }
      {
        !model.length && props.gMatch.hasInfo &&
        <div className="flex flex-col m-auto" style={{ width: "100vw", maxWidth: viewWidthInPx, margin: "0 auto !important" }}>
          {/* lg breakpoint in tailwind not working here, hence id and hard coded breakpoint in globals */}
          <div id='tailwindBroken' className="h-14 !lg:h-8 bg-[#00856A] dark:bg-[#3d3d3d] text-white flex justify-center items-center text-center">
            <p><i>{`"${decodeURI(props.specimenName)}" `}</i>{`${props.noModelData.title}`}</p>
          </div>
          <div style={{ maxHeight: viewportHeightInPx }}>
            <OccurrenceSwiper
              info={props.noModelData.images} swiperHeight={swiperHeight} imageHeight={imgHeight} />
          </div>
          <div className="mt-4">
            <ComponentDivider title='iNaturalist Observations' />
          </div>
          <div style={{ height: "calc(100vh - 176px)", maxHeight: viewportHeightInPx }}>
            <Inaturalist activeSpecies={props.specimenName} />
          </div>
          <Foot />
        </div>
      }
    </>
  )
}


