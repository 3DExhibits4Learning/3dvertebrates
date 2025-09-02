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
import { photo_annotation, video_annotation, model_annotation, model, text_annotation } from "@prisma/client"
import { SetStateAction, Dispatch, MutableRefObject } from "react"
import { v4 as uuidv4 } from 'uuid'
import { annotationEntryAction } from "@/interface/actions"
import { annotationDataEntryObj, annotationDataEntryUpdateObj } from "@/ts/ts"
import { ad } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js"
import { lengthNoWhitespace } from "@/functions/client/utils"

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
 * @param apData 
 * @param aeData 
 * @param isNewPosition 
 * @param setSaveDisabled 
 */
export const enableTextAnnotationUpdate = (apData: annotationsAndPositions, aeData: annotationEntry, isNewPosition: boolean, setSaveDisabled: Dispatch<SetStateAction<boolean>>) => {
    // Type assertion, required value arrays
    const caseAnnotation = apData.activeAnnotation as text_annotation
    const originalValues = [apData.activeAnnotationTitle, caseAnnotation.annotation]
    const currentValues = [aeData.annotationTitle, aeData.annotation]

    // If all required fields are populated and: they are different from the original, or there is a new position, then enable "save changes"
    if (currentValues.every(value => value) && lengthNoWhitespace(aeData.annotation) > 200 && (!allSame(originalValues, currentValues) || isNewPosition || aeData.annotationType !== apData.activeAnnotationType)) setSaveDisabled(false)
    else setSaveDisabled(true)
}

/**
 * 
 * @param aeData 
 * @param position 
 * @param setCreateDisabled 
 */
export const enableTextAnnotationCreate = (aeData: annotationEntry, position: string, setCreateDisabled: Dispatch<SetStateAction<boolean>>) => {
    // Required fields
    const valueArray = [aeData.annotationTitle, aeData.annotation, position]

    // Enable button if all required fields are populated
    if (valueArray.every(value => value) && lengthNoWhitespace(aeData.annotation) > 200) setCreateDisabled(false)
    else setCreateDisabled(true)
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
    const originalValues = [apData.activeAnnotationTitle, caseAnnotation.url, caseAnnotation.length, caseAnnotation.annotation]
    const currentValues = [aeData.annotationTitle, aeData.videoSource, aeData.length, aeData.annotation]

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
    if (currentValues.every(value => value) && aeData.modelAnnotationUid !== 'select' && (!allSame(originalValues, currentValues) || isNewPosition)) setSaveDisabled(false)
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
    if (valueArray.every(value => value)) setCreateDisabled(false)
    else setCreateDisabled(true)
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
    // Clear the form data
    dispatch({ type: 'clearAnnotationEntryData' })

    // If the active annotation is new, set the annotation entry data to the initial values
    if (apData.activeAnnotationIndex === 'new') dispatch({ type: 'newAnnotation', apData: apData })

    // If the active annotation is not new, load the relevant data into the form
    else if (apData.activeAnnotationType && apData.activeAnnotation) {
        switch (apData.activeAnnotationType) {
            case 'photo':
                dispatch({ type: 'loadPhotoAnnotation', apData: apData });
                dispatch({ type: 'setImageSource', path: getImagePath(apData.activeAnnotation as photo_annotation) })
                break
            case 'video': dispatch({ type: 'loadVideoAnnotation', apData: apData }); break
            case 'model': dispatch({ type: 'loadModelAnnotation', apData: apData }); break
            case 'text': dispatch({ type: 'loadTextAnnotation', apData: apData }); break
        }
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

    else if (aeData.annotationType === 'text') {
        switch (isNew) {
            case false: enableTextAnnotationUpdate(apData, aeData, isNewPosition, setSaveDisabled); break
            default: enableTextAnnotationCreate(aeData, apData.position3D as string, setCreateDisabled)
        }
    }
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
                child.remove()
            }
        }
    }

    clean(wrapper)

    return wrapper.innerHTML
}

export const getAnnotationEntryDataObj = (aeData: annotationEntry, uid: string, index: string, position: string, apData: annotationsAndPositions) => {
    // For first annotation
    if (index === '1') return { uid: uid, position: position, index: index }

    // For all other annotations (this is the annotation id)
    const annotationId = uuidv4()

    // Object initialization
    const entryObject: annotationDataEntryObj = {
        index: index,
        uid: uid,
        annotationNo: index.toString(),
        annotationType: aeData.annotationType,
        position: position,
        title: aeData.annotationTitle as string,
        annotationId: annotationId,
        annotation: aeData.annotation
    }

    // Directory, path and url data for photo uploads
    if (aeData.file) {
        const photo = aeData.file as File
        entryObject.file = photo
        entryObject.dir = `public/data/Vertebrates/Annotations/${uid}/${annotationId}`
        entryObject.path = `public/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`
        entryObject.url = `/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`
    }

    // Set relevant data based on annotationType
    switch (aeData.annotationType) {
        // Video_annotation table data
        case 'video':
            entryObject.length = aeData.length
            entryObject.url = aeData.videoSource
            break

        // Model_annotation table data
        case 'model':
            entryObject.modelAnnotationUid = aeData.modelAnnotationUid as string
            break

        // Photo_annotation table data
        case 'photo':
            entryObject.author = aeData.author
            entryObject.license = aeData.license
            entryObject.photoTitle = aeData.photoTitle ?? (apData.activeAnnotation as photo_annotation).title ?? ''
            entryObject.website = aeData.website ?? (apData.activeAnnotation as photo_annotation).title ?? ''

        default: break
    }
    return entryObject
}

export const getAnnotationEntryUpdateDataObj = (aeData: annotationEntry, index: string, position: string, apData: annotationsAndPositions, specimen: annotationClientSpecimen) => {
    // For first annotation
    if (index === '1') return { uid: specimen.uid, position: position, index: index }

    // Current annotation ID
    const annotationId = apData.activeAnnotation?.annotation_id as string
    const uid = specimen.uid as string

    // Update object initialization
    const updateObject: annotationDataEntryUpdateObj = {
        specimenName: specimen.specimenName as string,
        index: index,
        uid: specimen.uid as string,
        annotationNo: index.toString(),
        annotationType: aeData.annotationType,
        position: position,
        title: aeData.annotationTitle as string,
        annotationId: apData.activeAnnotation?.annotation_id as string,
        annotation: aeData.annotation,
        mediaTransition: apData.activeAnnotationType !== aeData.annotationType,
        previousMedia: apData.activeAnnotationType
    }

    // Set relevant data based on annotationType
    switch (aeData.annotationType) {
        // Video_annotation table data
        case 'video':
            updateObject.length = aeData.length
            updateObject.url = aeData.videoSource
            break

        // Model_annotation table data
        case 'model':
            updateObject.modelAnnotationUid = aeData.modelAnnotationUid as string
            updateObject.url = ''
            break

        // Photo_annotation table data
        case 'photo':
            updateObject.author = aeData.author
            updateObject.license = aeData.license
            updateObject.photoTitle = aeData.photoTitle ?? (apData.activeAnnotation as photo_annotation).title ?? ''
            updateObject.website = aeData.website ?? (apData.activeAnnotation as photo_annotation).title ?? ''

        default: break
    }

    // If there is a new photograph file
    if (aeData.file) {
        // Type safe declaration; add photo to object
        const photo = aeData.file as File
        updateObject.file = photo

        // Add directory, path and url to object
        updateObject.dir = `public/data/Vertebrates/Annotations/${uid}/${annotationId}`
        updateObject.path = `public/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`
        updateObject.url = `/data/Vertebrates/Annotations/${uid}/${annotationId}/${photo.name}`

        // If the annotation being updated was already a photo annotation, delete the previous photograph by adding oldUrl to the update object
        if (apData.activeAnnotationType === 'photo') updateObject.oldUrl = (apData.activeAnnotation as photo_annotation)?.url
    }

    // Else if the databased annotation is a photo, the url should be the same
    else if (aeData.photoChecked && apData.activeAnnotation) updateObject.url = (apData.activeAnnotation as photo_annotation)?.url

    // If there was a media transition and the original annotation was a photo annotation, delete the original photograph by adding oldUrl to the update object
    if (updateObject.mediaTransition && apData.activeAnnotationType === 'photo') updateObject.oldUrl = (apData.activeAnnotation as photo_annotation)?.url

    return updateObject
}

/**
 * 
 * @param url 
 * @returns 
 */
export const convertToYouTubeEmbed = (url: string): string | null => {
    try {
        const parsed = new URL(url)

        // Match standard YouTube URL (watch?v=...)
        if ((parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') && parsed.pathname === '/watch') {
            const videoId = parsed.searchParams.get('v')

            if (videoId) return `https://www.youtube.com/embed/${videoId}`
        }

        // Match shortened URL (youtu.be/...)
        if (parsed.hostname === 'youtu.be') {
            const videoId = parsed.pathname.split('/')[1]
            if (videoId) return `https://www.youtube.com/embed/${videoId}`
        }

        // Match already embed URL
        if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) return url

        return null
    } catch (err) { return null }
}
