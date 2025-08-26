import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'
import type { ModuleFederationOptions } from '@module-federation/vite/lib/utils/normalizeModuleFederationOptions'

const mfConfig = {
    name: 'host',
    remotes: {
        webpack_app: {
            entry: 'http://localhost:3001/remoteEntry.js',
            type: 'var',
        },
        vite_app: {
            entry: 'http://localhost:3002/remoteEntry.js',
            type: 'module',
        },
    },
    shared: ['react', 'react-dom'],
} as unknown as ModuleFederationOptions

export default defineConfig({
    plugins: [react(), federation({ ...mfConfig })],
    server: {
        host: true,
        port: 3000,
    },
})
