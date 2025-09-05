import { model } from "@prisma/client"

/**
 * 
 * @param models 
 * @returns 
 */
export const getUniqueModelers = (models: model[]): string[] => {
  const uniqueModelers = new Set<string>()
  models.forEach(model => uniqueModelers.add(model.modeled_by as string))
  return Array.from(uniqueModelers)
}

/**
 * 
 * @param models 
 * @returns 
 */
export const getUniqueAnnotators = (models: model[]): string[] => {
  const uniqueAnnotators = new Set<string>()
  models.forEach(model => { if (model.annotator) uniqueAnnotators.add(model.annotator as string) })
  return Array.from(uniqueAnnotators)
}

/**
 * 
 * @param models 
 * @returns 
 */
export const getUniqueSemesters = (models: model[]): string[] => {
  const uniqueSemesters = new Set<string>()
  models.forEach(model => uniqueSemesters.add(model.semester as string))
  return Array.from(uniqueSemesters)
}

  /**
   * 
   * @param selection 
   * @returns 
   */
  export const selectionCheck = (selection: string | undefined) => {
    if (selection === 'All' || selection === '' || selection === undefined) return true
    else return false
  }

  /**
   * 
   * @param models 
   * @param selectedSemester 
   * @returns 
   */
  export const filterModelsBySemester = (models: model[], selectedSemester: string | undefined): model[] => selectedSemester === 'All' ? models : models.filter(m => m.semester === selectedSemester)

  /**
   * 
   * @param models 
   * @param selectedModeler 
   * @param selectedAnnotator 
   * @returns 
   */
  export const getFilteredModels = (models: model[], selectedModeler: string | undefined, selectedAnnotator: string | undefined): model[] => {
    return models.filter(model =>
      (selectionCheck(selectedModeler) || model.modeled_by === selectedModeler) &&
      (selectionCheck(selectedAnnotator) || model.annotator === selectedAnnotator)
    )
  }