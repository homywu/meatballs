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

  // --- Internal Components for Consistency ---

  const MiniPrompt = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
    onDismiss
  }: {
    icon: any;
    title: string;
    description?: string;
    actionText: string;
    onAction: () => void;
    onDismiss?: () => void;
  }) => (
    <div className="fixed bottom-24 left-4 right-4 z-[60] md:bottom-6 md:right-6 md:left-auto md:w-80 animate-in slide-in-from-bottom-10 duration-700">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-orange-100 p-5 flex flex-col gap-4">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center border border-orange-200/50">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="font-bold text-slate-900 leading-tight">{title}</h3>
            {description && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onAction}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {actionText}
        </button>
      </div>
    </div>
  );

  const StepItem = ({ number, text }: { number: number; text: string }) => (
    <div className="flex gap-4 items-start group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm border border-orange-200 group-hover:scale-110 transition-transform">
        {number}
      </div>
      <p className="text-slate-700 text-sm leading-relaxed pt-1">{text}</p>
    </div>
  );

  const Modal = ({
    title,
    children,
    onClose
  }: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] shadow-3xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-300 relative border border-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full transition-colors border border-slate-100 shadow-sm active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {children}
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          {t('gotIt')}
        </button>
      </div>
    </div>
  );

  // --- Render Logic ---

  if (!isMounted || isStandalone || isDismissed) {
    return null;
  }

  // Android / Desktop Native Prompt
  if (!isIOS && deferredPrompt) {
    return (
      <MiniPrompt
        icon={Download}
        title={t('title')}
        description={t('description')}
        actionText={t('addNow')}
        onAction={handleInstallClick}
        onDismiss={handleDismiss}
      />
    );
  }

  // Android / Desktop Manual Guide
  if (!isIOS && !deferredPrompt) {
    return (
      <>
        <div className="fixed bottom-24 left-4 right-4 z-[60] md:bottom-6 md:right-6 md:left-auto md:w-64 animate-in slide-in-from-bottom-10 duration-700">
          <button
            onClick={() => setShowManualPrompt(true)}
            className="w-full bg-white/95 backdrop-blur-sm border border-orange-100 text-orange-600 px-6 py-4 rounded-[2rem] font-bold shadow-2xl hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {t('installTitle')}
          </button>
        </div>

        {showManualPrompt && (
          <Modal title={t('installTitle')} onClose={() => setShowManualPrompt(false)}>
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-slate-900">{t('desktopTitle')}</h4>
                </div>
                <div className="space-y-4 ml-1">
                  <StepItem number={1} text={t('desktopStep1')} />
                  <StepItem number={2} text={t('desktopStep2')} />
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-900">{t('androidTitle')}</h4>
                </div>
                <div className="space-y-4 ml-1">
                  <StepItem number={1} text={t('androidStep1')} />
                  <StepItem number={2} text={t('androidStep2')} />
                </div>
              </section>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // iOS Prompts
  if (isIOS) {
    return (
      <>
        {!showIOSPrompt && (
          <MiniPrompt
            icon={Share}
            title={t('title')}
            description={t('description')}
            actionText={t('viewSteps')}
            onAction={() => setShowIOSPrompt(true)}
            onDismiss={handleDismiss}
          />
        )}

        {showIOSPrompt && (
          <Modal title={t('title')} onClose={() => setShowIOSPrompt(false)}>
            <div className="bg-orange-50/50 border border-orange-100 rounded-[1.5rem] p-4 mb-2">
              <p className="text-xs text-orange-800 font-bold uppercase tracking-wider mb-1">{t('important')}</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                {t('importantNote')}
              </p>
            </div>
            <div className="space-y-5">
              <StepItem number={1} text={t('step1')} />
              <StepItem number={2} text={t('step2')} />
              <StepItem number={3} text={t('step3')} />
            </div>
          </Modal>
        )}
      </>
    );
  }

  return null;
}
