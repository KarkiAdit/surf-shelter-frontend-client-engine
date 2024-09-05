import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: './index.html',
        background: './src/background/background.ts',
        contentScript: './src/contentScript/contentScript.ts'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]', 
        dir: 'dist',
      }
    }
  },
});

