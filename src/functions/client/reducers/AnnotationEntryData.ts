/**
 * @file src/functions/client/reducers/AnnotationEntryData.ts
 * 
 * @fileoverview reducer for the state of the annotation entry component
 * 
 */

// Typical imports
import { annotationEntry, annotationsAndPositions } from "@/interface/interface";
import { photo_annotation, video_annotation, model_annotation } from "@prisma/client";
import { annotationEntryAction, setImageSource, setImageVisibility, loadAnnotation, setStringValue, setFile } from "@/interface/actions";
import { getInitialAnnotationEntryData } from "@/interface/initializers";

// Main JSX
export default function annotationEntryReducer(data: annotationEntry, action: annotationEntryAction): annotationEntry {

    var apData: annotationsAndPositions

    switch (action.type) {

        case 'newAnnotation':

            const newAnnotationAction = action as loadAnnotation
            if (!newAnnotationAction.apData) throw Error('Missing annotations and positions')

            return {
                photoChecked: undefined,
                videoChecked: undefined,
                modelChecked: undefined,
                annotationType: '',
                mediaType: undefined,
                imageVisible: undefined,
                annotationTitle: undefined,
                url: '',
                file: undefined,
                author: '',
                license: '',
                photoTitle: '',
                website: '',
                annotation: '',
                length: '',
                imageSource: undefined,
                videoSource: '',
                modelAnnotationUid: 'select'
            }

        case 'setImageSource':

            const imageSourceAction = action as setImageSource
            if (!imageSourceAction.path) { throw Error("Path missing") }

            return {
                ...data,
                imageSource: `/api/nfs?path=${imageSourceAction.path}`
            }

        case 'setImageVisibility':

            const imageVisibilityAction = action as setImageVisibility
            if (imageVisibilityAction.isVisible === undefined) { throw Error("Bool missing") }

            return {
                ...data,
                imageVisible: imageVisibilityAction.isVisible
            }

        case 'loadPhotoAnnotation':

            const loadPhotoAnnotationAction = action as loadAnnotation
            if (!loadPhotoAnnotationAction.apData) throw Error('Missing annotations and positions')
            apData = loadPhotoAnnotationAction.apData
            const photoAnnotation = apData.activeAnnotation as photo_annotation

            return {
                ...data,
                annotationType: apData.activeAnnotationType as string,
                url: photoAnnotation.url,
                author: photoAnnotation.author,
                license: photoAnnotation.license,
                photoTitle: photoAnnotation.title as string,
                website: photoAnnotation.website as string,
                annotation: photoAnnotation.annotation,
                annotationTitle: apData.activeAnnotationTitle,
                mediaType: 'upload',
                photoChecked: true,
                videoChecked: false,
                modelChecked: false
            }

        case 'loadVideoAnnotation':

            const loadvideoAnnotationAction = action as loadAnnotation
            if (!loadvideoAnnotationAction.apData) throw Error('Missing annotations and positions')
            apData = loadvideoAnnotationAction.apData
            const videoAnnotation = apData.activeAnnotation as video_annotation

            return {
                ...data,
                length: videoAnnotation.length as string,
                videoSource: videoAnnotation.url,
                annotationTitle: apData.activeAnnotationTitle,
                annotationType: apData.activeAnnotationType as string,
                mediaType: 'url',
                videoChecked: true,
                photoChecked: false,
                modelChecked: false,
                url: ''
            }

        case 'loadModelAnnotation':

            const loadmodelAnnotationAction = action as loadAnnotation
            if (!loadmodelAnnotationAction.apData) throw Error('Missing annotations and positions')
            apData = loadmodelAnnotationAction.apData
            const modelAnnotation = apData.activeAnnotation as model_annotation

            return {
                ...data,
                modelAnnotationUid: modelAnnotation.uid as string,
                annotation: modelAnnotation.annotation,
                annotationType: apData.activeAnnotationType as string,
                annotationTitle: apData.activeAnnotationTitle,
                mediaType: 'model',
                videoChecked: false,
                photoChecked: false,
                modelChecked: true,
                url: ''
            }

        case 'photoRadioButton':

            return {
                ...data,
                annotationType: 'photo',
                photoChecked: true,
                videoChecked: false,
                modelChecked: false,
                mediaType: 'upload',
            }

        case 'videoRadioButton':

            return {
                ...data,
                annotationType: 'video',
                photoChecked: false,
                videoChecked: true,
                modelChecked: false,
                mediaType: 'url',
            }

        case 'modelRadioButton':

            return {
                ...data,
                annotationType: 'model',
                photoChecked: false,
                videoChecked: false,
                modelChecked: true,
                mediaType: 'model',
            }

        case 'setStringValue':

            const setStringAction = action as setStringValue
            if (!(setStringAction.string || setStringAction.field)) throw Error("No data provided")

            return {
                ...data,
                [setStringAction.field]: setStringAction.string
            }

        case 'setFile':

            const setFileAction = action as setFile
            if (!setFileAction.file) throw Error("No file provided")

            return {
                ...data,
                file: setFileAction.file
            }

        default:
            throw Error('Unknow action type')
    }
}