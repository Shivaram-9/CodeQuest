import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/CodeQuest/',   // repo name EXACT
  plugins: [react()],
})
