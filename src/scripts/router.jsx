import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Load Pages
import App              from '@/scripts/app'
import NotFoundPage     from '@/scripts/pages/notFound'

const WildsPage         = React.lazy(() => import(/* webpackChunkName: "chunk-page-wilds" */ '@/scripts/pages/wilds'))
const RisePage          = React.lazy(() => import(/* webpackChunkName: "chunk-page-rise" */ '@/scripts/pages/rise'))
const WorldPage         = React.lazy(() => import(/* webpackChunkName: "chunk-page-world" */ '@/scripts/pages/world'))

export default function Router () {
    return (
        <Suspense fallback={<div></div>}>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<RisePage />} />

                    <Route path="wilds" element={<WildsPage />} />
                    <Route path="rise" element={<RisePage />} />
                    <Route path="world" element={<WorldPage />} />

                    <Route path="404" element={<NotFoundPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    )
}
