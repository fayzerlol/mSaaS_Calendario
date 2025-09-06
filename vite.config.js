import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // tratar arquivos .js que contenham JSX sem renomear para .jsx
  esbuild: {
    // define um loader padrão para permitir sintaxe JSX em .js
    loader: 'jsx'
  },
  optimizeDeps: {
    esbuildOptions: {
      // também aplicar o loader durante a pre-bundling
      loader: {
        '.js': 'jsx'
      }
    }
  },
})
