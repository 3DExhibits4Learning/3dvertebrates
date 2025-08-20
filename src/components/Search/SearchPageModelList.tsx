/**
 * @file src\components\Search\SearchPageModelList.tsx
 * 
 * @fileoverview list of models available given any search parameters
 */

// Typical imports
import { model } from '@prisma/client'

// Default imports
import Card from './Card'

export default function SearchPageModelList(props: {models: model[], selectedModeler: string | undefined, selectedAnnotator: string | undefined}){

  // Declartations
  const models = props.models
  const selectedModeler: string | undefined = props.selectedModeler
  const selectedAnnotator = props.selectedAnnotator
  var filteredModels: model[]

  /**
   * 
   * @param selection 
   * @returns 
   */
  const selectionCheck = (selection: string | undefined) => {
    if (selection === 'All' || selection === '' || selection === undefined) return true
    else return false
  }

  // Convert this to function and export
  filteredModels = models.filter(model =>
    (selectionCheck(props.selectedModeler) || model.modeled_by === selectedModeler) &&
    (selectionCheck(props.selectedAnnotator) || model.annotator === selectedAnnotator)
  )

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