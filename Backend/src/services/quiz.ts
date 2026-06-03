import { Quiz, QuizAttempt, User } from '../db/models';
import { AppError } from '../middleware/error';
import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export class QuizService {
  async getQuizzes(filters: any, page: number, limit: number) {
    const query: any = {};
    if (filters.quizType) query.category = filters.quizType;
    if (filters.difficulty) query.difficulty = (filters.difficulty as string).toUpperCase();

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Quiz.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Quiz.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getQuizById(id: string, _userId?: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Quiz not found', 404);
    }
    const quiz = await Quiz.findById(id).lean();
    if (!quiz) throw new AppError('Quiz not found', 404);
    return quiz;
  }

  async getDailyQuiz(_domain?: string) {
    return await Quiz.findOne({ category: 'daily' }).lean();
  }

  async submitQuizAttempt(userId: string, quizId: string, answers: any) {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new AppError('Quiz not found', 404);
    }
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) throw new AppError('Quiz not found', 404);

    const questions = quiz.questions || [];
    let correct = 0;

    const mappedAnswers = questions.map((q: any) => {
      const selectedIndex = answers && typeof answers === 'object' && !Array.isArray(answers)
        ? answers[q.id]
        : undefined;
      const isCorrect = selectedIndex !== undefined && selectedIndex === q.correctIndex;
      if (isCorrect) correct++;
      return { questionId: q.id, selectedIndex: selectedIndex ?? -1, correct: isCorrect };
    });

    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const attempt = await QuizAttempt.create({
      quizId: new mongoose.Types.ObjectId(quizId),
      userId: new mongoose.Types.ObjectId(userId),
      score,
      totalQuestions: total,
      answers: mappedAnswers,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    return {
      id: attempt._id,
      quizId,
      userId,
      score,
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: total - correct,
      percentage: score,
      completedAt: attempt.completedAt,
    };
  }

  async getUserAttempts(userId: string, page: number, limit: number) {
    const userOid = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      QuizAttempt.find({ userId: userOid })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('quizId', 'title category difficulty')
        .lean(),
      QuizAttempt.countDocuments({ userId: userOid }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLeaderboard(_type: string, limit: number) {
    const users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('fullName profilePicture totalPoints level')
      .lean();

    return users.map((u: any, i: number) => ({
      rank: i + 1,
      id: u._id,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      totalPoints: u.totalPoints || 0,
      level: u.level || 1,
    }));
  }

  async generateAIQuiz(topic: string, difficulty: string, numQuestions: number, userId: string) {
    try {
      const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
      const response = await axios.post(
        `${config.aiServiceUrl}/api/v1/quiz/generate`,
        { topic, difficulty, numQuestions, userId },
        { headers: internalSecret ? { 'X-Internal-Service': internalSecret } : {} }
      );
      return response.data;
    } catch (err) {
      logger.error('AI quiz generation failed', err);
      throw new AppError('Failed to generate AI quiz', 500);
    }
  }
}

export const quizService = new QuizService();
