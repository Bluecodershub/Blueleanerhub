'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Trophy,
  MessageSquare,
  Briefcase,
  Award,
  Settings,
  FileText,
  Users,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  BookMarked,
  Bot,
  Star,
} from 'lucide-react'
import { useState } from 'react'

type SidebarSubItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type SidebarItem =
  | {
      name: string
      href: string
      icon: React.ComponentType<{ className?: string }>
    }
  | {
      name: string
      icon: React.ComponentType<{ className?: string }>
      section: string
      items: SidebarSubItem[]
    }

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['learn'])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  const navigation: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Learn',
      icon: BookOpen,
      section: 'learn',
      items: [
        { name: 'Tutorials', href: '/tutorials', icon: BookOpen },
        { name: 'Learning Tracks', href: '/learning-tracks', icon: TrendingUp },
        { name: 'Daily Quiz', href: '/daily-quiz', icon: Zap },
      ],
    },
    {
      name: 'Practice',
      icon: Code,
      section: 'practice',
      items: [
        { name: 'Coding IDE', href: '/ide', icon: Code },
        { name: 'Exercises', href: '/exercises', icon: FileText },
        { name: 'Organizations', href: '/organizations', icon: Briefcase },
      ],
    },
    {
      name: 'Hackathons',
      icon: Trophy,
      section: 'hackathons',
      items: [
        { name: 'Browse', href: '/hackathons', icon: Trophy },
        { name: 'Leaderboard', href: '/hackathons', icon: TrendingUp },
      ],
    },
    {
      name: 'Community',
      icon: Users,
      section: 'community',
      items: [
        { name: 'Q&A Hub', href: '/qna', icon: MessageSquare },
        { name: 'Dev Portal', href: '/dev', icon: Code },
        { name: 'Study Notebooks', href: '/notebooks', icon: BookMarked },
      ],
    },
    {
      name: 'AI Companion',
      href: '/ai-companion',
      icon: Bot,
    },
    {
      name: 'Certificates',
      href: '/certificates',
      icon: Award,
    },
    {
      name: 'Premium',
      href: '/premium',
      icon: Star,
    },
    {
      name: 'Settings',
      href: '/student/profile',
      icon: Settings,
    },
  ]

  return (
    <aside className="hidden shadow-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-background lg:pt-16">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {'items' in item ? (
                // Section with sub-items
                <>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted/60 hover:text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4.5 h-4.5" />
                      {item.name}
                    </div>
                    {expandedSections.includes(item.section) ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </button>

                  {expandedSections.includes(item.section) && (
                    <div className="ml-3 mt-0.5 space-y-0.5 pb-1">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                              pathname === subItem.href
                                ? 'bg-accent font-semibold text-primary'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            )}
                          >
                            <SubIcon className="h-4 w-4 shrink-0" />
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                // Single item
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    pathname === item.href
                      ? 'bg-accent font-semibold text-primary shadow-sm'
                      : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
