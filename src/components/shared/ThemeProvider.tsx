import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { uiThemeAtom, appThemeAtom } from '@/store/atoms/ui';
import { themes } from '@/lib/themes/colors';

const ACCENT_VARS = [
  '--color-primary',
  '--color-primary-foreground',
  '--color-accent',
  '--color-accent-foreground',
  '--color-ring',
] as const;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [uiTheme] = useAtom(uiThemeAtom);
  const [appTheme] = useAtom(appThemeAtom);

  // Apply light/dark mode class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(uiTheme);
  }, [uiTheme]);

  // Apply the vertical accent (motor = base palette, medical = Health teal)
  useEffect(() => {
    const root = document.documentElement;

    if (appTheme === 'motor') {
      ACCENT_VARS.forEach((name) => root.style.removeProperty(name));
      return;
    }

    const colors = themes[appTheme][uiTheme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-foreground', colors.accentForeground);
    root.style.setProperty('--color-ring', colors.ring);
  }, [appTheme, uiTheme]);

  return <>{children}</>;
}
