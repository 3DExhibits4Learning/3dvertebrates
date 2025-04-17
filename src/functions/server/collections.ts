/**
 * @file src\functions\server\collections.ts
 * 
 * @fileoverview collections server actions
 */

'use server'

// Typical imports
import { serverActionErrorHandler, catchMessage } from "./error"
import { fetchGbifVernacularNames, fetchGbifProfile, fetchWikiSummary } from "./fetchFunctions"
import { getSoftwares } from "./queries"
import { model } from "@prisma/client"
import { annotationWithModel } from "@/interface/interface"

// SINGLETON
import prisma from "../utils/prisma"

// PATH
const path = 'src/functions/server/collections.ts'

/**
 * 
 * @param uid 
 * @param usageKey 
 * @param specimenName 
 * @returns 
 */
export const getCollectionMetadata = async (uid: string, usageKey: number, specimenName: string) => {
    try {
        // Await all promises
        const promises = [fetchGbifVernacularNames(usageKey), getSoftwares(uid), fetchGbifProfile(usageKey), fetchWikiSummary(specimenName)]
        const results = await Promise.all(promises).catch(e => serverActionErrorHandler(path, e.message, 'Promise.all(promises)', "Couldn't get collections metadata"))

        // Typical return
        return results
    }
    // Typical catch
    catch (e: any) { return catchMessage(e.message) }
}

export const getCollectionModels = async () => {
    try {
        // Get models and annotations
        const models = await prisma.model.findMany({orderBy: {spec_name: 'asc'}}).catch(e => serverActionErrorHandler(path, e.message, 'getAllModels()', "Coulnd't get models")) as model[]
        const modelAnnotations = await prisma.annotations.findMany({where: {annotation_type: 'model'}, include: {model_annotation: true}}).catch(e => serverActionErrorHandler(path, e.message, 'getModelAnnotations()', "Coulnd't get modelAnnotations")) as annotationWithModel[]

        // Boolean arrows
        const isSiteReadyModel = (model: model) => model.site_ready && model.annotationPosition && model.base_model && model.modelApproved && model.thumbnail
        const isUnannotatedSiteReadyModel = (model: model) => model.annotator === null && !model.annotated && !model.annotationsApproved
        const isAnnotatedSiteReadyModel = (model: model) => model.annotator && model.annotationsApproved && model.annotated
        const isAnnotationModel = (model: model) => model.site_ready && !model.base_model && model.modelApproved && model.thumbnail
        const isUsedAnnotationModel = (model: model) => modelAnnotations.some(annotationModel => annotationModel.model_annotation.uid === model.uid)
        const isBetaSiteReadyModel = (model: model) => model.site_ready && (model.base_model && model.modelApproved) || (!model.base_model && isUsedAnnotationModel)

        // Site ready models - used annotaion models, site ready annotated models or unannotated site ready models
        const siteReadyModels = models.filter(model => isAnnotationModel(model) && isUsedAnnotationModel(model) || isSiteReadyModel(model) && (isAnnotatedSiteReadyModel(model) || isUnannotatedSiteReadyModel(model)))
        const betaReadyModels = models.filter(model => isBetaSiteReadyModel(model))

        // Typical return
        return JSON.stringify(betaReadyModels)
    }
    // Typical catch
    catch (e: any) { return catchMessage(e.message) }
}