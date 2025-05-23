import { dispatch, annotationsAndPositions } from "./interface"

export interface openAnnotationEntryModal extends dispatch {
    loadingLabel: string
}

export interface closeAnnotationEntryModal extends dispatch {
    result: string
}

export interface setImageSource extends dispatch {
    path: string
}

export interface setImageVisibility extends dispatch {
    isVisible: boolean
}

export interface loadAnnotation extends dispatch {
    apData: annotationsAndPositions,
}

export interface setStringValue extends dispatch {
    field: string
    string: string
}

export interface setFile extends dispatch {
    file: File
}

export type annotationEntryAction = dispatch | setImageSource | setImageVisibility | loadAnnotation | setStringValue | setFile
export type annotationDataTransferAction = openAnnotationEntryModal | closeAnnotationEntryModal