import { fullAnnotation } from "@/interface/interface";

export default function MobileVideoAnnotation(props: { index: number, annotations: fullAnnotation[] }) {
    return <section id="modalVideo">
        <iframe className="w-full h-[77.5vh] fade" src={props.annotations[props.index - 1].url as string}></iframe>
    </section>
}