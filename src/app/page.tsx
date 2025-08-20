/**
 * @file src/app/page.tsx
 * 
 * @fileoverview Site landing page; simply redirects to collections/search. Keeping file structure in place in case of eventual landing page request.
 */

// Typical imports
import { isMobileOrTablet } from '@/functions/utils/isMobile'
import { redirect } from 'next/navigation'

// Default imports
import HomeWrapper from '@/components/Home/Wrapper'

export default function App() {
  const isMobile = isMobileOrTablet()
  if (isMobile) redirect('/collections/search')

  return <HomeWrapper />
}

