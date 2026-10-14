import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset URLs relative, so the build works on any GitHub Pages path.
export default defineConfig({ base: './', plugins: [react()], server: { port: 5173 } })
