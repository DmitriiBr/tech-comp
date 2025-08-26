import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

const mfConfig = {
    name: 'vite_app',
    filename: 'remoteEntry.js',
    exposes: {
        './ViteModule': './src/App.tsx',
    },
    shared: ['react', 'react-dom'],
}

export default defineConfig({
    plugins: [react(), federation(mfConfig)],
    server: {
        port: 3002,
    },
})
