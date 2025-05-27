/**
 * @file src/components/Collections/3dExhibit/VideoAnnotation.tsx
 * 
 * @fileoverview video annoation client
 */

import { video_annotation } from "@prisma/client"

export default function VideoAnnotation(props: { videoAnnotation: video_annotation }) {
    const videoAnnotation = props.videoAnnotation
    console.log(videoAnnotation.url)
    return <>
        {
            !videoAnnotation.annotation &&
            <div className="w-full h-full" id="annotationDivVideo">
                {/*@ts-ignore - align works on iframe just fine*/}
                <iframe align='left' className='fade w-[calc(100%-15px)] h-full' src={videoAnnotation.url}></iframe>
            </div>
        }
        {
            videoAnnotation.annotation &&
            <>
                <div className="w-full h-[65%]" id="annotationDivVideo">
                    {/*@ts-ignore - align works on iframe just fine*/}
                    <iframe align='left' className='fade w-[calc(100%-15px)] h-full' src={videoAnnotation.url}></iframe>
                </div>
                <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: videoAnnotation.annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                </div>
            </>
        }
    </>
}