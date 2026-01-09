import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import { remarkReadingTime } from './src/scripts/remark-reading-time.mjs'

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://olcchi.me',
  // HTML压缩优化（默认启用，明确设置以确保优化）
  compressHTML: true,
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: false,
    },
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [
    unocss({ injectReset: true },),
    react({
      experimentalReactChildren: true,
    })
  ],
  // Vite构建优化配置
  vite: {
    build: {
      // 启用代码压缩
      minify: 'esbuild', // 使用 esbuild 进行快速压缩
      // CSS压缩
      cssMinify: true,
      // 资源内联限制（小于4KB的资源内联到HTML中，减少HTTP请求）
      assetsInlineLimit: 4096,
      // 代码分割和输出优化
      rollupOptions: {
        output: {
          // 手动代码分割配置，优化chunk大小
          manualChunks: (id) => {
            // 将node_modules中的大型库单独打包
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              return 'vendor';
            }
          },
          // 优化chunk文件名，包含hash用于缓存
          chunkFileNames: 'chunks/[name]-[hash].js',
          // 优化资源文件名
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      // 启用源码映射（生产环境可关闭以减小体积）
      sourcemap: false,
      // 压缩输出报告
      reportCompressedSize: false, // 禁用压缩大小报告以加快构建速度
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  server: {
    port: 8000,
    host: true,
  },
})