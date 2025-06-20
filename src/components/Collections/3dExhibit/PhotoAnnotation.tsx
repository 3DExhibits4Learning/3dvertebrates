/**
 * @file src/components/Collections/3dExhibit/PhotoAnnotation.tsx
 * 
 * @fileoverview photo annotation client
 */

import { fullAnnotation } from "@/interface/interface"
import { photo_annotation } from "@prisma/client"
import { Skeleton } from "@heroui/react"

export default function PhotoAnnotation(props: { annotation: fullAnnotation, imgSrc: string, imgLoading: boolean }) {
    const annotation = props.annotation
    const photoAnnotation = props.annotation.annotation as photo_annotation
    const imgLoading = props.imgLoading

    return <>
        <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
            {
                imgLoading &&
                <div className='w-full h-full justify-center'>
                    <Skeleton className="w-full h-full" />
                </div>
            }
            {
                !imgLoading &&
                <div className='w-full h-full text-center fade'>
                    <img key={Math.random()} className='fade center w-[98%] h-full pr-[2%] pt-[1%]'
                        src={props.imgSrc}
                        alt={`Image for annotation number ${annotation.annotation_no}`}>
                    </img>
                </div>
            }
        </div>
        <div id="annotationDivText">
            <br></br>
            <p dangerouslySetInnerHTML={{ __html: photoAnnotation.annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
        </div>
        <div id="annotationDivCitation">
            <br></br>
            <p className='fade text-center w-[95%]'>Photo by: {photoAnnotation.author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{photoAnnotation.license}</a></p>
        </div>
    </>
}