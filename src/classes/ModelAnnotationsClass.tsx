'use client'

import { fullAnnotation } from "@/interface/interface"
import { getBaseAnnotations, getMediaAnnotation } from "@/functions/server/admin/annotator"
import { model_annotation, photo_annotation, video_annotation } from "@prisma/client"

class ModelAnnotations {

    annotations: fullAnnotation[]
    annotationIndex: number | undefined = undefined

    private constructor(annotations: fullAnnotation[]) {
        this.annotations = annotations
    }

    static async retrieve(uid: string) {

        let promises = []

        const annotations = await getBaseAnnotations(uid) as fullAnnotation[]
        for (let i in annotations) { promises.push(getMediaAnnotation(annotations[i].annotation_id, annotations[i].annotation_type)) }

        await Promise.all(promises).then(res => {
            for (let i = 0; i < annotations.length; i++) {
                annotations[i].annotation = res[i] as photo_annotation | video_annotation | model_annotation
            }
        })

        return new ModelAnnotations(annotations)
    }

    get index() {
        return this.annotationIndex
    }

    set index(i: number | undefined) {
        this.annotationIndex = i
    }
}

export default ModelAnnotations

