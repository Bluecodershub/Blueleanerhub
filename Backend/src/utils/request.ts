export function asString(value: unknown, fallback = ''): string {  
  if (typeof value === 'string') return value;  
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];  
  if (value === null || value === undefined) return fallback;  
  return String(value);  
}  
  
export function parseInteger(value: unknown, fallback = 0): number {  
  const parsed = Number.parseInt(asString(value), 10);  
  return Number.isNaN(parsed) ? fallback : parsed;  
} 
