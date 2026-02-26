import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from "@vercel/analytics/react"
import { registerSW } from 'virtual:pwa-register'

// Auto-update the app when a new version is deployed
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
     <Analytics />
  </StrictMode>,
)
