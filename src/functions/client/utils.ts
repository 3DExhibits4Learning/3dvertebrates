'use client'

/**
 * @file src\functions\client\utils.ts
 * 
 * @fileoverview client utilities
 */

export const lengthNoWhitespace = (s: string) => s.replace(/\s/g, "").length

/**
 * 
 * @param email 
 * @returns 
 */
export const isIT = (email: string | undefined | null) => email === process.env.NEXT_PUBLIC_IT_EMAIL

/**
 * 
 * @param url raw photo url from database; should begin with /data
 * @returns appropriate url based on whether the environment is local development
 */

export const photoUrlPrefix = (url: string) => process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `/api/nfs?path=${getLocalNfsPrefix()}${url.slice(4)}` : `/api/nfs?path=public/${url}`

/**
 * 
 * @param rawUrl 
 * @returns 
 */
export const getNfsPath = (rawUrl: string) => {
    const url = replaceBackslashWithForwardSlash(rawUrl)
    return process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `/api/nfs?path=${getLocalNfsPrefix()}${url.slice(5)}` : `/api/nfs?path=public/${url}`
}

/**
 * 
 * @returns 
 */
export const getLocalNfsPrefix = () => process.env.NEXT_PUBLIC_LOCAL_NFS_PATH_PREFIX

/**
 * 
 * @param text 
 * @returns 
 */
export const replaceBackslashWithForwardSlash = (text: string) => text.replace(/\\/g, "/")

/**
 * 
 * @param html 
 * @returns 
 */
export const stripTagsExceptIAP = (html: string) => html.replace(/<\/?(?!i\b|a\b|p\b)[a-z][^>]*>/gi, '')

/**
 * 
 * @returns 
 */
export const getClientLocalEnv = () => process.env.NEXT_PUBLIC_NODE_ENV

/**
 * 
 * @returns 
 */
export const isLocalDevEnvClient = () => 'development' === getClientLocalEnv()

/**
 * 
 * @param fileName 
 * @returns 
 */
export const sanitizeFileName = (fileName: string) => fileName
    // Normalize Unicode to remove weird composed forms
    .normalize('NFKD')
    // Replace unsafe/invisible characters (non-printable, control, etc.)
    .replace(/[^\x20-\x7E]/g, '')
    // Remove disallowed/special characters for Windows/macOS/Linux
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    // Collapse multiple spaces or dashes
    .replace(/[\s]+/g, ' ')
    // Trim spaces and dots
    .trim()
    .replace(/\.+$/, '')

