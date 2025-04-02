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
import { button, ModalBody } from "@nextui-org/react"
import { Modal } from "@nextui-org/react"
import HyperlinkModal from "@/components/Shared/Modals/HyperLink"

// Main JSX
export default function Annotation(props: { annotation: string, setAnnotation?: Dispatch<SetStateAction<string>>, field?: string }) {

    // Context
    const context = useContext(AnnotationEntryData)
    const dispatch = context ? context.annotationEntryDataDispatch : null

    const [hyperlinkUrl, setHyperlinkUrl] = useState('')
    const [hyperlinkText, setHyperlinkText] = useState('')

    // Refs
    const dialog = useRef<HTMLDialogElement>()
    const divTextArea = useRef<HTMLDivElement>()

    const getSelection = () => { if (typeof window !== 'undefined' && window.getSelection()) return window.getSelection() as Selection }

    // Dark mode hyperlink hex: #4EA8DE
    // Light mode hyperlink hex: #0000EE

    const replaceText = (selection: Selection | undefined) => {

        if (selection) {
            const range = selection.getRangeAt(0)
            const text = selection.toString()
            const newHtml = `<span style="color: #4EA8DE; text-decoration: underline;"><a href="${hyperlinkUrl}" target="_blank" rel="noopener noreferrer">${text}</a></span>`
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = newHtml
            const newNode = tempDiv.firstChild
            range.deleteContents()
            range.insertNode(newNode as ChildNode)
        }
        else console.log('No Selection')
    }

    useEffect(() => {
        if (!dialog.current?.open) (dialog.current as HTMLDialogElement).show()
        else (dialog.current as HTMLDialogElement).close()
    })

    return <>
        <HyperlinkModal ref={dialog} />
        <div className="flex justify-between w-[95%]">
            <p className="text-xl mb-1">Annotation<span className="text-red-600 ml-1">*</span></p>
            <div><button onClick={() => replaceText(getSelection())}>Hyperlink</button></div>
        </div>
        <div ref={divTextArea as MutableRefObject<HTMLDivElement>} contentEditable className="w-[95%] min-w-[300px] min-h-[400px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] p-4 text-[14px] outline-[#004C46]">
        </div>
        {/* <textarea
                className={`w-[95%] min-w-[300px] min-h-[400px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] p-4 text-[14px] outline-[#004C46]`}
                value={props.annotation}
                onChange={e => props.setAnnotation ? props.setAnnotation(e.target.value) : dispatch ? dispatch({ type: 'setStringValue', field: props.field, string: e.target.value }) : null}>
            </textarea> */}
    </>
}