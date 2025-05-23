import { model } from "@prisma/client"
import { annotationWithModel } from "@/interface/interface"

/**
 * 
 * @param model 3d model
 * @returns boolean value indicating if the model is an approved, site ready base model with a thumbnail
 */
export const isAnnotationModel = (model: model) => model.site_ready && !model.base_model && model.modelApproved && model.thumbnail

/**
 * 
 * @param model 3d mdoel
 * @param modelAnnotations a 3d model annotation record with the model_annotation record included
 * @returns boolean value indicating if a 3d model has been used as an annotation model
 */
export const isUsedAnnotationModel = (model: model, modelAnnotations: annotationWithModel[] ) => modelAnnotations.some(annotationModel => annotationModel.model_annotation.uid === model.uid)