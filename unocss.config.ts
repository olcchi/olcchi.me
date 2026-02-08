import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
} from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetIcons(),
    presetUno(),
    presetAttributify(),
    presetWebFonts(
      {
        provider: 'fontshare',
        fonts: {
          sans: 'Satoshi',
          serif: 'Telma',
        },
      },
    ),
    presetTypography(),
  ],
  shortcuts: [
    {
      themeBase: 'bg-white text-black dark:bg-black dark:text-gray-2 ',
      borderBase: 'dark:border-gray-2 border-black ',
      linkBase: 'block decoration-none border-b border-black dark:border-gray-2 hover:opacity-60 transition-opacity',
      linkMd: 'decoration-none border-b border-black dark:border-gray-2 hover:opacity-60 transition-opacity',
    },
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    animation: {
      keyframes: {
        slideUp: '{ from {transform: translateY(10px);opacity:0;} to {transform: translateY(0px);opacity:100;}}',
      },
      durations: {
        slideUp: '0.8s',
      },
      timingFns: {
        slideUp: 'ease',
      },
    },
  },

})
