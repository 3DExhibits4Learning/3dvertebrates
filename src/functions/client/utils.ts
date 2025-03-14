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

export const photoUrlPrefix = (url: string) => process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? `X:${url.slice(5)}` : `public${url}`