/**
 * @file src\components\Search\SearchPageModelList.tsx
 * 
 * @fileoverview list of models available given any search parameters
 */

// Typical imports
import { model } from '@prisma/client'
import { getFilteredModels } from '@/functions/client/search'

// Default imports
import Card from './Card'

// Main JSX
export default function SearchPageModelList(props: {models: model[], selectedModeler: string | undefined, selectedAnnotator: string | undefined, selectedSemester: string | undefined}) {

  // Declartations
  const models = props.models
  const selectedModeler = props.selectedModeler
  const selectedAnnotator = props.selectedAnnotator
  const filteredModels = getFilteredModels(models, selectedModeler, selectedAnnotator)

  // Extract sub components
  return <>
    {
      filteredModels && filteredModels.length === 0 &&
      <div className='h-[35rem] rounded mx-auto flex items-center justify-center'>
        <p className='text-2xl px-5'>No models found matching the current filters. Try adjusting your filter settings for broader results.</p>
      </div>
    }

    <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-5'>
      {filteredModels && filteredModels.map((model: model) => <Card key={model.uid} model={model}/>)}
    </section >
  </>
}