export interface AnnotationNumbers { id: string, no: string }

export interface newAnnotationData {
    uid: string,
    position: string,
    url: string,
    annotation_no: number,
    annotation_id: string,
    annotation_type: string,
    title: string
}

export interface annotationDataEntryObj {
    index: string
    uid: string,
    annotationNo: string,
    annotationType: string, 
    position: string, 
    title: string,
    annotationId: string,
    annotation: string,
    file?: File,
    dir?: string,
    path?: string,
    url?: string,
    length?: string,
    modelAnnotationUid?: string,
    author?: string,
    license?: string,
    photoTitle?: string,
    website?: string
}

export interface annotationDataEntryUpdateObj extends annotationDataEntryObj {
    specimenName: string
    mediaTransition: boolean
    oldUrl?: string
    previousMedia?: string

}
