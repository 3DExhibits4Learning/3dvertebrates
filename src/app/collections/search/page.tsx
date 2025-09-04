/**
 * @file /collections/search/page.tsx
 * 
 * @fileoverview page containing the list of site ready 3D models, for when users visit /collections/search
 */

// Default imports
import Header from "@/components/Header/Header"
import SearchPageContent from "@/components/Search/SearchPageContent"
import Foot from "@/components/Shared/Foot"
import { getCollectionModels } from "@/functions/server/collections"

export default async function SearchPage() {
  const modelsString = await getCollectionModels()
  
  return <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"></meta>
    <title>3D Vertebrates Collections</title>
    <Header headerTitle="Model Search" pageRoute="collections" />
    <section className="min-h-[calc(100vh-177px)]">
      <SearchPageContent models={modelsString} />
    </section>
    <Foot />
  </>
}