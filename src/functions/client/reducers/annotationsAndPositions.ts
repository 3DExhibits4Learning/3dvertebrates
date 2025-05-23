import ModelAnnotations from "@/classes/ModelAnnotationsClass"
import { annotationsAndPositions, fullAnnotation } from "@/interface/interface"

export function annotationsAndPositionsReducer(annotationsAndPositions: annotationsAndPositions, action: any): annotationsAndPositions {

    switch (action.type) {

        case 'activeAnnotationIndex=1':

            return {
                ...annotationsAndPositions,
                activeAnnotation: undefined,
                activeAnnotationType: undefined,
                activeAnnotationPosition: undefined
            }

        case 'activeAnnotationIndex>1':

            const annotations = annotationsAndPositions.annotations as fullAnnotation[]
            const i = annotationsAndPositions.activeAnnotationIndex as number

            return {
                ...annotationsAndPositions,
                activeAnnotationType: annotations[i - 2].annotation_type as 'photo' | 'video' | 'model' | undefined,
                activeAnnotationPosition: annotations[i - 2].position as string,
                newAnnotationEnabled: false,
                repositionEnabled: false,
                activeAnnotationTitle: annotations[i - 2].title ?? '',
                activeAnnotation: annotations[i - 2].annotation
            }

        case 'newModelSelectedOrDbUpdate':

            const mAnnotations = (action.modelAnnotations as ModelAnnotations).annotations

            return {
                ...annotationsAndPositions,
                annotations: mAnnotations,
                numberOfAnnotations: mAnnotations.length,
                activeAnnotationIndex: undefined,
                position3D: undefined,
                newAnnotationEnabled: false,
                firstAnnotationPosition: action.firstAnnotationPosition,
                activeAnnotationPosition: undefined,
                repositionEnabled: false
            }

        case 'newModelClicked':

            return {
                ...annotationsAndPositions,
                firstAnnotationPosition: undefined
            }

        case 'newAnnotation':

            return {
                ...annotationsAndPositions,
                newAnnotationEnabled: true,
                activeAnnotationIndex: 'new',
                repositionEnabled: false
            }

        case 'annotationCancelled':

            return {
                ...annotationsAndPositions,
                newAnnotationEnabled: false,
                activeAnnotationIndex: undefined,
                cancelledAnnotation: !annotationsAndPositions.cancelledAnnotation
            }


        case 'newPosition':

            return {
                ...annotationsAndPositions,
                position3D: action.position
            }

        case 'newAnnotationIndex':

            return {
                ...annotationsAndPositions,
                activeAnnotationIndex: action.index
            }


        case 'switchRepositionEnabled':

            return {
                ...annotationsAndPositions,
                repositionEnabled: !annotationsAndPositions.repositionEnabled
            }

        case 'switchRepositionAndUndefinePosition':

            return {
                ...annotationsAndPositions,
                repositionEnabled: !annotationsAndPositions.repositionEnabled,
                position3D: undefined
            }

        case 'annotationSavedOrDeleted':

            return {
                ...annotationsAndPositions,
                annotationSavedOrDeleted: !annotationsAndPositions.annotationSavedOrDeleted
            }

        default:
            throw Error('Unknown action: ' + action.type)
    }
}