const { withNativeFederation, shareAll } = require('@softarc/native-federation/build')

module.exports = withNativeFederation({
    name: 'remote',
    exposes: {
        './remote-app': './src/App.tsx',
    },
    shared: {
        ...shareAll(),
    },
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
