'use client'

import { SetStateAction, Dispatch } from "react"
import NumberInput from "@/components/Shared/Form Fields/NumberInput"

export default function LatLng(props: { lat: string, lng: string, setLat: Dispatch<SetStateAction<string>>, setLng: Dispatch<SetStateAction<string>> }) {
    return (
        <section className="ml-12 mb-6">
            <NumberInput value={props.lat} setValue={props.setLat as Dispatch<SetStateAction<string>>} title='Latitude' textSize="text-2xl"/>
            <NumberInput value={props.lng} setValue={props.setLng as Dispatch<SetStateAction<string>>} title='Longitude' textSize="text-2xl"/>
        </section>
    )
}