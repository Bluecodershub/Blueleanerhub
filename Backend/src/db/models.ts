import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN' | 'CORPORATE';
  domain?: string;
  level?: number;
  isActive: boolean;
  isBanned?: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  avatarUrl?: string;
  avatarConfig?: Record<string, any>;
  profilePicture?: string;
  bio?: string;
  location?: string;
  educationLevel?: string;
  collegeName?: string;
  graduationYear?: number;
  currentPosition?: string;
  company?: string;
  yearsExperience?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  phone?: string;
  totalPoints?: number;
  currentStreak?: number;
  longestStreak?: number;
  preferences?: Record<string, any>;
  notificationSettings?: Record<string, any>;
  skills?: Array<{ name: string; level: number }>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format',
    },
  },
  fullName: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'MENTOR', 'ADMIN', 'CORPORATE'], default: 'STUDENT' },
  domain: { type: String, trim: true },
  level: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  avatarUrl: { type: String },
  avatarConfig: { type: Schema.Types.Mixed, default: {} },
  profilePicture: { type: String },
  bio: { type: String },
  location: { type: String },
  educationLevel: { type: String },
  collegeName: { type: String },
  graduationYear: { type: Number },
  currentPosition: { type: String },
  company: { type: String },
  yearsExperience: { type: Number, default: 0 },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  portfolioUrl: { type: String },
  resumeUrl: { type: String },
  phone: { type: String, trim: true },
  totalPoints: { type: Number, default: 0, min: 0 },
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  preferences: { type: Schema.Types.Mixed, default: {} },
  notificationSettings: { type: Schema.Types.Mixed, default: {} },
  skills: [{ name: { type: String }, level: { type: Number, default: 1 } }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  lastActiveAt: { type: Date },
});

// Note: email index is automatically created by unique: true on the field
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1, role: 1 });

// Auto-update updatedAt on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Also update updatedAt when using findOneAndUpdate / updateOne / updateMany
UserSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  this.set({ updatedAt: new Date() });
});

export const User = mongoose.model<IUser>('User', UserSchema);

// User Achievements
export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  title: string;
  description: string;
  earnedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  earnedAt: { type: Date, default: Date.now },
});

UserAchievementSchema.index({ userId: 1 });

export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

// User Progress (for courses/lessons)
export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  lessonId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

UserProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

// User Credits (AI credits system)
export interface IUserCredits extends Document {
  userId: mongoose.Types.ObjectId;
  aiTokensBalance: number;
  bonusCredits: number;
  updatedAt: Date;
}

const UserCreditsSchema = new Schema<IUserCredits>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  aiTokensBalance: { type: Number, default: 50, min: 0 },
  bonusCredits: { type: Number, default: 0, min: 0 },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save
UserCreditsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const UserCredits = mongoose.model<IUserCredits>('UserCredits', UserCreditsSchema);

// User Subscriptions
export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  tier: 'EXPLORER' | 'INNOVATOR' | 'ENTERPRISE';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status?: string;
  expiresAt?: Date;
  updatedAt?: Date;
  createdAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tier: { type: String, enum: ['EXPLORER', 'INNOVATOR', 'ENTERPRISE'], default: 'EXPLORER' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  status: { type: String },
  expiresAt: { type: Date },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const UserSubscription = mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);

// Hackathons
export interface IHackathon extends Document {
  name: string;
  description: string;
  theme: string;
  organizerType: 'UNIVERSITY' | 'CORPORATE' | 'PLATFORM';
  organizerName?: string;
  organizerId?: mongoose.Types.ObjectId;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Pro';
  rules?: string;
  judgingCriteria?: string[];
  prizes: Array<{ rank: string; reward: string }>;
  registrationDeadline?: Date;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
  maxParticipants: number;
  prizePool?: string;
  entryFee?: number;
  currency?: string;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HackathonSchema = new Schema<IHackathon>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  theme: { type: String, trim: true },
  organizerType: {
    type: String,
    enum: ['UNIVERSITY', 'CORPORATE', 'PLATFORM'],
    default: 'PLATFORM',
  },
  organizerName: { type: String, trim: true },
  organizerId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  tags: [{ type: String, trim: true }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Pro'],
    default: 'Intermediate',
  },
  rules: { type: String },
  judgingCriteria: [{ type: String }],
  prizes: [{
    rank: { type: String, required: true },
    reward: { type: String, required: true },
  }],
  registrationDeadline: { type: Date },
  startDate: { type: Date, required: true },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: IHackathon, v: Date) {
        return v > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED'], default: 'DRAFT' },
  maxParticipants: { type: Number, default: 100, min: 1 },
  prizePool: { type: String, trim: true },
  entryFee: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'usd', lowercase: true, trim: true },
  imageUrl: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^https?:\/\//.test(v),
      message: 'Image URL must be a valid URL',
    },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on save
HackathonSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

HackathonSchema.index({ status: 1 });
HackathonSchema.index({ startDate: 1, endDate: 1 });
HackathonSchema.index({ status: 1, startDate: -1 });
HackathonSchema.index({ createdBy: 1 });
HackathonSchema.index({ organizerType: 1, status: 1 });

export const Hackathon = mongoose.model<IHackathon>('Hackathon', HackathonSchema);

// Hackathon Teams
export interface IHackathonTeam extends Document {
  hackathonId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  leaderId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  repoUrl?: string;
  demoUrl?: string;
  submissionLink?: string;
  createdAt: Date;
}

const HackathonTeamSchema = new Schema<IHackathonTeam>({
  hackathonId: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  name: { type: String, required: true },
  description: { type: String },
  leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  repoUrl: { type: String },
  demoUrl: { type: String },
  submissionLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

HackathonTeamSchema.index({ hackathonId: 1 });

export const HackathonTeam = mongoose.model<IHackathonTeam>('HackathonTeam', HackathonTeamSchema);

// Hackathon Submissions
export interface IHackathonSubmission extends Document {
  hackathonId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  score?: number;
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
}

const HackathonSubmissionSchema = new Schema<IHackathonSubmission>({
  hackathonId: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'HackathonTeam', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  repoUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^https?:\/\//.test(v),
      message: 'Repository URL must be a valid URL',
    },
  },
  demoUrl: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^https?:\/\//.test(v),
      message: 'Demo URL must be a valid URL',
    },
  },
  score: { type: Number, min: 0, max: 100 },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
});

HackathonSubmissionSchema.index({ hackathonId: 1, teamId: 1 }, { unique: true });

export const HackathonSubmission = mongoose.model<IHackathonSubmission>('HackathonSubmission', HackathonSubmissionSchema);

// Quizzes
export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
  }>;
  timeLimit?: number;
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number, required: true },
  }],
  timeLimit: { type: Number },
  category: { type: String },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

// Quiz Attempts
export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  answers: Array<{ questionId: string; selectedIndex: number; correct: boolean }>;
  startedAt: Date;
  completedAt?: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  answers: [{
    questionId: { type: String },
    selectedIndex: { type: Number },
    correct: { type: Boolean },
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

QuizAttemptSchema.index({ quizId: 1, userId: 1 });
QuizAttemptSchema.index({ userId: 1, startedAt: -1 }); // For user's quiz history
QuizAttemptSchema.index({ startedAt: -1 }); // For recent attempts

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

// Tutorials/Courses
export interface ITutorial extends Document {
  title: string;
  description: string;
  category: string;
  path: string;
  lessons: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TutorialSchema = new Schema<ITutorial>({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  path: { type: String, required: true },
  lessons: [{
    id: { type: String },
    title: { type: String },
    content: { type: String },
    order: { type: Number },
  }],
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
  isPublished: { type: Boolean, default: false },
  imageUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TutorialSchema.index({ path: 1 }, { unique: true });
TutorialSchema.index({ category: 1, isPublished: 1 });
TutorialSchema.index({ isPublished: 1, createdAt: -1 }); // For listing published tutorials
TutorialSchema.index({ difficulty: 1, isPublished: 1 }); // For filtering by difficulty

export const Tutorial = mongoose.model<ITutorial>('Tutorial', TutorialSchema);

// Exercises/Challenges
export interface IExercise extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode?: string;
  solution?: string;
  testCases?: Array<{ input: string; expected: string }>;
  tags: string[];
  spaceId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
  starterCode: { type: String },
  solution: { type: String },
  testCases: [{
    input: { type: String },
    expected: { type: String },
  }],
  tags: [{ type: String }],
  spaceId: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

ExerciseSchema.index({ category: 1, difficulty: 1 });
ExerciseSchema.index({ tags: 1 }); // For tag-based filtering
ExerciseSchema.index({ createdBy: 1 }); // For user's exercises

export const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);

// Exercise Submissions
export interface IExerciseSubmission extends Document {
  exerciseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  output?: string;
  submittedAt: Date;
}

const ExerciseSubmissionSchema = new Schema<IExerciseSubmission>({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  output: { type: String },
  submittedAt: { type: Date, default: Date.now },
});

ExerciseSubmissionSchema.index({ exerciseId: 1, userId: 1 });

export const ExerciseSubmission = mongoose.model<IExerciseSubmission>('ExerciseSubmission', ExerciseSubmissionSchema);

// Daily Challenges
export interface IDailyChallenge extends Document {
  date: Date;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode?: string;
  solution?: string;
  participants: number;
  createdAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>({
  date: { type: Date, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'] },
  starterCode: { type: String },
  solution: { type: String },
  participants: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const DailyChallenge = mongoose.model<IDailyChallenge>('DailyChallenge', DailyChallengeSchema);

// Spaces (challenge categories)
export interface ISpace extends Document {
  name: string;
  category: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

const SpaceSchema = new Schema<ISpace>({
  name: { type: String, required: true },
  category: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
});

SpaceSchema.index({ isActive: 1 });

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);

// Notebooks
export interface INotebook extends Document {
  title: string;
  description?: string;
  emoji?: string;
  content: string;
  language: string;
  isPublic: boolean;
  userId: mongoose.Types.ObjectId;
  forkCount: number;
  sourceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotebookSchema = new Schema<INotebook>({
  title: { type: String, required: true },
  description: { type: String },
  emoji: { type: String, default: '📓' },
  content: { type: String, default: '' },
  language: { type: String, default: 'text' },
  isPublic: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  forkCount: { type: Number, default: 0 },
  sourceCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NotebookSchema.index({ userId: 1 });
NotebookSchema.index({ isPublic: 1 });

export const Notebook = mongoose.model<INotebook>('Notebook', NotebookSchema);

// Jobs/Careers
export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  description: string;
  requirements: string[];
  applyUrl?: string;
  salary?: string;
  isActive: boolean;
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  type: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'] },
  description: { type: String },
  requirements: [{ type: String }],
  applyUrl: { type: String },
  salary: { type: String },
  isActive: { type: Boolean, default: true },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

JobSchema.index({ isActive: 1, type: 1 });
JobSchema.index({ isActive: 1, createdAt: -1 }); // For listing active jobs
JobSchema.index({ postedBy: 1 }); // For user's posted jobs

export const Job = mongoose.model<IJob>('Job', JobSchema);

// Job Applications
export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWED' | 'REJECTED' | 'OFFERED';
  appliedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  status: { type: String, enum: ['PENDING', 'REVIEWING', 'INTERVIEWED', 'REJECTED', 'OFFERED'], default: 'PENDING' },
  appliedAt: { type: Date, default: Date.now },
});

JobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

// Mentors & Batches
export interface IMentorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  expertise: string[];
  experience: number;
  bio?: string;
  hourlyRate?: number;
  isAvailable: boolean;
}

const MentorProfileSchema = new Schema<IMentorProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [{ type: String }],
  experience: { type: Number, default: 0 },
  bio: { type: String },
  hourlyRate: { type: Number },
  isAvailable: { type: Boolean, default: true },
});

export const MentorProfile = mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);

export interface IMentorBatch extends Document {
  name: string;
  description?: string;
  mentorId: mongoose.Types.ObjectId;
  studentIds: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

const MentorBatchSchema = new Schema<IMentorBatch>({
  name: { type: String, required: true },
  description: { type: String },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

MentorBatchSchema.index({ mentorId: 1, isActive: 1 });

export const MentorBatch = mongoose.model<IMentorBatch>('MentorBatch', MentorBatchSchema);

export interface IMentorSession extends Document {
  batchId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const MentorSessionSchema = new Schema<IMentorSession>({
  batchId: { type: Schema.Types.ObjectId, ref: 'MentorBatch', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60, min: 1 },
  meetingLink: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MentorSessionSchema.index({ mentorId: 1, scheduledAt: -1 });
MentorSessionSchema.index({ batchId: 1, scheduledAt: -1 });
export const MentorSession = mongoose.model<IMentorSession>('MentorSession', MentorSessionSchema);

export interface IMentorAssignment extends Document {
  batchId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  maxScore: number;
  status: 'PUBLISHED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const MentorAssignmentSchema = new Schema<IMentorAssignment>({
  batchId: { type: Schema.Types.ObjectId, ref: 'MentorBatch', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100, min: 1 },
  status: { type: String, enum: ['PUBLISHED', 'CLOSED'], default: 'PUBLISHED' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MentorAssignmentSchema.index({ mentorId: 1, createdAt: -1 });
MentorAssignmentSchema.index({ batchId: 1, dueDate: 1 });
export const MentorAssignment = mongoose.model<IMentorAssignment>('MentorAssignment', MentorAssignmentSchema);

// Certificates
export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'COURSE' | 'HACKATHON' | 'MENTORSHIP' | 'ACHIEVEMENT';
  issuedAt: Date;
  expiresAt?: Date;
  verificationCode: string;
}

const CertificateSchema = new Schema<ICertificate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['COURSE', 'HACKATHON', 'MENTORSHIP', 'ACHIEVEMENT'], required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  verificationCode: { type: String, required: true, unique: true },
});

CertificateSchema.index({ userId: 1 });

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

// Q&A
export interface IQnA extends Document {
  question: string;
  answer?: string;
  category: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  answeredBy?: mongoose.Types.ObjectId;
  upvotes: number;
  views: number;
  createdAt: Date;
}

const QnASchema = new Schema<IQnA>({
  question: { type: String, required: true },
  answer: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  upvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

QnASchema.index({ category: 1 });
QnASchema.index({ tags: 1 });

export const QnA = mongoose.model<IQnA>('QnA', QnASchema);

// Organizations
export interface IOrganization extends Document {
  name: string;
  slug?: string;
  type: 'UNIVERSITY' | 'COMPANY' | 'COMMUNITY';
  description?: string;
  website?: string;
  logoUrl?: string;
  adminIds: mongoose.Types.ObjectId[];
  talentPool: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  slug: { type: String, index: true, sparse: true },
  type: { type: String, enum: ['UNIVERSITY', 'COMPANY', 'COMMUNITY'] },
  description: { type: String },
  website: { type: String },
  logoUrl: { type: String },
  adminIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  talentPool: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

OrganizationSchema.index({ type: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);

// Leads (newsletter)
export interface ILead extends Document {
  email: string;
  source: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  email: { type: String, required: true, lowercase: true },
  source: { type: String, default: 'homepage_newsletter' },
  createdAt: { type: Date, default: Date.now },
});

LeadSchema.index({ email: 1 }, { unique: true });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

// Products (e-commerce/catalog)
export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock?: number;
  sku?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number },
  category: { type: String, required: true },
  images: [{ type: String }],
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  sku: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.index({ name: 1, category: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ tags: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

// Password Reset Tokens
export interface IPasswordResetToken extends Document {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  email: { type: String, required: true, lowercase: true, trim: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

PasswordResetTokenSchema.index({ email: 1, used: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

// Daily Quiz Attempts (deduplication: one attempt per user per day per domain)
export interface IDailyQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  quizDate: string;
  domain: string;
  score: number;
  xpEarned: number;
  createdAt: Date;
}

const DailyQuizAttemptSchema = new Schema<IDailyQuizAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizDate: { type: String, required: true },
  domain: { type: String, required: true },
  score: { type: Number, required: true },
  xpEarned: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

DailyQuizAttemptSchema.index({ userId: 1, quizDate: 1, domain: 1 }, { unique: true });

export const DailyQuizAttempt = mongoose.model<IDailyQuizAttempt>('DailyQuizAttempt', DailyQuizAttemptSchema);

// Frontend Error Logs
export interface IFrontendError extends Document {
  errorId: string;
  errorName: string;
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  componentName?: string;
  errorLevel: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const FrontendErrorSchema = new Schema<IFrontendError>({
  errorId: { type: String, required: true, unique: true },
  errorName: { type: String, default: 'Unknown Error' },
  errorMessage: { type: String, required: true },
  errorStack: { type: String },
  componentStack: { type: String },
  componentName: { type: String },
  errorLevel: { type: String, default: 'unknown' },
  url: { type: String },
  userAgent: { type: String },
  userId: { type: String },
  userEmail: { type: String },
  ipAddress: { type: String },
  sessionId: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

FrontendErrorSchema.index({ createdAt: -1 });
FrontendErrorSchema.index({ userId: 1 });

export const FrontendError = mongoose.model<IFrontendError>('FrontendError', FrontendErrorSchema);

// Payment Transactions (Stripe webhook records)
export interface IPaymentTransaction extends Document {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>({
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});


export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);

// Corporate Bounties
export interface IBounty extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  reward: number;
  currency: string;
  deadline: Date;
  status: 'open' | 'urgent' | 'closed' | 'completed';
  maxApplicants?: number;
  applicantCount: number;
  submissionCount: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Critical';
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BountySchema = new Schema<IBounty>({
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  reward: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'usd', lowercase: true, trim: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'urgent', 'closed', 'completed'], default: 'open', index: true },
  maxApplicants: { type: Number, min: 1 },
  applicantCount: { type: Number, default: 0, min: 0 },
  submissionCount: { type: Number, default: 0, min: 0 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Critical'], default: 'Medium' },
  skills: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BountySchema.index({ companyId: 1, createdAt: -1 });
BountySchema.index({ companyId: 1, status: 1 });

BountySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Bounty = mongoose.model<IBounty>('Bounty', BountySchema);

// ==========================================
// NEW ADAPTIVE ENGINEERING LEARNING SCHEMAS
// ==========================================

// User Onboarding Background Details
export interface IUserBackground extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  goals: string[];
  educationLevel: string;
  currentExperience: string;
  preferredLearningStyle: string;
  availableHoursPerDay: number;
  confidenceLevel: number;
  preferredLanguage: string;
  careerSwitchInfo?: string;
  hackathonInterest: boolean;
  toolFamiliarity: string[];
  createdAt: Date;
}

const UserBackgroundSchema = new Schema<IUserBackground>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  goals: [{ type: String }],
  educationLevel: { type: String, required: true },
  currentExperience: { type: String, required: true },
  preferredLearningStyle: { type: String, required: true },
  availableHoursPerDay: { type: Number, required: true },
  confidenceLevel: { type: Number, required: true },
  preferredLanguage: { type: String, required: true },
  careerSwitchInfo: { type: String },
  hackathonInterest: { type: Boolean, default: false },
  toolFamiliarity: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

UserBackgroundSchema.index({ userId: 1 }, { unique: true });
export const UserBackground = mongoose.model<IUserBackground>('UserBackground', UserBackgroundSchema);


// Adaptive Technical Assessment Instance
export interface IAssessmentQuestion {
  questionId: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string[];
  starterCode?: string;
  correctAnswer: string;
  userAnswer?: string;
  confidenceRating?: number;
  isCorrect?: boolean;
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  status: string;
  currentStep: number;
  totalQuestions: number;
  questions: IAssessmentQuestion[];
  overallScore?: number;
  startedAt: Date;
  completedAt?: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'IN_PROGRESS' },
  currentStep: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 5 },
  questions: [{
    questionId: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    starterCode: { type: String },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String },
    confidenceRating: { type: Number },
    isCorrect: { type: Boolean }
  }],
  overallScore: { type: Number },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

AssessmentSchema.index({ userId: 1, domain: 1 });
export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);


// AI Skill Scores & Placements
export interface ISkillScores extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  overallLevel: number;
  skills: Array<{ name: string; score: number; level: number }>;
  strengths: string[];
  weaknesses: string[];
  estimatedLevel: string;
  skillGaps: string[];
  updatedAt: Date;
}

const SkillScoresSchema = new Schema<ISkillScores>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  overallLevel: { type: Number, default: 1, min: 0, max: 10 },
  skills: [{
    name: { type: String, required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true }
  }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  estimatedLevel: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], default: 'BEGINNER' },
  skillGaps: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

SkillScoresSchema.index({ userId: 1, domain: 1 });
export const SkillScores = mongoose.model<ISkillScores>('SkillScores', SkillScoresSchema);


// Personalized Roadmaps
export interface IRoadmapNode {
  nodeId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  xpAwarded: number;
  estimatedWeeks: number;
  skillsRequired: string[];
  skillsUnlocked: string[];
  recommendedProjects: Array<{ title: string; description: string; difficulty: string }>;
  recommendedHackathons: Array<{ title: string; theme: string }>;
}

export interface ILearningPath extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  nodes: IRoadmapNode[];
  progressPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const LearningPathSchema = new Schema<ILearningPath>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  nodes: [{
    nodeId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED'], default: 'LOCKED' },
    xpAwarded: { type: Number, default: 0 },
    estimatedWeeks: { type: Number, default: 1 },
    skillsRequired: [{ type: String }],
    skillsUnlocked: [{ type: String }],
    recommendedProjects: [{
      title: { type: String, required: true },
      description: { type: String },
      difficulty: { type: String }
    }],
    recommendedHackathons: [{
      title: { type: String, required: true },
      theme: { type: String }
    }]
  }],
  progressPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

LearningPathSchema.index({ userId: 1, domain: 1 });
export const LearningPath = mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);


// AI Mentor Domain Conversations
export interface IMentorInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  mentorDomain: string;
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  lastActiveAt: Date;
}

const CHAT_HISTORY_MAX = 200;

const MentorInteractionSchema = new Schema<IMentorInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorDomain: { type: String, required: true },
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  lastActiveAt: { type: Date, default: Date.now }
});

MentorInteractionSchema.pre('save', function (next) {
  if (this.chatHistory.length > CHAT_HISTORY_MAX) {
    this.chatHistory = this.chatHistory.slice(-CHAT_HISTORY_MAX);
  }
  next();
});

MentorInteractionSchema.index({ userId: 1, mentorDomain: 1 });
export const MentorInteraction = mongoose.model<IMentorInteraction>('MentorInteraction', MentorInteractionSchema);

// ─── USER LEARNING TRACKING & WISHLIST ECOSYSTEM ───────────────────────────────

// Wishlist / Save Lesson
export interface ISavedLesson extends Document {
  userId: mongoose.Types.ObjectId;
  tutorialId: mongoose.Types.ObjectId;
  lessonId: string;
  savedAt: Date;
}

const SavedLessonSchema = new Schema<ISavedLesson>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tutorialId: { type: Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  lessonId: { type: String, required: true },
  savedAt: { type: Date, default: Date.now }
});

SavedLessonSchema.index({ userId: 1, tutorialId: 1, lessonId: 1 }, { unique: true });
export const SavedLesson = mongoose.model<ISavedLesson>('SavedLesson', SavedLessonSchema);

// Extended Lesson Progress (High-fidelity telemetry)
export interface ILessonProgressExtended extends Document {
  userId: mongoose.Types.ObjectId;
  tutorialId: mongoose.Types.ObjectId;
  lessonId: string;
  completionPercent: number;
  timeSpent: number; // in seconds
  completed: boolean;
  completedAt?: Date;
  revisitCount: number;
  domain: string;
  lastViewedAt: Date;
}

const LessonProgressExtendedSchema = new Schema<ILessonProgressExtended>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tutorialId: { type: Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  lessonId: { type: String, required: true },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 },
  timeSpent: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  revisitCount: { type: Number, default: 0 },
  domain: { type: String, required: true },
  lastViewedAt: { type: Date, default: Date.now }
});

LessonProgressExtendedSchema.index({ userId: 1, tutorialId: 1, lessonId: 1 }, { unique: true });
LessonProgressExtendedSchema.index({ userId: 1, domain: 1 });
export const LessonProgressExtended = mongoose.model<ILessonProgressExtended>('LessonProgressExtended', LessonProgressExtendedSchema);

// User Learning Activities
export interface IUserLearningActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'LESSON_VIEW' | 'LESSON_PROGRESS' | 'LESSON_COMPLETE' | 'QUIZ_SUBMIT' | 'CODE_RUN' | 'WISHLIST_ADD' | 'ROADMAP_NODE_COMPLETE';
  tutorialId?: mongoose.Types.ObjectId;
  lessonId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const UserLearningActivitySchema = new Schema<IUserLearningActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, required: true },
  tutorialId: { type: Schema.Types.ObjectId, ref: 'Tutorial' },
  lessonId: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

UserLearningActivitySchema.index({ userId: 1, createdAt: -1 });
export const UserLearningActivity = mongoose.model<IUserLearningActivity>('UserLearningActivity', UserLearningActivitySchema);

// Learning Sessions
export interface ILearningSession extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isActive: boolean;
  metadata?: Record<string, any>;
}

const LearningSessionSchema = new Schema<ILearningSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
});

LearningSessionSchema.index({ userId: 1, startTime: -1 });
export const LearningSession = mongoose.model<ILearningSession>('LearningSession', LearningSessionSchema);

// User Streak Log
export interface IUserStreakExtended extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: string[]; // List of YYYY-MM-DD active days
}

const STREAK_HISTORY_MAX = 400;

const UserStreakExtendedSchema = new Schema<IUserStreakExtended>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String },
  history: [{ type: String }]
});

UserStreakExtendedSchema.pre('save', function (next) {
  if (this.history.length > STREAK_HISTORY_MAX) {
    this.history = this.history.slice(-STREAK_HISTORY_MAX);
  }
  next();
});

export const UserStreakExtended = mongoose.model<IUserStreakExtended>('UserStreakExtended', UserStreakExtendedSchema);

// XP Tracking logs
export interface IXpTracking extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reason: string; // 'TUTORIAL_COMPLETE', 'QUIZ_SUBMIT', etc.
  createdAt: Date;
}

const XpTrackingSchema = new Schema<IXpTracking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

XpTrackingSchema.index({ userId: 1, createdAt: -1 });
export const XpTracking = mongoose.model<IXpTracking>('XpTracking', XpTrackingSchema);

// Personalized Recommendations Cache
export interface IPersonalizedRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  recommendedLessons: Array<{ tutorialId: mongoose.Types.ObjectId; title: string; difficulty: string; reason: string }>;
  recommendedExercises: Array<{ exerciseId: mongoose.Types.ObjectId; title: string; difficulty: string; reason: string }>;
  recommendedHackathons: Array<{ hackathonId: mongoose.Types.ObjectId; title: string; theme: string; reason: string }>;
  updatedAt: Date;
}

const PersonalizedRecommendationSchema = new Schema<IPersonalizedRecommendation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  domain: { type: String, required: true },
  recommendedLessons: [{
    tutorialId: { type: Schema.Types.ObjectId, ref: 'Tutorial', required: true },
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  recommendedExercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  recommendedHackathons: [{
    hackathonId: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    title: { type: String, required: true },
    theme: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const PersonalizedRecommendation = mongoose.model<IPersonalizedRecommendation>('PersonalizedRecommendation', PersonalizedRecommendationSchema);

// Refresh Tokens (for JWT rotation)
export interface IRefreshToken extends mongoose.Document {
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>({
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1, revoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

// ─── LEARNING CATALOG (Domains → Specializations → Courses → Modules → Labs) ──

export interface IDomain extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isPublished: boolean;
  createdAt: Date;
}

const DomainSchema = new Schema<IDomain>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  icon: { type: String },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const Domain = mongoose.model<IDomain>('Domain', DomainSchema);

export interface ISpecialization extends Document {
  domainId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isPublished: boolean;
  createdAt: Date;
}

const SpecializationSchema = new Schema<ISpecialization>({
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String },
  icon: { type: String },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
SpecializationSchema.index({ domainId: 1 });
SpecializationSchema.index({ domainId: 1, slug: 1 }, { unique: true });
export const Specialization = mongoose.model<ISpecialization>('Specialization', SpecializationSchema);

export interface ICourse extends Document {
  specializationId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours?: number;
  thumbnail?: string;
  tags: string[];
  isPublished: boolean;
  enrollmentCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  specializationId: { type: Schema.Types.ObjectId, ref: 'Specialization', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
  estimatedHours: { type: Number, default: 0 },
  thumbnail: { type: String },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  enrollmentCount: { type: Number, default: 0, min: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
CourseSchema.index({ specializationId: 1 });
CourseSchema.index({ isPublished: 1, difficulty: 1 });
export const Course = mongoose.model<ICourse>('Course', CourseSchema);

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
}

const ModuleSchema = new Schema<IModule>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
ModuleSchema.index({ courseId: 1, order: 1 });
export const Module = mongoose.model<IModule>('Module', ModuleSchema);

export interface ILab extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'PROJECT' | 'ASSIGNMENT' | 'QUIZ';
  order: number;
  isPublished: boolean;
  createdAt: Date;
}

const LabSchema = new Schema<ILab>({
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  type: { type: String, enum: ['PROJECT', 'ASSIGNMENT', 'QUIZ'], default: 'PROJECT' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
LabSchema.index({ moduleId: 1, order: 1 });
export const Lab = mongoose.model<ILab>('Lab', LabSchema);

// ─── LEARNING TRACKS ────────────────────────────────────────────────────────

export interface ILearningTrack extends Document {
  title: string;
  slug: string;
  description?: string;
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  thumbnail?: string;
  tags: string[];
  estimatedWeeks: number;
  enrollmentCount: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LearningTrackSchema = new Schema<ILearningTrack>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  domain: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  thumbnail: { type: String },
  tags: [{ type: String }],
  estimatedWeeks: { type: Number, default: 4 },
  enrollmentCount: { type: Number, default: 0, min: 0 },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
LearningTrackSchema.index({ domain: 1, isPublished: 1 });
LearningTrackSchema.index({ isPublished: 1, enrollmentCount: -1 });
export const LearningTrack = mongoose.model<ILearningTrack>('LearningTrack', LearningTrackSchema);

export interface ITrackCourse extends Document {
  trackId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  orderIndex: number;
  isRequired: boolean;
}

const TrackCourseSchema = new Schema<ITrackCourse>({
  trackId: { type: Schema.Types.ObjectId, ref: 'LearningTrack', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  orderIndex: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: true },
});
TrackCourseSchema.index({ trackId: 1, orderIndex: 1 });
TrackCourseSchema.index({ trackId: 1, courseId: 1 }, { unique: true });
export const TrackCourse = mongoose.model<ITrackCourse>('TrackCourse', TrackCourseSchema);

export interface ITrackEnrollment extends Document {
  userId: string;
  trackId: mongoose.Types.ObjectId;
  progressPercentage: number;
  enrolledAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const TrackEnrollmentSchema = new Schema<ITrackEnrollment>({
  userId:             { type: String, required: true },
  trackId:            { type: Schema.Types.ObjectId, ref: 'LearningTrack', required: true },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  enrolledAt:         { type: Date, default: Date.now },
  completedAt:        { type: Date },
  updatedAt:          { type: Date, default: Date.now },
});
TrackEnrollmentSchema.index({ userId: 1, trackId: 1 }, { unique: true });
TrackEnrollmentSchema.index({ userId: 1 });
export const TrackEnrollment = mongoose.model<ITrackEnrollment>('TrackEnrollment', TrackEnrollmentSchema);

// ─── DEVELOPER PORTAL (Repositories) ────────────────────────────────────────

export interface IRepository extends Document {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  visibility: 'public' | 'private';
  language?: string;
  topics?: string[];
  license?: string;
  totalCommits: number;
  starCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>({
  ownerId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  language: { type: String },
  topics: [{ type: String }],
  license: { type: String },
  totalCommits: { type: Number, default: 0 },
  starCount: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
RepositorySchema.index({ ownerId: 1, slug: 1 }, { unique: true });
RepositorySchema.index({ ownerId: 1, updatedAt: -1 });
RepositorySchema.index({ visibility: 1 });
export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);

export interface IRepositoryFile extends Document {
  repoId: mongoose.Types.ObjectId;
  path: string;
  content: string;
  language?: string;
  sizeBytes: number;
  updatedAt: Date;
}

const RepositoryFileSchema = new Schema<IRepositoryFile>({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  path: { type: String, required: true },
  content: { type: String, default: '' },
  language: { type: String },
  sizeBytes: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});
RepositoryFileSchema.index({ repoId: 1, path: 1 }, { unique: true });
export const RepositoryFile = mongoose.model<IRepositoryFile>('RepositoryFile', RepositoryFileSchema);

export interface ICommit extends Document {
  repoId: mongoose.Types.ObjectId;
  authorId: string;
  sha: string;
  message: string;
  branch: string;
  changesSummary?: { filesChanged: number; additions: number; deletions: number };
  createdAt: Date;
}

const CommitSchema = new Schema<ICommit>({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  authorId: { type: String, required: true },
  sha: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  branch: { type: String, default: 'main' },
  changesSummary: {
    filesChanged: { type: Number, default: 0 },
    additions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});
CommitSchema.index({ repoId: 1, createdAt: -1 });
CommitSchema.index({ authorId: 1 });
export const Commit = mongoose.model<ICommit>('Commit', CommitSchema);

export interface IIssue extends Document {
  repoId: mongoose.Types.ObjectId;
  authorId: string;
  number: number;
  title: string;
  body?: string;
  labels: string[];
  status: 'open' | 'closed';
  createdAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  authorId: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String },
  labels: [{ type: String }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});
IssueSchema.index({ repoId: 1, number: 1 }, { unique: true });
IssueSchema.index({ repoId: 1, status: 1, createdAt: -1 });
export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);

export interface IPullRequest extends Document {
  repoId: mongoose.Types.ObjectId;
  authorId: string;
  number: number;
  title: string;
  description?: string;
  sourceBranch?: string;
  targetBranch: string;
  diffContent?: string;
  status: 'open' | 'merged' | 'closed';
  aiReview?: string;
  aiReviewScore?: number;
  createdAt: Date;
}

const PullRequestSchema = new Schema<IPullRequest>({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  authorId: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  sourceBranch: { type: String },
  targetBranch: { type: String, default: 'main' },
  diffContent: { type: String },
  status: { type: String, enum: ['open', 'merged', 'closed'], default: 'open' },
  aiReview: { type: String },
  aiReviewScore: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
});
PullRequestSchema.index({ repoId: 1, number: 1 }, { unique: true });
PullRequestSchema.index({ repoId: 1, createdAt: -1 });
export const PullRequest = mongoose.model<IPullRequest>('PullRequest', PullRequestSchema);

export interface IRepositoryStar extends Document {
  userId: string;
  repoId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RepositoryStarSchema = new Schema<IRepositoryStar>({
  userId: { type: String, required: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  createdAt: { type: Date, default: Date.now },
});
RepositoryStarSchema.index({ userId: 1, repoId: 1 }, { unique: true });
export const RepositoryStar = mongoose.model<IRepositoryStar>('RepositoryStar', RepositoryStarSchema);

// ─── AI-GENERATED COURSE CONTENT ──────────────────────────────────────────────
// Stores the full lesson content generated by the AI for each roadmap node.
// Content is generated once and cached here for instant retrieval.

export interface ICourseContentSection {
  type: 'intro' | 'concept' | 'example' | 'code' | 'quiz' | 'summary' | 'exercise';
  title?: string;
  content: string;
  language?: string; // for code blocks
  explanation?: string;
  quiz?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface ICourseContent extends Document {
  userId: mongoose.Types.ObjectId;
  nodeId: string;
  domain: string;
  nodeTitle: string;
  estimatedMinutes: number;
  level: string;
  sections: ICourseContentSection[];
  keyTakeaways: string[];
  furtherReading: Array<{ title: string; url?: string; description: string }>;
  practiceExercises: Array<{
    title: string;
    description: string;
    starterCode?: string;
    language?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }>;
  generatedAt: Date;
  viewCount: number;
  lastViewedAt?: Date;
}

const CourseContentSchema = new Schema<ICourseContent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nodeId: { type: String, required: true },
  domain: { type: String, required: true },
  nodeTitle: { type: String, required: true },
  estimatedMinutes: { type: Number, default: 30 },
  level: { type: String, default: 'BEGINNER' },
  sections: [{
    type: { type: String, enum: ['intro', 'concept', 'example', 'code', 'quiz', 'summary', 'exercise'], required: true },
    title: { type: String },
    content: { type: String, required: true },
    language: { type: String },
    explanation: { type: String },
    quiz: [{
      question: { type: String },
      options: [{ type: String }],
      correctIndex: { type: Number },
      explanation: { type: String },
    }],
  }],
  keyTakeaways: [{ type: String }],
  furtherReading: [{
    title: { type: String, required: true },
    url: { type: String },
    description: { type: String },
  }],
  practiceExercises: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    starterCode: { type: String },
    language: { type: String },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
  }],
  generatedAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
});

CourseContentSchema.index({ userId: 1, nodeId: 1 }, { unique: true });
CourseContentSchema.index({ domain: 1, nodeId: 1 });
export const CourseContent = mongoose.model<ICourseContent>('CourseContent', CourseContentSchema);

// ─── NODE PROGRESS TRACKING ───────────────────────────────────────────────────

export interface IRoadmapNodeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  nodeId: string;
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: Date;
  xpAwarded: number;
  timeSpentMinutes: number;
  updatedAt: Date;
}

const RoadmapNodeProgressSchema = new Schema<IRoadmapNodeProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  nodeId: { type: String, required: true },
  status: { type: String, enum: ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED'], default: 'LOCKED' },
  completedAt: { type: Date },
  xpAwarded: { type: Number, default: 0 },
  timeSpentMinutes: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

RoadmapNodeProgressSchema.index({ userId: 1, domain: 1, nodeId: 1 }, { unique: true });
RoadmapNodeProgressSchema.index({ userId: 1, domain: 1 });
export const RoadmapNodeProgress = mongoose.model<IRoadmapNodeProgress>('RoadmapNodeProgress', RoadmapNodeProgressSchema);

// ─── COURSE ENROLLMENT ────────────────────────────────────────────────────────

export interface ICourseEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  enrolledAt: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progressPercent: number;
  completedAt?: Date;
}

const CourseEnrollmentSchema = new Schema<ICourseEnrollment>({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:        { type: String, required: true },
  enrolledAt:      { type: Date, default: Date.now },
  status:          { type: String, enum: ['ACTIVE', 'COMPLETED', 'DROPPED'], default: 'ACTIVE' },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  completedAt:     { type: Date },
});

CourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CourseEnrollmentSchema.index({ userId: 1, status: 1 });
export const CourseEnrollment = mongoose.model<ICourseEnrollment>('CourseEnrollment', CourseEnrollmentSchema);

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'CERT_EARNED' | 'FEEDBACK_RECEIVED' | 'HACKATHON_DEADLINE' | 'GRADED' | 'SYSTEM';
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['CERT_EARNED', 'FEEDBACK_RECEIVED', 'HACKATHON_DEADLINE', 'GRADED', 'SYSTEM'], default: 'SYSTEM' },
  title:     { type: String, required: true, trim: true },
  body:      { type: String, required: true },
  read:      { type: Boolean, default: false },
  link:      { type: String },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// ─── CAPSTONE SUBMISSION ──────────────────────────────────────────────────────

export interface ICapstoneSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  courseTitle?: string;
  repoUrl?: string;
  demoUrl?: string;
  description: string;
  grade?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'GRADED' | 'REJECTED';
  gradedBy?: mongoose.Types.ObjectId;
  submittedAt: Date;
  gradedAt?: Date;
}

const CapstoneSubmissionSchema = new Schema<ICapstoneSubmission>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:     { type: String, required: true },
  courseTitle:  { type: String },
  repoUrl:      { type: String, validate: { validator: (v: string) => !v || /^https?:\/\//.test(v), message: 'Must be a valid URL' } },
  demoUrl:      { type: String, validate: { validator: (v: string) => !v || /^https?:\/\//.test(v), message: 'Must be a valid URL' } },
  description:  { type: String, required: true },
  grade:        { type: Number, min: 0, max: 100 },
  feedback:     { type: String },
  status:       { type: String, enum: ['SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'REJECTED'], default: 'SUBMITTED' },
  gradedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  submittedAt:  { type: Date, default: Date.now },
  gradedAt:     { type: Date },
});

CapstoneSubmissionSchema.index({ userId: 1, courseId: 1 });
CapstoneSubmissionSchema.index({ status: 1 });
CapstoneSubmissionSchema.index({ gradedBy: 1, status: 1 });
export const CapstoneSubmission = mongoose.model<ICapstoneSubmission>('CapstoneSubmission', CapstoneSubmissionSchema);

// ─── CORPORATE PROFILE ────────────────────────────────────────────────────────

export interface ICorporateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  updatedAt: Date;
}

const CorporateProfileSchema = new Schema<ICorporateProfile>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName:  { type: String, required: true, trim: true },
  industry:     { type: String, trim: true },
  companySize:  { type: String },
  website:      { type: String, validate: { validator: (v: string) => !v || /^https?:\/\//.test(v), message: 'Must be a valid URL' } },
  location:     { type: String, trim: true },
  description:  { type: String },
  contactEmail: { type: String, lowercase: true, trim: true },
  contactPhone: { type: String, trim: true },
  logoUrl:      { type: String },
  updatedAt:    { type: Date, default: Date.now },
});

export const CorporateProfile = mongoose.model<ICorporateProfile>('CorporateProfile', CorporateProfileSchema);
