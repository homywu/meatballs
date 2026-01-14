import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['zh', 'en'],

  // Used when no locale matches
  defaultLocale: 'zh'
});

// In next-intl 4.x, navigation functions should be imported directly
// from 'next-intl/navigation' in the components that need them
// We only export routing config here
