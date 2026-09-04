import { CompletionInput, calculateCompletion } from './profile-completion';

const EMPTY: CompletionInput = {
  headline: null,
  location: null,
  primaryRole: null,
  bio: null,
  resumeFileName: null,
  experienceCount: 0,
  educationCount: 0,
  skillCount: 0,
  hasSocialLink: false,
  hasPreference: false,
  hasCulture: false,
};

const COMPLETE: CompletionInput = {
  headline: 'Product Manager',
  location: 'Bengaluru',
  primaryRole: 'Product Manager',
  bio: 'Some bio',
  resumeFileName: 'cv.pdf',
  experienceCount: 2,
  educationCount: 1,
  skillCount: 5,
  hasSocialLink: true,
  hasPreference: true,
  hasCulture: true,
};

describe('calculateCompletion', () => {
  it('scores an empty profile at zero and lists every step as missing', () => {
    const result = calculateCompletion(EMPTY);

    expect(result.score).toBe(0);
    expect(result.missing).toHaveLength(result.steps.length);
  });

  it('scores a fully populated profile at exactly 100', () => {
    const result = calculateCompletion(COMPLETE);

    expect(result.score).toBe(100);
    expect(result.missing).toHaveLength(0);
  });

  it('weights are defined so the maximum is exactly 100', () => {
    const total = calculateCompletion(EMPTY).steps.reduce(
      (sum, step) => sum + step.weight,
      0,
    );

    expect(total).toBe(100);
  });

  it('requires three skills before crediting the skills step', () => {
    const twoSkills = calculateCompletion({ ...EMPTY, skillCount: 2 });
    const threeSkills = calculateCompletion({ ...EMPTY, skillCount: 3 });

    expect(twoSkills.steps.find((s) => s.key === 'skills')?.complete).toBe(false);
    expect(threeSkills.steps.find((s) => s.key === 'skills')?.complete).toBe(true);
  });

  it('cannot reach 100 without the searchable fields', () => {
    // A profile with every cosmetic field but no role/skills/experience must
    // stay meaningfully incomplete, since recruiters could not find it.
    const cosmeticOnly = calculateCompletion({
      ...COMPLETE,
      primaryRole: null,
      skillCount: 0,
      experienceCount: 0,
    });

    expect(cosmeticOnly.score).toBeLessThanOrEqual(50);
  });
});
