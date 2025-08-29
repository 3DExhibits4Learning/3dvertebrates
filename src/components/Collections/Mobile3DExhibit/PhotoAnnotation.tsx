import { fullAnnotation } from "@/interface/interface";
import { Skeleton } from "@heroui/react";
import { photo_annotation } from "@prisma/client";

export default function MobilePhotoAnnotation(props: { imgSrc: string | null, annotations: fullAnnotation[], imgLoading: boolean, index: number }) {
    const annotations = props.annotations

    return <>
        {
            props.imgLoading &&
            <section>
                <div className="fade w-full h-full text-center">
                    <Skeleton className="w-full h-full" />
                </div>
            </section>
        }
        {
            !props.imgLoading && props.imgSrc &&
            <section id="modalMedia2">
                <div className="fade w-full h-full text-center">
                    <img className="center w-full h-[50vh]" src={props.imgSrc} alt={`Annotation number ${annotations[props.index - 1].annotation_no}`}></img>
                </div>
            </section>
        }
        <span>
            <section id="modalText">
                <br></br>
                <p dangerouslySetInnerHTML={{ __html: annotations[props.index - 1].annotation.annotation as string }} className="m-auto text-center fade"></p>
            </section>
            <section id="modalCitation">
                <br></br>
                <p className="fade text-center w-[95%]"> Photo by: {(annotations[props.index - 1].annotation as photo_annotation).author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{(annotations[props.index - 1].annotation as photo_annotation).license}</a></p>
            </section>
        </span>
    </>
}