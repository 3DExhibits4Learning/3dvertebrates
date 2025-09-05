/**
 * @file src\functions\server\collections.ts
 * 
 * @fileoverview collections server actions
 */

'use server'

// Typical imports
import { serverActionErrorHandler, catchMessage } from "./error"
import { fetchGbifVernacularNames, fetchGbifProfile, fetchWikiSummary } from "./fetchFunctions"
import { getSoftwares } from "./queries"
import { model } from "@prisma/client"

// Default imports
import prisma from "../utils/prisma"

// PATH
const path = 'src/functions/server/collections.ts'

/**
 * 
 * @param uid 
 * @param usageKey 
 * @param specimenName 
 * @returns 
 */
export const getCollectionMetadata = async (uid: string, usageKey: number, specimenName: string) => {
    try {
        // Await all promises
        const promises = [fetchGbifVernacularNames(usageKey), getSoftwares(uid), fetchGbifProfile(usageKey), fetchWikiSummary(specimenName)]
        const results = await Promise.all(promises).catch(e => serverActionErrorHandler(path, e.message, 'Promise.all(promises)', "Couldn't get collections metadata"))

        // Typical return
        return results
    }
    // Typical catch
    catch (e: any) { return catchMessage(e.message) }
}

/**
 * 
 * @returns 
 */
export const getCollectionModels = async () => {
    try {
        // Get models and return a stringified, site-ready filtred array of them
        const models = await prisma.model.findMany({where: {published: true, base_model: true, NOT: {thumbnail: null}}, orderBy: {spec_name: 'asc'}}).catch(e => serverActionErrorHandler(path, e.message, 'getAllModels()', "Coulnd't get models")) as model[]
        return JSON.stringify(models)
    }
    // Typical catch
    catch (e: any) { return catchMessage(e.message) }
}