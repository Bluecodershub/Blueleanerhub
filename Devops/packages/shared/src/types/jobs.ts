export const JobType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
} as const

export type JobType = (typeof JobType)[keyof typeof JobType]

export const HackathonStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const

export type HackathonStatus = (typeof HackathonStatus)[keyof typeof HackathonStatus]

export interface Job {
  _id: string
  title: string
  company: string
  location: string
  type: JobType
  description?: string
  requirements?: string
  salary?: string
  applyUrl?: string
  isActive: boolean
  postedBy?: string
  createdAt: string
}

export interface JobApplication {
  _id: string
  jobId: string
  userId: string
  resumeUrl?: string
  coverLetter?: string
  status: string
  appliedAt: string
}

export interface Hackathon {
  _id: string
  title: string
  description?: string
  theme?: string
  startDate: string
  endDate: string
  status: HackathonStatus
  maxParticipants?: number
  prizePool?: string
  imageUrl?: string
  createdBy?: string
  participants?: number
  createdAt: string
}
