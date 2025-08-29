import Herbarium from "@/classes/HerbariumClass"
import { addCommas, arrayFromObjects, boolRinse } from "@/components/Collections/SketchfabDom"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { GbifResponse } from "@/interface/interface"

export default function FirstMobileAnnotation(props: { gMatch: { hasInfo: boolean, data?: GbifResponse }, s: Herbarium }) {
    const gMatch = props.gMatch.data as GbifResponse
    const s = props.s

    return <section>
        <div className="fade w-full flex justify-center items-center pt-[20px] pb-[20px] text-center flex-col">
            <div className='text-[1.25rem] border-b border-t border-[#004C46] w-full'>
                <p> Classification </p>
            </div><br></br>
            <p>Species: <i><span className='text-[#FFC72C]'>{gMatch.species}</span></i></p>
            <p>Kingdom: {gMatch.kingdom}</p>
            <p>Phylum: {gMatch.phylum}</p>
            <p>Order: {gMatch.order}</p>
            <p>Family: {gMatch.family}</p>
            <p>Genus: <i>{gMatch.genus}</i></p>
        </div>

        <div className='fade flex w-full justify-center items-center pt-[20px] pb-[20px] text-center flex-col'>
            <div className='text-[1.25rem] border-b border-t border-[#004C46] w-full'>
                <p> Profile </p>
            </div><br></br>
            {s.commonNames.length > 1 && <p>Common Names: {addCommas(s.commonNames)}</p>}
            {s.commonNames.length == 1 && <p>Common Names: {s.commonNames[0]}</p>}
            {s.profile.extinct !== '' && <p>Extinct: {boolRinse(s.profile.extinct as string)}</p>}
            {s.profile.habitat && <p>Habitat: {toUpperFirstLetter(s.profile.habitat)}</p>}
            {s.profile.freshwater !== '' && <p>Freshwater: {boolRinse(s.profile.freshwater as string)}</p>}
            {s.profile.marine !== '' && <p>Marine: {boolRinse(s.profile.marine as string)}</p>}
        </div>

        <div className='fade flex w-full justify-center items-center pt-[20px] pb-[20px] text-center flex-col'>
            <div className='text-[1.25rem] border-b border-t border-[#004C46] w-full'>
                <p> 3D Model</p>
            </div><br></br>
            <p>Build method: {s.model.build_process}</p>
            <p>Created with: {arrayFromObjects(s.software)}</p>
            <p>Modeler: {s.model.modeled_by}</p>
            <p>Annotator: {s.getAnnotator()}</p>
        </div>

        {
            s.wikiSummary &&
            <div className='fade flex w-full justify-center items-center pt-[20px] pb-[20px] text-center flex-col'>
                <div className='text-[1.25rem] border-b border-t border-[#004C46] w-full'>
                    <p>Description</p>
                </div><br></br>
                <p dangerouslySetInnerHTML={{ __html: s.wikiSummary.extract_html }}></p><br></br>
                <p className="text-[0.9rem]">from <a href={s.wikiSummary.content_urls.desktop.page} target='_blank'><u>Wikipedia</u></a></p>
            </div>
        }
    </section>
}