'use client'

import { IsClientCtxProvider } from '@/functions/utils/isClient'
import { NextUIProvider } from '@nextui-org/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <IsClientCtxProvider>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </IsClientCtxProvider>
  )
}