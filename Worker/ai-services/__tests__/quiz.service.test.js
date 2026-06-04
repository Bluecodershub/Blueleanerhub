'use strict';

jest.mock('../services/aiProvider.service', () => ({
  generateJSON: jest.fn(),
}));

const aiProvider = require('../services/aiProvider.service');
const { generateQuiz } = require('../services/quiz.service');

describe('quiz.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validated quiz questions from model JSON', async () => {
    aiProvider.generateJSON.mockResolvedValue({
      questions: [
        {
          question: 'Which keyword declares a block-scoped variable in JavaScript?',
          options: { A: 'var', B: 'let', C: 'define', D: 'set' },
          correct_answer: 'B',
          explanation: 'let declares a variable scoped to the nearest block.',
          difficulty: 'easy',
        },
      ],
    });

    await expect(generateQuiz({ topic: 'JavaScript', count: 1, difficulty: 'easy' }))
      .resolves
      .toEqual({
        questions: [
          {
            question: 'Which keyword declares a block-scoped variable in JavaScript?',
            options: ['var', 'let', 'define', 'set'],
            correctIndex: 1,
            explanation: 'let declares a variable scoped to the nearest block.',
            difficulty: 'easy',
          },
        ],
      });
  });

  it('throws when the provider is unavailable', async () => {
    aiProvider.generateJSON.mockRejectedValue(new Error('No local AI provider available'));

    await expect(generateQuiz({ topic: 'Python', count: 1 }))
      .rejects
      .toThrow('No local AI provider available');
  });

  it('rejects incomplete model output instead of fabricating placeholders', async () => {
    aiProvider.generateJSON.mockResolvedValue({
      questions: [
        {
          question: 'Incomplete question',
          options: ['Only one option'],
          correctIndex: 0,
          explanation: '',
        },
      ],
    });

    await expect(generateQuiz({ topic: 'Databases', count: 1 }))
      .rejects
      .toThrow(/must have exactly 4 options|missing an explanation/);
  });
});
