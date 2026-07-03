import { body, param, query } from 'express-validator';
import { isJobType } from './jobTypes';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const authValidators = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(PASSWORD_COMPLEXITY_REGEX)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['STUDENT']).withMessage('Public signup is only available for students'),
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(PASSWORD_COMPLEXITY_REGEX)
      .withMessage('New password must contain uppercase, lowercase, number and special character'),
  ],
};

export const quizValidators = {
  createQuiz: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('quizType').isIn(['daily', 'practice', 'assessment', 'ai_generated']),
    body('domain').notEmpty().withMessage('Domain is required'),
    body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']),
    body('totalQuestions').isInt({ min: 1 }).withMessage('Must have at least 1 question'),
  ],

  submitAnswer: [
    body('questionId').isInt().withMessage('Valid question ID required'),
    body('answer').notEmpty().withMessage('Answer is required'),
  ],
};

export const hackathonValidators = {
  createHackathon: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
  ],

  submitCode: [
    body('language').isString().trim().isLength({ min: 1, max: 40 }).withMessage('Programming language is required'),
    body('sourceCode').isString().isLength({ min: 1, max: 50 * 1024 }).withMessage('Source code must be 1-50KB'),
    body('repoUrl').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('repoUrl must be a valid HTTPS URL'),
    body('demoUrl').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('demoUrl must be a valid HTTPS URL'),
    body('presentationUrl').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('presentationUrl must be a valid HTTPS URL'),
  ],

  runCode: [
    body('language').isString().trim().isLength({ min: 1, max: 40 }).withMessage('Programming language is required'),
    body('code').isString().isLength({ min: 1, max: 64 * 1024 }).withMessage('Code must be 1-64KB'),
    body('input').optional().isString().isLength({ max: 16 * 1024 }).withMessage('Input must be at most 16KB'),
  ],

  behaviorEvent: [
    body('eventType').isString().trim().isLength({ min: 1, max: 100 }).withMessage('eventType is required'),
    body('eventPayload').optional().isObject({ strict: true }).withMessage('eventPayload must be a plain object'),
  ],
};

export const jobValidators = {
  createJob: [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('jobType').custom(isJobType).withMessage('jobType must be one of full-time, part-time, internship, or contract'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],

  apply: [
    body('resumeUrl').isURL({ protocols: ['https'], require_protocol: true }).withMessage('Valid HTTPS resume URL required'),
  ],
};

export const commonValidators = {
  idParam: [
    param('id')
      .custom((value) => /^[0-9]+$/.test(String(value)) || /^[0-9a-fA-F]{24}$/.test(String(value)))
      .withMessage('Valid ID required'),
  ],

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  ],
};

export const profileValidators = {
  update: [
    body('fullName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Full name must be 1-100 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
    body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be at most 100 characters'),
    body('profilePicture').optional().isURL({ protocols: ['https'], require_protocol: true }).withMessage('Profile picture must be a valid HTTPS URL'),
    body('linkedinUrl').optional().isURL({ protocols: ['https'], require_protocol: true }).withMessage('LinkedIn URL must be a valid HTTPS URL'),
    body('githubUrl').optional().isURL({ protocols: ['https'], require_protocol: true }).withMessage('GitHub URL must be a valid HTTPS URL'),
    body('portfolioUrl').optional().isURL({ protocols: ['https'], require_protocol: true }).withMessage('Portfolio URL must be a valid HTTPS URL'),
    body('graduationYear').optional().isInt({ min: 1950, max: 2100 }).withMessage('Invalid graduation year'),
    body('yearsExperience').optional().isInt({ min: 0, max: 60 }).withMessage('Invalid years of experience'),
    body('currentPosition').optional().trim().isLength({ max: 150 }).withMessage('Position must be at most 150 characters'),
    body('company').optional().trim().isLength({ max: 150 }).withMessage('Company must be at most 150 characters'),
    body('collegeName').optional().trim().isLength({ max: 150 }).withMessage('College name must be at most 150 characters'),
    // Reject any attempt to set privileged fields
    body('role').not().exists().withMessage('role cannot be updated via profile'),
    body('email').not().exists().withMessage('email cannot be updated via profile'),
    body('password').not().exists().withMessage('password cannot be updated via profile'),
    body('isActive').not().exists().withMessage('isActive cannot be updated via profile'),
    body('failedLoginAttempts').not().exists().withMessage('failedLoginAttempts cannot be updated via profile'),
    body('lockedUntil').not().exists().withMessage('lockedUntil cannot be updated via profile'),
  ],
};

export const aiValidators = {
  chat: [
    body('message').isString().trim().notEmpty().withMessage('Message is required'),
    body('persona').optional().isIn(['tutor', 'mentor', 'reviewer', 'interviewer']).withMessage('Invalid persona'),
  ],

  review: [
    body('projectContent').isString().trim().notEmpty().withMessage('Project content is required'),
    body('domain').isString().trim().notEmpty().withMessage('Domain is required'),
    body('persona').optional().isIn(['technical', 'product', 'business']).withMessage('Invalid persona'),
  ],

  hackathonHelp: [
    body('hackathonTheme').isString().trim().notEmpty().withMessage('Hackathon theme is required'),
    body('query').isString().trim().notEmpty().withMessage('Query is required'),
  ],

  checkout: [
    body('tier').isString().trim().isIn(['EXPLORER', 'INNOVATOR', 'ENTERPRISE']).withMessage('Invalid subscription tier'),
  ],
};
