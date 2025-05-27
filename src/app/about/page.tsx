/**
 * @file /app/about/page.tsx
 * 
 * @fileoverview the About page 
 */

import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'

export default function About(){
  return <>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
      <title>3D Herbarium - About Page</title>

      <Header pageRoute='inaturalist' headerTitle='About' />
      <main className='min-h-[calc(100vh-177px)] flex p-2 items-center flex-col'>
        <p className='text-xl mb-8'>Welcome to 3D Vertebrates, the second of the 3DExhibits4Learning along with the 3D Herbarium.</p>
        <p className='text-xl mb-8'>This project is a collaboration of the Cal Poly Humboldt Library and Vertebrate Museum. It began as an idea for a supervised study project (BIOL-499) by student Hannah Wirth.</p>
        <p className='text-xl mb-8'>The first beta testers and contributors were the Spring 2025 Advanced Mammology class, a class that had not been offered in 14 years!</p>
      </main>
      <Foot />
    </>
}