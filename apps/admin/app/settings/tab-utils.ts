export type SettingsTab = 'security' | 'cms' | 'company';

export function resolveSettingsTab(tabParam?: string | null): SettingsTab {
  if (tabParam === 'cms') return 'cms';
  if (tabParam === 'company') return 'company';
  return 'security';
}
