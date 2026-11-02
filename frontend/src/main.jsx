import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <AccessibilityProvider>
          <App />
        </AccessibilityProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
