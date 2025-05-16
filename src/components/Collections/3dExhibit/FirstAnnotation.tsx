/**
 * @file src/components/Collections/3dExhibit/FirstAnnotation.tsx
 * 
 * @fileoverview first annotation metadata
 */

import { GbifResponse } from "@/interface/interface"
import { addCommas, boolRinse, arrayFromObjects } from "../SketchfabDom"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"

import Vertebrates from '@/classes/HerbariumClass'

export default function FirstAnnotation(props: {gMatch: GbifResponse, s: Vertebrates}) {
    const gMatch = props.gMatch
    const s = props.s // s = specimen

    return <div className="w-full h-[65%]" id="annotationDivMedia" style={{ display: "block" }}>
        <div className='fade flex w-[99%] mt-[25px]'>
            <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                <p> Classification </p>
            </div>
            <div className='w-[65%] py-[20px] justify-center items-center text-center'>
                <p>Species: <i><span className='text-[#FFC72C]'>{gMatch.species}</span></i></p>
                <p>Kingdom: {gMatch.kingdom}</p>
                <p>Phylum: {gMatch.phylum}</p>
                <p>Order: {gMatch.order}</p>
                <p>Family: {gMatch.family}</p>
                <p>Genus: <i>{gMatch.genus}</i></p>
            </div>
        </div>

        <div className='fade flex w-[99%] mt-[25px]'>
            <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                <p> Profile </p>
            </div>
            <div className='w-[65%] py-[20px] justify-center items-center text-center px-[2%]'>
                {s.commonNames.length > 1 && !s.model.comm_name_string && <p>Common Names: {addCommas(s.commonNames)}</p>}
                {s.commonNames.length === 1 && !s.model.comm_name_string && <p>Common Name: {s.commonNames[0]}</p>}
                {s.model.comm_name_string && <p>Common Names: {s.model.comm_name_string}</p>}
                {s.profile.extinct !== '' && <p>Extinct: {boolRinse(s.profile.extinct as string)}</p>}
                {s.profile.habitat && !s.model.habitat_string && <p>Habitat: {toUpperFirstLetter(s.profile.habitat)}</p>}
                {s.model.habitat_string && <p>Habitat: {toUpperFirstLetter(s.model.habitat_string)}</p>}
                {s.profile.freshwater !== '' && <p>Freshwater: {boolRinse(s.profile.freshwater as string)}</p>}
                {s.profile.marine !== '' && <p>Marine: {boolRinse(s.profile.marine as string)}</p>}
            </div>
        </div>

        <div className='fade flex w-[99%] mt-[25px]'>
            <div className='annotationBorder w-[35%] flex text-[1.5rem] justify-center items-center py-[20px] border-r'>
                <p> 3D Model </p>
            </div>
            <div className='w-[65%] py-[20px] justify-center items-center text-center'>
                <p>Build method: {s.model.build_process}</p>
                <p>Created with: {arrayFromObjects(s.software)}</p>
                <p>Modeler: {s.model.modeled_by}</p>
                <p>Annotator: {s.getAnnotator()}</p>
            </div>
        </div>

        <br></br>

        {
            s.wikiSummary &&
            <>
                <br></br>
                <h1 className='fade text-center text-[1.5rem]'>Description</h1>
                <p dangerouslySetInnerHTML={{ __html: s.wikiSummary.extract_html }} className='fade text-center pr-[1.5%] pl-[0.5%]'></p>
                <br></br>
                <p className='fade text-center text-[0.9rem]'>from <a href={s.wikiSummary.content_urls?.desktop?.page} target='_blank'><u>Wikipedia</u></a></p>
            </>
        }

    </div>
}