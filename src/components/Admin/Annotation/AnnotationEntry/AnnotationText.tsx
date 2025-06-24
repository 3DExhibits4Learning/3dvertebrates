import { ClipboardEvent, Dispatch, forwardRef, RefObject, SetStateAction, useContext, useEffect } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"

export const AnnotationText = forwardRef((props: { setAnnotation?: Dispatch<SetStateAction<string>>, field?: string }, ref) => {

    const divTextArea = ref as RefObject<HTMLDivElement>
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    const paste = (e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        if( typeof window !== 'undefined') document.execCommand('insertText', false, text)
    }

    return <div
        ref={divTextArea as RefObject<HTMLDivElement>}
        onPaste={paste}
        id='divTextArea'
        contentEditable
        suppressContentEditableWarning
        className="w-full min-w-[300px] min-h-[400px] rounded-xl mb-4 bg-white dark:bg-[#27272a] dark:hover:bg-[#3E3E47] p-4 text-[14px] outline-[#004C46] text-[#004C46] dark:text-white mr-12"
        onInput={e => props.setAnnotation ? props.setAnnotation(e.currentTarget.innerHTML) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.currentTarget.innerHTML }) : null}>
        <br />
    </div>
})

export default AnnotationText
AnnotationText.displayName = "AnnotationText"