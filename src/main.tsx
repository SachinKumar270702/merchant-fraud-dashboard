import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AppDebug from './AppDebug.tsx'
import './index.css'

// Use debug version to test basic functionality
const USE_DEBUG = false;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {USE_DEBUG ? <AppDebug /> : <App />}
  </React.StrictMode>,
)