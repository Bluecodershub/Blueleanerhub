// src/lib/domain-config.ts

export const DOMAINS = {
  COMPUTER_SCIENCE: {
    id: 'computer-science',
    name: 'CS',
    icon: '💻',
    categories: ['Artificial Intelligence', 'Data Science', 'Python', 'Java'],
  },
  MECHANICAL: {
    id: 'mechanical',
    name: 'Mechanical',
    icon: '⚙️',
    categories: ['Thermodynamics', 'CAD Engineering', 'Fluid Dynamics', 'FAE'],
  },
  MANAGEMENT: {
    id: 'management',
    name: 'Management',
    icon: '💼',
    categories: ['Lean Six Sigma', 'Investment Banking'],
  },
} as const

export type DomainId = keyof typeof DOMAINS

export function getDomain(id: DomainId) {
  return DOMAINS[id]
}

export function getAllDomains() {
  return [DOMAINS.COMPUTER_SCIENCE, DOMAINS.MECHANICAL, DOMAINS.MANAGEMENT]
}

export function getEngineeringDomains() {
  return [DOMAINS.COMPUTER_SCIENCE, DOMAINS.MECHANICAL]
}

export function getManagementDomains() {
  return [DOMAINS.MANAGEMENT]
}
