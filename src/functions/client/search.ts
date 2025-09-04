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