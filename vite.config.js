import { defineConfig } from 'vite'

export default defineConfig({
  root: 'photo/public',
  server: {
    port: 5173, // お好みで
  },
  build: {
    outDir: '../../../dist', // ビルド出力先（必要なら調整）
    emptyOutDir: true,
  },
})