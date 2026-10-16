/**
 * Vertical accent overrides. The base palette lives in src/index.css (light and `.dark`).
 * Motor uses the base navy; Medical swaps the primary accent to the deck's Health teal.
 * Values are applied by ThemeProvider only when they differ from the CSS defaults.
 */
export interface AccentColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
}

export interface ThemeColors {
  light: AccentColors;
  dark: AccentColors;
}

export const motorTheme: ThemeColors = {
  light: {
    primary: '#113378',
    primaryForeground: '#ffffff',
    accent: '#e3f2ee',
    accentForeground: '#1f5e54',
    ring: '#3d9bea',
  },
  dark: {
    primary: '#3d9bea',
    primaryForeground: '#06122b',
    accent: '#123a38',
    accentForeground: '#9fd3c6',
    ring: '#3d9bea',
  },
};

export const medicalTheme: ThemeColors = {
  light: {
    primary: '#1f5e54',
    primaryForeground: '#ffffff',
    accent: '#e3f2ee',
    accentForeground: '#1f5e54',
    ring: '#63af9d',
  },
  dark: {
    primary: '#63af9d',
    primaryForeground: '#06201b',
    accent: '#123a38',
    accentForeground: '#9fd3c6',
    ring: '#63af9d',
  },
};

export const themes = {
  motor: motorTheme,
  medical: medicalTheme,
};
