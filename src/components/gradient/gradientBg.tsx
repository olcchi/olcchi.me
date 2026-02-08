import Grainient from './gradient';
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
 */
function getThemeColors(theme: 'dark' | 'light') {
    if (theme === 'dark') {
        return {
            color1: '#A0A3BF',
            color2: '#020202',
            color3: '#A0A3BF',
        };
    } else {
        return {
            color1: '#E0E0E0',
            color2: '#BDBFD7',
            color3: '#E0E0E0',
        };
    }
}

export default function GradientBg() {
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
        <div style={{ width: '100vw', height: '100lvh', position: 'fixed', top: 0, left: 0 }}>
            <Grainient
                {...colors}
                timeSpeed={0.15}
                colorBalance={0}
                warpStrength={1}
                warpFrequency={5}
                warpSpeed={0.5}
                warpAmplitude={50}
                blendAngle={1}
                blendSoftness={0.05}
                rotationAmount={500}
                noiseScale={2}
                grainAmount={0.05}
                grainScale={1}
                grainAnimated={false}
                contrast={1.5}
                gamma={0.5}
                saturation={1}
                centerX={0}
                centerY={0}
                zoom={1.2}
            />
        </div>
    );
}
