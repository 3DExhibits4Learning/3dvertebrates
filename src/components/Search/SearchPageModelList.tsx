/**
 * @file src\components\Search\SearchPageModelList.tsx
 * 
 * @fileoverview list of models available given any search parameters
 */

// Typical imports
import { handleImgError } from '@/functions/utils/imageHandler'
import { SyntheticEvent } from 'react'
import { model } from '@prisma/client'
import { toUpperFirstLetter } from '@/functions/utils/toUpperFirstLetter'
import { getNfsPath} from '@/functions/client/utils'

// Default imports
import noImage from '../../../public/noImage.png'

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

    <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-5 gap-4 mx-5'>
      {
        filteredModels && filteredModels.map((model: model, index: number) => {
          return <div key={index} className='noselect'>
              <article className='rounded-md overflow-hidden mx-1'>
                <section className='rounded shadow-md mx-auto'>
                  <a href={model.base_model ? "/collections/" + (model as model).spec_name : "/collections/" + (model as model).spec_name + `?annotation=${model.uid}`} tabIndex={-1}>
                    <img
                      alt={'Image of ' + (model as model).spec_name}
                      role='button'
                      src={model.thumbnail ? getNfsPath(model.thumbnail) : ''}
                      className='w-full h-[calc(100vh-275px)] min-h-[25rem] max-h-[30rem] object-cover relative z-5 rounded-t-md'
                      onError={(e: SyntheticEvent<HTMLImageElement, Event>) => { handleImgError(e.currentTarget, noImage) }}/>
                  </a>
                </section>
                <section className='bg-[#98B8AD] dark:bg-[#3d3d3d] h-[5rem] max-h-[calc(100vh-300px)*0.2] opacity-[0.99] px-5 py-3 rounded-b-md text-center relative z-10 flex flex-col justify-center items-center space-y-1.5 mt-[-1px]'>
                  <section className='flex items-center space-x-0.5rem'>
                    <a
                      href={"/collections/" + (model as model).spec_name}
                      rel='noopener noreferrer'
                      className='text-[#004C46] dark:text-[#C3D5D1] text-xl'
                    >
                      <i className='text-lg'>{(model as model).spec_name.charAt(0).toUpperCase() + (model as model).spec_name.slice(1)}</i>
                    </a>
                  </section>
                  <section className='text-sm text-black dark:text-white'>
                    {toUpperFirstLetter((model as model).pref_comm_name)}
                  </section>
                </section>
              </article>
            </div>
        })
      }
    </section >
  </>
}