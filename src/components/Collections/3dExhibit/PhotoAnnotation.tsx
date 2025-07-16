/**
 * @file src/components/Collections/3dExhibit/PhotoAnnotation.tsx
 * 
 * @fileoverview photo annotation client
 */

import { fullAnnotation } from "@/interface/interface"
import { photo_annotation } from "@prisma/client"
import { Skeleton } from "@heroui/react"
import { useContext } from "react"
import { collectionsContext, CollectionsContext } from "@/components/Collections/Collections"

// Main JSX
export default function PhotoAnnotation() {
    // Context, variables from context
    const context = useContext(CollectionsContext) as collectionsContext
    const index = context.state.index as number
    const annotations = context.state.annotations as fullAnnotation[]
    const baseAnnotation = annotations[index - 1]
    const photoAnnotation = baseAnnotation.annotation as photo_annotation
    const imgLoading = context.state.imgLoading
    const imgHeight = context.state.imgHeight as number
    const imgWidth = context.state.imgWidth as number

    // Boolean checks for image dimensions
    const bothDimensionsGreaterThanRect = context.state.imgHeightGtRect && context.state.imgWidthGtRect
    const compressHeight = (bothDimensionsGreaterThanRect && imgHeight >= imgWidth) || context.state.imgHeightGtRect && !context.state.imgWidthGtRect
    const compressWidth = (bothDimensionsGreaterThanRect && imgWidth > imgHeight) || context.state.imgWidthGtRect && !context.state.imgHeightGtRect
    const noCompression = !context.state.imgHeightGtRect && !context.state.imgWidthGtRect

    // JSX for text section
    const TextSection = () => <>
        <div id="annotationDivText">
            <br></br>
            <p dangerouslySetInnerHTML={{ __html: photoAnnotation.annotation as string }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
        </div>
        <div id="annotationDivCitation">
            <br></br>
            <p className='fade text-center w-[95%]'>Photo by: {photoAnnotation.author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{photoAnnotation.license}</a></p>
        </div>
    </>

    // JSX for images wider than the annotation div
    const WidthCompressedAnnotationImg = () => <div className='flex w-full text-center fade justify-center'>
        <div className="w-full mt-[2%] pr-[3%]">
            <img key={Math.random()} className='fade w-[98%] align-top'
                src={context.state.imgSrc as string}
                alt={`Image for annotation number ${baseAnnotation.annotation_no}`}>
            </img>
        </div>
    </div>

    // JSX for images taller than the annotation div
    const HeightCompressedAnnotationImg = () => <div className='flex w-full h-full text-center fade justify-center'>
        <div className="w-fit h-full">
            <img key={Math.random()} className='fade h-full align-top'
                src={context.state.imgSrc as string}
                alt={`Image for annotation number ${baseAnnotation.annotation_no}`}>
            </img>
        </div>
    </div>

    // JSX for images that do not require compression
    const UncompressedAnnotationImage = () => <div className='flex w-full h-full text-center fade justify-center'>
        <div className="h-fit w-fit mt-[2%]">
            <img key={Math.random()} className='fade align-top'
                src={context.state.imgSrc as string}
                alt={`Image for annotation number ${baseAnnotation.annotation_no}`}>
            </img>
        </div>
    </div>

    return <>
    {imgLoading && <div className='w-full h-full justify-center'> <Skeleton className="w-full h-full" /> </div> /* Skeleton loading for image */}
        {
            compressWidth && <>
                <div className="w-full pt-[2%]" id="annotationDivMedia" style={{ display: "block" }}>{!imgLoading && <WidthCompressedAnnotationImg />}</div>
                {!imgLoading && <TextSection />}
            </>
        }
        {
            compressHeight && <>
                <div className="w-full h-[65%] pt-[2%]" id="annotationDivMedia" style={{ display: "block" }}>{!imgLoading && <HeightCompressedAnnotationImg />}</div>
                {!imgLoading && <TextSection />}
            </>
        }
        {
            noCompression && <>
                <div className="w-full h-fit" id="annotationDivMedia" style={{ display: "block" }}>{!imgLoading && <UncompressedAnnotationImage />}</div>
                {!imgLoading && <TextSection />}
            </>
        }
    </>
}