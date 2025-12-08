import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { populateServerWithMockData } from './data/mock.ts';
populateServerWithMockData()
    .then(mapping => console.log('Server populated with IDs:', mapping))
    .catch(error => console.error('Failed to populate server:', error));


createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>,)
