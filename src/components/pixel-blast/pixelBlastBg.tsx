import PixelBlast from './pixel-blast';
import { useState, useEffect } from 'react';

function getCurrentTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    const storedTheme = localStorage.getItem('globalTheme');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    if (document.documentElement.classList.contains('dark')) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
}

export default function PixelBlastBg() {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => getCurrentTheme());

    useEffect(() => {
        setTheme(getCurrentTheme());

        const observer = new MutationObserver(() => {
            const newTheme = getCurrentTheme();
            setTheme(cur => (newTheme !== cur ? newTheme : cur));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'globalTheme' && e.newValue) {
                const t = e.newValue === 'dark' ? 'dark' : 'light';
                setTheme(cur => (t !== cur ? t : cur));
            }
        };
        window.addEventListener('storage', handleStorage);

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMedia = () => {
            if (!localStorage.getItem('globalTheme')) {
                const t = mq.matches ? 'dark' : 'light';
                setTheme(cur => (t !== cur ? t : cur));
            }
        };
        mq.addEventListener('change', handleMedia);

        return () => {
            observer.disconnect();
            window.removeEventListener('storage', handleStorage);
            mq.removeEventListener('change', handleMedia);
        };
    }, []);

    const color = theme === 'dark' ? '#A0A3BF' : '#6B6F9E';

    const maskColor = theme === 'dark' ? '0,0,0' : '255,255,255';

    return (
        <div style={{ width: '100vw', height: '100lvh', position: 'fixed', top: 0, left: 0 }}>
            <PixelBlast
                color={color}
                variant="circle"
                pixelSize={2.5}
                patternScale={2}
                patternDensity={0.8}
                speed={0.5}
                edgeFade={0.15}
                enableRipples={true}
                rippleSpeed={0.3}
                rippleThickness={2}
                rippleIntensityScale={1}
                transparent={true}
                autoPauseOffscreen={true}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(${maskColor}, 0.8) 0%, rgba(${maskColor}, 0.55) 35%, rgba(${maskColor}, 0.2) 65%, transparent 100%)`,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}
