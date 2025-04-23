/**
 * @file src\components\Admin\Annotation\AnnotationEntry\Annotation.tsx
 * 
 * @fileoverview annotation (text) entry component
 * 
 * @todo automate text hyperlink
 */

'use client'

// Typical imports
import { SetStateAction, Dispatch, useContext, useState, useRef, useEffect, MutableRefObject } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { insertAnnotationHyperlink, toggleLinkComponent } from "@/functions/client/annotationEntry"
import { Button } from "@nextui-org/react"

// Default imports
import Image from "next/image"

// Default imports
import HyperlinkModal from "@/components/Shared/Modals/HyperLink"

// Main JSX
export default function Annotation(props: { annotation: string, setAnnotation?: Dispatch<SetStateAction<string>>, field?: string, notRequired?: boolean }) {

    // Context
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    // States
    const [hyperlinkUrl, setHyperlinkUrl] = useState('')
    const [selectionText, setSelectionText] = useState('')
    const [linkAdded, setLinkAdded] = useState(0)

    // Refs
    const dialog = useRef<HTMLDialogElement>()
    const divTextArea = useRef<HTMLDivElement>()
    const selectionRange = useRef<Range>()

    // Hyperlink wrapper
    const annotationHyperlinkInsertionWrapper = () => insertAnnotationHyperlink(selectionRange, hyperlinkUrl, selectionText, dialog, setSelectionText, divTextArea, setLinkAdded, linkAdded)

    // Set div text area innerHTML
    useEffect(() => {
        const textArea = divTextArea.current as HTMLDivElement
        textArea.innerHTML = props.annotation
    }, [props.annotation])

    // Trigger state update when a hyperlink is added (signaling a change to the annotation thus enabling the save button)
    useEffect(() => {
        if (linkAdded) {
            const textArea = divTextArea.current as HTMLDivElement
            props.setAnnotation ? props.setAnnotation(textArea.innerHTML) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: textArea.innerHTML }) : null
        }
    }, [linkAdded])

    return <>
        <HyperlinkModal ref={dialog} setHyperLinkUrl={setHyperlinkUrl} hyperlinkWrapper={annotationHyperlinkInsertionWrapper} selectionText={selectionText} setSelectionText={setSelectionText} />
        <div className="flex justify-between w-full">
            <p className="text-xl mb-1">Annotation
                {props.notRequired !== true && <span className="text-red-600 ml-1">*</span>}
                {props.notRequired == true && <span className="ml-1">(Optional)</span>}
                </p>
            <div>
                <Button className='bg-[#004C46] text-white' onClick={() => toggleLinkComponent(dialog, selectionRange, setSelectionText)} size='sm'>
                    <Image src="/White Link Icon.svg" width={20} height={10} alt="Logo" className="pt-[3px]" />
                </Button>
            </div>
        </div>
        <div
            ref={divTextArea as MutableRefObject<HTMLDivElement>}
            id='divTextArea'
            contentEditable
            className="w-full min-w-[300px] min-h-[400px] rounded-xl mb-4 bg-white dark:bg-[#27272a] dark:hover:bg-[#3E3E47] p-4 text-[14px] outline-[#004C46] text-[#004C46] dark:text-white mr-12"
            onInput={e => props.setAnnotation ? props.setAnnotation(e.currentTarget.innerHTML) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.currentTarget.innerHTML }) : null}>
        </div>
    </>
}