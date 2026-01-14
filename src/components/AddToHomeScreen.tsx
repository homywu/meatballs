'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches;
  });
  const [supportsShare] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return typeof navigator.share !== 'undefined';
  });

  useEffect(() => {
    // 如果已安装，不需要设置其他内容
    if (isInstalled) {
      return;
    }

    // Android: 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleIOSShare = async () => {
    // 使用 Web Share API 打开分享菜单
    if (navigator.share) {
      try {
        await navigator.share({
          title: '肉丸订购系统',
          text: '轻松订购美味手打肉丸',
          url: window.location.href,
        });
        // 分享成功后，用户可以在分享菜单中找到"添加到主屏幕"选项
      } catch (error: unknown) {
        // 用户取消分享或发生错误
        if (error instanceof Error && error.name !== 'AbortError') {
          // 如果不是用户取消，显示步骤说明
          setShowIOSPrompt(true);
        }
      }
    } else {
      // 不支持 Web Share API，显示步骤说明
      setShowIOSPrompt(true);
    }
  };

  // 如果已安装，不显示按钮
  if (isInstalled) {
    return null;
  }

  // Android: 显示安装提示
  if (deferredPrompt && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">添加到主屏幕</h3>
              <p className="text-sm text-gray-600 mb-3">
                将应用添加到主屏幕，方便快速下单
              </p>
              <button
                onClick={handleAndroidInstall}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                立即添加
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS: 显示分享按钮
  if (isIOS && !showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Share2 className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">添加到主屏幕</h3>
              <p className="text-sm text-gray-600 mb-3">
                {supportsShare
                  ? '点击下方按钮，在分享菜单中选择&ldquo;添加到主屏幕&rdquo;'
                  : '点击下方按钮查看添加步骤'}
              </p>
              <div className="flex gap-2">
                {supportsShare && (
                  <button
                    onClick={handleIOSShare}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    打开分享菜单
                  </button>
                )}
                <button
                  onClick={() => setShowIOSPrompt(true)}
                  className={`${supportsShare ? 'flex-1' : 'w-full'} bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors`}
                >
                  查看步骤
                </button>
              </div>
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
            <h3 className="text-lg font-semibold text-gray-900">添加到主屏幕</h3>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  点击浏览器底部的 <Share2 className="w-4 h-4 inline mx-1" /> 分享按钮
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  向下滚动，找到并点击&ldquo;添加到主屏幕&rdquo;
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  点击&ldquo;添加&rdquo;确认
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIOSPrompt(false)}
            className="mt-6 w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    );
  }

  return null;
}
