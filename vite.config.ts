import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoI18n from './tools/i18n/plugin.mjs'

// base './' keeps asset URLs relative, so the build works on any GitHub Pages path.
// autoI18n translates the interface text at build time (see tools/i18n).
export default defineConfig({ base: './', plugins: [autoI18n(), react()], server: { port: 5173 } })
