import FaultyTerminal from './FaultyTerminal';
import { useState, useEffect } from 'react';

/**
 * 获取当前主题模式
 * @returns 'dark' | 'light'
 */
function getCurrentTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';

  // 优先检查 localStorage
  const storedTheme = localStorage.getItem('globalTheme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  // 检查 DOM 类名
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  // 检查系统偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * 根据主题模式获取对应的颜色配置
 * @param theme 主题模式
 * @returns { tint: string, backgroundTint: string }
 */
function getThemeColors(theme: 'dark' | 'light'): { tint: string; backgroundTint: string } {
  if (theme === 'dark') {
    return {
      tint: '#FBF9EF',
      backgroundTint: '#131313',
    };
  } else {
    return {
      tint: '#131313',
      backgroundTint: '#FBF9EF',
    };
  }
}

export default function FaultyTerminalBg() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getCurrentTheme());
  const colors = getThemeColors(theme);

  useEffect(() => {
    // 初始化时获取主题
    setTheme(getCurrentTheme());

    // 监听 DOM 类名变化（主题切换时）
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      setTheme((currentTheme) => {
        if (newTheme !== currentTheme) {
          return newTheme;
        }
        return currentTheme;
      });
    });

    // 监听 document.documentElement 的 class 属性变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 监听 localStorage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'globalTheme' && e.newValue) {
        const newTheme = e.newValue === 'dark' ? 'dark' : 'light';
        setTheme((currentTheme) => {
          if (newTheme !== currentTheme) {
            return newTheme;
          }
          return currentTheme;
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // 只有在没有 localStorage 设置时才响应系统偏好
      if (!localStorage.getItem('globalTheme')) {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setTheme((currentTheme) => {
          if (newTheme !== currentTheme) {
            return newTheme;
          }
          return currentTheme;
        });
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <div className="h-full">
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-black/10 z-10 backdrop-blur-sm md:backdrop-blur-0" />
      <FaultyTerminal
        scale={2.5}
        gridMul={[2, 1]}
        digitSize={1.5}
        timeScale={.3}
        pause={false}
        mouseReact={false}
        mouseStrength={0.5}
        scanlineIntensity={0.1}
        glitchAmount={0}
        flickerAmount={0.5}
        noiseAmp={1}
        tint={colors.tint}
        backgroundTint={colors.backgroundTint}
        centerVignette={true}
      />
    </div>
  );
}

