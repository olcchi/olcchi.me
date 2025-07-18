import { useRef, useEffect, useCallback, useMemo } from "react";

const LetterGlitch = ({
    glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
    glitchSpeed = 50,
    centerVignette = false,
    outerVignette = true,
    smooth = true,
}: {
    glitchColors: string[];
    glitchSpeed: number;
    centerVignette: boolean;
    outerVignette: boolean;
    smooth: boolean;
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const letters = useRef<
        {
            char: string;
            color: string;
            targetColor: string;
            colorProgress: number;
            active: boolean;
            lastGlitchTime: number;
        }[]
    >([]);
    const grid = useRef({ columns: 0, rows: 0 });
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const lastGlitchTime = useRef(Date.now());
    const animationStartTime = useRef(Date.now());
    const isEntranceActive = useRef(true);
    const lastFrameTime = useRef(0);
    const needsRedraw = useRef(false);
    // Frame rate control interval (approx 16.7ms = 60fps)
    const frameInterval = useRef(1000 / 30); // Reduce to 30fps to lower CPU usage
    // entranceDuration
    const entranceDuration = 5000;

    const fontSize = 16;
    const charWidth = 10;
    const charHeight = 20;

    // Cache character array with useMemo
    const lettersAndSymbols = useMemo(() => [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "!", "@", "#", "$", "&", "*", "(", ")", "-", "_", "+", "=", "/",
        "[", "]", "{", "}", ";", ":", "<", ">", ",", "0", "1", "2", "3",
        "4", "5", "6", "7", "8", "9"
    ], []);

    // Pre-calculate random character index
    const getRandomChar = useCallback(() => {
        return lettersAndSymbols[
            Math.floor(Math.random() * lettersAndSymbols.length)
        ];
    }, [lettersAndSymbols]);

    // Pre-calculate random color index
    const getRandomColor = useCallback(() => {
        return glitchColors[Math.floor(Math.random() * glitchColors.length)];
    }, [glitchColors]);

    // Cache color conversion function
    const hexToRgb = useCallback((hex: string) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }, []);

    // Cache color interpolation function
    const interpolateColor = useCallback(
        (
            start: { r: number; g: number; b: number },
            end: { r: number; g: number; b: number },
            factor: number
        ) => {
            const result = {
                r: Math.round(start.r + (end.r - start.r) * factor),
                g: Math.round(start.g + (end.g - start.g) * factor),
                b: Math.round(start.b + (end.b - start.b) * factor),
            };
            return `rgb(${result.r},${result.g},${result.b})`;
        }, []);

    const calculateGrid = useCallback((width: number, height: number) => {
        const columns = Math.ceil(width / charWidth);
        const rows = Math.ceil(height / charHeight);
        return { columns, rows };
    }, []);

    const initializeLetters = useCallback((columns: number, rows: number) => {
        grid.current = { columns, rows };
        const totalLetters = columns * rows;

        // Create a single array instead of recalculating for each element
        letters.current = Array.from({ length: totalLetters }, () => ({
            char: getRandomChar(),
            color: getRandomColor(),
            targetColor: getRandomColor(),
            colorProgress: 1,
            active: false,
            lastGlitchTime: Date.now()
        }));
    }, [getRandomChar, getRandomColor]);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        // Use innerHeight instead of screen.height
        const screenHeight = window.innerHeight;
        // Use innerWidth instead of screen.width
        const screenWidth = window.innerWidth;
        canvas.width = screenWidth * dpr;
        canvas.height = screenHeight * dpr;

        canvas.style.width = `${screenWidth}px`;
        canvas.style.height = `${screenHeight}px`;

        if (context.current) {
            context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const { columns, rows } = calculateGrid(screenWidth, screenHeight);
        initializeLetters(columns, rows);
        needsRedraw.current = true;
    }, [calculateGrid, initializeLetters]);

    const drawLetters = useCallback(() => {
        if (!context.current || letters.current.length === 0) return;
        const ctx = context.current;
        const { width, height } = canvasRef.current!.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
        ctx.font = `${fontSize}px monospace`;
        ctx.textBaseline = "top";

        // Only redraw when truly needed
        if (!needsRedraw.current) return;

        letters.current.forEach((letter, index) => {
            if (!letter.active) return;
            const x = (index % grid.current.columns) * charWidth;
            const y = Math.floor(index / grid.current.columns) * charHeight;
            ctx.fillStyle = letter.color;
            ctx.fillText(letter.char, x, y);
        });

        needsRedraw.current = false;
    }, []);

    const handleEntranceAnimation = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { width, height } = canvas.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        const elapsed = Date.now() - animationStartTime.current;
        const progress = Math.min(elapsed / entranceDuration, 1);

        // Optimization: only update when necessary
        if (progress >= 1 && !isEntranceActive.current) return;

        // Adjust the probability curve to start with a lower probability
        const adjustedProgress = Math.pow(progress, 1);

        let allActive = true;
        let hasChanges = false;

        letters.current.forEach((letter, index) => {
            if (letter.active) return; // skip active letters

            const x = (index % grid.current.columns) * charWidth + charWidth / 2;
            const y = Math.floor(index / grid.current.columns) * charHeight + charHeight / 2;
            const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            const baseProbability = distance / maxRadius;
            // Optimize probability calculation to reduce random calls
            const probability = baseProbability * adjustedProgress / 200

            if (Math.random() < probability) {
                letter.active = true;
                letter.char = getRandomChar();
                letter.targetColor = getRandomColor();
                letter.colorProgress = 0;
                hasChanges = true;
            } else {
                allActive = false;
            }
        });

        if (hasChanges) {
            needsRedraw.current = true;
        }

        if (allActive) {
            isEntranceActive.current = false;
        }
    }, [getRandomChar, getRandomColor]);

    const updateLetters = useCallback(() => {
        if (!letters.current || letters.current.length === 0) return;

        // Avoid filtering active letters every time, only calculate when needed
        const activeLettersCount = letters.current.filter(l => l.active).length;
        if (activeLettersCount === 0) return;

        // Reduce update count to lower CPU load
        const updateCount = Math.max(1, Math.floor(activeLettersCount * 0.02)); // Reduced from 0.05 to 0.02
        let hasChanges = false;

        // Use pre-generated random indices array to avoid multiple Math.random calls
        const randomIndices = Array.from({ length: updateCount },
            () => Math.floor(Math.random() * activeLettersCount));

        const activeLetters = letters.current.filter(l => l.active);
        randomIndices.forEach(randomIndex => {
            if (randomIndex < activeLetters.length) {
                const letter = activeLetters[randomIndex];
                letter.char = getRandomChar();
                letter.targetColor = getRandomColor();

                if (!smooth) {
                    letter.color = letter.targetColor;
                    letter.colorProgress = 1;
                } else {
                    letter.colorProgress = 0;
                }
                hasChanges = true;
            }
        });

        if (hasChanges) {
            needsRedraw.current = true;
        }
    }, [getRandomChar, getRandomColor, smooth]);

    const handleSmoothTransitions = useCallback(() => {
        let hasChanges = false;

        // Batch process color changes
        letters.current.forEach((letter) => {
            if (letter.colorProgress < 1) {
                letter.colorProgress += 0.05;
                letter.colorProgress = Math.min(letter.colorProgress, 0.5);

                const startRgb = hexToRgb(letter.color);
                const endRgb = hexToRgb(letter.targetColor);
                if (startRgb && endRgb) {
                    letter.color = interpolateColor(
                        startRgb,
                        endRgb,
                        letter.colorProgress
                    );
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            needsRedraw.current = true;
        }
    }, [hexToRgb, interpolateColor]);

    const animate = useCallback(() => {
        const now = Date.now();
        const elapsed = now - lastFrameTime.current;

        // Implement frame rate control to reduce unnecessary rendering
        if (elapsed < frameInterval.current) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        lastFrameTime.current = now;

        if (isEntranceActive.current) {
            handleEntranceAnimation();
        }

        const glitchElapsed = now - lastGlitchTime.current;
        if (glitchElapsed >= glitchSpeed) {
            updateLetters();
            lastGlitchTime.current = now;
        }

        if (smooth) {
            handleSmoothTransitions();
        }

        // Only redraw when necessary
        if (needsRedraw.current) {
            drawLetters();
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [drawLetters, handleEntranceAnimation, handleSmoothTransitions, updateLetters, smooth, glitchSpeed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        context.current = canvas.getContext("2d", { alpha: true });
        animationStartTime.current = Date.now();
        lastFrameTime.current = Date.now();
        resizeCanvas();

        // Immediately mark as needing redraw
        needsRedraw.current = true;

        animate();

        // let resizeTimeout;
        // const handleResize = () => {
        //     clearTimeout(resizeTimeout);
        //     resizeTimeout = setTimeout(() => {
        //         cancelAnimationFrame(animationRef.current!);
        //         animationStartTime.current = Date.now();
        //         isEntranceActive.current = true;
        //         resizeCanvas();
        //         animate();
        //     }, 500);
        // };

        // window.addEventListener("resize", handleResize);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // window.removeEventListener("resize", handleResize);
        };
    }, [animate, resizeCanvas]);

    return (
        <div className="relative overflow-hidden h-full w-full">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {outerVignette && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]" />
            )}
            {centerVignette && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-repeating-radial from-gray-50 dark:from-black to-transparent" />
            )}
        </div>
    );
};

export default LetterGlitch;