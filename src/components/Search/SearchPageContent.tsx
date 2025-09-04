/**
 * @file src/components/Search/SearchPageContent.tsx
 * 
 * @fileoverview list of 3D models available on the site
 */

'use client'

// Typical imports
import { useState } from "react"
import { model } from "@prisma/client"
import { getUniqueAnnotators, getUniqueModelers } from "@/functions/client/search"

// Default imports
import SearchPageModelList from "./SearchPageModelList"
import SubHeader from "./SubHeader"
import { useSearchParams } from "next/navigation"

// Main Component
export default function SearchPageContent(props: { models: string }) {
  // Parse models
  const siteReadyModels = JSON.parse(props.models) as model[]
  const searchParams = useSearchParams()
  const annotator = searchParams.get('annotator')
  const modeler = searchParams.get('modeler')

  // Get unique modelers and annotators
  let uniqueModelers = getUniqueModelers(siteReadyModels)
  let uniqueAnnotators = getUniqueAnnotators(siteReadyModels)

  // States
  const modeledByList= ['All', ...uniqueModelers]
  const annotatedByList = ['All', ...uniqueAnnotators]
  const [selectedModeler, setSelectedModeler] = useState<string>(uniqueModelers.includes(modeler as string) ? modeler as string : 'All')
  const [selectedAnnotator, setSelectedAnnotator] = useState<string>(uniqueAnnotators.includes(annotator as string) ? annotator as string : 'All')

  return <>
    {
      modeledByList && annotatedByList &&
      <>
        <SubHeader
          modeledByList={modeledByList}
          annotatedByList={annotatedByList}
          modeler={selectedModeler}
          annotator={selectedAnnotator}
          setSelectedModeler={setSelectedModeler}
          setSelectedAnnotator={(setSelectedAnnotator)} />
        <br />
        <SearchPageModelList models={siteReadyModels} selectedModeler={selectedModeler} selectedAnnotator={selectedAnnotator} />
        <br />
      </>
    }
  </>
}