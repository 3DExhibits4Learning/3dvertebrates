/**
 * 
 * @returns 
 */
export const getLocalEnv = () => process.env.LOCAL_ENV

/**
 * 
 * @returns 
 */
export const isLocalDevEnv = () => 'development' === getLocalEnv()

/**
 * 
 * @returns 
 */
export const getLocalPrefix = () => isLocalDevEnv() ? 'X:' : 'public/data'

/**
 * 
 * @param path 
 * @returns 
 */
export const convertCloudPathToLocalPath = (path: string) => 'X:' + path.slice(11)

/**
 * 
 * @param values 
 */
export const checkEssentialValues = (values: any[]) => { for (let i in values) { if (!i) throw new Error(`Error: Value for ${i} is missing`) } }

/**
 * 
 * @param path 
 * @returns 
 */
export const convertDbPathToLocalPath = (path: string) => 'X:' + path.slice(5)

/**
 * 
 * @param oldUrl 
 * @returns 
 */
export const getPathToUnlink = (path?: string) => path ? isLocalDevEnv() ? convertDbPathToLocalPath(path) : path : ''