import type { AppearanceSettings, ResolvedEntitlements } from '@asc/types';

export function resolveVisibleAppearance(saved: AppearanceSettings, entitlements: ResolvedEntitlements): AppearanceSettings & { activeLayout: AppearanceSettings['layout'] | NonNullable<AppearanceSettings['supporterLayout']> } {
  const studio = entitlements.canProfileStudio;
  return {
    ...saved,
    backgroundUrl: entitlements.canCustomBackground ? saved.backgroundUrl : null,
    activeLayout: studio && saved.supporterLayout ? saved.supporterLayout : saved.layout,
    supporterLayout: studio ? saved.supporterLayout : null,
    typography: studio ? saved.typography : 'balanced',
    avatarFrame: studio ? saved.avatarFrame : 'none',
    coverTreatment: studio ? saved.coverTreatment : 'solid',
    coverPosition: studio ? saved.coverPosition : 50,
    motion: studio ? saved.motion : 'subtle',
  };
}
