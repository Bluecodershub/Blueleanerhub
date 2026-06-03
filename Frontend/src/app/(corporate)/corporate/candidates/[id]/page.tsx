'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Calendar,
  Star,
  Trophy,
  Code,
  Award,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Download,
  GitFork,
  Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const candidate = {
  id: '1',
  name: 'Priya Sharma',
  email: 'priya.sharma@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  location: 'Bangalore, India',
  joinedDate: '2025-06-15',
  level: 15,
  xp: 15420,
  xpToNext: 16000,
  score: 94,
  rank: 1,
  streak: 45,
  longestStreak: 67,
  skills: [
    { name: 'Python', level: 95 },
    { name: 'Machine Learning', level: 92 },
    { name: 'TensorFlow', level: 88 },
    { name: 'Data Science', level: 85 },
    { name: 'NLP', level: 82 },
    { name: 'PyTorch', level: 78 },
  ],
  bio: 'Passionate ML engineer with 3 years of experience in building AI solutions. Specialized in computer vision and natural language processing. Currently looking for opportunities in AI/ML research and development.',
  github: 'https://github.com/priyasharma',
  linkedin: 'https://linkedin.com/in/priyasharma',
  portfolio: 'https://priyasharma.dev',
  availability: 'Available for hire',
  education: 'B.Tech Computer Science, IIT Delhi (2024)',
  experience: '3 years',
}

const hackathonHistory = [
  {
    id: '1',
    title: 'AI Innovators Challenge 2026',
    rank: 1,
    score: 96,
    date: 'Mar 2026',
    prize: '$5,000',
    project: 'AI Image Classifier',
  },
  {
    id: '2',
    title: 'FinTech Revolution',
    rank: 2,
    score: 91,
    date: 'Feb 2026',
    prize: '$2,500',
    project: 'Payment Gateway Solution',
  },
  {
    id: '3',
    title: 'HealthTech Innovation',
    rank: 1,
    score: 94,
    date: 'Jan 2026',
    prize: '$3,000',
    project: 'Medical Diagnosis AI',
  },
  {
    id: '4',
    title: 'Smart City Challenge',
    rank: 3,
    score: 88,
    date: 'Dec 2025',
    prize: '$1,000',
    project: 'Traffic Optimization',
  },
]

const challenges = [
  { title: 'Binary Tree Traversal', difficulty: 'Easy', score: 100, solved: '2 days ago' },
  { title: 'Dynamic Programming - Knapsack', difficulty: 'Hard', score: 95, solved: '1 week ago' },
  { title: 'Graph Coloring Problem', difficulty: 'Medium', score: 88, solved: '2 weeks ago' },
  { title: 'API Rate Limiter', difficulty: 'Medium', score: 100, solved: '3 weeks ago' },
  { title: 'ML Model Deployment', difficulty: 'Hard', score: 92, solved: '1 month ago' },
]

const achievements = [
  { title: 'Rising Star', description: 'Reached Level 10', icon: Star, date: '2025-09-01' },
  { title: 'Algorithm Master', description: 'Solved 100 challenges', icon: Target, date: '2025-10-15' },
  { title: 'Hackathon Champion', description: 'Won 3 hackathons', icon: Trophy, date: '2026-01-15' },
  { title: 'Streak Master', description: '30-day streak', icon: Zap, date: '2025-08-20' },
  { title: 'Problem Solver', description: '500 problems solved', icon: Code, date: '2026-02-01' },
]

const submissionHistory = [
  { problem: 'Image Classifier', language: 'Python', status: 'Accepted', time: '45 min', date: '2 hours ago' },
  { problem: 'API Security', language: 'Node.js', status: 'Accepted', time: '32 min', date: '1 day ago' },
  { problem: 'Data Pipeline', language: 'Python', status: 'Accepted', time: '58 min', date: '3 days ago' },
  { problem: 'ML Pipeline', language: 'Python', status: 'Wrong Answer', time: '-', date: '1 week ago' },
]

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy: 'bg-green-500/10 text-green-500',
    Medium: 'bg-blue-500/10 text-blue-500',
    Hard: 'bg-red-500/10 text-red-500',
  }
  return <Badge className={styles[difficulty]}>{difficulty}</Badge>
}

export default function CandidateProfilePage() {
  const progress = (candidate.xp / candidate.xpToNext) * 100

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/corporate/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      {/* Profile Header */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback className="text-2xl">{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {candidate.rank}
                  </div>
                  <span className="text-sm font-medium">Global Rank</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{candidate.name}</h1>
                    <p className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </p>
                  </div>
                  <Badge className={candidate.availability === 'Available for hire' ? 'bg-green-500/10 text-green-500' : 'bg-muted'}>
                    {candidate.availability}
                  </Badge>
                </div>

                <p className="mt-4 text-muted-foreground">{candidate.bio}</p>

                {/* Level Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Zap className="h-4 w-4 text-primary" />
                      Level {candidate.level}
                    </span>
                    <span className="text-muted-foreground">
                      {candidate.xp.toLocaleString()} / {candidate.xpToNext.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={progress} className="mt-2 h-2" />
                </div>

                {/* Skills */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <div key={skill.name} className="flex items-center gap-2">
                        <Badge variant="outline">{skill.name}</Badge>
                        <span className="text-xs text-muted-foreground">{skill.level}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={candidate.github} target="_blank" rel="noopener noreferrer">
                      <GitFork className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Portfolio
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{candidate.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{candidate.streak}</p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{candidate.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{candidate.joinedDate.split('-')[0]}</p>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save Candidate
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hackathons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hackathons" className="gap-1">
            <Trophy className="h-4 w-4" />
            Hackathons
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-1">
            <Code className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Hackathons Tab */}
        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {hackathonHistory.map((hackathon) => (
              <Card key={hackathon.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{hackathon.title}</h3>
                      <p className="text-sm text-muted-foreground">{hackathon.project}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      #{hackathon.rank}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      {hackathon.score}%
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {hackathon.date}
                    </span>
                    <span className="text-primary font-medium">{hackathon.prize}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {challenges.map((challenge, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{challenge.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <DifficultyBadge difficulty={challenge.difficulty} />
                          <span className="text-xs text-muted-foreground">Solved {challenge.solved}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{challenge.score}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                    <achievement.icon className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {submissionHistory.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        sub.status === 'Accepted' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Code className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{sub.problem}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline">{sub.language}</Badge>
                          <Badge className={sub.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                            {sub.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{sub.date}</span>
                        </div>
                      </div>
                    </div>
                    {sub.time !== '-' && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{sub.time}</p>
                        <p className="text-xs text-muted-foreground">Execution</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
