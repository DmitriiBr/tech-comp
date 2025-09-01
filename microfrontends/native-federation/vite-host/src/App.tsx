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
