// Single source of truth for the legal/policy version that consent is recorded
// against. Bump this whenever a policy materially changes so the platform can
// re-collect consent (DPDP 2023 requires fresh, specific, informed consent).
export const CURRENT_POLICY_VERSION = '2026.06';

// Grievance Officer contact — surfaced in the Privacy Policy, Grievance page,
// and footer. Replace placeholders before production launch.
export const GRIEVANCE_OFFICER = {
  name: 'Grievance Officer',
  email: 'grievance@bluelearnerhub.com',
  responseWindowDays: 30,
};
