'use client';

import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';

const navigation = createNavigation(routing);

export default function LanguageSwitcher({
  currentLocale,
  isScrolled
}: {
  currentLocale: string;
  isScrolled?: boolean;
}) {
  const router = navigation.useRouter();
  const pathname = navigation.usePathname();

  const switchLocale = (locale: string) => {
    router.push(pathname, { locale });
  };

  // 内联版本：紧凑的语言切换按钮，适配 header 样式
  return (
    <button
      onClick={() => switchLocale(currentLocale === 'zh' ? 'en' : 'zh')}
      className={`ml-2 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${isScrolled
        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        : 'bg-black/30 text-white backdrop-blur-md border border-white/20 hover:bg-black/40'
        }`}
    >
      <Globe size={12} />
      <span>{currentLocale === 'zh' ? '中文' : 'EN'}</span>
    </button>
  );
}
