/**
 * @file src/components/Search/SearchPageContent.tsx
 * 
 * @fileoverview list of 3D models available on the site
 */

'use client'

// Typical imports
import { useEffect, useState } from "react"
import { model } from "@prisma/client"
import { useSearchParams } from "next/navigation"
import { filterModelsBySemester, getUniqueAnnotators, getUniqueModelers } from "@/functions/client/search"

// Default imports
import SearchPageModelList from "./SearchPageModelList"
import SubHeader from "./SubHeader"

// Main Component
export default function SearchPageContent(props: { models: string, semesters: string[] }) {
  // Parse models
  const siteReadyModels = JSON.parse(props.models) as model[]
  const searchParams = useSearchParams()
  const semesterParameter = searchParams.get('semester')
  const modeler = searchParams.get('modeler')
  const annotator = searchParams.get('annotator')
  const semesterFilteredModels = semesterParameter && props.semesters.includes(semesterParameter) && semesterParameter !== "All" ?
    siteReadyModels.filter(m => m.semester.toLowerCase() === semesterParameter.toLowerCase()) : siteReadyModels
  const modelers = ["All", ...getUniqueModelers(semesterFilteredModels)]
  const annotators = ["All", ...getUniqueAnnotators(semesterFilteredModels)]

  // States
  const [modelsFilteredBySemester, setModelsFilteredBySemester] = useState<model[]>(semesterFilteredModels)
  const [selectedSemester, setSelectedSemester] = useState<string>(props.semesters.includes(semesterParameter as string) ? semesterParameter as string : 'All')
  const [selectedModeler, setSelectedModeler] = useState<string>(modeler && modelers.includes(modeler) ? modeler : 'All')
  const [selectedAnnotator, setSelectedAnnotator] = useState<string>(annotator && annotators.includes(annotator) ? annotator : 'All')

  // Reset filtered models by semester (thus updating the modelers and annotators) when the semester changes
  useEffect(() => setModelsFilteredBySemester(props.semesters.includes(selectedSemester) ? filterModelsBySemester(siteReadyModels, selectedSemester) : siteReadyModels), [selectedSemester])

  return <>
    <SubHeader
      modeledByList={modelers}
      annotatedByList={annotators}
      modeler={selectedModeler}
      annotator={selectedAnnotator}
      semester={selectedSemester}
      setSelectedModeler={setSelectedModeler}
      setSelectedAnnotator={setSelectedAnnotator}
      setSelectedSemester={setSelectedSemester}
      semesters={props.semesters} />
    <br />
    <SearchPageModelList models={modelsFilteredBySemester} selectedModeler={selectedModeler} selectedAnnotator={selectedAnnotator} selectedSemester={selectedSemester} />
    <br />
  </>
}