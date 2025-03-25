'use client'

import { software, model, photo_annotation, model_annotation } from "@prisma/client"
import { getCollectionMetadata } from "@/functions/server/collections"
import { GbifImageResponse, GbifProfile } from "@/interface/interface"

import ModelAnnotations from "./ModelAnnotationsClass"

export default class Herbarium {

  commonNames: string[]
  wikiSummary: any
  software: software[]
  images: GbifImageResponse[]
  annotations: ModelAnnotations
  model: model
  profile: GbifProfile
  imageSectionTitle: string

  private constructor(commonNames: string[], software: software[], images: GbifImageResponse[], profile: GbifProfile, wikiSummary: any, imageSectionTitle: string, model: model, annotations: ModelAnnotations) {
    this.commonNames = commonNames
    this.software = software
    this.images = images
    this.annotations = annotations
    this.model = model
    this.profile = profile
    this.wikiSummary = wikiSummary
    this.imageSectionTitle = imageSectionTitle
  }

  static async model(usageKey: number, model: model, images: GbifImageResponse[], title: string) {

    var data: any
    var annotations: any
    var promises = []

    promises.push(getCollectionMetadata(model.uid, usageKey, model.spec_name))
    promises.push(ModelAnnotations.retrieve(model.uid))

    await Promise.all(promises).then(res => {
      data = res[0]
      annotations = res[1]
    })

    return new Herbarium(data[0], data[1], images, data[2], data[3], title, model, annotations)
  }

  getAnnotator() {
    for (let annotation of this.annotations.annotations) {
      if ((annotation.annotation as photo_annotation | model_annotation)?.annotator) {
        const annotator = (annotation.annotation as photo_annotation | model_annotation)?.annotator
        return annotator
      }
    }
  }
}