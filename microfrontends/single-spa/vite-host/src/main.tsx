import 'systemjs'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerApplication, start } from 'single-spa'

const loadingFn = (path: string, isWebpack?: boolean) => async () => {
    const module = await System.import(path)

    return isWebpack ? module.default : module
}

registerApplication('vite-module', loadingFn('http://localhost:3002/vite-module.js'), location =>
    location.pathname.startsWith('/')
)

registerApplication(
    'webpack-module',
    loadingFn('http://localhost:3001/webpack-module-spa.js', true),
    location => location.pathname.startsWith('/')
)

start()

createRoot(document.getElementById('root')!).render(<App />)
