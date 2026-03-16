import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import axios from 'axios';

import ErrorBoundary from './components/ErrorBoundary';

// Set global axios defaults for deployment
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Toaster position="top-right" />
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
