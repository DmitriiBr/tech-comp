import { federation } from '@gioboa/vite-module-federation'
import { createEsBuildAdapter } from '@softarc/native-federation-esbuild'
import { defineConfig } from 'vite'
import { reactReplacements } from '@softarc/native-federation-esbuild/src/lib/react-replacements'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command }) => ({
    plugins: [
        await federation({
            options: {
                workspaceRoot: __dirname,
                outputPath: 'dist',
                tsConfig: 'tsconfig.json',
                federationConfig: 'module-federation/federation.config.cjs',
                verbose: true,
                dev: command === 'serve',
            },
            adapter: createEsBuildAdapter({
                plugins: [],
                // fileReplacements: reactReplacements.dev,
            }),
        }),
        react(),
    ],
    server: {
        host: true,
        port: 3000,
    },
}))
