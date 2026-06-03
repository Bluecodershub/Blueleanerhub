export type AppRole = 'STUDENT' | 'MENTOR' | 'CORPORATE' | 'ADMIN'

const homeByRole: Record<AppRole, string> = {
  STUDENT: '/student/dashboard',
  MENTOR: '/mentor/dashboard',
  CORPORATE: '/corporate/dashboard',
  ADMIN: '/admin/dashboard',
}

export function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') return null
  const normalized = role.toUpperCase()
  return normalized in homeByRole ? (normalized as AppRole) : null
}

export function getHomeByRole(role: unknown): string {
  const normalized = normalizeRole(role)
  return normalized ? homeByRole[normalized] : homeByRole.STUDENT
}

export function isAllowedRole(role: unknown, allowedRoles: AppRole[]): boolean {
  const normalized = normalizeRole(role)
  return normalized ? allowedRoles.includes(normalized) : false
}
