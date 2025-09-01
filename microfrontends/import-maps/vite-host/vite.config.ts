import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dynamicImport from 'vite-plugin-dynamic-import'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    plugins: [
        react(),
        dynamicImport(),
        viteStaticCopy({
            targets: [
                {
                    src: './node_modules/es-module-shims/dist/es-module-shims.js',
                    dest: 'assets',
                },
            ],
        }),
    ],
    server: {
        host: true,
        port: 3000,
    },
    build: {
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@example/micro',
                '@example/webpack',
            ],
        },
    },
})
