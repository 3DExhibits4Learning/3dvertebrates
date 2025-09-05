/**
 * @file /collections/search/page.tsx
 * 
 * @fileoverview page containing the list of site ready 3D models, for when users visit /collections/search
 */

// Typical imports
import { serverActionErrorHandler } from "@/functions/server/error"
import { model } from "@prisma/client"
import { getUniqueSemesters } from "@/functions/client/search"

// Default imports
import Header from "@/components/Header/Header"
import SearchPageContent from "@/components/Search/SearchPageContent"
import Foot from "@/components/Shared/Foot"
import prisma from "@/functions/utils/prisma"

// Main JSX
export default async function SearchPage() {
  // Get models, modelers, and annotators
  const models = await prisma.model.findMany({where: {published: true, base_model: true, NOT: {thumbnail: null}}, orderBy: {spec_name: 'asc'}}).catch(e => serverActionErrorHandler('/collections/search/page.tsx', e.message, 'getAllModels()', "Coulnd't get models")) as model[]
  const semesters = ['All', ...getUniqueSemesters(models)]
  const modelsString = JSON.stringify(models)

  return <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"></meta>
    <title>3D Vertebrates Collections</title>
    <Header headerTitle="Model Search" pageRoute="collections" />
    <section className="min-h-[calc(100vh-177px)]">
      <SearchPageContent models={modelsString} semesters={semesters} />
    </section>
    <Foot />
  </>
}