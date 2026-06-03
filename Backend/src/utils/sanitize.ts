/**
 * Input Sanitization Utilities - Simple stub implementation
 */

// Simple sanitization without external library dependency issues
export function sanitizeText(input: string): string {
  try {
    if (!input) return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  } catch {
    return input || '';
  }
}

export function sanitizeRichText(input: string): string {
  try {
    if (!input) return '';
    // Strip dangerous tags but keep basic formatting
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  } catch {
    return sanitizeText(input);
  }
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = typeof value === 'string' ? sanitizeText(value) : value;
  }
  return cleaned;
}
