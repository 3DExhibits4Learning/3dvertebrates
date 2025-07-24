/**
 * @file src/functions/client/reducers/AnnotationEntryData.ts
 * 
 * @fileoverview reducer for the state of the annotation entry component
 * 
 */

// Typical imports
import { annotationEntry, annotationsAndPositions } from "@/interface/interface"
import { photo_annotation, video_annotation, model_annotation, text_annotation } from "@prisma/client"
import { annotationEntryAction, setImageSource, setImageVisibility, loadAnnotation, setStringValue, setFile } from "@/interface/actions"
import { getNewAnnotationEntryData } from "@/interface/initializers"

// Main JSX
export default function annotationEntryReducer(data: annotationEntry, action: annotationEntryAction): annotationEntry {

    var apData: annotationsAndPositions

    switch (action.type) {

        case 'newAnnotation':

            const newAnnotationAction = action as loadAnnotation
            if (!newAnnotationAction.apData) throw Error('Missing annotations and positions')

            return {
                photoChecked: false,
                videoChecked: false,
                modelChecked: false,
                textChecked: false,
                annotationType: '',
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
                imageSource: imageSourceAction.path
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
                photoChecked: true,
                videoChecked: false,
                modelChecked: false,
                textChecked: false
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
                annotation: videoAnnotation.annotation ? videoAnnotation.annotation : '',
                annotationType: apData.activeAnnotationType as string,
                videoChecked: true,
                photoChecked: false,
                modelChecked: false,
                textChecked: false,
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
                videoChecked: false,
                photoChecked: false,
                modelChecked: true,
                textChecked: false,
                url: ''
            }

        case 'loadTextAnnotation':

            const loadTextAnnotationAction = action as loadAnnotation
            if (!loadTextAnnotationAction.apData) throw Error('Missing annotations and positions')
            apData = loadTextAnnotationAction.apData
            const textAnnotation = apData.activeAnnotation as text_annotation

            return {
                ...data,
                annotationType: apData.activeAnnotationType as string,
                videoChecked: false,
                photoChecked: false,
                modelChecked: false,
                textChecked: true,
                annotationTitle: apData.activeAnnotationTitle,
                annotation: textAnnotation.annotation,
            }

        case 'textRadioButton':

            return {
                ...data,
                annotationType: 'text',
                photoChecked: false,
                videoChecked: false,
                modelChecked: false,
                textChecked: true,
            }

        case 'photoRadioButton':

            return {
                ...data,
                annotationType: 'photo',
                photoChecked: true,
                videoChecked: false,
                modelChecked: false,
                textChecked: false,
            }

        case 'videoRadioButton':

            return {
                ...data,
                annotationType: 'video',
                photoChecked: false,
                videoChecked: true,
                modelChecked: false,
                textChecked: false,
            }

        case 'modelRadioButton':

            return {
                ...data,
                annotationType: 'model',
                photoChecked: false,
                videoChecked: false,
                modelChecked: true,
                textChecked: false,
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

        case 'clearAnnotationEntryData':
            const newData = getNewAnnotationEntryData()
            return newData

        default:
            throw Error('Unknow action type')
    }
}