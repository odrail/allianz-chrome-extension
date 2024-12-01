import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '..',
        },
        {
          src: 'src/popup/hello_extensions.png',
          dest: './assets/popup'
        }
      ],
    }),
  ],
  build: {
    outDir: 'build/general',
    rollupOptions: {
      input: {
        popup: './index.html',
      },
      output: {
        assetFileNames: "assets/[name].[ext]",
        entryFileNames: "assets/[name].js"
      }
    },
  },
});