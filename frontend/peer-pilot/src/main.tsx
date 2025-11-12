import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './auth/LoginPage.tsx'
import Dashboard from './instructor/grading/Dashboard.tsx'
import AllReviews from './instructor/reviews/AllReviews.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AllReviews/>
  </StrictMode>,
)
