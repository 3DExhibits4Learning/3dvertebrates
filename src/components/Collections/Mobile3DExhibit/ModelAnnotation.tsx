import { fullAnnotation } from '@/interface/interface'
import { model_annotation, photo_annotation } from '@prisma/client'
import dynamic from 'next/dynamic'

// Dynamic imports
const ModelViewer = dynamic(() => import('@/components/Shared/ModelViewer'), { ssr: false })

export default function MobileModelAnnotation(props: { index: number, annotations: fullAnnotation[] }) {
    const annotations = props.annotations
    console.log('Ran1')
    console.log(annotations[props.index - 1].annotation)

    return <>
        <section className="fade w-full h-full text-center">
            <ModelViewer uid={(annotations[props.index - 1].annotation as model_annotation).uid} minHeight="50vh" />
        </section>
        <section id="modalText">
            <br></br>
            <p dangerouslySetInnerHTML={{ __html: annotations[props.index - 1].annotation.annotation as string }} className="m-auto text-center fade"></p>
        </section>
        <section id="modalCitation">
            <br></br>
            <p className="fade text-center w-[95%]"> Photo by: {(annotations[props.index - 1].annotation as photo_annotation).author}, licensed under <a href='https://creativecommons.org/share-your-work/cclicenses/' target='_blank'>{(annotations[props.index - 1].annotation as photo_annotation).license}</a></p>
        </section>
    </>
}