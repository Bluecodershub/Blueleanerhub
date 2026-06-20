'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import { PlatformNavigation } from '@/components/layout/PlatformNavigation'

export function HackathonsChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudentToolPage = /^\/hackathons\/[^/]+\/(submit|team)$/.test(pathname)

  if (isStudentToolPage) return <>{children}</>

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <PlatformNavigation />
        {children}
      </div>
    </>
  )
}
