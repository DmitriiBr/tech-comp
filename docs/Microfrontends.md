# Microfrontends

Here's a table comparing Module Federation and its alternatives for microfrontend solutions based on popularity, framework agnosticness, downloads, and easiness of use:

| Solution                                | Popularity                                            | Framework Agnosticness                                                             | Downloads (NPM Weekly)                   | Easiness of Use                                                                                          |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Module Federation (Webpack\Vite\Rspack) | Very popular, industry standard with strong adoption  | Mostly tied to Webpack but evolving to support other bundlers like Rspack and Vite | Very high, millions of downloads overall | Powerful but can be complex to configure; requires understanding of Webpack and runtime sharing concepts |
| Native Federation (esbuild)             | Growing, alternative to Module Federation for esbuild | Framework agnostic, uses native ES modules and import maps                         | Moderate                                 | Easier setup than Webpack Module Federation, keeps modularity without webpack dependency                 |
| Single-SPA (runtime orchestration)      | Popular, widely used alternative to Module Federation | Framework agnostic, supports multiple frameworks                                   | Moderate                                 | Easier to set up and use, good documentation, but less dynamic code sharing than Module Federation       |
| Import Maps (native browser)            | Emerging, seen as a web-standard alternative          | True framework agnostic, browser native                                            | Low                                      | Very easy to use, but limited compared to full runtime code sharing and dependency resolution            |
| SystemJS (module loader)                | Less popular than Module Federation but stable        | Framework agnostic, works with any JS                                              | Low to moderate                          | Flexible but more manual config and runtime complexity                                                   |

## Технологии

1. SystemJS
2. importmaps
3. native-federation
4. single-spa
5. module-federation

## Разделение

### Подгрузка модулей

Возможно подгружать любой js код в свое приложение.

1. SystemJS
2. importmaps

### Оркестрация микрофронтов на уровне сборщика

Возможно подгружать любой js код в свое приложение.
Поверх подгрузки есть возможно оркестрировать (регистрировать) приложения.

3. native-federation
4. single-spa
5. module-federation

## Кейс, выбранный для примера

1. Хост - Vite
2. Дочерние приложения на Vite и Webpack
3. У webpack отличается версия React + ReactDOM

Vite application:

```tsx
const App = () => {
    return <h1>Module from Vite</h1>
}

export default App
```

Webpack application:

```tsx
import { useEffect } from 'react'

const App = () => {
    useEffect(() => {
        console.log('Message from webpack!')
    }, [])

    return <h1>Module from Webpack</h1>
}

export default App
```

## Native federation (FAIL)

1. Должен работать на ES модулях
2. Оркестрация с помощью конфига при сборке
3. Должен быть framework-agnostic

### Попытка примера

Родительское приложение:

```typescript
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

// module-federation-config.js
const { withNativeFederation, shareAll } = require('@softarc/native-federation/build')

module.exports = withNativeFederation({
    name: 'host',
    shared: shareAll(),
    skip: [
        'react-dom/server',
        'react-dom/react-dom.react-server',
        'react-dom/profiling.react-server',
        'react-dom/server.browser',
        'react-dom/server.bun',
        'react-dom/server.edge',
        'react-dom/server.node',
        'react-dom/react-server',
        'react-dom/server.bun',
        'react-dom/server.node',
        'react-dom/server.react-server',
        'react-dom/static.node',
        'react-dom/static',
        'react-dom/static.react-server',
    ],
})
```

Точно такое же и для дочернего фронта:

```typescript
import { federation } from '@gioboa/vite-module-federation'
import { createEsBuildAdapter } from '@softarc/native-federation-esbuild'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
            }),
        }),
        react(),
    ],
}))
```

В финале должно было получиться что-то вроде...

```tsx
import { loadRemoteModule } from '@softarc/native-federation-runtime'
import { lazy, Suspense } from 'react'

const Comp = lazy(() => loadRemoteModule('remote', './remote-app'))

function App() {
    return (
        <main>
            Hello world!!
            <Suspense>
                <Comp />
            </Suspense>
        </main>
    )
}

export default App
```

### Минусы

1. Очень много конфигов
2. Очень старые примеры
3. Актуальная либа развиваетсят в основном по экосистему Angular
4. Документации практически нет

## SysstemJS

1. Подгрузка кода
2. Полифил для `importmaps`
3. Полифил для `import('...')`

### Пример реализации

Родительское приложение:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 3000,
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                format: 'esm',
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
```

Родительское приложение `root`:

```tsx
import 'systemjs'
import { lazy, Suspense } from 'react'

const Comp = lazy(() => System.import('http://localhost:3002/vite-module.iife.mjs'))
const Comp2 = lazy(async () => {
    const res = await System.import('http://localhost:3001/webpack-module.js')

    return res.default
})

function App() {
    return (
        <main>
            Hello world!!
            <Suspense>
                <Comp />
            </Suspense>
            <Suspense>
                <Comp2 />
            </Suspense>
        </main>
    )
}

export default App
```

Дочернее приложение на Vite:

```typescript
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
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/App.tsx'),
            name: 'ViteModule',
            fileName: format => `vite-module.${format}.mjs`,
            formats: ['es', 'system', 'iife'],
        },
        target: 'esnext',
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                format: 'esm',
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
```

Дочернее приложение на Webpack:

```typescript
const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')
const Dotenv = require('dotenv-webpack')

const printCompilationMessage = require('./compilation.config.js')

module.exports = {
    entry: path.resolve(__dirname, 'src/App.tsx'),
    output: {
        filename: 'webpack-module.js',
        library: 'WebpackModule',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        publicPath: 'auto',
    },

    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },

    // ...devServer
    // ...module.rules
    // ...plugins
}
```

## Import Maps

## Single SPA

## Module Federation
