import { Request, Response } from 'express';
import { AdaptiveLearningService } from '../services/adaptiveLearning.service';
import { UserBackground, LearningPath, SkillScores, Assessment, CourseContent } from '../db';
import { aiService } from '../services/ai.service';
import logger from '../utils/logger';
import mongoose from 'mongoose';

const VALID_DOMAINS = [
  'Software Engineering',
  'Mechanical Engineering',
  'Electronics Engineering',
  'Civil Engineering',
  'Robotics Engineering',
] as const;

type FullDomain = typeof VALID_DOMAINS[number];

const VALID_MENTOR_DOMAINS = ['Software', 'Mechanical', 'Electronics', 'Civil', 'Robotics'] as const;
type MentorDomain = typeof VALID_MENTOR_DOMAINS[number];

// Maps the full domain string (stored in UserBackground/User) to the short
// key expected by AdaptiveLearningService.chatWithMentorStream.
const DOMAIN_TO_MENTOR: Record<FullDomain, MentorDomain> = {
  'Software Engineering': 'Software',
  'Mechanical Engineering': 'Mechanical',
  'Electronics Engineering': 'Electronics',
  'Civil Engineering': 'Civil',
  'Robotics Engineering': 'Robotics',
};

// Strip correctAnswer from a question before sending it to the client.
function sanitizeQuestion(q: any) {
  if (!q) return null;
  const { correctAnswer: _omit, ...safe } = q.toObject ? q.toObject() : q;
  return safe;
}

/**
 * Submit personal background quiz and lock domain.
 * Blocked if the user already completed an assessment for this domain.
 */
export const onboarding = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      domain,
      goals,
      educationLevel,
      currentExperience,
      preferredLearningStyle,
      availableHoursPerDay,
      confidenceLevel,
      preferredLanguage,
      careerSwitchInfo,
      hackathonInterest,
      toolFamiliarity
    } = req.body;

    if (!domain || !VALID_DOMAINS.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: `domain must be one of: ${VALID_DOMAINS.join(', ')}`,
        error: 'INVALID_DOMAIN'
      });
    }

    // Block re-onboarding: reject if a completed assessment already exists for this domain.
    const existing = await Assessment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain,
      status: 'COMPLETED',
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already completed an assessment for this domain. Visit your roadmap to continue learning.',
        error: 'ASSESSMENT_ALREADY_COMPLETED',
      });
    }

    await UserBackground.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        domain,
        goals,
        educationLevel,
        currentExperience,
        preferredLearningStyle,
        availableHoursPerDay: Number(availableHoursPerDay || 2),
        confidenceLevel: Number(confidenceLevel || 5),
        preferredLanguage: preferredLanguage || 'English',
        careerSwitchInfo,
        hackathonInterest: Boolean(hackathonInterest),
        toolFamiliarity: toolFamiliarity || []
      },
      { upsert: true }
    );

    const assessment = await AdaptiveLearningService.getOrCreateAssessment(userId, domain);

    res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment._id,
        currentStep: assessment.currentStep,
        totalQuestions: assessment.totalQuestions,
        question: sanitizeQuestion(assessment.questions[assessment.currentStep])
      }
    });
  } catch (error) {
    logger.error('Onboarding handler error:', error);
    res.status(500).json({ success: false, message: 'Failed to save background details', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Fetch current step of active assessment.
 */
export const getCurrentAssessmentStep = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { domain } = req.query;

    if (!domain || typeof domain !== 'string' || !VALID_DOMAINS.includes(domain as FullDomain)) {
      return res.status(400).json({
        success: false,
        message: `domain must be one of: ${VALID_DOMAINS.join(', ')}`,
        error: 'INVALID_DOMAIN'
      });
    }

    const assessment = await AdaptiveLearningService.getOrCreateAssessment(userId, domain);

    res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment._id,
        currentStep: assessment.currentStep,
        status: assessment.status,
        totalQuestions: assessment.totalQuestions,
        question: sanitizeQuestion(assessment.questions[assessment.currentStep])
      }
    });
  } catch (error) {
    logger.error('Fetch current step error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assessment step', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Submit answer for the current assessment question.
 */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { assessmentId, userAnswer, confidenceRating } = req.body;

    if (!assessmentId || userAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'assessmentId and userAnswer are required',
        error: 'INVALID_INPUT'
      });
    }

    const assessment = await AdaptiveLearningService.submitAnswer(
      userId,
      assessmentId,
      userAnswer,
      Number(confidenceRating || 5)
    );

    const nextQuestion = assessment.questions[assessment.currentStep];

    res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment._id,
        currentStep: assessment.currentStep,
        status: assessment.status,
        totalQuestions: assessment.totalQuestions,
        question: nextQuestion ? sanitizeQuestion(nextQuestion) : null,
        overallScore: assessment.overallScore ?? null
      }
    });
  } catch (error) {
    logger.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answer', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Finalize assessment, triggers AI Skill Analyzer, computes skill scorecard.
 */
export const finalizeAssessment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { domain } = req.body;

    if (!domain || !VALID_DOMAINS.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: `domain must be one of: ${VALID_DOMAINS.join(', ')}`,
        error: 'INVALID_DOMAIN'
      });
    }

    const results = await AdaptiveLearningService.finalizeAssessment(userId, domain);

    res.status(200).json({
      success: true,
      data: {
        scores: results.scores,
        roadmap: results.roadmap
      }
    });
  } catch (error: any) {
    logger.error('Finalize assessment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Finalization failed', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Fetch personalized learning path / roadmap configuration.
 */
export const getRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { domain } = req.query;

    if (!domain || typeof domain !== 'string' || !VALID_DOMAINS.includes(domain as FullDomain)) {
      return res.status(400).json({
        success: false,
        message: `domain must be one of: ${VALID_DOMAINS.join(', ')}`,
        error: 'INVALID_DOMAIN'
      });
    }

    const path = await LearningPath.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain
    }).lean();

    const scores = await SkillScores.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        roadmap: path || null,
        scores: scores || null
      }
    });
  } catch (error) {
    logger.error('Get roadmap error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roadmap data', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Chat with Domain-Specific AI Mentor (Server-Sent Events Stream).
 */
export const chatWithMentor = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { mentorDomain, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required', error: 'INVALID_INPUT' });
    }

    // Accept either short form ("Software") or full form ("Software Engineering")
    let resolvedDomain: MentorDomain | undefined;
    if (VALID_MENTOR_DOMAINS.includes(mentorDomain as MentorDomain)) {
      resolvedDomain = mentorDomain as MentorDomain;
    } else if (VALID_DOMAINS.includes(mentorDomain as FullDomain)) {
      resolvedDomain = DOMAIN_TO_MENTOR[mentorDomain as FullDomain];
    }

    if (!resolvedDomain) {
      return res.status(400).json({
        success: false,
        message: `mentorDomain must be one of: ${VALID_MENTOR_DOMAINS.join(', ')}`,
        error: 'INVALID_MENTOR_DOMAIN'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await AdaptiveLearningService.chatWithMentorStream(userId, resolvedDomain, message);
    let fullResponse = '';

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

    AdaptiveLearningService.saveMentorResponse(userId, resolvedDomain, fullResponse).catch(err => {
      logger.error('Failed to save mentor conversation:', err);
    });
  } catch (error) {
    logger.error('Mentor streaming chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Mentor interaction failed', error: 'MENTOR_CHAT_ERROR' });
    } else {
      res.end();
    }
  }
};

/**
 * Generate AI lesson content for a roadmap node (cached after first generation).
 */
export const generateNodeContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { nodeId, domain, nodeTitle } = req.body;

    if (!nodeId || !domain || !nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'nodeId, domain, and nodeTitle are required',
        error: 'INVALID_INPUT'
      });
    }

    // Get user level from skill scores
    const scores = await SkillScores.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain
    }).lean();
    const userLevel = scores?.estimatedLevel || 'BEGINNER';

    const content = await AdaptiveLearningService.generateNodeContent(
      userId,
      nodeId,
      domain,
      nodeTitle,
      userLevel
    );

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    logger.error('Generate node content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lesson content',
      error: 'CONTENT_GENERATION_ERROR'
    });
  }
};

/**
 * Retrieve existing AI lesson content for a roadmap node.
 */
export const getNodeContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { nodeId } = req.params;

    const content = await CourseContent.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      nodeId
    }).lean();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not yet generated for this node. Call POST /content/generate first.',
        error: 'CONTENT_NOT_FOUND'
      });
    }

    // Increment view count
    CourseContent.updateOne(
      { userId: new mongoose.Types.ObjectId(userId), nodeId },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } }
    ).catch(() => {});

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    logger.error('Get node content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson content', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Update the progress of a roadmap node (start or complete).
 */
export const updateNodeProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { domain, nodeId, status } = req.body;

    if (!domain || !nodeId || !status) {
      return res.status(400).json({
        success: false,
        message: 'domain, nodeId, and status are required',
        error: 'INVALID_INPUT'
      });
    }

    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be IN_PROGRESS or COMPLETED',
        error: 'INVALID_STATUS'
      });
    }

    // Get xpAwarded from the node definition
    const path = await LearningPath.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      domain
    }).lean();
    const node = path?.nodes?.find(n => n.nodeId === nodeId);
    const xpToAward = node?.xpAwarded || 0;

    const progress = await AdaptiveLearningService.updateNodeProgress(
      userId,
      domain,
      nodeId,
      status as 'IN_PROGRESS' | 'COMPLETED',
      xpToAward
    );

    res.status(200).json({
      success: true,
      data: {
        progress,
        xpAwarded: status === 'COMPLETED' ? xpToAward : 0
      }
    });
  } catch (error) {
    logger.error('Update node progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update node progress', error: 'INTERNAL_ERROR' });
  }
};

/**
 * Real-time Monaco Editor Sandbox Debugger & Explanation Copilot.
 */
export const sandboxAssist = async (req: Request, res: Response) => {
  try {
    const { code, language, errorMsg, action = 'debug', customPrompt } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'code is required', error: 'MISSING_CODE' });
    }

    const actionPrompts: Record<string, string> = {
      debug: `Review the following ${language || 'javascript'} code for bugs, logic errors, or inefficiencies. The compiler/execution output was: ${errorMsg || 'none'}.\nCode:\n${code}\nIdentify exactly where the bug is, explain why it happens, and provide the fully optimized, corrected code block.`,
      optimize: `Analyze the following ${language || 'javascript'} code for performance bottlenecks, algorithmic complexity, or readability optimizations.\nCode:\n${code}\nProvide refactored code and list specific optimizations made (e.g. O(N) instead of O(N^2), cleaner syntax).`,
      explain: `Explain the core programming concepts, logical flows, and methods used in this ${language || 'javascript'} code snippet.\nCode:\n${code}\nProvide a concise explanation in markdown styled bullet points for a student.`,
      custom: customPrompt
        ? `${customPrompt}\n\nCode context:\n${code}`
        : `Review the following ${language || 'javascript'} code and answer any questions a student may have.\nCode:\n${code}`,
    };

    const prompt = actionPrompts[action] ?? actionPrompts.debug;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await aiService.chatAssistantStream(prompt, {
      path: '/ide/sandbox/assist',
      action
    }, 'technical');

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk.text() })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    logger.error('Sandbox IDE assist error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Sandbox assistance failed', error: 'SANDBOX_ASSIST_ERROR' });
    } else {
      res.end();
    }
  }
};
