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
