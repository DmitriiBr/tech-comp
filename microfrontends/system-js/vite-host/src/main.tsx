import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ReactModule from 'react'
import ReactDOMMOdule from 'react-dom'

window.React = ReactModule
window.ReactDOM = ReactDOMMOdule

createRoot(document.getElementById('root')!).render(<App />)
