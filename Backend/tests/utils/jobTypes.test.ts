import { normalizeJobType } from '../../src/utils/jobTypes';

describe('normalizeJobType', () => {
  it.each([
    ['full-time', 'FULL_TIME'],
    ['full_time', 'FULL_TIME'],
    ['FULL_TIME', 'FULL_TIME'],
    ['part-time', 'PART_TIME'],
    ['part time', 'PART_TIME'],
    ['internship', 'INTERNSHIP'],
    ['contract', 'CONTRACT'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeJobType(input)).toBe(expected);
  });

  it('rejects unsupported job types', () => {
    expect(normalizeJobType('temporary')).toBeNull();
    expect(normalizeJobType(undefined)).toBeNull();
  });
});
