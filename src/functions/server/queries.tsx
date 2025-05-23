/**
 * @file /api/queries.tsx
 * @fileoverview database queries used throughout the application
 */

import { model } from "@prisma/client";
import prisma from '@/functions/utils/prisma'
import { Prisma } from "@prisma/client";

// Legacy export (so all the resulting imports don't need to be changed)
export function prismaClient() {
  return prisma
}

/***** USER QUERIES *****/

/**
 * @function getAuthorizedUsers
 * @description returns an array of authorized username objects
 * 
 */
export async function getAuthorizedUsers() {
  const users = await prisma.authorized.findMany()
  return users
}

/**
 * @function getUserById
 * @description returns a user object by ID
 * 
 * @param {id} id of the user
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id: id } })
  return user
}

/**
 * @function getAccounts
 * @description return an array of providers corresponding to the userId argument
 * 
 */
export const getAccountProviders = async (userId: string,) => {
  const accountsObj = await prisma.account.findMany({
    where: { userId: userId },
  });
  return accountsObj
}

/**
 * @function getAccount
 * @description returns a user account based on the userId and the provider
 * 
 */
export const getAccount = async (id: string, provider: string) => {

  const account = await prisma.account.findFirst({
    where: {
      userId: id,
      provider: provider,
    },
  })

  return account
}

/***** MODEL QUERIES *****/

/**
 * @function getFullModels
 * @description get all full models
 * 
 */
export async function getFullModels() {
  const models = await prisma.model.findMany({
    include: { software: true, tags: true, assignment: true }
  })
  return models
}

/**
 * @function getModelUid
 * @description returns a list of models matching the species parameter
 * 
 * @param {string} species of the model
 */
export async function getModel(species: string) {
  const models = await prisma.model.findMany({
    where: { spec_name: species, site_ready: true, base_model: true }
  })

  return models
}

// export async function getModel(species: string) {
//   const models = await prisma.model.findMany({
//     where: { 
//       OR: [
//         {spec_name: species},
//         {pref_comm_name: species}  
//       ],
//       AND:[{site_ready: true, base_model: true}]
//     }
//   })

//   return models
// }

/**
 * @function getFullModelByUid
 * @description returns a full model (with tags and software) with the corresponding UID
 * 
 * @param {string} uid of the model
 */
export async function getFullModelByUid(uid: string) {
  const models = await prisma.model.findUnique({
    where: { uid: uid },
    include: { software: true, tags: true }
  })

  return models
}

/**
 * @function getModelThumbmail
 * @description returns the path of a thumbnail for a 3D model
 * 
 * @param {string} uid of the model
 */
export async function getModelThumbnail(uid: string) {
  const models = await prisma.model.findUnique({
    where: { uid: uid },
    select: { thumbnail: true }
  })

  return models
}

/**
* @function getSoftwares
* @description returns a list of all softwares used for the uid parameter
* 
* @param {string} uid of the model
*/
export async function getSoftwares(uid: string) {
  const softwares = await prisma.software.findMany({
    where: { uid: uid }
  });

  return softwares;
}

/**
 * @function getAllSiteReadyModels
 * @description returns a list of all models labeled as site_ready from the database.
 * 
 * @returns {Promise<model[]>}
 */
export const getAllSiteReadyModels = async (development: boolean): Promise<model[]> => {

  const whereClause = development ? { site_ready: true, base_model: true, thumbnail: { not: null } } : 
  { site_ready: true, base_model: true, annotator: { not: null }, annotated: true, thumbnail: { not: null }, annotationsApproved: true }

  const models = await prisma.model.findMany({
    where: whereClause,
    orderBy: {
      spec_name: 'asc'
    }
  })

  return models as model[]
}

/**
 * @function getAllModels
 * @description returns all 3D models from the database
 * 
 * @returns {Promise<model[]>}
 */
export const getAllModels = async ()=> {return await prisma.model.findMany({orderBy: {spec_name: 'asc'}})}

/**
 * @function getModelAnnotations
 * @description returns all annotations records of 'model' annotation_type; includes model_annotation record
 * 
 * @returns {Promise<model[]>}
 */
export const getModelAnnotations = async ()=> {return await prisma.annotations.findMany({where: {annotation_type: 'model'}, include: {model_annotation: true}})}

/**
 * @function getModelsWithoutThumbnails
 * @description returns a list of all models without thumbnails.
 * 
 * @returns {Promise<model[]>}
 */
export const getModelsWithoutThumbnails = async (): Promise<model[]> => {

  const models = await prisma.model.findMany({
    where: {
      thumbnail: null,
      base_model: true
    },
    orderBy: {
      spec_name: 'asc'
    }
  })

  return models as model[]
}

/**
 * @function getModelsWithThumbnails
 * @description returns a list of all models with thumbnails.
 * 
 * @returns {Promise<model[]>}
 */
export const getModelsWithThumbnails = async (): Promise<model[]> => {

  const models = await prisma.model.findMany({
    where: {
      thumbnail: { not: null },
      base_model: true
    },
    orderBy: {
      spec_name: 'asc'
    }
  })

  return models as model[]
}

/**
 * @function getAllAnnotationModels
 * @description returns all models marked as not base models and site ready
 * 
 * @returns {Promise<model[]>}
 */
export const getAllAnnotationModels = async (): Promise<model[]> => {

  const models = await prisma.model.findMany({
    where: { site_ready: true, base_model: false },
    orderBy: {
      spec_name: 'asc'
    }
  })

  return models as model[]
};

/**
 * @function updateModelAnnotator
 * @description update the annotator for a 3D model
 * 
 */
export const updateModelAnnotator = async (uid: string, student: string | null) => {
  const models = await prisma.model.update({
    where: { uid: uid },
    data: { annotator: student }
  })
  return models
}

/**
 * @function updateThumbUrl
 * @description update thumbnail url of the model with the corresponding confirmation string (preferably) or the model uid.
 * 
 */
export const updateThumbUrl = async (thumbUrl: string, uid: string) => {
  await prisma.model.update({ where: { uid: uid }, data: { thumbnail: thumbUrl } })
}

/**
 * @function delete3DModel
 * @description deletes a 3D Model
 * 
 */
export const delete3DModel = async (uid: string) => {
  const deletedModel = await prisma.model.delete({
    where: { uid: uid }
  })
  return deletedModel
}


/***** ANNOTATION QUERIES *****/

/**
 * @function getAnnotations
 * @description returns a list of annotations matching the uid parameter in order of annotation number
 * 
 * @param {string} uid of the annotated model
 */
export async function getAnnotations(uid: string) {
  const annotations = await prisma.annotations.findMany({
    where: { uid: uid },
    orderBy: { annotation_no: 'asc' }
  })

  return annotations;
}


/**
* @function getCitations
* @description returns a list of photo annotations (and corresponding citation info) matching the url parameter
* 
* @param {string} uid of the annotated model
*/
export async function getCitations(url: string) {
  const citation = await prisma.photo_annotation.findMany({
    where: { url: url }
  });

  return citation;
}

/**
* @function getPhotoAnnotation
* @description returns a unique photo annotation based on id
* 
* @param {string} annotation_id of the annotated model
*/
export async function getPhotoAnnotation(id: string) {
  const annotation = await prisma.photo_annotation.findUnique({
    where: { annotation_id: id }
  });

  return annotation;
}

/**
* @function getVideoAnnotation
* @description returns a unique video annotation based on id
* 
* @param {string} annotation_id of the annotated model
*/
export async function getVideoAnnotation(id: string) {
  const annotation = await prisma.video_annotation.findUnique({
    where: { annotation_id: id }
  });

  return annotation;
};

/**
* @function getModelAnnotation
* @description returns a unique model annotation based on id
* 
* @param {string} annotation_id of the annotated model
*/
export async function getModelAnnotation(id: string) {
  const annotation = await prisma.model_annotation.findUnique({
    where: { annotation_id: id }
  });

  return annotation;
}

/**
 * @function insertFirstAnnotationPosition
 * @description returns a user account based on the userId and the provider
 * 
 */
export const insertFirstAnnotationPosition = async (uid: string, position: string) => {

  const update = await prisma.model.update({
    where: {
      uid: uid
    },
    data: {
      annotationPosition: position
    }
  })
  return update
}

/**
 * @function getFirstAnnotationPostion
 * @description returns a user account based on the userId and the provider
 * 
 */
export const getFirstAnnotationPostion = async (uid: string) => {

  const model = await prisma.model.findUnique({
    where: {
      uid: uid
    }
  })
  return model?.annotationPosition
}

/**
 * @function insertFirstAnnotationPosition
 * @description returns a user account based on the userId and the provider
 * 
 */
export const insertAnnotationPosition = async (uid: string, position: string) => {

  const update = await prisma.model.update({
    where: {
      uid: uid
    },
    data: {
      annotationPosition: position
    }
  })
  return update
}

/**
 * @function createAnnotation
 * @description creates a database record for a 3d model annotation
 * 
 */
export const createAnnotation = async (uid: string, position: string, url: string, annotation_no: number, annotation_type: string, annotation_id: string, title: string) => {

  const newAnnotation = await prisma.annotations.create({
    data: {
      uid: uid,
      position: position,
      url: url,
      annotation_no: annotation_no,
      annotation_id: annotation_id,
      annotation_type: annotation_type,
      title: title
    },
  })
  return newAnnotation
}

/**
 * @function updateAnnotation
 * @description updates a database record for a 3d model annotation
 * 
 */
export const updateAnnotation = async (uid: string, position: string, annotation_type: string, annotation_id: string, title: string, url?: string) => {

  const updatedAnnotation = await prisma.annotations.update({
    where: {
      annotation_id: annotation_id
    },
    data: {
      uid: uid,
      position: position,
      url: url,
      annotation_type: annotation_type,
      title: title
    },
  })
  return updatedAnnotation
}

/**
 * @function createPhotoAnnotation
 * @description creates a database record for a 3d model photo annotation
 * 
 */
export const createPhotoAnnotation = async (url: string, author: string, license: string, annotator: string, annotation: string, annotation_id: string, website?: string, title?: string) => {

  const newAnnotation = await prisma.photo_annotation.create({
    data: {
      url: url,
      author: author,
      license: license,
      annotator: annotator,
      annotation_id: annotation_id,
      annotation: annotation,
      website: website ? website : '',
      title: title ? title : '',
    }
  })
  return newAnnotation
}

/**
 * @function udpatePhotoAnnotation
 * @description creates a database record for a 3d model photo annotation
 * 
 */
export const updatePhotoAnnotation = async (url: string, author: string, license: string, annotator: string, annotation: string, annotation_id: string, website?: string, title?: string) => {

  const updatedAnnotation = await prisma.photo_annotation.update({
    where: {
      annotation_id: annotation_id
    },
    data: {
      url: url,
      author: author,
      license: license,
      annotator: annotator,
      annotation: annotation,
      website: website ? website : '',
      title: title ? title : '',
    }
  })
  return updatedAnnotation
}

/**
 * @function createVideoAnnotation
 * @description creates a database record for a 3d model video annotation
 * 
 */
export const createVideoAnnotation = async (url: string, length: string, id: string) => {

  const newAnnotation = await prisma.video_annotation.create({
    data: {
      url: url,
      length: length,
      annotation_id: id
    }
  })
  return newAnnotation
}

/**
 * @function updateVideoAnnotation
 * @description updates a database record for a 3d model video annotation
 * 
 */
export const updateVideoAnnotation = async (url: string, length: string, id: string) => {

  const newAnnotation = await prisma.video_annotation.update({
    where: {
      annotation_id: id
    },
    data: {
      url: url,
      length: length,
    }
  })
  return newAnnotation
}

/**
 * @function createModelAnnotation
 * @description creates a database record for a 3d model Model annotation
 * 
 */
export const createModelAnnotation = async (uid: string, annotation: string, id: string, annotator: string, modeler: string) => {

  const newAnnotation = await prisma.model_annotation.create({
    data: {
      uid: uid,
      annotation: annotation,
      annotation_id: id,
      annotator: annotator,
      modeler: modeler
    }
  })
  return newAnnotation
}

/**
 * @function updateModelAnnotation
 * @description updates a database record for a 3d model Model annotation
 * 
 */
export const updateModelAnnotation = async (uid: string, annotation: string, id: string) => {

  const newAnnotation = await prisma.model_annotation.update({
    where: {
      annotation_id: id
    },
    data: {
      uid: uid,
      annotation: annotation,
    }
  })
  return newAnnotation
}

/**
 * @function deleteAnnotation
 * @description deletes an annotation an reduces the numbers of all higher indexed annotations by 1
 * 
 */
export const deleteAnnotation = async (id: string, modelUid: string) => {

  // Get annotation pending deletion and store its number
  const annotationPendingDeletion = await prisma.annotations.findUnique({where: {annotation_id: id}})
  const annotationPendingDeletionNumber = annotationPendingDeletion?.annotation_no

  // Get remaining annotations with higher annotation numbers
  const remainingAnnotations = await prisma.annotations.findMany({
    where: {
      uid: modelUid,
      annotation_no: {gt: annotationPendingDeletionNumber}
    },
    orderBy:{annotation_no: 'asc'}
  })

  // Promises array; push deletion of annotation with given annoation_id
  const promises = []
  promises.push(prisma.annotations.delete({where: {annotation_id: id}}))

  // Push updates to all remaining annotation higher in number; number is decresed by 1
  for (let i in remainingAnnotations) {
    promises.push(prisma.annotations.update({
      where: {annotation_id: remainingAnnotations[i].annotation_id},
      data: {annotation_no: remainingAnnotations[i].annotation_no - 1}
    }))
  }

  // // Await promises to resolve
  await prisma.$transaction(promises)

  return
}

/**
 * @function deleteAllAnnotations
 * @description delete all annotations for a 3D model
 * 
 */
export const deleteAllAnnotations = async (uid: string) => {

  const deletionPromises = []
  const annotations = await getAnnotations(uid)

  for (let annotation in annotations) {
    deletionPromises.push(prisma.annotations.delete({
      where: { annotation_id: annotations[annotation].annotation_id }
    }))
  }

  await Promise.all(deletionPromises)

  return deletionPromises
}

/**
 * @function deletePhotoAnnotation
 * @description delete photo annotation
 * 
 */
export const deletePhotoAnnotation = async (id: string) => {

  const deletion = await prisma.photo_annotation.delete({
    where: { annotation_id: id }
  })
  return deletion
}

/**
 * @function deleteVideoAnnotation
 * @description delete video annotation
 * 
 */
export const deleteVideoAnnotation = async (id: string) => {

  const deletion = await prisma.video_annotation.delete({
    where: { annotation_id: id }
  })
  return deletion
}

/**
 * @function deleteModelAnnotation
 * @description delete model annotation
 * 
 */
export const deleteModelAnnotation = async (id: string) => {

  const deletion = await prisma.model_annotation.delete({
    where: { annotation_id: id }
  })
  return deletion
}

/**
 * @function markAsAnnotated
 * @description update a model record to indicate whether or not it's annotated
 * 
 */
export const markAsAnnotated = async (uid: string, annotated: boolean) => {

  const updated = await prisma.model.update({
    where: { uid: uid },
    data: { annotated: annotated }
  })
  return updated
}


/***** ADMIN QUERIES *****/

/**
 * @function getModelsToAnnotate
 * @description 
 * 
 */
export const getModelsToAnnotate = async () => {

  const modelsToAnnotate = await prisma.model.findMany({
    where: {
      site_ready: true,
      base_model: true,
      annotated: false,
    },
    include: {
      software: true,
      tags: true,
      assignment: true
    }
  })

  return modelsToAnnotate
}


/**
 * @function removeStudent
 * @description remove a student from the 'authorized' database table
 * 
 */
export const removeStudent = async (email: string) => {
  const remove = await prisma.authorized.delete({
    where: { email: email }
  })
  return remove
}

/**
 * @function addStudent
 * @description add a student to the 'authorized' database table
 * 
 */
export const addStudent = async (email: string, name: string) => {
  const remove = await prisma.authorized.create({
    data: { email: email, name: name }
  })
  return remove
}

/**
 * @function assignModelToStudent
 * @description assign a 3D model to a student for annotation
 * 
 */
export const assignModelToStudent = async (uid: string, email: string) => {
  return await prisma.assignment.create({ data: { uid: uid, email: email } })
}

/**
 * @function unassignModelToStudent
 * @description unassign a 3D model to a student for annotation
 * 
 */
export const unassignModelToStudent = async (uid: string, email: string) => {
  return await prisma.assignment.delete({ where: { email_uid: { email: email, uid: uid } } })
}

/**
 * @function getStudentsAndAssignments
 * @description get an array of authorized students objecets with assignments included
 * 
 */
export const getStudentsAndAssignments = async () => {
  return await prisma.authorized.findMany({ where: { role: 'student' }, include: { assignment: true } satisfies Prisma.authorizedInclude })
}

/**
 * @function getAssignments
 * @description get an array of assignment objects
 * 
 */
export const getAssignments = async () => {
  return await prisma.assignment.findMany()
}

/**
 * @function getModelsWithAssignments
 * @description get an array of assignment objects
 * 
 */
export const getModelsWithAssignments = async () => {
  return await prisma.model.findMany({ include: { assignment: true } })
}

/**
 * @function approveAnnotations
 * @description approve 3d model annotations
 * 
 */

export const approveAnnotations = async (uid: string) => {
  return await prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: true } })
}

/**
 * @function rejectAnnotations
 * @description reject 3d model annotations
 * 
 */
export const rejectAnnotations = async (uid: string) => {
  return await prisma.model.update({ where: { uid: uid }, data: { annotated: false } })
}

/**
 * @function unapproveAnnotations
 * @description unapprove 3d model annotations
 * 
 */
export const unapproveAnnotations = async (uid: string) => {
  return await prisma.model.update({ where: { uid: uid }, data: { annotationsApproved: false } })
}

/**
 * @function approveModel
 * @description unapprove 3d model annotations
 * 
 */
export const approveModel = async (uid: string) => {
  return await prisma.model.update({ where: { uid: uid }, data: { modelApproved: true } })
}


