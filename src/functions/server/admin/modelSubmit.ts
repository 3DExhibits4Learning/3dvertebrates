/**
 * @file src\functions\server\admin\modelSubmit.ts
 * 
 * @fileoverview server side model submission logic
 */

'use server'

/**
 * 
 * @param tmpId 
 * @returns 
 * @detail this function behaves asynchronously even when async is not added to the function; hence async's addidtion as to not aggravate the IDE
 */
export const getTmpPath = async(tmpId: string) => process.env.LOCAL_ENV === 'development' ? `X:/Vertebrates/tmp/models/${tmpId}` : `public/data/Vertebrates/tmp/models/${tmpId}`