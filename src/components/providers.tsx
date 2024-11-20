"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  )
}