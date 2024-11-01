/**
 * Bootstrap
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

// Load Config
import Config from '@/scripts/config'

// import States from '@/scripts/states'
import Router from '@/scripts/router'

// Load Styles
import '@/styles/global.sass'
import '@/styles/main.sass'

// Set Sentry Endpoint
if ('production' === Config.env) {
    Sentry.configureScope((scope) => {
        scope.setLevel('error')
    })
    Sentry.init({
        dsn: Config.sentryDsn,
        release: Config.buildTime
    })
}

// Mounting
createRoot(document.getElementById('mhc')).render(
    <React.StrictMode>
        <HashRouter>
            <Router />
        </HashRouter>
    </React.StrictMode>
)
