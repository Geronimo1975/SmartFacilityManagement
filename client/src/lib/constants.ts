export const ROLES = {
  ADMIN: "admin",
  COMPANY: "company",
  PARTNER: "partner",
  CLIENT: "client"
} as const;

export type Role = keyof typeof ROLES;

export const SYSTEM_CONTROLS = {
  HVAC: "hvac",
  LIGHTING: "lighting",
  SECURITY: "security"
} as const;

export type SystemControl = keyof typeof SYSTEM_CONTROLS;

export const DASHBOARD_CONFIG = {
  [ROLES.ADMIN]: {
    title: "Master Admin Dashboard",
    features: ["userManagement", "systemControls", "analytics"]
  },
  [ROLES.COMPANY]: {
    title: "Company Dashboard",
    features: ["assetManagement", "systemControls", "reports"]
  },
  [ROLES.PARTNER]: {
    title: "Partner Dashboard",
    features: ["collaboration", "systemControls"]
  },
  [ROLES.CLIENT]: {
    title: "Client Dashboard",
    features: ["serviceRequests", "systemStatus"]
  }
} as const;
