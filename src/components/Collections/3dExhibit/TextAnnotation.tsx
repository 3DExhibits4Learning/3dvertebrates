/**
 * @file src/components/Collections/3dExhibit/VideoAnnotation.tsx
 * 
 * @fileoverview video annoation client
 */

import { text_annotation } from "@prisma/client"

export default function TextAnnotation(props: { textAnnotation: text_annotation }) {
    const textAnnotation = props.textAnnotation
    
    return <div id="annotationDivText">
        <br></br>
        <p dangerouslySetInnerHTML={{ __html: textAnnotation.annotation }} className='w-full text-center fade break-words' />
    </div>
}