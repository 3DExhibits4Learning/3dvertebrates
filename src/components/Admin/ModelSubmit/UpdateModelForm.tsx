/**
 * @file src/components/ModelSubmit/UpdateModelForm.tsx
 * 
 * @fileoverview The form for updating 3D models
 * 
 * @todo add red asterisks to mandatory fields
 */

'use client'

// Typical imports
import { useState, useEffect } from 'react'
import { Button } from "@nextui-org/react"
import { Divider } from '@nextui-org/react'
import { UpdateModelFormProps } from '@/interface/interface'
import { v4 as uuidv4 } from 'uuid'
import { chunkFileToTmp, uploadFileToTmp } from '@/functions/client/modelSubmit'

// Default imports
import ProcessSelect from './ProcessSelectField'
import TagInput from './Tags'
import DataTransferModal from '../../Shared/Modals/DataTransferModal'
import TextInput from '../../Shared/Form Fields/TextInput'
import AutoCompleteWrapper from '../../Shared/Form Fields/AutoCompleteWrapper'
import ModelInput from './ModelInput'
import LatLng from './LatLng'
import JSZip from 'jszip'

// Main component
export default function UpdateModelForm(props: UpdateModelFormProps) {

    // Variable initialization
    const model = props.model
    const tagArr = model.tags.map((tagObject) => tagObject.tag)
    const softwareArr = model.software.map((softwareObject) => softwareObject.software)
    var tagString = ''
    var softwareString = ''

    // Creating tag and software strings
    for (let i in tagArr) tagString += tagArr[i] + ','
    for (let i in softwareArr) softwareString += softwareArr[i] + ','

    // Variable initialization - field states
    const [species, setSpecies] = useState<string>(model.spec_name)
    const [speciesAcquisitionDate, setSpeciesAcquisitionDate] = useState<string>(model.spec_acquis_date ? model.spec_acquis_date : '')
    const [lat, setLat] = useState<string>(model.lat ? model.lat.toString() : '')
    const [lng, setLng] = useState<string>(model.lng ? model.lng.toString() : '')
    const [artist, setArtist] = useState<string>(model.modeled_by)
    const [buildMethod, setBuildMethod] = useState<string>(model.build_process)
    const [software, setSoftware] = useState<{ value: string }[]>(model.software.map((softwareObject) => ({ value: softwareObject.software })))
    const [tags, setTags] = useState<{ value: string }[]>(model.tags.map((tagObject) => ({ value: tagObject.tag })))
    const [file, setFile] = useState<File | null>(null)
    const [commonName, setCommonName] = useState<string>(model.pref_comm_name ?? '')

    // Data transfer states
    const [updateDisabled, setUpdateDisabled] = useState<boolean>(true)
    const [open, setOpen] = useState<boolean>(false)
    const [transferring, setTransferring] = useState<boolean>(false)
    const [result, setResult] = useState<string>('')

    // Render states
    const [reRenderKey, setReRenderKey] = useState<number>(Math.random())
    const [reRenderKey1, setReRenderKey1] = useState<number>(Math.random())

    // Edit handler
    const edit3DModelHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {

        try {

            // Prevent default and set initial data transfer states
            e.preventDefault()
            setOpen(true)
            setTransferring(true)

            // If there is a file, replace the original file in sketchfab
            if (file) {

                const modelFile = file as File
                const tmpId = uuidv4()
                await uploadFileToTmp(modelFile, tmpId).catch(e => { throw Error(e.message) })

                const modelReuploadData = new FormData()
                modelReuploadData.set('uid', model.uid)
                modelReuploadData.set('tmpId', tmpId)
                modelReuploadData.set('fileName', modelFile.name)

                await fetch('/api/modelSubmit', { method: 'PUT', body: modelReuploadData })
                    .then(res => {
                        if (!res.ok) throw Error('Bad reupload request')
                        return res.json()
                    })
                    .catch((e) => {
                        if (process.env.LOCAL_ENV === 'development') console.error(e.message)
                        throw Error('Error reuploading model')
                    })
            }

            // Set edited data
            const data = new FormData()

            const formSoftware = JSON.stringify(software.filter(obj => obj.value))
            const formTags = JSON.stringify(software.filter(obj => obj.value))
            const formPosition = JSON.stringify({ lat: lat, lng: lng })

            data.set('artist', artist)
            data.set('species', species)
            data.set('buildMethod', buildMethod)
            data.set('software', formSoftware)
            data.set('tags', formTags)
            data.set('position', formPosition)
            data.set('speciesAcquisitionDate', speciesAcquisitionDate as string)
            data.set('commonName', commonName)

            // Update model data in the database and set resultant states
            await fetch('/api/modelSubmit', {
                method: 'PATCH',
                body: data
            })
                .then(res => res.json())
                .then(json => {
                    setResult(json.data)
                    setTransferring(false)
                })
                .catch(e => {
                    setResult(e.message)
                    setTransferring(false)
                })
        }

        // Typical catch
        catch (e: any) {
            if (process.env.LOCAL_ENV === 'development') console.error(e.message)
            setResult('Error updating model')
        }
    }

    // Set form field states upon changing of the selected 3D model
    useEffect(() => {
        setSpecies(props.model.spec_name)
        setSpeciesAcquisitionDate(model.spec_acquis_date ?? '')
        setReRenderKey(reRenderKey + 1)
        setReRenderKey1(reRenderKey1 + 1)
    }, [props.model])

    // Enable/disable the upload button
    useEffect(() => {

        // Appropriate then stringify initial values for comparison
        const initialSoftware = model.software.map((softwareObject) => ({ value: softwareObject.software }))
        const initialTags = model.tags.map((tagObject) => ({ value: tagObject.tag }))
        const initialFormValues = JSON.stringify([model.spec_name, model.spec_acquis_date, model.modeled_by, model.build_process, model.lat, model.lng, initialSoftware, initialTags])
        const currentFormValues = JSON.stringify([species, speciesAcquisitionDate, artist, buildMethod, lat, lng, software, tags])

        // Set upload disabled button state
        if (species && artist && buildMethod && software.length && currentFormValues !== initialFormValues) setUpdateDisabled(false)
        else setUpdateDisabled(true)

    }, [species, speciesAcquisitionDate, artist, buildMethod, software, tags])

    return <>
        <DataTransferModal open={open} transferring={transferring} result={result} loadingLabel='Uploading 3D Model' href='/admin' modelUpload />

        <form className='w-full lg:w-3/5 lg:border-2 m-auto lg:border-[#004C46] lg:rounded-md bg-[#D5CB9F] dark:bg-[#212121] lg:mb-16'>

            <Divider />

            <div className='flex items-center h-[75px]'>
                <p className='ml-12 text-3xl'>Specimen Data</p>
            </div>

            <Divider className='mb-6' />

            <AutoCompleteWrapper value={species} setValue={setSpecies} />
            <TextInput value={commonName} setValue={setCommonName} title='Common Name' leftMargin='ml-12' textSize='text-2xl' />
            <LatLng lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
            <TagInput key={reRenderKey} value={tags} setValue={setTags} defaultValues={tagString} />

            <Divider className='mt-8' />

            <h1 className='ml-12 text-3xl mt-4 mb-4'>Model Data</h1>

            <Divider className='mb-8' />

            <TextInput value={artist} setValue={setArtist} title='3D Modeler Name' required leftMargin='ml-12' textSize='text-2xl' />
            <ProcessSelect value={buildMethod} setValue={setBuildMethod} defaultValue={model.build_process} />
            <TagInput key={reRenderKey1} value={software} setValue={setSoftware} defaultValues={softwareString} title='Enter any software used to create the model' marginTop='mt-12' marginBottom='mb-4' />
            <ModelInput setFile={setFile} />

            <Button
                isDisabled={updateDisabled}
                color='primary'
                onClick={edit3DModelHandler}
                className='text-white text-xl mb-24 mt-8 ml-12'>Save changes
            </Button>

        </form>
    </>
}
