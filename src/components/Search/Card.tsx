/**
 * @file src/components/Search/Card.tsx
 * 
 * @fileoverview clickable cards for model search page
 */

// Typical imports
import { handleImgError } from "@/functions/utils/imageHandler"
import { model } from "@prisma/client"
import { getNfsPath } from "@/functions/client/utils"
import { SyntheticEvent, useState, useEffect } from "react"
import { toUpperFirstLetter } from "@/functions/utils/toUpperFirstLetter"
import { Skeleton } from "@heroui/react"

// Default imports
import noImage from '../../../public/noImage.png'

// Main JSX
export default function Card(props: { model: model }) {
    const model = props.model

    const [mobileAnnotationModalOpen, setMobileAnnotationModalOpen] = useState(false)
    const [src, setSrc] = useState('')
    const thumbnailPath = model.thumbnail ? getNfsPath(model.thumbnail) : ''

    // Photo src fn
    const setPhotoSrc = async () => {
        await fetch(thumbnailPath)
            .then(res => {
                if (!res.ok) setSrc('/noImage.png')
                else return res.blob()
            })
            .then(blob => setSrc(URL.createObjectURL(blob as Blob)))
    }

    // Photo src effect
    useEffect(() => { setPhotoSrc() }, [])

    return <div className='noselect'>
        <article className='rounded-md overflow-hidden mx-1'>
            {
                // Loading skeleton
                !src &&
                <section className='rounded shadow-md mx-auto'>
                    <Skeleton className="w-full h-[calc(100vh-275px)] min-h-[25rem] max-h-[30rem]" />
                </section>
            }
            {
                // Img displays once loaded
                src && <section className='rounded shadow-md mx-auto'>
                    <a href={model.base_model ? "/collections/" + model.spec_name : "/collections/" + model.spec_name + `?annotation=${model.uid}`} tabIndex={-1}>
                        <img
                            alt={'Image of ' + model.spec_name}
                            role='button'
                            src={src}
                            className='w-full h-[calc(100vh-275px)] min-h-[25rem] max-h-[30rem] object-cover relative z-5 rounded-t-md'
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => { handleImgError(e.currentTarget, noImage) }} />
                    </a>
                </section>
            }
            <section className='bg-[#98B8AD] dark:bg-[#3d3d3d] h-[5rem] max-h-[calc(100vh-300px)*0.2] opacity-[0.99] px-5 py-3 rounded-b-md text-center relative z-10 flex flex-col justify-center items-center space-y-1.5 mt-[-1px]'>
                <section className='flex items-center space-x-0.5rem'>
                    <a
                        href={"/collections/" + (model).spec_name}
                        rel='noopener noreferrer'
                        className='text-[#004C46] dark:text-[#C3D5D1] text-xl'>
                        <i className='text-lg'>{model.spec_name.charAt(0).toUpperCase() + model.spec_name.slice(1)}</i>
                    </a>
                </section>
                <section className='text-sm text-black dark:text-white'>
                    {toUpperFirstLetter(model.pref_comm_name)}
                </section>
            </section>
        </article>
    </div>
}