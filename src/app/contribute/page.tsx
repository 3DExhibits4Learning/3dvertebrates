/**
 * @file /app/contribute/page.tsx
 * 
 * @fileoverview page containing information on how to contribute to the 3D Digital Herbarium project.
 */

// Default imports
import Header from '@/components/Header/Header'
import Footer from '@/components/Shared/Foot'
import Link from 'next/link'

// Main component
export default function Contribute(){ return <>
  <Header headerTitle="contribute" pageRoute="collections" />
  <div className="h-[calc(100vh-177px)] pl-8 text-2xl">
    <br></br>
    <p>Thank you for considering contribution!</p>
    <br></br>
    <p>To give to the library, click <Link href='https://library.humboldt.edu/giving-library' target='_blank'><u>here</u></Link></p>
    <br></br>
    <p>To give to the vertebrate museum, click <Link href='https://giving.humboldt.edu/cal-poly-humboldt-vertebrate-museum' target='_blank'><u>here</u></Link></p>
    <br></br>
    <p>For code contributions, check out our <Link href='https://github.com/CPH3DH/3dHerbarium' target='_blank'><u>github</u></Link></p>
    <br></br>
    <p><Link href='/api/auth/signin'><u>admin portal</u></Link></p>
  </div>
  <Footer />
</>
}