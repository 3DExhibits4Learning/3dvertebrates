export default function MobileTextAnnotation(props: { textAnnotation: string }) {
    return <div id="annotationDivText">
        <br></br>
        <p dangerouslySetInnerHTML={{ __html: props.textAnnotation }} className='m-auto pr-[3%] pl-[2%] text-center fade' />
    </div>
}