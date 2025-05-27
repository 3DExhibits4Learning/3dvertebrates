/**
 * @file src/app/page.tsx
 * 
 * @fileoverview Site landing page; simply redirects to collections/search. Keeping file structure in place in case of eventual landing page request.
 */

// Default imports
import Header from '@/components/Header/Header'
import HomeModel from '@/components/Home/model'
import Foot from '@/components/Shared/Foot'

export default function App() {

  return <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"></meta>
      <meta name="description" content="An annotated collection of 3D Models by the Cal Poly Humboldt Vertebrate Museum and its students"></meta>
      <title>3D Vertebrate Museum</title>
      <Header headerTitle='Home' pageRoute='collections'/>
      <HomeModel />
      <Foot />
    </>
}

