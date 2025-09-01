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
