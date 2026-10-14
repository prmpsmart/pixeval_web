import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { savedLanguage, setLanguage } from './i18n/runtime'
import { useApp } from './store/useApp'
import './styles/app.css'
import './styles/pages.css'

// Load the saved interface language before the first render, so the UI never flashes in English.
setLanguage(savedLanguage()).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

// Dev-only handle for console debugging / smoke tests.
if (import.meta.env.DEV) (window as unknown as { __app: typeof useApp }).__app = useApp
