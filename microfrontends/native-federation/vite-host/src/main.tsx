import './index.css'

import { initFederation } from '@softarc/native-federation'
;(async () => {
    await initFederation({
        remote: 'http://localhost:3002/remoteEntry.json',
    })

    await import('./bootstrap')
})()
