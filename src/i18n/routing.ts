import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['zh', 'en'],

  // Used when no locale matches
  defaultLocale: 'zh'
});

// Create navigation with routing config
// In next-intl 4.x, this works differently for server/client
// For client components, use createNavigation from 'next-intl/navigation'
export const navigation = createNavigation(routing);
