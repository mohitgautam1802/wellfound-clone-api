/**
 * Profile completion scoring.
 *
 * Drives the progress bar and the "Congrats! Your profile is complete" banner.
 * Weights are deliberately lopsided towards the things a recruiter actually
 * filters on (role, skills, experience) rather than cosmetic fields, so a
 * profile cannot reach 100% while being unsearchable.
 */

export interface CompletionInput {
  headline: string | null;
  location: string | null;
  primaryRole: string | null;
  bio: string | null;
  resumeFileName: string | null;
  experienceCount: number;
  educationCount: number;
  skillCount: number;
  hasSocialLink: boolean;
  hasPreference: boolean;
  hasCulture: boolean;
}

export interface CompletionStep {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
}

export function calculateCompletion(input: CompletionInput): {
  score: number;
  steps: CompletionStep[];
  missing: CompletionStep[];
} {
  const steps: CompletionStep[] = [
    {
      key: 'headline',
      label: 'Add a headline',
      weight: 10,
      complete: !!input.headline,
    },
    {
      key: 'primaryRole',
      label: 'Set your primary role',
      weight: 15,
      complete: !!input.primaryRole,
    },
    {
      key: 'location',
      label: 'Add your location',
      weight: 5,
      complete: !!input.location,
    },
    { key: 'bio', label: 'Write a short bio', weight: 10, complete: !!input.bio },
    {
      key: 'experience',
      label: 'Add work experience',
      weight: 20,
      complete: input.experienceCount > 0,
    },
    {
      key: 'education',
      label: 'Add education',
      weight: 5,
      complete: input.educationCount > 0,
    },
    {
      key: 'skills',
      label: 'Add at least 3 skills',
      weight: 15,
      complete: input.skillCount >= 3,
    },
    {
      key: 'resume',
      label: 'Upload a resume',
      weight: 5,
      complete: !!input.resumeFileName,
    },
    {
      key: 'social',
      label: 'Link a social profile',
      weight: 5,
      complete: input.hasSocialLink,
    },
    {
      key: 'preferences',
      label: 'Set job preferences',
      weight: 5,
      complete: input.hasPreference,
    },
    {
      key: 'culture',
      label: 'Complete the culture section',
      weight: 5,
      complete: input.hasCulture,
    },
  ];

  const score = steps.reduce((sum, step) => sum + (step.complete ? step.weight : 0), 0);

  return {
    score,
    steps,
    missing: steps.filter((step) => !step.complete),
  };
}
