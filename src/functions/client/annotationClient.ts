/**
 * @file src/functions/client/annotationClient.ts
 * 
 * @fileoverview Annotation Client functions
 * 
 * @todo update param descriptions
 */

'use client'

// Typical imports
import { Dispatch } from "react"
import { annotationClientSpecimen, annotationsAndPositions, studentsAssignmentsAndModels } from "@/interface/interface"
import { dispatch } from "@/interface/interface"

// Default imports
import ModelAnnotations from "@/classes/ModelAnnotationsClass"
import { model } from "@prisma/client"

// New model selected/db update dispatch action interface
interface newModelSelectedOrDbUpdate extends dispatch{
    modelAnnotations: ModelAnnotations,
    firstAnnotationPosition: number[]
}

// Specimen data update interface
interface newModelClicked extends dispatch{
    model: model
}

/**
 * 
 * @returns the index of the active annotation for the selected model in the annotation client
 */
export const getIndex = (apData: annotationsAndPositions) => {

    // Index
    var index

    // If else block to determine the correct index
    if (!apData.numberOfAnnotations && !apData.firstAnnotationPosition || apData.activeAnnotationIndex == 1) index = 1
    else if (!apData.numberOfAnnotations) index = 2
    else if (apData.numberOfAnnotations && apData.activeAnnotationIndex !== 'new') index = apData.activeAnnotationIndex
    else if (apData.activeAnnotationIndex === 'new') index = apData.numberOfAnnotations + 2

    // Return
    return index
}

/**
 * 
 * @param students array of students, assignments and models (see type)
 * @returns email of student who is assigned the model with uid from specimenData object
 */
export const findStudentEmail = (students: studentsAssignmentsAndModels[], specimenData: annotationClientSpecimen) => 
    students.find(student => student.assignment.find(assignment => assignment.uid === specimenData.uid))?.email

/**
 * 
 * @param students array of students, assignments and models (see type)
 * @param email email of student who to be assigned the currently selected model for annotation
 * @returns arguments for assignAnnotation()
 */
export const getAssignmentArgs = (specimenData: annotationClientSpecimen, name: string | null | undefined, students?: studentsAssignmentsAndModels[], email?: string | null) => specimenData.annotator ?
    [specimenData.uid, null, findStudentEmail(students as studentsAssignmentsAndModels[], specimenData)] :
    [specimenData.uid, (students as studentsAssignmentsAndModels[]).find(student => student.email === email)?.name, email]

/**
 * 
 * @returns data transfer label for assignAnnotation()
 */
export const getAssignmentLabel = (specimenData: annotationClientSpecimen) => specimenData.annotator ? 'Unassigning model to student for annotation' : 'Assigning model to student for annotation'

/**
 * 
 * @description dispatch based on active annotation index
 */
export const activeAnnotationChangeHandler = (apData: annotationsAndPositions, apDispatch: Dispatch<dispatch>) => {
    if (apData.activeAnnotationIndex === 1) apDispatch({ type: 'activeAnnotationIndex=1' })
    else if (typeof (apData.activeAnnotationIndex) === 'number' && apData.annotations) apDispatch({ type: 'activeAnnotationIndex>1' })
}

/**
 * 
 * @returns first annotation position of the active specimen if it exists, or an empty string if not
 */
export const getFirstAnnotationPosition = async (specimenData: annotationClientSpecimen) => await fetch(`/api/annotations?uid=${specimenData.uid}`, { cache: 'no-store' })
    .then(res => res.json()).then(json => {
        if (json.response) return JSON.parse(json.response)
        else return ''
    })

/**
 * 
 * @description get relevant data and dispatch when a either a model is selected or an annotation record is created/updated
 */
export const modelOrAnnotationChangeHandler = async (specimenData: annotationClientSpecimen, apDispatch: Dispatch<newModelSelectedOrDbUpdate>) => {
    if(!specimenData.uid) return
    const modelAnnotations = await ModelAnnotations.retrieve(specimenData.uid as string)
    const annotationPosition = await getFirstAnnotationPosition(specimenData)
    apDispatch({ type: 'newModelSelectedOrDbUpdate', modelAnnotations: modelAnnotations, firstAnnotationPosition: annotationPosition })
}

/**
 * 
 * @param modelClicked indicates if a model was selected or closed on the accordion
 * @param model 3D model database record
 * @param apDispatch annotationsAndPositionsDispatch
 * @param sdDispatch specimenDataDispatch
 */
export const modelClickHandler = (modelClicked: boolean, model: model, apDispatch: Dispatch<dispatch>, sdDispatch: Dispatch<newModelClicked | dispatch>, admin: boolean) => {
    if(admin) return
    if (modelClicked) {
        // First annotation position MUST be loaded before BotanistRefWrapper, so it is set to undefined while model data is set
        apDispatch({ type: 'newModelClicked' })
        sdDispatch({ type: 'newModelClicked', model: model })
    }
    else sdDispatch({ type: 'modelUndefined' })
}
