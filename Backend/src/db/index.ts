import mongoose, { ClientSession } from 'mongoose';
import { AsyncLocalStorage } from 'async_hooks';

// Import all models
import {
  User,
  UserBackground,
  Assessment,
  SkillScores,
  LearningPath,
  MentorInteraction,
  UserAchievement,
  UserProgress,
  UserCredits,
  UserSubscription,
  Hackathon,
  HackathonTeam,
  HackathonSubmission,
  Quiz,
  QuizAttempt,
  Tutorial,
  Exercise,
  ExerciseSubmission,
  DailyChallenge,
  Space,
  Notebook,
  Job,
  JobApplication,
  MentorProfile,
  MentorBatch,
  Certificate,
  QnA,
  Organization,
  Lead,
  PasswordResetToken,
  DailyQuizAttempt,
  FrontendError,
  PaymentTransaction,
  SavedLesson,
  LessonProgressExtended,
  UserLearningActivity,
  LearningSession,
  UserStreakExtended,
  XpTracking,
  PersonalizedRecommendation,
  RefreshToken,
  // Learning catalog
  Domain,
  Specialization,
  Course,
  Module,
  Lab,
  // Learning tracks
  LearningTrack,
  TrackCourse,
  TrackEnrollment,
  // Developer portal
  Repository,
  RepositoryFile,
  Commit,
  Issue,
  PullRequest,
  RepositoryStar,
  // AI-generated course content
  CourseContent,
  RoadmapNodeProgress,
  // New modules
  CourseEnrollment,
  Notification,
  CapstoneSubmission,
  CorporateProfile,
  ConsentRecord,
  GrievanceTicket,
  MoodleCourseMapping,
  MoodleUserMapping,
  MoodleSyncLog,
} from './models';

// Re-export models for external use
export {
  User, UserBackground, Assessment, SkillScores, LearningPath, MentorInteraction,
  Hackathon, Quiz, Tutorial, Exercise, Job, Notebook, Space,
  Certificate, MentorProfile, MentorBatch, QnA, Organization, Lead,
  PasswordResetToken, DailyQuizAttempt, FrontendError, PaymentTransaction,
  SavedLesson, LessonProgressExtended, UserLearningActivity, LearningSession,
  UserStreakExtended, XpTracking, PersonalizedRecommendation, RefreshToken,
  // Learning catalog
  Domain, Specialization, Course, Module, Lab,
  // Learning tracks
  LearningTrack, TrackCourse, TrackEnrollment,
  // Developer portal
  Repository, RepositoryFile, Commit, Issue, PullRequest, RepositoryStar,
  // AI-generated course content & node progress
  CourseContent, RoadmapNodeProgress,
  // New modules
  CourseEnrollment, Notification, CapstoneSubmission, CorporateProfile,
  // Legal & compliance
  ConsentRecord, GrievanceTicket,
  // Moodle LMS integration
  MoodleCourseMapping, MoodleUserMapping, MoodleSyncLog,
} from './models';

// ─── Transaction session propagation ─────────────────────────────────────────
// AsyncLocalStorage propagates the active Mongoose session through the entire
// call stack inside db.transaction() without callers threading it manually.
const activeSession = new AsyncLocalStorage<ClientSession>();

// Attaches the active session (if any) to a Mongoose query
function injectSession<T extends mongoose.Query<any, any>>(q: T): T {
  const session = activeSession.getStore();
  return session ? (q.session(session) as T) : q;
}

// Wraps Model.create to support the active session
async function sessionCreate(Model: any, data: any): Promise<any> {
  const session = activeSession.getStore();
  if (session) {
    const [doc] = await Model.create([data], { session });
    return doc;
  }
  return Model.create(data);
}

// ─── Legacy SQL compat shim ──────────────────────────────────────────────────
// QueryBuilder/MutationBuilder mimic the Drizzle ORM query API so that stub
// controllers (tracks, learning, repositories) compile and return empty results.

class QueryBuilder {
  protected _promise: Promise<any[]> | null = null;
  protected model: any = null;
  protected conditions: Record<string, any> = {};
  protected sort: Record<string, number> = {};
  protected limitCount: number | null = null;
  protected skipCount: number | null = null;
  protected cursorFilter: Record<string, any> = {};
  protected cursorField: string | null = null;
  protected cursorSortDirection: number = -1; // -1 for desc, 1 for asc

  from(table: any) { this.model = table; return this; }
  leftJoin(_table: any, _on?: any) { return this; }
  innerJoin(_table: any, _on?: any) { return this; }

  where(condition?: any) {
    if (condition && typeof condition === 'object') Object.assign(this.conditions, condition);
    return this;
  }

  orderBy(...order: any[]) {
    for (const o of order) {
      if (typeof o === 'object') Object.assign(this.sort, o);
    }
    return this;
  }

  limit(n: number) { this.limitCount = n; return this; }
  offset(n: number) { this.skipCount = n; return this; }

  /**
   * Cursor-based pagination: pass the last seen value of the sort field
   * and the field name to paginate on. More efficient than offset for large datasets.
   */
  cursor(lastValue: any, field: string = '_id', direction: number = -1) {
    if (lastValue) {
      this.cursorFilter[field] = direction === -1 ? { $lt: lastValue } : { $gt: lastValue };
      this.cursorField = field;
      this.cursorSortDirection = direction;
    }
    return this;
  }

  $dynamic() { return this; }

  values(_data: any) { return this; }
  set(_data: any) { return this; }
  returning(_selection?: any) { return this; }
  onConflictDoUpdate(_config?: any) { return this; }
  onConflictDoNothing() { return this; }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    if (!this._promise) this._resolve();
    return this._promise!.then(onfulfilled as any, onrejected as any);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any[] | TResult> {
    if (!this._promise) this._resolve();
    return this._promise!.catch(onrejected as any);
  }

  private _resolve(): void {
    if (!this.model || !this.model.find) {
      this._promise = Promise.resolve([]);
      return;
    }
    // Merge cursor filter with conditions
    const finalConditions = { ...this.conditions, ...this.cursorFilter };
    let query = this.model.find(finalConditions);
    // Apply cursor sort if specified, otherwise use explicit sort
    if (this.cursorField) {
      const cursorSort: any = {};
      cursorSort[this.cursorField] = this.cursorSortDirection;
      query = query.sort(cursorSort);
    } else if (Object.keys(this.sort).length > 0) {
      query = query.sort(this.sort);
    }
    if (this.skipCount) query = query.skip(this.skipCount);
    if (this.limitCount) query = query.limit(this.limitCount);
    this._promise = query.lean().exec();
  }
}

class MutationBuilder extends QueryBuilder {
  private mutationData: any = null;
  private mutationFilter: Record<string, any> = {};

  values(data: any) {
    this.mutationData = Array.isArray(data) ? data[0] : data;
    return this;
  }

  set(data: any) {
    this.mutationData = data;
    return this;
  }

  where(condition?: any) {
    if (condition) Object.assign(this.mutationFilter, condition);
    return this;
  }

  private _resolveMutation(): void {
    if (!this.model) {
      this._promise = Promise.resolve([]);
      return;
    }
    if (this.mutationData && Object.keys(this.mutationFilter).length > 0) {
      this._promise = this.model.updateMany(this.mutationFilter, this.mutationData).exec().then(() => []);
    } else if (this.mutationData) {
      this._promise = this.model.create(this.mutationData).then((r: any) => [r]);
    } else if (Object.keys(this.mutationFilter).length > 0) {
      this._promise = this.model.deleteMany(this.mutationFilter).exec().then(() => []);
    } else {
      this._promise = Promise.resolve([]);
    }
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    if (!this._promise) this._resolveMutation();
    return this._promise!.then(onfulfilled as any, onrejected as any);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any[] | TResult> {
    if (!this._promise) this._resolveMutation();
    return this._promise!.catch(onrejected as any);
  }
}

// Ensures update payloads use $set so findOneAndUpdate does a partial update, not a replacement
function toSetUpdate(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const hasOperator = Object.keys(data).some(k => k.startsWith('$'));
  return hasOperator ? data : { $set: data };
}

// ─── Main db object ──────────────────────────────────────────────────────────
export const db = {
  query: {
    users: {
      findMany: async (filter: any = {}) => injectSession(User.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(User.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(User.findById(id)).lean(),
      create: async (data: any) => sessionCreate(User, data),
      update: async (filter: any, data: any) => injectSession(User.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      updateById: async (id: any, data: any) => injectSession(User.findByIdAndUpdate(id, toSetUpdate(data), { new: true })).lean(),
      delete: async (filter: any) => injectSession(User.findOneAndDelete(filter)).exec(),
      count: async (filter: any = {}) => {
        const session = activeSession.getStore();
        return User.countDocuments(filter, session ? { session } : {});
      },
    },
    userAchievements: {
      findMany: async (filter: any = {}) => injectSession(UserAchievement.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(UserAchievement.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(UserAchievement, data),
    },
    userProgress: {
      findMany: async (filter: any = {}) => injectSession(UserProgress.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(UserProgress.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(UserProgress, data),
      update: async (filter: any, data: any) => injectSession(UserProgress.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    userCredits: {
      findFirst: async (filter: any) => injectSession(UserCredits.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(UserCredits, data),
      update: async (filter: any, data: any) => injectSession(UserCredits.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    userSubscriptions: {
      findFirst: async (filter: any) => injectSession(UserSubscription.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(UserSubscription, data),
      update: async (filter: any, data: any) => injectSession(UserSubscription.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    hackathons: {
      findMany: async (filter: any = {}) => injectSession(Hackathon.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Hackathon.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Hackathon.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Hackathon, data),
      update: async (filter: any, data: any) => injectSession(Hackathon.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      updateById: async (id: any, data: any) => injectSession(Hackathon.findByIdAndUpdate(id, toSetUpdate(data), { new: true })).lean(),
      delete: async (filter: any) => injectSession(Hackathon.findOneAndDelete(filter)).exec(),
      count: async (filter: any = {}) => {
        const session = activeSession.getStore();
        return Hackathon.countDocuments(filter, session ? { session } : {});
      },
    },
    hackathonTeams: {
      findMany: async (filter: any = {}) => injectSession(HackathonTeam.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(HackathonTeam.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(HackathonTeam, data),
      update: async (filter: any, data: any) => injectSession(HackathonTeam.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    hackathonSubmissions: {
      findMany: async (filter: any = {}) => injectSession(HackathonSubmission.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(HackathonSubmission.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(HackathonSubmission, data),
      update: async (filter: any, data: any) => injectSession(HackathonSubmission.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    quizzes: {
      findMany: async (filter: any = {}) => injectSession(Quiz.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Quiz.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Quiz.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Quiz, data),
      update: async (filter: any, data: any) => injectSession(Quiz.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      delete: async (filter: any) => injectSession(Quiz.findOneAndDelete(filter)).exec(),
    },
    quizAttempts: {
      findMany: async (filter: any = {}) => injectSession(QuizAttempt.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(QuizAttempt.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(QuizAttempt, data),
      update: async (filter: any, data: any) => injectSession(QuizAttempt.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    tutorials: {
      findMany: async (filter: any = {}) => injectSession(Tutorial.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Tutorial.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Tutorial.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Tutorial, data),
      update: async (filter: any, data: any) => injectSession(Tutorial.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    exercises: {
      findMany: async (filter: any = {}) => injectSession(Exercise.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Exercise.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Exercise.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Exercise, data),
      update: async (filter: any, data: any) => injectSession(Exercise.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    exerciseSubmissions: {
      findMany: async (filter: any = {}) => injectSession(ExerciseSubmission.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(ExerciseSubmission.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(ExerciseSubmission, data),
    },
    dailyChallenges: {
      findMany: async (filter: any = {}) => injectSession(DailyChallenge.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(DailyChallenge.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(DailyChallenge, data),
    },
    spaces: {
      findMany: async (filter: any = {}) => injectSession(Space.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Space.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Space, data),
    },
    notebooks: {
      findMany: async (filter: any = {}) => injectSession(Notebook.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Notebook.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Notebook.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Notebook, data),
      update: async (filter: any, data: any) => injectSession(Notebook.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    jobs: {
      findMany: async (filter: any = {}) => injectSession(Job.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Job.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Job.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Job, data),
      update: async (filter: any, data: any) => injectSession(Job.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    jobApplications: {
      findMany: async (filter: any = {}) => injectSession(JobApplication.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(JobApplication.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(JobApplication, data),
      update: async (filter: any, data: any) => injectSession(JobApplication.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    mentorProfiles: {
      findMany: async (filter: any = {}) => injectSession(MentorProfile.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(MentorProfile.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(MentorProfile, data),
    },
    mentorBatches: {
      findMany: async (filter: any = {}) => injectSession(MentorBatch.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(MentorBatch.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(MentorBatch, data),
      update: async (filter: any, data: any) => injectSession(MentorBatch.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    certificates: {
      findMany: async (filter: any = {}) => injectSession(Certificate.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Certificate.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Certificate, data),
    },
    qna: {
      findMany: async (filter: any = {}) => injectSession(QnA.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(QnA.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(QnA, data),
      update: async (filter: any, data: any) => injectSession(QnA.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    organizations: {
      findMany: async (filter: any = {}) => injectSession(Organization.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Organization.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Organization, data),
      update: async (filter: any, data: any) => injectSession(Organization.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    leads: {
      findMany: async (filter: any = {}) => injectSession(Lead.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Lead.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Lead, data),
    },
    savedLessons: {
      findMany: async (filter: any = {}) => injectSession(SavedLesson.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(SavedLesson.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(SavedLesson, data),
      delete: async (filter: any) => injectSession(SavedLesson.findOneAndDelete(filter)).exec(),
    },
    lessonProgressExtended: {
      findMany: async (filter: any = {}) => injectSession(LessonProgressExtended.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(LessonProgressExtended.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(LessonProgressExtended, data),
      update: async (filter: any, data: any) => injectSession(LessonProgressExtended.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    userLearningActivities: {
      findMany: async (filter: any = {}) => injectSession(UserLearningActivity.find(filter)).lean(),
      create: async (data: any) => sessionCreate(UserLearningActivity, data),
    },
    learningSessions: {
      findMany: async (filter: any = {}) => injectSession(LearningSession.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(LearningSession.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(LearningSession, data),
      update: async (filter: any, data: any) => injectSession(LearningSession.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    userStreaksExtended: {
      findFirst: async (filter: any) => injectSession(UserStreakExtended.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(UserStreakExtended, data),
      update: async (filter: any, data: any) => injectSession(UserStreakExtended.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    xpTrackings: {
      findMany: async (filter: any = {}) => injectSession(XpTracking.find(filter)).lean(),
      create: async (data: any) => sessionCreate(XpTracking, data),
    },
    personalizedRecommendations: {
      findFirst: async (filter: any) => injectSession(PersonalizedRecommendation.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(PersonalizedRecommendation, data),
      update: async (filter: any, data: any) => injectSession(PersonalizedRecommendation.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    // Learning catalog
    domains: {
      findMany: async (filter: any = {}) => injectSession(Domain.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Domain.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Domain.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Domain, data),
      update: async (filter: any, data: any) => injectSession(Domain.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      count: async (filter: any = {}) => Domain.countDocuments(filter),
    },
    specializations: {
      findMany: async (filter: any = {}) => injectSession(Specialization.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(Specialization.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Specialization.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Specialization, data),
    },
    courses: {
      findMany: async (filter: any = {}, opts?: { sort?: any; limit?: number; skip?: number }) => {
        let q = injectSession(Course.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        if (opts?.skip) q = q.skip(opts.skip) as any;
        if (opts?.limit) q = q.limit(opts.limit) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(Course.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Course.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Course, data),
      update: async (filter: any, data: any) => injectSession(Course.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      count: async (filter: any = {}) => Course.countDocuments(filter),
    },
    modules: {
      findMany: async (filter: any = {}) => injectSession(Module.find(filter).sort({ order: 1 })).lean(),
      findFirst: async (filter: any) => injectSession(Module.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Module, data),
    },
    labs: {
      findMany: async (filter: any = {}) => injectSession(Lab.find(filter).sort({ order: 1 })).lean(),
      findFirst: async (filter: any) => injectSession(Lab.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Lab, data),
    },
    // Learning tracks
    learningTracks: {
      findMany: async (filter: any = {}, opts?: { sort?: any }) => {
        let q = injectSession(LearningTrack.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(LearningTrack.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(LearningTrack.findById(id)).lean(),
      create: async (data: any) => sessionCreate(LearningTrack, data),
      update: async (filter: any, data: any) => injectSession(LearningTrack.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      updateById: async (id: any, data: any) => injectSession(LearningTrack.findByIdAndUpdate(id, toSetUpdate(data), { new: true })).lean(),
    },
    trackCourses: {
      findMany: async (filter: any = {}) => injectSession(TrackCourse.find(filter).sort({ orderIndex: 1 })).lean(),
      findFirst: async (filter: any) => injectSession(TrackCourse.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(TrackCourse, data),
    },
    trackEnrollments: {
      findMany: async (filter: any = {}) => injectSession(TrackEnrollment.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(TrackEnrollment.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(TrackEnrollment, data),
      update: async (filter: any, data: any) => injectSession(TrackEnrollment.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    // Developer portal
    repositories: {
      findMany: async (filter: any = {}, opts?: { sort?: any }) => {
        let q = injectSession(Repository.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(Repository.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(Repository.findById(id)).lean(),
      create: async (data: any) => sessionCreate(Repository, data),
      update: async (filter: any, data: any) => injectSession(Repository.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      updateById: async (id: any, data: any) => injectSession(Repository.findByIdAndUpdate(id, toSetUpdate(data), { new: true })).lean(),
      delete: async (filter: any) => injectSession(Repository.findOneAndDelete(filter)).exec(),
    },
    repositoryFiles: {
      findMany: async (filter: any = {}) => injectSession(RepositoryFile.find(filter)).lean(),
      findFirst: async (filter: any) => injectSession(RepositoryFile.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(RepositoryFile, data),
      update: async (filter: any, data: any) => injectSession(RepositoryFile.findOneAndUpdate(filter, toSetUpdate(data), { new: true, upsert: true })).lean(),
    },
    commits: {
      findMany: async (filter: any = {}, opts?: { sort?: any; limit?: number }) => {
        let q = injectSession(Commit.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        if (opts?.limit) q = q.limit(opts.limit) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(Commit.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Commit, data),
    },
    issues: {
      findMany: async (filter: any = {}, opts?: { sort?: any; limit?: number; skip?: number }) => {
        let q = injectSession(Issue.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        if (opts?.skip) q = q.skip(opts.skip) as any;
        if (opts?.limit) q = q.limit(opts.limit) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(Issue.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(Issue, data),
      count: async (filter: any = {}) => Issue.countDocuments(filter),
    },
    pullRequests: {
      findMany: async (filter: any = {}, opts?: { sort?: any; limit?: number; skip?: number }) => {
        let q = injectSession(PullRequest.find(filter));
        if (opts?.sort) q = q.sort(opts.sort) as any;
        if (opts?.skip) q = q.skip(opts.skip) as any;
        if (opts?.limit) q = q.limit(opts.limit) as any;
        return q.lean();
      },
      findFirst: async (filter: any) => injectSession(PullRequest.findOne(filter)).lean(),
      findById: async (id: any) => injectSession(PullRequest.findById(id)).lean(),
      create: async (data: any) => sessionCreate(PullRequest, data),
      update: async (filter: any, data: any) => injectSession(PullRequest.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
      updateById: async (id: any, data: any) => injectSession(PullRequest.findByIdAndUpdate(id, toSetUpdate(data), { new: true })).lean(),
      count: async (filter: any = {}) => PullRequest.countDocuments(filter),
    },
    repositoryStars: {
      findFirst: async (filter: any) => injectSession(RepositoryStar.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(RepositoryStar, data),
      delete: async (filter: any) => injectSession(RepositoryStar.findOneAndDelete(filter)).exec(),
    },
    // Legal & compliance
    consentRecords: {
      findMany: async (filter: any = {}) => injectSession(ConsentRecord.find(filter).sort({ createdAt: -1 })).lean(),
      findFirst: async (filter: any) => injectSession(ConsentRecord.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(ConsentRecord, data),
      update: async (filter: any, data: any) => injectSession(ConsentRecord.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    grievanceTickets: {
      findMany: async (filter: any = {}) => injectSession(GrievanceTicket.find(filter).sort({ createdAt: -1 })).lean(),
      findFirst: async (filter: any) => injectSession(GrievanceTicket.findOne(filter)).lean(),
      create: async (data: any) => sessionCreate(GrievanceTicket, data),
      update: async (filter: any, data: any) => injectSession(GrievanceTicket.findOneAndUpdate(filter, toSetUpdate(data), { new: true })).lean(),
    },
    // Moodle LMS integration
    moodleCourseMappings: {
      findMany: async (filter: any = {}) => injectSession(MoodleCourseMapping.find(filter).sort({ lastSyncedAt: -1 })).lean(),
      upsert: async (moodleCourseId: number, data: any) =>
        injectSession(MoodleCourseMapping.findOneAndUpdate({ moodleCourseId }, toSetUpdate(data), { new: true, upsert: true })).lean(),
      count: async (filter: any = {}) => MoodleCourseMapping.countDocuments(filter),
    },
    moodleUserMappings: {
      findMany: async (filter: any = {}) => injectSession(MoodleUserMapping.find(filter).sort({ lastSyncedAt: -1 })).lean(),
      upsert: async (moodleUserId: number, data: any) =>
        injectSession(MoodleUserMapping.findOneAndUpdate({ moodleUserId }, toSetUpdate(data), { new: true, upsert: true })).lean(),
      count: async (filter: any = {}) => MoodleUserMapping.countDocuments(filter),
    },
    moodleSyncLogs: {
      findMany: async (filter: any = {}, opts?: { limit?: number }) => {
        let q = injectSession(MoodleSyncLog.find(filter).sort({ createdAt: -1 }));
        if (opts?.limit) q = q.limit(opts.limit) as any;
        return q.lean();
      },
      findFirst: async (filter: any = {}) => injectSession(MoodleSyncLog.findOne(filter).sort({ createdAt: -1 })).lean(),
      create: async (data: any) => sessionCreate(MoodleSyncLog, data),
    },
  }, // end db.query

  // SQL helpers for compatibility (delegate to Mongoose via QueryBuilder)
  select: (_selection?: any) => new QueryBuilder(),
  insert: (table: any) => new MutationBuilder().from(table),
  update: (table: any) => new MutationBuilder().from(table),
  delete: (table: any) => new MutationBuilder().from(table),
  execute: async (_query: any): Promise<any[]> => [],

  // Pagination helper for cursor-based pagination
  paginate: async (
    model: any,
    filter: Record<string, any> = {},
    options: {
      cursor?: string;
      cursorField?: string;
      limit?: number;
      sort?: Record<string, number>;
    } = {}
  ) => {
    const { cursor, cursorField = '_id', limit = 20, sort = { _id: -1 } } = options;

    // Build query with cursor filter.
    // Direction is determined by the sort order of cursorField: -1 (desc) uses $lt, 1 (asc) uses $gt.
    const query = { ...filter };
    if (cursor) {
      const sortDir = sort[cursorField] ?? -1;
      query[cursorField] = sortDir === 1 ? { $gt: cursor } : { $lt: cursor };
    }

    const results = await model
      .find(query)
      .sort(sort)
      .limit(limit + 1) // Fetch one extra to check if there's a next page
      .lean();

    const hasNextPage = results.length > limit;
    const items = hasNextPage ? results.slice(0, -1) : results;
    const nextCursor = hasNextPage ? String(items[items.length - 1][cursorField]) : null;

    return {
      items,
      nextCursor,
      hasNextPage,
      limit,
    };
  },

  // Wraps a callback in a Mongoose session+transaction. All db.query.* calls
  // inside the callback automatically use the session via AsyncLocalStorage.
  transaction: async <T>(callback: (tx: any) => Promise<T> | T): Promise<T> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await activeSession.run(session, () => Promise.resolve(callback(db as any)));
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};

// ─── Helper operators (MongoDB-compatible filter objects) ─────────────────────
const _fieldName = (a: any): string => (typeof a === 'string' ? a : (a?.name ?? String(a)));
export const eq = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: b });
export const ne = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: { $ne: b } });
export const gte = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: { $gte: b } });
export const lte = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: { $lte: b } });
export const gt = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: { $gt: b } });
export const lt = (a: any, b: any): Record<string, any> => ({ [_fieldName(a)]: { $lt: b } });
export const and = (...conds: any[]): Record<string, any> => Object.assign({}, ...conds.filter(c => c && typeof c === 'object'));
export const or = (...conds: any[]): Record<string, any> => ({ $or: conds.filter(c => c && typeof c === 'object') });
// Escapes all regex special chars before converting SQL LIKE % wildcards to .*
export const like = (a: any, b: string): Record<string, any> => ({
  [_fieldName(a)]: new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*'), 'i'),
});
export const inArray = (a: any, b: any[]): Record<string, any> => ({ [_fieldName(a)]: { $in: b } });
export const desc = (field: string) => { const o: any = {}; o[field] = -1; return o; };
export const asc = (field: string) => { const o: any = {}; o[field] = 1; return o; };
export const sql = <_T = any>(strings: any, ..._args: any[]) => strings;

// ─── Schema alias exports for legacy query patterns ────────────────────────
export const users = User;
export const hackathons = Hackathon;
export const spaces = Space;
export const quizzes = Quiz;
export const tutorials = Tutorial;
export const exercises = Exercise;
export const notebooks = Notebook;
export const jobs = Job;
export const savedLessons = SavedLesson;
export const lessonProgressExtended = LessonProgressExtended;
export const userLearningActivities = UserLearningActivity;
export const learningSessions = LearningSession;
export const userStreaksExtended = UserStreakExtended;
export const xpTrackings = XpTracking;
export const personalizedRecommendations = PersonalizedRecommendation;
// Real model exports (replaced stubs)
export const domains = Domain;
export const specializations = Specialization;
export const courses = Course;
export const modules = Module;
export const labs = Lab;
export const learningTracks = LearningTrack;
export const trackCourses = TrackCourse;
export const trackEnrollments = TrackEnrollment;
export const repositories = Repository;
export const repositoryFiles = RepositoryFile;
export const commits = Commit;
export const issues = Issue;
export const pullRequests = PullRequest;
export const repositoryStars = RepositoryStar;

export default db;
