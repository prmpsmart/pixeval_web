import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useApp } from './store/useApp'
import './styles/app.css'
import './styles/pages.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only handle for console debugging / smoke tests.
if (import.meta.env.DEV) (window as unknown as { __app: typeof useApp }).__app = useApp
