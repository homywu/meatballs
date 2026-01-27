'use client';

import { useState, useEffect, startTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X, Share, HelpCircle, Monitor, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const t = useTranslations('addToHome');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Detect iOS/installed status after hydration
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';

    startTransition(() => {
      setIsMounted(true);
      setIsIOS(ios);
      setIsStandalone(standalone);
      setIsDismissed(dismissed);
    });
  }, []);

  useEffect(() => {
    // 如果已安装，不需要设置其他内容
    if (isStandalone || !isMounted) {
      return;
    }

    // Android/Desktop: 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If we got the prompt, we can show it again even if it was dismissed before
      // as the browser decided it's a good time to prompt
      setIsDismissed(false);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, isMounted]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    // We could make this expire, but for now just hide it for the session
  };

  // Don't render anything until after hydration to prevent mismatch
  if (!isMounted) {
    return null;
  }

  // 如果已安装或已关闭，不显示按钮
  if (isStandalone || isDismissed) {
    return null;
  }

  // Android / Desktop Chrome: 显示安装提示
  if (!isIOS) {
    // Case 1: Browser fired beforeinstallprompt (Native flow available)
    if (deferredPrompt) {
      return (
        <div className="fixed bottom-24 left-4 right-4 z-[60] md:bottom-6 md:right-6 md:left-auto md:w-80">
          <div className="relative bg-white rounded-lg shadow-2xl border border-gray-100 p-5 animate-in slide-in-from-bottom-5 duration-300">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{t('title')}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {t('description')}
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-200"
                >
                  {t('addNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Case 2: No native prompt yet, but we want to show a manual guide option
    // This is especially useful for users who uninstalled or for desktop discovery
    return (
      <>
        <div className="fixed bottom-24 left-4 right-4 z-[60] md:bottom-6 md:right-6 md:left-auto md:w-64">
          <button
            onClick={() => setShowManualPrompt(true)}
            className="w-full bg-white border border-orange-100 text-orange-600 px-4 py-3 rounded-2xl font-semibold shadow-xl hover:bg-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {t('manualTitle')}
          </button>
        </div>

        {showManualPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{t('manualTitle')}</h3>
                <button
                  onClick={() => setShowManualPrompt(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Monitor className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-gray-900">{t('desktopTitle')}</h4>
                  </div>
                  <ol className="space-y-3 pl-2">
                    <li className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-orange-600">1.</span>
                      {t('desktopStep1')}
                    </li>
                    <li className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-orange-600">2.</span>
                      {t('desktopStep2')}
                    </li>
                  </ol>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">{t('androidTitle')}</h4>
                  </div>
                  <ol className="space-y-3 pl-2">
                    <li className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-blue-600">1.</span>
                      {t('androidStep1')}
                    </li>
                    <li className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-blue-600">2.</span>
                      {t('androidStep2')}
                    </li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowManualPrompt(false)}
                className="mt-8 w-full bg-gray-900 text-white px-4 py-3 rounded-2xl font-bold hover:bg-black transition-colors"
              >
                {t('gotIt')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // iOS: 显示添加提示
  if (isIOS && !showIOSPrompt) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-80">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Share className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{t('iosTitle')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('iosDescription')}
              </p>
              <button
                onClick={() => setShowIOSPrompt(true)}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                {t('viewSteps')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS: 显示详细步骤
  if (isIOS && showIOSPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('iosTitle')}</h3>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800 font-medium mb-1">{t('important')}</p>
              <p className="text-xs text-orange-700">
                {t('importantNote')}
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  {t('step1')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  {t('step2')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  {t('step3')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIOSPrompt(false)}
            className="mt-6 w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
