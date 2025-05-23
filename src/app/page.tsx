/**
 * @file src/app/page.tsx
 * 
 * @fileoverview Site landing page; simply redirects to collections/search. Keeping file structure in place in case of eventual landing page request.
 */

import { redirect } from 'next/navigation';

export default function App() {

  redirect('/collections/search')

  return <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"></meta>
      <meta name="description" content="An annotated collection of 3D Models by the Cal Poly Humboldt Vertebrate Museum and its Students"></meta>
      <title>3D Vertebrate Museum</title>
    </>
}

