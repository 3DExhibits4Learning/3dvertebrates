import { Dispatch, SetStateAction } from "react"

const ArtistName = (props : { edit? : boolean, defaultValue?: string, value: string, setValue: Dispatch<SetStateAction<string>>}) => {

    const size = props.edit ? 'w-4/5' : 'w-4/5 md:w-3/5'
    const topMargin = props.edit ? 'mt-4' : 'mt-12'
    
    return (
        <div className={`${topMargin}`}>
            <label className='text-2xl ml-12 '>3D Modeler Name<span className="text-red-600"> *</span></label><br></br>
            <input autoComplete='off' 
            value={props.value}
            onChange={(e) => props.setValue(e.target.value)}
            type='text' 
            name='artistName' 
            defaultValue={props.defaultValue} 
            className={`${size} max-w-[500px] rounded-xl mb-4 ml-12 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 text-[14px] outline-[#004C46]`}></input>
        </div>
    )
}

export default ArtistName