import { annotationClientSpecimen } from "@/interface/interface"
import { model } from "@prisma/client"

export function annotationClientSpecimenReducer(specimenData: annotationClientSpecimen, action: any): annotationClientSpecimen {

    switch (action.type) {

        case 'newModelClicked':

            const model = action.model as model

            return {
                ...specimenData,
                specimenName: model.spec_name,
                uid: model.uid,
                annotated: model.annotated,
                annotator: model.annotator ?? '',
                annotationsApproved: model.annotationsApproved
            }


        case 'modelUndefined':


            return {
                ...specimenData,
                uid: undefined
            }


        default:
            throw Error('Unknown action: ' + action.type)
    }
}