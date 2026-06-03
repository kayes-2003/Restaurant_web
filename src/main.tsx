import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1209',
          color: '#fde68a',
          border: '1px solid #3d2810',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
        },
        success: { iconTheme: { primary: '#d4841a', secondary: '#0f0b06' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#0f0b06' } },
      }}
    />
  </React.StrictMode>,
)
