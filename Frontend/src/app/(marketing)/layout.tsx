import React from 'react'
import Header from '@/components/layout/Header'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-screen">{children}</div>
    </>
  )
}

