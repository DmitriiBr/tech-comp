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
