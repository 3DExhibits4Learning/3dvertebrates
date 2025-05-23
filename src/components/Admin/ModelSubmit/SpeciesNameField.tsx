import { Dispatch, useState, SetStateAction } from "react"
import Autocomplete from "../../Shared/Form Fields/AutoComplete"

const SpeciesName = (props: { edit?: boolean, value: string, setValue: Dispatch<SetStateAction<string>>}) => {

    const [speciesOptions, setSpeciesOptions] = useState<any[]>([])

    const fetchAutoCompleteSpecies = async () => {
        const speciesOptions = await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?taxon_id=1&rank=species&q=${props.value}`)
            .then(res => res.json()).then(json => json.results)
        setSpeciesOptions(speciesOptions)
    }

    const size = props.edit ? 'w-4/5' : 'w-4/5 md:w-3/5'
    
    return (
        <div className="w-full mb-8">
            <label className='text-2xl ml-12 '>Species Name<span className="text-red-600"> *</span></label><br></br>
            <Autocomplete
                options={speciesOptions}
                changeFn={fetchAutoCompleteSpecies}
                width={size}
                listWidth={`${size} ml-12 max-w-[500px]`}
                className={`inline-block h-[42px] ml-12 max-w-[500px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#3E3E47] px-4 text-[15px] outline-[#004C46] text-[#004C46] dark:text-white`}
                value={props.value}
                setValue={props.setValue}
                 />
        </div>
    )
}

export default SpeciesName