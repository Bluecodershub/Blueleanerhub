import Header from '@/components/layout/Header'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="w-full">{children}</div>
      </div>
    </>
  )
}
