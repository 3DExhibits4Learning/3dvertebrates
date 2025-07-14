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

    return <>
        {
            context.state.imgGtRect && <>
                <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
                    {
                        imgLoading &&
                        <div className='w-full h-full justify-center'>
                            <Skeleton className="w-full h-full" />
                        </div>
                    }
                    {
                        !imgLoading &&
                        <div className='flex w-full h-full text-center fade justify-center items-center'>
                            <img key={Math.random()} className='fade center w-[98%] h-full pr-[2%] pt-[1%]'
                                // <div className="h-fit w-fit mt-12">
                                //     <img key={Math.random()} className='fade center'
                                src={context.state.imgSrc as string}
                                alt={`Image for annotation number ${baseAnnotation.annotation_no}`}>
                            </img>
                            {/* </div> */}
                        </div>
                    }
                </div>
                <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: photoAnnotation.annotation as string }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                </div>
                <div id="annotationDivCitation">
                    <br></br>
                    <p className='fade text-center w-[95%]'>Photo by: {photoAnnotation.author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{photoAnnotation.license}</a></p>
                </div>
            </>
        }
        {
            !context.state.imgGtRect && <>
                <div className="w-full h-fit" id="annotationDivMedia" style={{ display: "block" }}>
                    {
                        imgLoading &&
                        <div className='w-full h-full justify-center'>
                            <Skeleton className="w-full h-full" />
                        </div>
                    }
                    {
                        !imgLoading &&
                        <div className='flex w-full h-full text-center fade justify-center items-center'>
                            <div className="h-fit w-fit mt-12">
                                <img key={Math.random()} className='fade center'
                                    src={context.state.imgSrc as string}
                                    alt={`Image for annotation number ${baseAnnotation.annotation_no}`}>
                                </img>
                            </div>
                        </div>
                    }
                </div>
                <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: photoAnnotation.annotation as string }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                </div>
                <div id="annotationDivCitation">
                    <br></br>
                    <p className='fade text-center w-[95%]'>Photo by: {photoAnnotation.author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{photoAnnotation.license}</a></p>
                </div>
            </>
        }
    </>
}