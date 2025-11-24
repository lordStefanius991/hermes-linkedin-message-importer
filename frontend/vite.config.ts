import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',              // 👈 fondamentale per Electron
  plugins: [react()],
  build: {
    outDir: 'dist',        // (di default è già così, ma lo forziamo)
  }
});
