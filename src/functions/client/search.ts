import { model } from "@prisma/client"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams } from "next/navigation"
import { Dispatch, SetStateAction } from "react"

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

/**
* Convert "SPRING25" / "FALL24" -> "Spring 2025" / "Fall 2024"
* @param code e.g. "SPRING25" or "FALL24" (case-insensitive)
* @param pivot Two-digit year <= pivot -> 20YY, > pivot -> 19YY (default 69)
*/
export function formatSemester(code: string, pivot = 69): string {
    const m = code.trim().toUpperCase().match(/^(SPRING|FALL)(\d{2})$/)
    if (!m) throw new Error('Expected format "SPRINGYY" or "FALLYY" (e.g., SPRING25).')

    const [, semRaw, yyStr] = m
    const sem = semRaw === 'SPRING' ? 'Spring' : 'Fall'

    const yy = Number(yyStr)
    const year = yy <= pivot ? 2000 + yy : 1900 + yy // 00–69 => 2000–2069, 70–99 => 1970–1999

    return `${sem} ${year}`
}

/**
 * 
 * @param param 
 * @param paramValue 
 * @param params 
 * @param path 
 * @param router 
 */
export const replaceCollectionsSearchParams = (param: string, paramValue: string, params: ReadonlyURLSearchParams, path: string, router: AppRouterInstance) => {
    const writeParams = new URLSearchParams(params)
    writeParams.set(param, paramValue)
    router.replace(`${path}?${writeParams.toString()}`)
}

export const modelerSelectHandler = (selectedModeler: string, params: ReadonlyURLSearchParams, path: string, router: AppRouterInstance, setSelectedModeler: Dispatch<SetStateAction<string>>) => {
    replaceCollectionsSearchParams('modeler', selectedModeler, params, path, router)
    setSelectedModeler(selectedModeler)
}

export const annotatorSelectHandler = (selectedAnnotator: string, params: ReadonlyURLSearchParams, path: string, router: AppRouterInstance, setSelectedAnnotator: Dispatch<SetStateAction<string>>) => {
    replaceCollectionsSearchParams('annotator', selectedAnnotator, params, path, router)
    setSelectedAnnotator(selectedAnnotator)
}

export const semesterSelectHandler = (selectedSemester: string, params: ReadonlyURLSearchParams, path: string, router: AppRouterInstance, setSelectedSemester: Dispatch<SetStateAction<string>>) => {
    replaceCollectionsSearchParams('semester', selectedSemester, params, path, router)
    setSelectedSemester(selectedSemester)
}
