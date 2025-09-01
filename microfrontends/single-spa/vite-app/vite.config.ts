import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSingleSpa from 'vite-plugin-single-spa'

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            serverPort: 3002,
            spaEntryPoints: 'src/vite-module.tsx',
            type: 'mife',
        }),
    ],
    server: {
        port: 3002,
    },
    build: {
        rollupOptions: {
            output: {
                format: 'system',
            },
        },
    },
})
