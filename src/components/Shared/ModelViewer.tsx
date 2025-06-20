"use client"

// Default imports
import Sketchfab from '@sketchfab/viewer-api'

// Typical imports
import { RefObject, useEffect, useRef } from 'react'

export default function ModelViewer(props: { uid: string, minHeight?: string, noAutoStart?: boolean }) {

    const modelViewer = useRef<HTMLIFrameElement>(undefined)
    const minHeight = props.minHeight ? props.minHeight : '150px'

    const successObj = {
        success: function onSuccess(api: any) {
            if (props.noAutoStart) { }
            else api.start()
        },
        error: function onError() { },
        ui_stop: 0,
        ui_infos: 0,
        ui_inspector: 0,
        ui_settings: 0,
        ui_watermark: 0,
        ui_annotations: 0,
        ui_color: "004C46",
        ui_fadeout: 0
    }

    useEffect(() => {
        const iframe = modelViewer.current as HTMLIFrameElement
        iframe.src = props.uid
        const client = new Sketchfab(iframe)
        client.init(props.uid, successObj)
    }, [props.uid]) // eslint-disable-line react-hooks/exhaustive-deps

    return <div className={`flex bg-black m-auto`} style={{ minHeight: minHeight, width: "100%", height: minHeight }}>
        <iframe
            ref={modelViewer as RefObject<HTMLIFrameElement>}
            frameBorder="0"
            title={"Model Viewer for " + ''}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            xr-spatial-tracking="true"
            execution-while-out-of-viewport="true"
            execution-while-not-rendered="true"
            web-share="true"
            allowFullScreen
            style={{ width: "100%" }} />
    </div>
}