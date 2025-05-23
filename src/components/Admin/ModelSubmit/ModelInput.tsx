'use client'

import { SetStateAction, Dispatch } from "react"

export default function ModelInput(props:{setFile:Dispatch<SetStateAction<File | null>>}) {
    return (
        <div className='my-6 mx-12'>
            <p className='text-2xl mb-6'>Select your 3D model file.
                The supported file formats can be found <a href='https://support.fab.com/s/article/Supported-3D-File-Formats' target='_blank'><u>here</u></a>.
                If your format requires more than one file, zip the files then upload the folder. Maximum upload size is 500 MB.</p>
            <input onChange={(e) => {
                if (e.target.files?.[0])
                    props.setFile(e.target.files[0])
            }}
                type='file'
                name='file'
                id='formFileInput'
            >
            </input>
        </div>
    )
}