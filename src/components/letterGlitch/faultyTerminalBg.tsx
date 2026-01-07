import React, { useState, useEffect, useMemo } from 'react';
import FaultyTerminal from './FaultyTerminal';

/**
 * 自定义 Hook: 统一管理主题监听逻辑
 */
function useThemeMode() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const getResolvedTheme = (): 'dark' | 'light' => {
      if (typeof window === 'undefined') return 'dark';

      // 1. 检查 localStorage
      const storedTheme = localStorage.getItem('globalTheme');
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;

      // 2. 检查 DOM 类名
      if (document.documentElement.classList.contains('dark')) return 'dark';

      // 3. 检查系统偏好
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // 初始化主题
    setTheme(getResolvedTheme());

    // 监听 DOM class 变化 (Tailwind 等框架常用)
    const observer = new MutationObserver(() => {
      setTheme(getResolvedTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 监听系统主题偏好变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (!localStorage.getItem('globalTheme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // 监听跨标签页同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'globalTheme' && e.newValue) {
        setTheme(e.newValue === 'dark' ? 'dark' : 'light');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return theme;
}

/**
 * 主组件
 */
export default function FaultyTerminalBg() {
  const theme = useThemeMode();

  // 使用 useMemo 缓存颜色配置，避免组件重绘时重新创建对象
  const themeColors = useMemo(() => {
    return theme === 'dark'
      ? { tint: '#FBF9EF', backgroundTint: '#131313' }
      : { tint: '#131313', backgroundTint: '#FBF9EF' };
  }, [theme]);

  return (
    <div className="relative w-full h-[100lvh] overflow-hidden bg-background">
      {/* 遮罩层：
        - pointer-events-none 确保不会拦截点击事件
        - z-10 浮在动画上方
      */}
      <div
        className="absolute inset-0 z-10 bg-white/10 dark:bg-black/10 backdrop-blur-sm md:backdrop-blur-0 pointer-events-none"
        aria-hidden="true"
      />

      <FaultyTerminal
        scale={5}
        gridMul={[2, 1]}
        digitSize={1.5}
        timeScale={0.1}
        pause={false}
        mouseReact={false}
        mouseStrength={0.5}
        scanlineIntensity={0}
        glitchAmount={0}
        flickerAmount={0.5}
        noiseAmp={0.5}
        centerVignette={true}
        // 应用计算后的颜色
        tint={themeColors.tint}
        backgroundTint={themeColors.backgroundTint}
      />
    </div>
  );
}