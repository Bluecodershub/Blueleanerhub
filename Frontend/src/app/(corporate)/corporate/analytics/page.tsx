'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Trophy,
  Code,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const overviewStats = [
  {
    title: 'Total Candidates',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Active Hackathons',
    value: '3',
    change: '+1',
    trend: 'up',
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Avg. Score',
    value: '76.4%',
    change: '+2.3%',
    trend: 'up',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Completion Rate',
    value: '89%',
    change: '-1%',
    trend: 'down',
    icon: BarChart3,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
]

const domainStats = [
  { domain: 'Machine Learning', candidates: 423, avgScore: 82, growth: 15 },
  { domain: 'Web Development', candidates: 512, avgScore: 78, growth: 8 },
  { domain: 'Mobile Development', candidates: 234, avgScore: 74, growth: 12 },
  { domain: 'DevOps', candidates: 189, avgScore: 71, growth: 5 },
  { domain: 'Data Science', candidates: 356, avgScore: 79, growth: 18 },
  { domain: 'Blockchain', candidates: 98, avgScore: 68, growth: -3 },
]

const monthlyTrends = [
  { month: 'Jan', candidates: 234, submissions: 456, avgScore: 72 },
  { month: 'Feb', candidates: 312, submissions: 523, avgScore: 74 },
  { month: 'Mar', candidates: 287, submissions: 612, avgScore: 76 },
  { month: 'Apr', candidates: 356, submissions: 678, avgScore: 75 },
  { month: 'May', candidates: 398, submissions: 745, avgScore: 77 },
  { month: 'Jun', candidates: 423, submissions: 789, avgScore: 78 },
]

const topCompanies = [
  { name: 'TechCorp India', hires: 45, avgScore: 85 },
  { name: 'InnovateLabs', hires: 32, avgScore: 82 },
  { name: 'DataDriven Inc', hires: 28, avgScore: 88 },
  { name: 'CloudFirst', hires: 24, avgScore: 79 },
  { name: 'AI Solutions', hires: 19, avgScore: 91 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track performance metrics and hiring insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month} 2026</span>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {month.candidates}
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {month.submissions}
                      </span>
                      <span className="font-medium text-primary">{month.avgScore}%</span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${month.avgScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Hiring Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Hiring Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company, i) => (
                <div key={company.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.hires} hires</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{company.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance by Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {domainStats.map((domain) => (
              <div key={domain.domain} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{domain.domain}</span>
                    <Badge variant="outline" className="text-xs">
                      {domain.candidates} candidates
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Avg: <span className="font-medium text-foreground">{domain.avgScore}%</span>
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${
                      domain.growth >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {domain.growth >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(domain.growth)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${domain.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Skills in Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { skill: 'Python', count: 892, percentage: 85 },
                { skill: 'JavaScript', count: 756, percentage: 72 },
                { skill: 'Machine Learning', count: 634, percentage: 60 },
                { skill: 'React', count: 523, percentage: 50 },
                { skill: 'Node.js', count: 456, percentage: 43 },
                { skill: 'AWS', count: 398, percentage: 38 },
                { skill: 'Docker', count: 345, percentage: 33 },
                { skill: 'SQL', count: 312, percentage: 30 },
              ].map((skill) => (
                <div key={skill.skill} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium">{skill.skill}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">
                    {skill.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Registered', count: 2847, percentage: 100, color: 'bg-blue-500' },
                { stage: 'Profile Viewed', count: 1923, percentage: 68, color: 'bg-primary' },
                { stage: 'Contacted', count: 856, percentage: 30, color: 'bg-amber-500' },
                { stage: 'Interviewed', count: 234, percentage: 8, color: 'bg-green-500' },
                { stage: 'Hired', count: 128, percentage: 4, color: 'bg-purple-500' },
              ].map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count} ({stage.percentage}%)</span>
                  </div>
                  <div className="h-4 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-4 ${stage.color} transition-all`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
