import { createTheme } from '@mui/material/styles';

// CarePath palette — calm, trustworthy healthcare tones. Deep teal for trust and
// clinical calm, coral as the one warm accent for calls to action and alerts.
export const palette = {
  teal: '#0D7377',
  tealDark: '#093E3E',
  tealLight: '#E4F3F2',
  coral: '#FF6F59',
  coralDark: '#E85A45',
  ink: '#14282B',
  slate: '#5B6B6E',
  lightBg: '#F5F8F8',
  white: '#FFFFFF',
  amber: '#D98E04',
  red: '#C6423A',
  sky: '#2F8FA8',
};

export const chartColors = {
  positive: '#2E9E5B',
  negative: palette.red,
  neutral: palette.amber,
};

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      ink: string;
      tealLight: string;
    };
  }
  interface PaletteOptions {
    brand?: {
      ink: string;
      tealLight: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.teal, dark: palette.tealDark, contrastText: '#FFFFFF' },
    secondary: { main: palette.coral, dark: palette.coralDark, contrastText: '#FFFFFF' },
    warning: { main: palette.amber },
    error: { main: palette.red },
    info: { main: palette.sky },
    background: { default: palette.lightBg, paper: palette.white },
    text: { primary: palette.ink, secondary: palette.slate },
    brand: { ink: palette.ink, tealLight: palette.tealLight },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, fontSize: '2.15rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, fontSize: '1.3rem' },
    h4: { fontWeight: 600, fontSize: '1.05rem' },
    h5: { fontWeight: 600, fontSize: '1rem' },
    h6: { fontWeight: 600, fontSize: '0.9rem' },
    subtitle1: { fontWeight: 500 },
    overline: { fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: '18px',
          transition: 'transform 120ms ease, box-shadow 180ms ease, background-color 180ms ease',
          '&:active': { transform: 'scale(0.97)' },
        },
        contained: {
          boxShadow: '0 1px 2px rgba(20,40,43,0.08), 0 6px 16px rgba(20,40,43,0.08)',
          '&:hover': { boxShadow: '0 2px 4px rgba(20,40,43,0.1), 0 10px 24px rgba(20,40,43,0.12)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(20,40,43,0.06)',
          boxShadow: '0 1px 2px rgba(20,40,43,0.05), 0 8px 20px rgba(20,40,43,0.04)',
          transition: 'box-shadow 220ms ease, transform 220ms ease',
          '&:has(.MuiCardActionArea-root:hover)': {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 8px rgba(20,40,43,0.07), 0 18px 36px rgba(20,40,43,0.09)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem' },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: { zIndex: 1500 },
      },
    },
  },
});
