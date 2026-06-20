import { Request, Response } from 'express';
import { aiService, reviewSubmissionViaAI, type AIReviewPayload } from '../services/ai.service';
import { quizService } from '../services/quiz';
import { consumeCredit } from '../middleware/credits';
import { runAgentCommand, generateQuizQuestions, isInProcess } from '../services/aiCoreBridge.service';
import logger from '../utils/logger';

export const chat = async (req: Request, res: Response) => {
    try {
        const { message, context, persona = 'tutor' } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required', error: 'INVALID_INPUT' });
        }

        // Extended user type for AI features - requires profile completion
const user = req.user as { 
    fullName: string; 
    domain?: string; 
    level?: number; 
    id: number 
} | undefined;

        const enrichedContext = {
            ...context,
            userName: user?.fullName,
            domain: user?.domain,
            level: user?.level
        };

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await aiService.chatAssistantStream(message, enrichedContext, persona);

        for await (const chunk of stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

        const userId = user?.id;
        if (userId) {
            await consumeCredit(String(userId)).catch(err => logger.error('Credit consumption failed:', err));
        }
    } catch (error) {
        logger.error('Streaming AI error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'AI Chat failed', error: 'AI_CHAT_ERROR' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
            res.end();
        }
    }
};

export const getDailyQuiz = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const quiz = await quizService.getDailyQuiz(String(userId));
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate quiz', error: 'QUIZ_ERROR' });
    }
};

export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { quizId, answers } = req.body;
        const result = await quizService.submitQuizAttempt(String(userId), String(quizId), answers);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Quiz submission failed', error: 'QUIZ_SUBMISSION_ERROR' });
    }
};

export const reviewProject = async (req: Request, res: Response) => {
    try {
        const { projectContent, domain, persona = 'technical' } = req.body;

        if (!projectContent || typeof projectContent !== 'string' || !projectContent.trim()) {
            return res.status(400).json({ success: false, message: 'Project content is required', error: 'INVALID_INPUT' });
        }
        if (!domain || typeof domain !== 'string' || !domain.trim()) {
            return res.status(400).json({ success: false, message: 'Domain is required', error: 'INVALID_INPUT' });
        }

        // Extended user type for AI features - requires profile completion
const user = req.user as { 
    fullName: string; 
    domain?: string; 
    level?: number; 
    id: number 
} | undefined;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const prompt = `Review this project in the ${domain} domain. Focus on technical depth, design choices, and industry-readiness. Content: ${projectContent}`;

        const stream = await aiService.chatAssistantStream(prompt, {
            userName: user?.fullName,
            domain,
            level: user?.level,
            path: '/project/review'
        }, persona);

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ text: chunk.text() })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

        const reviewUserId = user?.id;
        if (reviewUserId) {
            await consumeCredit(String(reviewUserId)).catch(err => logger.error('Credit consumption failed:', err));
        }
    } catch (error) {
        logger.error('Project review streaming error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Project review failed', error: 'PROJECT_REVIEW_ERROR' });
        } else {
            res.end();
        }
    }
};

/**
 * Structured AI review of a submission (code/assignment/project/capstone/hackathon).
 * Proxies to the FastAPI /api/v1/ai-review endpoint and returns structured scores +
 * feedback. Never fabricates a review — if the model is unavailable, returns 503.
 */
export const reviewSubmission = async (req: Request, res: Response) => {
    try {
        const { submissionType = 'code', content, language, context } = req.body as {
            submissionType?: string; content?: string; language?: string; context?: string;
        };

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ success: false, message: 'content is required', error: 'INVALID_INPUT' });
        }
        const allowed = ['code', 'assignment', 'project', 'capstone', 'hackathon'];
        const type = allowed.includes(submissionType) ? submissionType : 'code';

        const payload: AIReviewPayload = { submission_type: type as AIReviewPayload['submission_type'], content };
        if (language) payload.language = language;
        if (context) payload.context = context;

        const review = await reviewSubmissionViaAI(payload);

        const userId = (req.user as any)?.id;
        if (userId) await consumeCredit(String(userId)).catch(err => logger.error('Credit consumption failed:', err));

        return res.json({ success: true, data: review });
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 503) {
            return res.status(503).json({
                success: false,
                message: 'AI review is not configured yet — a mentor review is still available.',
                error: 'AI_REVIEW_UNAVAILABLE',
            });
        }
        // Concise log — never dump the full axios error (noisy + leaks request config).
        logger.error(`Structured AI review error: ${error?.code || error?.message || 'unknown'}`);
        return res.status(502).json({ success: false, message: 'AI review service is unavailable. Please try again later.', error: 'AI_REVIEW_ERROR' });
    }
};

export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user.domain || !user.level) {
            return res.status(400).json({ success: false, message: 'User profile incomplete for recommendations', error: 'INVALID_USER_PROFILE' });
        }

        const recommendationPrompt = `Based on my current domain: ${user.domain} and level: ${user.level}, what are 3 specific projects or courses I should tackle next to maximize my industry-readiness? Respond with a JSON array of strings.`;

        const responseText = await aiService.chatAssistant(recommendationPrompt, {
            userName: user.fullName,
            domain: user.domain,
            level: user.level
        });

        const jsonMatch = responseText.match(/\[.*\]/s);
        const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : ['Advanced Robotics', 'Operations Management', 'Cloud Architecture'];

        res.json({ success: true, data: { recommendations } });

        const creditUserId2 = user?.id;
        if (creditUserId2) {
            await consumeCredit(creditUserId2).catch(err => logger.error('Credit consumption failed:', err));
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations', error: 'RECOMMENDATIONS_ERROR' });
    }
};

export const getHackathonHelp = async (req: Request, res: Response) => {
    try {
        const { hackathonTheme, query } = req.body;

        if (!hackathonTheme || typeof hackathonTheme !== 'string' || !hackathonTheme.trim()) {
            return res.status(400).json({ success: false, message: 'Hackathon theme is required', error: 'INVALID_INPUT' });
        }
        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Query is required', error: 'INVALID_INPUT' });
        }

        const help = await aiService.chatAssistant(
            `I am participating in a hackathon with theme: ${hackathonTheme}. My question is: ${query}`,
            { hackathonTheme }
        );

        const helpUser = req.user as any;
        const helpUserId = helpUser?.id;
        if (helpUserId) {
            await consumeCredit(helpUserId).catch(err => logger.error('Credit consumption failed:', err));
        }

        res.json({ success: true, data: { help } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Hackathon AI help failed', error: 'HACKATHON_HELP_ERROR' });
    }
};

// ── AI_core-backed endpoints (routes through AI_core/ai-services in-process) ─

/**
 * POST /api/ai/generate
 * General-purpose text generation powered by AI_core/ai-services.
 * Requires authentication.
 *
 * Body: { prompt: string, topic?: string, max_tokens?: number }
 */
export const generate = async (req: Request, res: Response) => {
    try {
        const { prompt, topic } = req.body as {
            prompt?: string;
            topic?: string;
        };

        const input = prompt || topic;
        if (!input || typeof input !== 'string' || !input.trim()) {
            return res.status(400).json({ success: false, error: 'prompt (or topic) is required' });
        }

        const response = await aiService.generate(input.trim());

        return res.json({
            success: true,
            response,
            provider: aiService.providerName,
            inProcess: isInProcess,
        });
    } catch (error) {
        logger.error('[ai.controller] generate error:', error);
        return res.status(500).json({ success: false, error: 'AI generation failed' });
    }
};

/**
 * POST /api/ai/agent/run
 * Route a free-text command through the multi-agent orchestrator
 * (CTO / Dev / Product / Sales agents in AI_core/ai-services/system/).
 *
 * Body: { command: string, agent_type?: 'cto'|'dev'|'product'|'sales' }
 */
export const agentRun = async (req: Request, res: Response) => {
    try {
        const { command, agent_type } = req.body as { command?: string; agent_type?: string };
        if (!command || typeof command !== 'string' || !command.trim()) {
            return res.status(400).json({ success: false, error: 'command is required' });
        }

        const result = await runAgentCommand(command.trim(), agent_type);
        return res.json({ success: true, ...result });
    } catch (error) {
        logger.error('[ai.controller] agentRun error:', error);
        return res.status(500).json({ success: false, error: 'Agent command failed' });
    }
};

/**
 * POST /api/ai/quiz/generate
 * Generate structured quiz questions using the AI_core quiz service.
 * Also used internally by the daily quiz cron (dailyQuiz.service.ts calls
 * the AI service directly, but this endpoint exposes the same capability
 * for on-demand quiz creation).
 *
 * Body: { topic: string, count?: number, difficulty?: string, context?: string }
 */
export const generateQuiz = async (req: Request, res: Response) => {
    try {
        const { topic, count, difficulty, context } = req.body as {
            topic?: string;
            count?: number;
            difficulty?: string;
            context?: string;
        };

        if (!topic || typeof topic !== 'string' || !topic.trim()) {
            return res.status(400).json({ success: false, error: 'topic is required' });
        }

        const result = await generateQuizQuestions({
            topic:      topic.trim(),
            count:      count      ?? 5,
            difficulty: difficulty ?? 'medium',
            context:    context    ?? '',
        });

        return res.json({ success: true, ...result });
    } catch (error) {
        logger.error('[ai.controller] generateQuiz error:', error);
        return res.status(500).json({ success: false, error: 'Quiz generation failed' });
    }
};

export const generateLearningPath = async (req: Request, res: Response) => {
    try {
        const { goal, current_skills } = req.body as { goal?: string; current_skills?: string[] | string };
        if (!goal || typeof goal !== 'string' || !goal.trim()) {
            return res.status(400).json({ success: false, error: 'goal is required' });
        }

        const skills = Array.isArray(current_skills)
            ? current_skills.join(', ')
            : (current_skills || 'beginner');
        const prompt = `Create a structured learning path for: "${goal.trim()}". Current skills: ${skills}. Return JSON with title, estimatedWeeks, phases, topics, resources, and milestones.`;
        const raw = await aiService.generate(prompt);

        let path: unknown = raw;
        try {
            const match = raw.match(/\{[\s\S]*\}/);
            path = match ? JSON.parse(match[0]) : raw;
        } catch {
            path = raw;
        }

        return res.json({ success: true, path });
    } catch (error) {
        logger.error('[ai.controller] generateLearningPath error:', error);
        return res.status(500).json({ success: false, error: 'Learning path generation failed' });
    }
};
