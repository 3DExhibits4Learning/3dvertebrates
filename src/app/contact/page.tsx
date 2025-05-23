/**
 * @file /app/contact/page.tsx
 * 
 * @fileoverview contains information on how to contact Cyril and AJ :)
 */

// Default imports
import Header from '@/components/Header/Header'
import Footer from '@/components/Shared/Foot'

// Main component
const Contact = () => <>
  <Header headerTitle="contribute" pageRoute="collections" />
  <div className="h-[calc(100vh-177px)] pl-8">
    <br></br>
    <p><u><a href='https://www.humboldt.edu/vertebrate-museum' target='_blank'>Cal Poly Humbold Vertebrates Museum</a></u></p>
    <br></br>
    <p>3DExhibits4Learning Director, AJ Bealum: ab632@humboldt.edu</p>
    <br></br>
    <p>Project Sponsor & Library Dean, Cyril Oberlander: cyril.oberlander@humboldt.edu</p>
  </div>
  <Footer />
</>
export default Contact