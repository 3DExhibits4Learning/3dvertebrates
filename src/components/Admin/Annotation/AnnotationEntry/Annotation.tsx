/**
 * @file src\components\Admin\Annotation\AnnotationEntry\Annotation.tsx
 * 
 * @fileoverview annotation (text) entry component
 * 
 * @todo diagnose stale annotation value on first render (note run count and dependency-less effect)
 */

'use client'

// Typical imports
import { SetStateAction, Dispatch, useContext, useState, useRef, useEffect, memo } from "react"
import { AnnotationEntryData } from "./AnnotationEntry"
import { insertAnnotationHyperlink, toggleLinkComponent } from "@/functions/client/annotationEntry"
import { Button } from "@nextui-org/react"

// Default imports
import Image from "next/image"

// Default imports
import HyperlinkModal from "@/components/Shared/Modals/HyperLink"
import AnnotationText from "./AnnotationText"
import { run } from "node:test"

// Main JSX
export default function Annotation(props: { annotation: string, setAnnotation?: Dispatch<SetStateAction<string>>, field?: string, notRequired?: boolean }) {

    // Context
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null
    const runCount = useRef(0)

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
        if(runCount.current < 2) {
        const textArea = divTextArea.current as HTMLDivElement
        textArea.innerHTML = props.annotation
        runCount.current++
        }
    })

    // Trigger state update when a hyperlink is added (signaling a change to the annotation thus enabling the save button)
    useEffect(() => {
        if (linkAdded) {
            const textArea = divTextArea.current as HTMLDivElement
            props.setAnnotation ? props.setAnnotation(textArea.innerHTML) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: textArea.innerHTML }) : null
        }
    }, [linkAdded])

    console.log(props.annotation)

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
        <AnnotationText ref={divTextArea} setAnnotation={props.setAnnotation} field={props.field} annotation={props.annotation} />
    </>
}