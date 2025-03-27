/**
 * @file src/functions/client/modelSubmit.ts
 * 
 * @fileoverview client side model submission logic
 */

'use client'

import { isZipFile } from "../utils/zip"
import JSZip from 'jszip'
import { v4 as uuidv4 } from 'uuid'

/**
 * 
 * @param zip 
 * @param tmpId 
 */
export const chunkFileToTmp = async (zip: Blob | File, tmpId: string) => {
    // Declare chunk size and offset
    const chunkSize = 4 * 1024 * 1024 // 4 MB chunks
    var offset = 0

    // Fetch chunks until file upload is complete
    while (offset < zip.size) {
        const chunk = zip.slice(offset, offset + chunkSize)
        offset += chunkSize

        // Set form data
        const data = new FormData()
        data.set('chunk', chunk)
        data.set('tmpId', tmpId)

        // Await fetch
        const res = await fetch('/api/modelSubmit/tmp', { method: 'POST', body: data })
        if (!res.ok) throw Error("Couldn't write file to disk")
    }

    return
}

export const zipFileIfNeeded = async (file: File | Blob, fileName: string) => {
    // Return file if it's already zipped
    if (await isZipFile(file)) return file

    // Return zipped file
    const zip = new JSZip()
    zip.file(fileName, file)
    return await zip.generateAsync({ type: 'blob' })
}

export const uploadFileToTmp = async(file: File, tmpId: string) => {
    const model = file as File
    await chunkFileToTmp(model, tmpId).catch(e => { throw Error(e.message) })
}
