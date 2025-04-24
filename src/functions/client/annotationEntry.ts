/**
 * @file src/functions/client/annotationEntry.ts
 * 
 * @fileoverview logic (function) file primarily for components of AnnotationEntry.tsx
 * 
 * @todo extract "index" argument from firstAnnotationFormData, it should always be "1"
 * @todo complete commentary
 */

'use client'

// Imports
import { annotationClientSpecimen, annotationEntry, annotationsAndPositions } from "@/interface/interface"
import { photo_annotation, video_annotation, model_annotation } from "@prisma/client"
import { SetStateAction, Dispatch, MutableRefObject, MouseEvent } from "react"
import { v4 as uuidv4 } from 'uuid'
import { annotationEntryAction } from "@/interface/actions"

export const allTruthy = (value: any) => value ? true : false
export const allSame = (originalValues: any[], currentValues: any[]) => JSON.stringify(originalValues) === JSON.stringify(currentValues) ? true : false

/**
 * 
 * @param selection 
 * @returns 
 */
export const isHyperLinkSelectionValid = (selection: Selection | undefined) => {
    const divId = 'divTextArea'

    if (selection && selection.toString().length > 0 && selection.anchorNode) {
        let node: ParentNode | Node | null = selection.anchorNode

        // If the node is a text node, move up to its parent
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode
        }

        while (node) {
            // @ts-ignore
            if (node.id === divId) {
                return true;
            }
            node = node.parentNode
        }
    }
}

/**
 * 
 * @param dialog 
 * @returns 
 */
export const toggleLinkComponent = (dialog: MutableRefObject<HTMLDialogElement | undefined>, selectionRange: MutableRefObject<Range | undefined>, setSelectionText: Dispatch<SetStateAction<string>>) => {

    const selection = getSelection() as Selection

    if (isHyperLinkSelectionValid(selection)) {
        selectionRange.current = selection.getRangeAt(0).cloneRange()
        setSelectionText(selection.toString())
    }

    if (dialog.current) {
        if (!dialog.current?.open) (dialog.current as HTMLDialogElement).showModal()
        else (dialog.current as HTMLDialogElement).close()
    }
    return
}

/**
 * 
 * @returns 
 */
export const getSelection = () => {
    if (typeof window !== 'undefined' && (window.getSelection() as Selection).toString().length > 0) return window.getSelection() as Selection
    return undefined
}

/**
 * 
 * @param selection 
 * @param hyperlinkUrl 
 * @param hyperlinkText 
 * @param divTextArea 
 * Dark mode hyperlink hex: #4EA8DE
 * Light mode hyperlink hex: #0000EE
 */
export const insertAnnotationHyperlink = (
    selectionRange: MutableRefObject<Range | undefined>,
    hyperlinkUrl: string,
    selectionText: string,
    dialog: MutableRefObject<HTMLDialogElement | undefined>,
    setSelectionText: Dispatch<SetStateAction<string>>,
    divTextArea: MutableRefObject<HTMLDivElement | undefined>,
    setLinkAdded: Dispatch<SetStateAction<number>>,
    linkAdded: number,
) => {
    const range = selectionRange.current as Range
    const newHtml = `<span class='hyperlink'><a href="${hyperlinkUrl}" target="_blank" rel="noopener noreferrer">${selectionText}</a></span>`
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = newHtml
    const newNode = tempDiv.firstChild
    range.deleteContents()
    range.insertNode(newNode as ChildNode)
    const textArea = divTextArea.current as HTMLDivElement
    textArea.innerHTML += '&nbsp;'
    setLinkAdded(linkAdded + 1)
    dialog.current?.close()
    setSelectionText('')
}

/**
 * 
 * @param selection 
 * @param hyperlinkUrl 
 * @param hyperlinkText 
 * @param divTextArea 
 * Dark mode hyperlink hex: #4EA8DE
 * Light mode hyperlink hex: #0000EE
 */
export const annotationItalicization = (
    selectionRange: MutableRefObject<Range | undefined>,
    selectionText: string,
    divTextArea: MutableRefObject<HTMLDivElement | undefined>,
) => {
    console.log(selectionText)
    const range = selectionRange.current as Range
    const newHtml = `<i>${selectionText}</i>`
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = newHtml
    const newNode = tempDiv.firstChild
    range.deleteContents()
    range.insertNode(newNode as ChildNode)
    const textArea = divTextArea.current as HTMLDivElement
    textArea.innerHTML += '&nbsp;'
}

/**
 * 
 * @param photoAnnotation photo_annotation from the database
 * @returns a route handler returning an HTTP response with the image to be served
 */
export function getImagePath(photoAnnotation: photo_annotation) {
    const path = process.env.NEXT_PUBLIC_LOCAL === 'development' ? `X:${photoAnnotation.url.slice(5)}` : `public${photoAnnotation.url}`
    return `/api/nfs?path=${path}`
}
/**
 * 
 * @param uid of the 3D model
 * @param position of the annotation (stringified array)
 * @param index should always be one; this triggers the correct code block on the route handler
 * @returns 
 */
export const firstAnnotationFormData = (uid: string, position: string, index: string) => {

    const data = new FormData()

    data.set('uid', uid as string)
    data.set('position', position as string)
    data.set('index', index)

    return data
}
/**
 * 
 * @param data form data for the route handler and database records
 * @param method HTTP method
 * @returns string containing status message
 */
export const insertAnnotation = async (data: FormData, method?: 'PATCH' | 'DELETE') => {
    return await fetch('/api/annotations', {
        method: method ? method : 'POST',
        body: data
    }).then(res => res.json()).then(json => json.data)
}
/**
 * 
 * @param apData annotationsAndPostions object
 * @param aeData annotationEntry object
 * @param setSaveDisabled save button disabled state
 * @param isNewPosition boolean indicating whether there is a new position
 * @description enables the "update" button if all required fields are populated and there is an update, including new file, position or optional data
 */
export const enablePhotoAnnotatonUpdate = (apData: annotationsAndPositions, aeData: annotationEntry, setSaveDisabled: Dispatch<SetStateAction<boolean>>, isNewPosition: boolean) => {
    // Type assertion for brevity
    const caseAnnotation = apData.activeAnnotation as photo_annotation

    // Required value arrays for comparison
    const originalValues = [apData.activeAnnotationTitle, caseAnnotation.author, caseAnnotation.license, caseAnnotation.annotation]
    const currentValues = [aeData.annotationTitle, aeData.author, aeData.license, aeData.annotation]

    // Optional value arrays for comparison
    const originalOptionalValues = [caseAnnotation.title, caseAnnotation.website]
    const optionalValues = [aeData.photoTitle, aeData.website]

    // If all required fields are populated and: they are different from the original, there is a new file, there is a new annotation position, or optional values have changed, enable "save changes"
    if (!aeData.url.startsWith('/data') && !aeData.file) setSaveDisabled(true)
    else if (currentValues.every(value => value) && (!allSame(originalValues, currentValues) || aeData.file || isNewPosition || !allSame(originalOptionalValues, optionalValues))) setSaveDisabled(false)
    else setSaveDisabled(true)
}

/**
 * 
 * @param aeData 
 * @param setCreateDisabled 
 * @param position 
 */
export const enablePhotoAnnotationCreate = (aeData: annotationEntry, setCreateDisabled: Dispatch<SetStateAction<boolean>>, position: string) => {
    // Required fields
    const valueArray = [aeData.annotationTitle, aeData.file, aeData.author, aeData.license, aeData.annotation, position]

    // Enable button if all required fields are populated
    if (valueArray.every(allTruthy)) setCreateDisabled(false)
    else setCreateDisabled(true)
}

/**
 * 
 * @param apData 
 * @param aeData 
 * @param isNewPosition 
 * @param setSaveDisabled 
 */
export const enableVideoAnnotationUpdate = (apData: annotationsAndPositions, aeData: annotationEntry, isNewPosition: boolean, setSaveDisabled: Dispatch<SetStateAction<boolean>>) => {
    // Type assertion, required value arrays
    const caseAnnotation = apData.activeAnnotation as video_annotation
    const originalValues = [apData.activeAnnotationTitle, caseAnnotation.url, caseAnnotation.length]
    const currentValues = [aeData.annotationTitle, aeData.videoSource, aeData.length]

    // If all required fields are populated and: they are different from the original, or there is a new position, then enable "save changes"
    if (currentValues.every(allTruthy) && (!allSame(originalValues, currentValues) || isNewPosition)) setSaveDisabled(false)
    else setSaveDisabled(true)
}

/**
 * 
 * @param aeData 
 * @param position 
 * @param setCreateDisabled 
 */
export const enableVideoAnnotationCreate = (aeData: annotationEntry, position: string, setCreateDisabled: Dispatch<SetStateAction<boolean>>) => {
    // Required fields
    const valueArray = [aeData.annotationTitle, aeData.videoSource, aeData.length, position]

    // Enable button if all required fields are populated
    if (valueArray.every(allTruthy)) setCreateDisabled(false)
    else setCreateDisabled(true)
}

/**
 * 
 * @param aeData 
 * @param apData 
 * @param isNewPosition 
 * @param setSaveDisabled 
 */
export const enableModelAnnotationUpdate = (aeData: annotationEntry, apData: annotationsAndPositions, isNewPosition: boolean, setSaveDisabled: Dispatch<SetStateAction<boolean>>) => {

    // Type assertion, required value arrays
    const caseAnnotation = apData.activeAnnotation as model_annotation
    const originalValues = [apData.activeAnnotationTitle, caseAnnotation.uid, caseAnnotation.annotation]
    const currentValues = [aeData.annotationTitle, aeData.modelAnnotationUid, aeData.annotation]

    // If all required fields are populated and: they are different from the original, or there is a new position, then enable "save changes"
    if (currentValues.every(allTruthy) && (!allSame(originalValues, currentValues) || isNewPosition)) setSaveDisabled(false)
    else setSaveDisabled(true)
}

/**
 * 
 * @param aeData 
 * @param position 
 * @param setCreateDisabled 
 */
export const enableModelAnnotationCreate = (aeData: annotationEntry, position: string, setCreateDisabled: Dispatch<SetStateAction<boolean>>) => {

    // Required fields
    const valueArray = [aeData.annotationTitle, aeData.modelAnnotationUid !== 'select', aeData.annotation, position]

    // Enable button if all required fields are populated
    if (valueArray.every(allTruthy)) setCreateDisabled(false)
    else setCreateDisabled(true)
}

/**
 * 
 * @param apData 
 * @param uid 
 * @returns 
 */
export const deleteAnnotationData = (apData: annotationsAndPositions, uid: string) => {

    const requestObj = {
        annotation_id: apData.activeAnnotation?.annotation_id,
        modelUid: uid,
        oldUrl: apData.activeAnnotationType === 'photo' ? (apData.activeAnnotation as photo_annotation).url : ''
    }

    return JSON.stringify(requestObj)
}

/**
 * 
 * @param index 
 * @param uid 
 * @param position 
 * @param dataTransferWrapper 
 * @param aeData 
 */
export const createAnnotation = (index: number, uid: string, position: string, dataTransferWrapper: Function, aeData: annotationEntry) => {
    // Simple handler for the first annotation (always taxonomy and description)
    if (index === 1) {
        const data = firstAnnotationFormData(uid, position, index.toString())
        dataTransferWrapper(insertAnnotation, [data], "Creating annotation")
    }
    // Handler for all other annotations
    else {
        const data = annotationFormData(aeData, uid, index.toString(), position)
        dataTransferWrapper(insertAnnotation, [data], "Creating annotation")
    }
}

export const updateAnnotation = (index: number, dataTransferWrapper: Function, aeData: annotationEntry, apData: annotationsAndPositions, specimen: annotationClientSpecimen) => {
    if (index == 1) {
        const data = annotationFormData(aeData, specimen.uid as string, index.toString(), apData.position3D as string)
        dataTransferWrapper(insertAnnotation, [data, 'PATCH'], "Updating annotation")
    }
    else {
        const data = annotationUpdateData(aeData, apData, specimen)
        dataTransferWrapper(insertAnnotation, [data, 'PATCH'], "Updating annotation")
    }
}

/**
 * 
 * @param apData 
 * @param uid 
 * @param dataTransferWrapper 
 */
export const deleteAnnotation = (apData: annotationsAndPositions, uid: string, dataTransferWrapper: Function) => {
    const data = deleteAnnotationData(apData, uid)
    dataTransferWrapper(insertAnnotation, [data, 'DELETE'], "Deleting annotation")
}

/**
 * 
 * @param index 
 * @param aeData 
 * @param isNew 
 * @param dispatch 
 */
export const setImageVisibility = (index: number, aeData: annotationEntry, isNew: boolean, dispatch: Dispatch<annotationEntryAction>) => {
    if (index !== 1 && aeData.annotationType === 'photo' && !isNew && aeData.url.startsWith('/data')) dispatch({ type: 'setImageVisibility', isVisible: true })
    else dispatch({ type: 'setImageVisibility', isVisible: false })
}

/**
 * 
 * @param apData 
 * @param dispatch 
 */
export const populateFormFields = (apData: annotationsAndPositions, dispatch: Dispatch<annotationEntryAction>) => {

    if (apData.activeAnnotationIndex === 'new') dispatch({ type: 'newAnnotation', apData: apData })

    else if (apData.activeAnnotationType && apData.activeAnnotation) {

        if (apData.activeAnnotationType === 'photo') {
            dispatch({ type: 'loadPhotoAnnotation', apData: apData });
            dispatch({ type: 'setImageSource', path: getImagePath(apData.activeAnnotation as photo_annotation) })
        }

        else if (apData.activeAnnotationType === 'video') dispatch({ type: 'loadVideoAnnotation', apData: apData })
        else if (apData.activeAnnotationType === 'model') dispatch({ type: 'loadModelAnnotation', apData: apData })
    }
}

/**
 * 
 * @param apData 
 * @param aeData 
 * @param enableFirstAnnotation 
 * @param index 
 * @param isNew 
 * @param setCreateDisabled 
 * @param setSaveDisabled 
 * @param isNewPosition 
 */
export const enableSaveOrUpdateButton = (
    apData: annotationsAndPositions,
    aeData: annotationEntry,
    enableFirstAnnotation: Function,
    index: number,
    isNew: boolean,
    setCreateDisabled: Dispatch<SetStateAction<boolean>>,
    setSaveDisabled: Dispatch<SetStateAction<boolean>>,
    isNewPosition: boolean
) => {
    if (index === 1) apData.position3D ? enableFirstAnnotation(false) : enableFirstAnnotation(true)

    else if (aeData.annotationType === 'photo') {
        switch (isNew) {
            case false: enablePhotoAnnotatonUpdate(apData, aeData, setSaveDisabled, isNewPosition); break
            default: enablePhotoAnnotationCreate(aeData, setCreateDisabled, apData.position3D as string)
        }
    }

    else if (aeData.annotationType === 'video') {
        switch (isNew) {
            case false: enableVideoAnnotationUpdate(apData, aeData, isNewPosition, setSaveDisabled); break
            default: enableVideoAnnotationCreate(aeData, apData.position3D as string, setCreateDisabled)
        }
    }

    else if (aeData.annotationType === 'model') {
        switch (isNew) {
            case false: enableModelAnnotationUpdate(aeData, apData, isNewPosition, setSaveDisabled); break
            default: enableModelAnnotationCreate(aeData, apData.position3D as string, setCreateDisabled)
        }
    }
}

/**
 * 
 * @param aeData 
 * @param uid 
 * @param index 
 * @param position 
 * @returns 
 */
export const annotationFormData = (aeData: annotationEntry, uid: string, index: string, position: string): FormData => {

    // Form data, annotation ID
    const data = new FormData()

    // For first annotation
    if (index === '1') return firstAnnotationFormData(uid, position, index)

    // For all other annotations (this is the annotation id)
    const annotationId = uuidv4()

    // Annotations table data
    data.set('uid', uid as string)
    data.set('annotation_no', index.toString())
    data.set('annotation_type', aeData.annotationType)
    data.set('position', position as string)
    data.set('title', aeData.annotationTitle as string)
    data.set('annotation_id', annotationId)
    data.set('annotation', aeData.annotation)

    // Route handler data
    data.set('mediaType', aeData.mediaType as string)
    data.set('file', aeData.file as File)

    // Directory, path and url data for photo uploads
    if (aeData.file) {
        const photo = aeData.file as File
        data.set('dir', `public/data/Vertebrates/Annotations/${uid}/${annotationId}`)
        data.set('path', `public/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`)
        data.set('url', `/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`)
    }

    // Set relevant data based on annotationType
    switch (aeData.annotationType) {

        // Video_annotation table data
        case 'video':
            data.set('length', aeData.length)
            data.set('url', aeData.videoSource)

            break

        // Model_annotation table data
        case 'model':
            data.set('modelAnnotationUid', aeData.modelAnnotationUid as string)

            break

        // Photo_annotation table data
        default:
            data.set('author', aeData.author)
            data.set('license', aeData.license)
            if (aeData.photoTitle) data.set('photoTitle', aeData.photoTitle)
            if (aeData.website) data.set('website', aeData.website)
    }

    return data
}

/**
 * 
 * @param aeData 
 * @param apData 
 * @param specimen 
 * @returns 
 */
export const annotationUpdateData = (aeData: annotationEntry, apData: annotationsAndPositions, specimen: annotationClientSpecimen): FormData => {

    const data = new FormData()

    if (apData.activeAnnotationType !== aeData.annotationType) {
        data.set('mediaTransition', 'true')
        data.set('previousMedia', apData.activeAnnotationType as string)
        if (apData.activeAnnotationType === 'photo') data.set('oldUrl', (apData.activeAnnotation as photo_annotation).url)
    }

    // Annotations table data (for update)
    data.set('uid', specimen.uid as string)
    data.set('annotation_type', aeData.annotationType)
    data.set('position', apData.position3D as string ?? apData.activeAnnotationPosition)
    data.set('title', aeData.annotationTitle as string)
    data.set('annotation', aeData.annotation)

    // Set relevant data based on annotationType
    switch (aeData.annotationType) {

        // Video_annotation table data
        case 'video':
            data.set('length', aeData.length)
            data.set('url', aeData.videoSource)

            break

        // Model_annotation table data
        case 'model':
            data.set('modelAnnotationUid', aeData.modelAnnotationUid as string)

            break

        // Photo_annotation table data
        default:
            data.set('author', aeData.author)
            data.set('license', aeData.license)
            if (aeData.photoTitle) data.set('photoTitle', aeData.photoTitle)
            if (aeData.website) data.set('website', aeData.website)
    }

    // Shared data (url was formerly the foreign key)
    // Note that the url is the url necessary from the collections page; also note the old path must be inlcuded for deletion; also note that a new id is not generated for update
    data.set('annotation_id', (apData.activeAnnotation as photo_annotation | video_annotation).annotation_id)
    data.set('specimenName', specimen.specimenName as string)

    // Set relevant form data if there is a new photo file
    if (aeData.file) {
        const photo = aeData.file as File
        const annotation = apData.activeAnnotation as photo_annotation
        data.set('dir', `public/data/Vertebrates/Annotations/${specimen.uid}/${annotation.annotation_id}`)
        data.set('path', `public/data/Vertebrates/Annotations/${specimen.uid}/${annotation.annotation_id}/${photo.name}`)
        data.set('url', `/data/Vertebrates/Annotations/${specimen.uid}/${annotation.annotation_id}/${photo.name}`)
        data.set('file', photo)
        if (apData.activeAnnotationType === 'photo') data.set('oldUrl', (apData.activeAnnotation as photo_annotation).url)
    }

    // Else if the databased annotation is a photo, the url should be the same
    else if (apData.activeAnnotationType === 'photo') data.set('url', (apData.activeAnnotation as photo_annotation).url)

    // Route handler data
    data.set('mediaType', aeData.mediaType as string)

    return data
}

export function sanitizeHtml(htmlString: string): string {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString;

    const allowedTags = ['SPAN', 'A', 'I'];

    function clean(node: Node) {
        const children = Array.from(node.childNodes);

        for (let child of children) {
            if (child.nodeType === 1) { // Element node
                const element = child as HTMLElement;
                const tag = element.tagName.toUpperCase();
                const isAllowed =
                    allowedTags.includes(tag) &&
                    (
                        (tag !== 'SPAN' || element.classList.contains('hyperlink')) || // Allow <span class="hyperlink">
                        //@ts-ignore
                        (tag === 'A' && element.closest('span.hyperlink')) // Allow <a> only if inside <span class="hyperlink">
                    );

                if (!isAllowed) {
                    // Remove tag but keep contents
                    clean(child); // Clean nested children before removing the tag
                    child.replaceWith(...child.childNodes);
                } else {
                    clean(child); // Recurse into allowed tags
                }
            } else if (child.nodeType === 3) {
                // Text node, do nothing
                continue;
            } else {
                // Remove non-element and non-text nodes
                child.remove();
            }
        }
    }

    clean(wrapper);

    return wrapper.innerHTML;
}