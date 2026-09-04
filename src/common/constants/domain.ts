/**
 * Domain vocabularies.
 *
 * SQLite cannot express Prisma `enum`s, so these arrays are the single source of
 * truth for every status/type column. DTOs validate against them with `@IsIn`,
 * and the derived union types keep the service layer honest at compile time.
 */

export const ROLE_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'COFOUNDER',
] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

export const LOCATION_TYPES = ['REMOTE', 'ONSITE', 'HYBRID'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const SEARCH_STATUSES = [
  'READY_TO_INTERVIEW',
  'OPEN_TO_OFFERS',
  'CLOSED',
] as const;
export type SearchStatus = (typeof SEARCH_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'APPLIED',
  'IN_REVIEW',
  'INTERVIEWING',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/**
 * Statuses that represent a finished pipeline. Used to split the Applied page
 * into "active" and "archived", and to block withdrawal of a closed application.
 */
export const TERMINAL_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
];

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const FUNDING_STAGES = [
  'BOOTSTRAPPED',
  'PRE_SEED',
  'SEED',
  'SERIES_A',
  'SERIES_B',
  'SERIES_C',
  'PUBLIC',
] as const;
export type FundingStage = (typeof FUNDING_STAGES)[number];

export const JOB_SORT_OPTIONS = ['recommended', 'recent', 'salary'] as const;
export type JobSort = (typeof JOB_SORT_OPTIONS)[number];

export const WORK_ENVIRONMENTS = [
  'OFFICE',
  'REMOTE',
  'HYBRID',
  'NO_PREFERENCE',
] as const;
export type WorkEnvironment = (typeof WORK_ENVIRONMENTS)[number];

export const WORK_AUTHORIZATIONS = [
  'NOT_SPECIFIED',
  'CITIZEN',
  'PERMANENT_RESIDENT',
  'VISA_HOLDER',
  'NEEDS_SPONSORSHIP',
] as const;
export type WorkAuthorization = (typeof WORK_AUTHORIZATIONS)[number];

/**
 * Wellfound expires an application after two weeks of inactivity. Encoded once
 * here so the applications service and the "expiring soon" badge agree.
 */
export const APPLICATION_EXPIRY_DAYS = 14;
