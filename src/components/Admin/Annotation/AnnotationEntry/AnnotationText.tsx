import { Dispatch, forwardRef, MutableRefObject, SetStateAction, useContext, useEffect } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"

export const AnnotationText = forwardRef((props: { setAnnotation?: Dispatch<SetStateAction<string>>, field?: string }, ref) => {

    const divTextArea = ref as MutableRefObject<HTMLDivElement>
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    useEffect(() => {
        if (divTextArea.current && divTextArea.current.innerHTML.trim() === '') {
            divTextArea.current.innerHTML = '<br />';
        }
    }, []);

    console.log('AnnotationText')

    return <div
        ref={divTextArea as MutableRefObject<HTMLDivElement>}
        id='divTextArea'
        contentEditable
        className="w-full min-w-[300px] min-h-[400px] rounded-xl mb-4 bg-white dark:bg-[#27272a] dark:hover:bg-[#3E3E47] p-4 text-[14px] outline-[#004C46] text-[#004C46] dark:text-white mr-12"
        onInput={e => props.setAnnotation ? props.setAnnotation(e.currentTarget.innerHTML) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.currentTarget.innerHTML }) : null}>
        <br />
    </div>
})

export default AnnotationText
AnnotationText.displayName = "AnnotationText"