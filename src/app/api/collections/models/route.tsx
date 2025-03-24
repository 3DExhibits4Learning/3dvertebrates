/**
 * @file src/app/api/collections/models/route.tsx
 * 
 * @fileoverview handler to obtain site ready models
 * 
 * @todo convert to server action
 */

// Typical imports
import { getAllModels, getModelAnnotations } from "@/functions/server/queries"
import { model } from "@prisma/client"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"
import { annotationWithModel } from "@/interface/interface"

// Default imports
import routeHandlerTypicalResponse from "@/functions/server/typicalSuccessResponse"

// DYNAMIC ROUTE
export const dynamic = 'force-dynamic'

// GLOBAL ROUTE
const route = 'src/app/api/collections/models/route.tsx'

/**
 * 
 * @returns typical response with siteReadyModels (or error message onCatch)
 */
export async function GET() {

  try {

    // Get models and annotations
    const models = await getAllModels().catch(e => routeHandlerErrorHandler(route, e.message, 'getAllModels()', "Coulnd't get models", 'GET')) as model[]
    const modelAnnotations = await getModelAnnotations().catch(e => routeHandlerErrorHandler(route, e.message, 'getModelAnnotations()', "Coulnd't get modelAnnotations", 'GET')) as annotationWithModel[]

    // Boolean arrows
    const isSiteReadyModel = (model: model) => model.site_ready && model.annotationPosition && model.base_model && model.modelApproved && model.thumbnail
    const isUnannotatedSiteReadyModel = (model: model) => model.annotator === null && !model.annotated && !model.annotationsApproved
    const isAnnotatedSiteReadyModel = (model: model) => model.annotator && model.annotationsApproved && model.annotated
    const isAnnotationModel = (model: model) => model.site_ready && !model.base_model && model.modelApproved && model.thumbnail
    const isUsedAnnotationModel = (model: model) => modelAnnotations.some(annotationModel => annotationModel.model_annotation.uid === model.uid)

    // Beta Boolean arrows
    const isBetaSiteReadyModel = (model: model) => model.site_ready && (model.base_model && model.modelApproved) || (!model.base_model && isUsedAnnotationModel)



    // Site ready models - used annotaion models, site ready annotated models or unannotated site ready models
    const siteReadyModels = models.filter(model => isAnnotationModel(model) && isUsedAnnotationModel(model) || isSiteReadyModel(model) && (isAnnotatedSiteReadyModel(model) || isUnannotatedSiteReadyModel(model)))
    const betaReadyModels = models.filter(model => isBetaSiteReadyModel(model))

    // Typical return
    return routeHandlerTypicalResponse("Models obtained", betaReadyModels)
  }
  // Typical catch
  catch (e: any) { return routeHandlerTypicalCatch(e.message) }
}