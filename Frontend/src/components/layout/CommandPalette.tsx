'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { 
  Search, 
  Book, 
  Code, 
  Cpu, 
  Zap, 
  Users, 
  Trophy, 
  Layout, 
  ArrowRight 
} from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Search"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type to search tutorials, domains, or paths..."
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            
            <Command.Group heading="Engineering Domains" className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Item onSelect={() => runCommand(() => router.push('/library/computer-science'))}>
                <Code className="mr-2 h-4 w-4" />
                <span>Computer Science</span>
              </Item>
              <Item onSelect={() => runCommand(() => router.push('/library/mechanical'))}>
                <Cpu className="mr-2 h-4 w-4" />
                <span>Mechanical Engineering</span>
              </Item>
              <Item onSelect={() => runCommand(() => router.push('/library/electrical'))}>
                <Zap className="mr-2 h-4 w-4" />
                <span>Electrical Engineering</span>
              </Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border" />

            <Command.Group heading="Quick Links" className="mt-2 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Item onSelect={() => runCommand(() => router.push('/library'))}>
                <Book className="mr-2 h-4 w-4" />
                <span>All Tutorials</span>
              </Item>
              <Item onSelect={() => runCommand(() => router.push('/mentor'))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Expert Mentors</span>
              </Item>
              <Item onSelect={() => runCommand(() => router.push('/hackathons'))}>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Active Hackathons</span>
              </Item>
              <Item onSelect={() => runCommand(() => router.push('/student/dashboard'))}>
                <Layout className="mr-2 h-4 w-4" />
                <span>Student Dashboard</span>
              </Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Search for anything with BlueAI...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-background px-1.5 py-0.5 border border-border">Ctrl</kbd>
              <span>+</span>
              <kbd className="rounded bg-background px-1.5 py-0.5 border border-border">K</kbd>
            </div>
          </div>
        </div>
      </Command.Dialog>
    </>
  )
}

function Item({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
    >
      {children}
      <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-aria-selected:opacity-100" />
    </Command.Item>
  )
}
