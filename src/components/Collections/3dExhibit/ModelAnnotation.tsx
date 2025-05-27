import { model_annotation } from "@prisma/client"
import AnnotationModel from "../AnnotationModel"

export default function ModelAnnotation(props: { modelAnnotation: model_annotation }) {
    const modelAnnotation = props.modelAnnotation
    return <>
        {
            <>
                <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
                    <AnnotationModel uid={modelAnnotation.uid} />
                </div>
                <div id="annotationDivText">
                    <br></br>
                    <p dangerouslySetInnerHTML={{ __html: modelAnnotation.annotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
                </div>
                <div id="annotationDivCitation">
                    <br></br>
                    <p className='fade text-center w-[95%]'>Model by {modelAnnotation.modeler}</p>
                </div>
            </>
        }
    </>
}