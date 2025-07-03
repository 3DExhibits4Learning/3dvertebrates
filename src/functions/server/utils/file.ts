import { mkdir, writeFile } from "fs/promises"
import { serverActionErrorHandler } from "@/functions/server/error"

/**
 * 
 * @param file 
 * @param dir 
 * @param path 
 */
export const autoWriteFile = async (file: File, dir: string, path: string) => {
    try {
        // Convert to file arrayBuffer, then arrayBuffer to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Make the directory and write a typed array from the buffer
        await mkdir(dir, { recursive: true })
        await writeFile(path, new Uint8Array(buffer))
    }
    catch (e: any) { serverActionErrorHandler(path, e.message, 'autoWriteFile()', "Error: Couldn't write file") }
}