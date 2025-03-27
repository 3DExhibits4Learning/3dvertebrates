/**
 * @file src/components/ModelSubmit/UpdateModelForm.tsx
 * 
 * @fileoverview client component containing the form for uploading 3D models
 * 
 */

'use client'

// Imports
import { useState, useEffect } from 'react'
import { Button } from "@nextui-org/react"
import { Divider } from '@nextui-org/react'
import { v4 as uuidv4 } from 'uuid'
import { chunkFileToTmp, uploadFileToTmp } from '@/functions/client/modelSubmit'

// Default imports
import ArtistName from './ArtistNameField'
import SpeciesName from './SpeciesNameField'
import ProcessSelect from './ProcessSelectField'
import TagInput from './Tags'
import DataTransferModal from '../../Shared/Modals/DataTransferModal'
import SpeciesAcquisitionDate from './AcquisitionDate'
import ModelInput from './ModelInput'
import LatLng from './LatLng'
import BaseOrAnnotation from './BaseOrAnnotation'
import TextInput from '@/components/Shared/Form Fields/TextInput'

// Main component
export default function ModelSubmitForm() {

    // Variable initialization - field states
    const [species, setSpecies] = useState<string>('')
    const [speciesAcquisitionDate, setSpeciesAcquisitionDate] = useState<string>('')
    const [lat, setLat] = useState<string>('')
    const [lng, setLng] = useState<string>('')
    const [artist, setArtist] = useState<string>('')
    const [baseOrAnnotation, setBaseOrAnnotation] = useState('')
    const [buildMethod, setBuildMethod] = useState<string>('')
    const [software, setSoftware] = useState<{ value: string }[]>([])
    const [tags, setTags] = useState<{ value: string }[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [commonName, setCommonName] = useState<string>('')

    // Data transfer states
    const [uploadDisabled, setUploadDisabled] = useState<boolean>(true)
    const [open, setOpen] = useState<boolean>(false)
    const [transferring, setTransferring] = useState<boolean>(false)
    const [result, setResult] = useState<string>('')
    const [success, setSuccess] = useState<boolean>()

    // 3D model upload handler
    const handle3DModelUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {

        try {

            // Prevent default and set initial transfer states
            e.preventDefault()
            setOpen(true)
            setTransferring(true)

            // Stringify arrays and object
            const formSoftware = JSON.stringify(software.map(obj => obj.value))
            const formTags = JSON.stringify(software.map(obj => obj.value))
            const formPosition = JSON.stringify({ lat: lat, lng: lng })

            // Write file to tmp 
            const model = file as File
            const tmpId = uuidv4()
            await uploadFileToTmp(model, tmpId).catch(e => { throw Error(e.message) })

            // Set form data
            const data = new FormData()
            data.set('artist', artist)
            data.set('species', species)
            data.set('buildMethod', buildMethod)
            data.set('software', formSoftware)
            data.set('tags', formTags)
            data.set('position', formPosition)
            data.set('speciesAcquisitionDate', speciesAcquisitionDate)
            data.set('baseOrAnnotation', baseOrAnnotation)
            data.set('commonName', commonName)
            data.set('tmpId', tmpId)
            data.set('fileName', model.name)

            // Upload 3d model to sketchfab and insert model data into database via associated route handler
            await fetch('/api/modelSubmit', { method: 'POST', body: data })
                .then(res => { if (!res.ok) throw Error(res.statusText); return res.json() })
                .then(json => { setResult(json.data); setTransferring(false) })
                .catch(e => { throw Error(e.message) })
        }
        // Typical catch
        catch (e: any) {
            setResult(e.message)
            setTransferring(false)
            setSuccess(false)
        }
    }

    // Enable/disable the upload button
    useEffect(() => {

        if (species && artist && buildMethod && software.length && file && baseOrAnnotation) setUploadDisabled(false)
        else setUploadDisabled(true)

    }, [species, artist, buildMethod, software.length, file, baseOrAnnotation])

    return <>
        <DataTransferModal open={open} transferring={transferring} result={result} loadingLabel='Uploading 3D Model' href='/admin' modelUpload success={success} />

        <form className='w-full lg:w-3/5 lg:border-2 m-auto lg:border-[#004C46] lg:rounded-md bg-[#D5CB9F] dark:bg-[#212121] lg:mb-16 text-[#004C46] dark:text-white'>

            <Divider />

            <div className='flex items-center h-[75px]'>
                <p className='ml-12 text-3xl'>Specimen Data</p>
            </div>

            <Divider className='mb-6' />

            <SpeciesName value={species} setValue={setSpecies} />
            <TextInput value={commonName} setValue={setCommonName} title='Common Name' leftMargin='ml-12' textSize='text-2xl' />
            <SpeciesAcquisitionDate value={speciesAcquisitionDate} setValue={setSpeciesAcquisitionDate} />
            <LatLng lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
            <TagInput value={tags} setValue={setTags} />

            <Divider className='mt-8' />

            <h1 className='ml-12 text-3xl mt-4 mb-4'>Model Data</h1>

            <Divider />

            <ArtistName value={artist} setValue={setArtist} />
            <BaseOrAnnotation value={baseOrAnnotation} setValue={setBaseOrAnnotation} />
            <ProcessSelect value={buildMethod} setValue={setBuildMethod} />
            <TagInput value={software} setValue={setSoftware} marginTop='mt-12' title='Enter any software used in creation of the 3D model (must enter at least 1)' required />
            <ModelInput setFile={setFile} />

            <Button
                isDisabled={uploadDisabled}
                color='primary'
                onClick={handle3DModelUpload}
                className='text-white text-xl mb-24 mt-8 ml-12'>Upload 3D Model
            </Button>

        </form>
    </>
}
