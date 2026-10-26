const defaultTheme = require('tailwindcss/defaultTheme');

// Dawn sets html { font-size: 62.5% }, so 1rem is 10px, while Tailwind assumes 16px.
// Rescaling the rem values keeps classes (and Tailwind UI markup) at their documented sizes.
const REM_SCALE = 1.6;

const scaleRem = (value) => {
  if (typeof value === 'string') {
    return value.replace(/([\d.]+)rem/g, (_, rem) => `${Number((rem * REM_SCALE).toFixed(4))}rem`);
  }
  if (Array.isArray(value)) return value.map(scaleRem);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, scaleRem(val)]));
  }
  return value;
};

// Dawn color schemes expose comma-separated channels, e.g. --color-foreground: 18,18,18
const dawnColor = (variable) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${variable}))` : `rgba(var(${variable}), ${opacityValue})`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Prefix keeps utilities from colliding with Dawn's own class names
  prefix: 'tw-',
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './assets/*.js',
  ],
  corePlugins: {
    // Dawn ships its own reset; Tailwind's would restyle the whole theme
    preflight: false,
  },
  theme: {
    spacing: scaleRem(defaultTheme.spacing),
    fontSize: scaleRem(defaultTheme.fontSize),
    lineHeight: scaleRem(defaultTheme.lineHeight),
    borderRadius: scaleRem(defaultTheme.borderRadius),
    extend: {
      colors: {
        foreground: dawnColor('--color-foreground'),
        background: dawnColor('--color-background'),
      },
      fontFamily: {
        inherit: 'inherit',
      },
    },
  },
};
