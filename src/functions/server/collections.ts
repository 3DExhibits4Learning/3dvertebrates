/**
 * @file src\functions\server\collections.ts
 * 
 * @fileoverview collections server actions
 */

// Typical imports
import { serverActionErrorHandler, catchMessage } from "./error"
import { fetchGbifVernacularNames, fetchGbifProfile, fetchWikiSummary } from "./fetchFunctions"
import { getSoftwares } from "./queries"

// PATH
const path = 'src/functions/server/collections.ts'

// Main JSX
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