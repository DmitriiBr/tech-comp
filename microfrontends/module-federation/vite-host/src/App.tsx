import { lazy, Suspense } from 'react'

const ViteModule = lazy(
    () =>
        // @ts-expect-error maybe not found
        import('vite_app/ViteModule')
)
const WebpackModule = lazy(
    () =>
        // @ts-expect-error maybe not found
        import('webpack_app/WebpackModule')
)

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
