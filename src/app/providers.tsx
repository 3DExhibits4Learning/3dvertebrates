'use client'

import { IsClientCtxProvider } from '@/functions/utils/isClient'
import { HeroUIProvider } from '@heroui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <IsClientCtxProvider>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </IsClientCtxProvider>
  )
}