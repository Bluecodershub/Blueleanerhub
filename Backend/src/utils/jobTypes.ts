export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

export const JOB_TYPES: JobType[] = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

const JOB_TYPE_ALIASES: Record<string, JobType> = {
  FULL_TIME: 'FULL_TIME',
  FULLTIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  PARTTIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
};

export function normalizeJobType(value: unknown): JobType | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase().replace(/[-\s]+/g, '_');
  return JOB_TYPE_ALIASES[normalized] ?? null;
}

export function isJobType(value: unknown): boolean {
  return normalizeJobType(value) !== null;
}
