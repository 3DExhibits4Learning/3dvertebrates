/**
 * @file src/components/Search/SearchPageContent.tsx
 * 
 * @fileoverview list of 3D models available on the site
 */

'use client'

// Typical imports
import { useEffect, useState, useRef } from "react"
import { model } from "@prisma/client"
import { getCollectionModels } from "@/functions/server/collections"

// Default imports
import SearchPageModelList from "./SearchPageModelList"
import SubHeader from "./SubHeader"

const getUniqueModelers = (models: model[]): string[] => {
  const uniqueModelers = new Set<string>()
  models.forEach(model => uniqueModelers.add(model.modeled_by as string))
  return Array.from(uniqueModelers)
}

const getUniqueAnnotators = (models: model[]): string[] => {
  const uniqueAnnotators = new Set<string>()
  models.forEach(model => { if (model.annotator) uniqueAnnotators.add(model.annotator as string) })
  return Array.from(uniqueAnnotators)
}

// Main Component
const SearchPageContent = () => {

  const siteReadyModels = useRef<model[]>()

  const [modeledByList, setModeledByList] = useState<string[]>()
  const [annotatedByList, setAnnotatedByList] = useState<string[]>()
  const [selectedModeler, setSelectedModeler] = useState<string>('All')
  const [selectedAnnotator, setSelectedAnnotator] = useState<string>('All')

  useEffect(() => {

    const getModels = async () => {
      const models = JSON.parse(await getCollectionModels())

      if (typeof models !== 'string') {
        siteReadyModels.current = models as model[]
        let a = getUniqueModelers(models)
        let b = getUniqueAnnotators(models)
        a.unshift('All')
        b.unshift('All')
        setModeledByList(a)
        setAnnotatedByList(b)
      }
    }

    getModels()

  }, [])

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
          setSelectedAnnotator={(setSelectedAnnotator)}/>
        <br />
        <SearchPageModelList models={siteReadyModels.current as model[]} selectedModeler={selectedModeler} selectedAnnotator={selectedAnnotator} />
        <br />
      </>
    }
  </>
}

export default SearchPageContent