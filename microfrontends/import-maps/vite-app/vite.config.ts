import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
    },
    define: {
        'process.env': process.env,
        React: {},
        ReactDOM: {},
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/App.tsx'),
            name: 'ViteModule',
            fileName: format => `vite-module.${format}.mjs`,
            formats: ['es'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                format: 'esm',
            },
        },
    },
})
