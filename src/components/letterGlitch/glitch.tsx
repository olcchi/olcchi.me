import CodeGlitch from './letterGlitch'

export default function LetterGlitchBg() {
    return (
        <div className="h-full">
            <div className="w-screen h-screen fixed dark:bg-dark/10 backdrop-blur-5 z-10">
            </div>
            <CodeGlitch
                glitchColors={["gray", "white", "black"]}
                glitchSpeed={200}
                centerVignette={true}
                outerVignette={false}
                smooth={false}
            />
        </div>
    )

}