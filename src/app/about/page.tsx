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
      <title>3D Vertebrates - About Page</title>

      <Header pageRoute='inaturalist' headerTitle='About' />
      <main className='min-h-[calc(100vh-177px)] flex p-2 items-center flex-col'>
        <p className='text-xl mb-8'>This project is a collaboration of the Cal Poly Humboldt Library and Vertebrate Museum. It began as an idea for a supervised study project (BIOL-499) by student Hannah Wirth.</p>
        <p className='text-xl mb-8'>The first beta testers and contributors were the Spring 2025 Advanced Mammology class, a class that had not been offered in 14 years!</p>
        <b><p className='text-xl mb-8'>Students interested in model production and annotation can contribute to the 3D Vertebrates site collection through supervised studies (BIOL-499). 
          Those with availability for a regular weekly commitment are encouraged to contact Vertebrate Museum curator Silvia Pavan.</p></b>
        <div className='w-full h-[1000px]'>
          <img className='w-full h-full object-cover' src='/About Photo.jpg'/>
        </div>
      </main>
      <Foot />
    </>
}