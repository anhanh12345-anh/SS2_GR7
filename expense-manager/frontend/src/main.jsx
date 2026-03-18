import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e1e2a',
          color: '#f0f0fa',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'DM Sans, sans-serif',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#00d48a', secondary: '#1e1e2a' } },
        error: { iconTheme: { primary: '#ff5b7d', secondary: '#1e1e2a' } },
      }}
    />
  </React.StrictMode>,
)
