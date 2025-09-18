













# Microfrontends

| Solution                                | Popularity                                            |
| --------------------------------------- | ----------------------------------------------------- |
| Module Federation (Webpack\Vite\Rspack) | Very popular, industry standard with strong adoption  |
| Native Federation (esbuild)             | Growing, alternative to Module Federation for esbuild |
| Single-SPA (runtime orchestration)      | Popular, widely used alternative to Module Federation |
| Import Maps (native browser)            | Emerging, seen as a web-standard alternative          |
| SystemJS (module loader)                | Less popular than Module Federation but stable        |



























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

1. native-federation
2. single-spa
3. module-federation






















## Native federation (FAIL)

1. Должен работать на ES модулях
2. Оркестрация с помощью конфига при сборке
3. Должен быть framework-agnostic

❌- Собрать приложение
❌- Загрузить Vite
❌- Загрузить Webpack

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

☑️ - Собрать приложение
☑️ - Загрузить Vite
☑️ - Загрузить Webpack

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

### Плюсы

1. Минималистичность
2. Кроссбраузерность
3. Очень гибок в использовании, тк по сути является подгрузчиком модулей

### Минусы

1. Нет инфраструктуры вокруг
2. Мало документации
3. Официальные примеры 6ти летней давности





















## Import Maps

Маппинг адресов на нативные ES импорты.

☑️ - Собрать приложение
☑️ - Загрузить Vite
❌- Загрузить Webpack

### Пример

Родительское приложение:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Import map Host</title>
        <script async src="/assets/es-module-shims.js"></script>
        <script type="importmap">
            {
                "imports": {
                    "@example/micro": "http://localhost:3002/vite-module.es.mjs",
                    "@example/webpack": "http://localhost:3001/webpack-module.js",
                    "react": "https://esm.sh/react",
                    "react-dom": "https://esm.sh/react-dom",
                    "react/jsx-runtime": "https://esm.sh/react/jsx-runtime"
                }
            }
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
    </body>
</html>
```

Родетильское Vite config:

```typescript
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
```

Родительское `root`:

```tsx
import { lazy, Suspense } from 'react'

const Comp = lazy(() => import('@example/micro'))
const Comp2 = lazy(() => import('@example/webpack'))

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

Дочернее на Vite:

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
```

### Плюсы

1. Нативно в браузере, никаких зависимостей

### Минусы

1. Не кроссбраузерно
2. Проблемы с зоопарком технологий становятся еще сложнее
3. Прокидывание пропсов становится более сложным



















## Single SPA

1. Оркестрация
2. Зоопарк технологий
3. Можно использовать в комбинации с import-maps и systemjs

☑️ - Собрать приложение
☑️ - Загрузить Vite
☑️ - Загрузить Webpack

### Пример реализации

Родительское приложение на Vite:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSingleSpa from 'vite-plugin-single-spa'

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            type: 'root',
            imo: '3.1.1',
        }),
    ],
    server: {
        host: true,
        port: 3000,
    },
})
```

Родительское приложение `root`:

```tsx
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
    location.pathname.startsWith('/'),
)

registerApplication(
    'webpack-module',
    loadingFn('http://localhost:3001/webpack-module-spa.js', true),
    location => location.pathname.startsWith('/'),
)

start()

createRoot(document.getElementById('root')!).render(<App />)
```

Родительское приложение (каркас) `App`:

```tsx
function App() {
    return (
        <main>
            Hello world!!
            <div id="single-spa-application:vite-module" />
            <div id="single-spa-application:webpack-module" />
        </main>
    )
}

export default App
```

Дочернее приложение на Vite `vite.config.ts`:

```typescript
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
```

Дочернее приложение на Vite `vite-module`:

```tsx
import React from 'react'
import ReactDOMClient from 'react-dom/client'
import singleSpaReact from 'single-spa-react'
import App from './App'
import { cssLifecycleFactory } from 'vite-plugin-single-spa/ex'

const lc = singleSpaReact({
    React,
    ReactDOMClient,
    rootComponent: App,
    errorBoundary(err: Error) {
        return <div>Error: {err.message}</div>
    },
})

// IMPORTANT:  The argument passed here depends on the file name.
const cssLc = cssLifecycleFactory('spa')

export const bootstrap = [cssLc.bootstrap, lc.bootstrap]
export const mount = [cssLc.mount, lc.mount]
export const unmount = [cssLc.unmount, lc.unmount]
```

Дочернее приложение на Webpack:

```javascript
const singleSpaDefaults = require('webpack-config-single-spa-react')
const path = require('path')
const { merge } = require('webpack-merge')
const printCompilationMessage = require('./compilation.config.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (webpackConfigEnv, argv) => {
    webpackConfigEnv.standalone = true

    const defaultConfig = singleSpaDefaults({
        orgName: 'webpack-module',
        projectName: 'spa',
        outputSystemJS: true,
        webpackConfigEnv,
        argv,
    })

    return merge(defaultConfig, {
        context: __dirname,
        output: {
            publicPath: '/',
        },

        resolve: {
            modules: ['node_modules'],
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        },

        // ...devserver
        // ...module.rules
    })
}
```

Дочернее приложение на Webpack `webpack-module-spa`:

```tsx
import React from 'react'
import ReactDOMClient from 'react-dom/client'
import App from './App'
import singleSpaReact from 'single-spa-react'

const lifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    errorBoundary() {
        return <div>Webpack Module error</div>
    },
    rootComponent: App,
})

export default lifecycles
```

### Плюсы

1. Удобная оркестрация микрофронтов
2. Есть конфиг в экспортируемом модуле и в сборщике, а то, что в коде не важно. Позволяет использовать много технологий
3. Есть очень много документации примеров
4. Хороший вариант, если идёт переход с легаси кода на микрофронты
5. \*Регистрация приложений происходит после компиляции, то при желании ее легче сделать динамической.

### Минусы

1. Несколько точек, за которыми нужно следить
2. Так себе с шарингом зависимостей
3. Могут быть подводные камни в пробрасывании пропсов





















## Module Federation

1. Оркестрация
2. Прост в использовании
3. Является очень популярным решением

☑️ - Собрать приложение
☑️ - Загрузить Vite
☑️ - Загрузить Webpack

### Реализация примера

Родительское приложение на Vite:

```typescript
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
```

Родительское приложение `root`:

```tsx
import { lazy, Suspense } from 'react'

const ViteModule = lazy(() => import('vite_app/ViteModule'))
const WebpackModule = lazy(() => import('webpack_app/WebpackModule'))

function App() {
    return (
        <main>
            <Suspense fallback="Loading vite...">
                <ViteModule />
            </Suspense>
            <Suspense fallback="Loading webpack...">
                <WebpackModule />
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
```

Дочернее приложение на Webpack:

```javascript
const HtmlWebPackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const path = require('path')
const Dotenv = require('dotenv-webpack')
const deps = require('./package.json').dependencies

const printCompilationMessage = require('./compilation.config.js')

module.exports = {
    context: __dirname,
    output: {
        publicPath: 'auto',
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },

    // ...module.rules
    // ...devSever

    plugins: [
        new ModuleFederationPlugin({
            name: 'webpack_app',
            filename: 'remoteEntry.js',
            remotes: {},
            exposes: {
                './WebpackModule': './src/App.tsx',
            },
            shared: {
                ...deps,
                react: {
                    singleton: true,
                },
                'react-dom': {
                    singleton: true,
                },
            },
        }),
        new HtmlWebPackPlugin({
            template: './src/index.html',
        }),
        new Dotenv(),
    ],
}
```

### Плюсы

1. Самый простой вариант из всех. Буквально скопировал и всё работает
2. Популярность и активное комьюнити
3. Очень много примеров
4. Удобная оркестрация микрофронтов
5. Множественный exposes

### Минусы

1. Так себе с шарингом зависимостей
2. Сложно с зоопарком технологий
3. Docs


const PATHS = {
	SERVICE: {
		BY_ID: 'service/entities/:id',
		ENTITIES: {
			FIRST: 'service/entities/:id/first',
			SECOND: 'service/entities/:id/second',
		}
	}
}
