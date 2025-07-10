/**
 * @file /app/collections/[specimenName]/page.tsx
 * 
 * @fileoverview the collections page for when users are viewing a specific specimen (genus or species).
 * Contains the 3D model (if it exists), images and inaturalist observations, map and leaderboard.
 */

// Typical Imports
import { GbifImageResponse, GbifResponse } from "@/interface/interface"
import { getCollectionsModels } from '@/functions/server/queries'
import { fetchSpecimenGbifInfo, fetchGbifImages } from "@/functions/server/fetchFunctions"
import { model } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


// Default Imports
import dynamic from "next/dynamic"
import CollectionsError from "@/components/Collections/CollectionsError"
import prisma from "@/functions/utils/prisma"
import ClientWrapper from "@/components/Collections/ClientWrapper"

// Dynamic Imports
const Header = dynamic(() => import('@/components/Header/Header'))

// Main JSX
export default async function Page({ params, searchParams }: { params: Promise<{ specimenName: string }>, searchParams: Promise<{}> }) {
  // Get parameters
  const parameters = await params
  const searchParameters = await searchParams
  const isPreview = !(Object.keys(searchParameters).length === 0)

  // Ensure there is a session if this is a preview
  if (isPreview) {
    const session = await getServerSession(authOptions)

    // Ensure the user is authorized if there is a session, else return error page
    if (session) {
      const userEmail = session.user?.email
      const authedUserEmails = await prisma?.authorized.findMany({ select: { email: true } }).then(authorizedEmails => authorizedEmails.map(emailObj => emailObj.email))

      if (!authedUserEmails.some(authedEmail => authedEmail === userEmail)) return <CollectionsError specimenName={parameters.specimenName} preview />
    }
    // Return error page if there isn't a session
    else return <CollectionsError specimenName={parameters.specimenName} preview />
  }

  // Variable declarations
  var promises = []
  var gMatch: any
  var _3dmodel: any
  var noModelData: any
  var images: any
  const decodedSpecimenName = decodeURI(parameters.specimenName)

  // Push GBIF fetch and getModel onto promise array
  promises.push(fetchSpecimenGbifInfo(parameters.specimenName), getCollectionsModels(decodedSpecimenName, isPreview))

  // Await the promises
  await Promise.all(promises).then(results => {

    // Populate variables with types
    gMatch = results[0] as { hasInfo: boolean, data?: GbifResponse }
    _3dmodel = results[1] as model[]

    // If there is a GBIF record of the specimen, fetch images
    if (gMatch.hasInfo) return fetchGbifImages(gMatch.data.usageKey, gMatch.data.rank)
  })
    // Populate variables with images (or undefined if there are no images)
    .then(res => {
      images = res
      noModelData = { title: 'Images from the Global Biodiversity Information Facility', images: images }
    })

  // If there is no model or GBIF record of the specimen, we test for a common name
  if (!_3dmodel.length) return <CollectionsError specimenName={parameters.specimenName} />

  return <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    {isPreview && <meta name="robots" content="noindex, nofollow" />} {/* No indexing for the preview query string as it's only for authed users */}
    <title>3D Vertebrates Collections</title>
    <Header searchTerm={parameters.specimenName} headerTitle={parameters.specimenName} hasModel={!!_3dmodel.length} pageRoute="collections" />
    <ClientWrapper model={JSON.stringify(_3dmodel)} gMatch={gMatch} specimenName={parameters.specimenName} noModelData={noModelData as { title: string, images: GbifImageResponse[] }} />
  </>
}


