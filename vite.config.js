import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/CodeQuest/',   // 🔴 MUST MATCH REPO NAME
  plugins: [react()],
})
