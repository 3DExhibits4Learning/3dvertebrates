/**
 * @file src\functions\client\utils.ts
 * 
 * @fileoverview client utilities
 */

/**
 * 
 * @param url raw photo url from database; should begin with /data
 * @returns appropriate url based on whether the environment is local development
 */

export const photoUrlPrefix = (url: string) => {
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `api/nfs/path=${getLocalNfsPrefix()}${url.slice(5)}` : `public${url}`
}

export const getNfsPath = (rawUrl: string) => {
    const url = replaceBackslashWithForwardSlash(rawUrl)
    return process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `api/nfs/path=${getLocalNfsPrefix()}${url.slice(4)}` : `api/nfs/path=public${url}`
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