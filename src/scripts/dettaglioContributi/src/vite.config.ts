import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'build/scripts',
    rollupOptions: {
      input: {
        dettaglioContributi: './src/scripts/dettaglioContributi/src/index.tsx',
      },
      output: {
        assetFileNames: "[name].[ext]",
        entryFileNames: "[name].js",
        inlineDynamicImports: true
      }
    },
  },
});
