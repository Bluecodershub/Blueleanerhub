import Header from '@/components/layout/Header'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-16 text-foreground">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--info)/0.07),transparent_28rem)]" />
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </>
  )
}
