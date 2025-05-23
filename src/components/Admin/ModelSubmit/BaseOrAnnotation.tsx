import { useEffect, SetStateAction, Dispatch } from "react"

const BaseOrAnnotation = (props : { defaultValue?: string, value: string, setValue: Dispatch<SetStateAction<string>>}) => {

    return (
        <>
        <p className='text-2xl mt-8 ml-12'>Is this a base model or annotation model?<span className="text-red-600"> *</span></p>
        <div className='grid grid-cols-2 w-[250px] mt-4 ml-12'>
            <div className='flex items-center'><label className='text-xl'>Base</label></div>
            <div className='flex items-center'><input onChange={(e) => props.setValue(e.target.value)} className='mt-1' type='radio' value='base' name='baseOrAnnotation'></input></div>
            <div className='flex items-center'><label className='text-xl mr-4'>Annotation</label></div>
            <div className='flex items-center'><input onChange={(e) => props.setValue(e.target.value)} className='mt-1' type='radio' value='annotation' name='baseOrAnnotation'></input></div>
        </div>
        </>
    )
}

export default BaseOrAnnotation