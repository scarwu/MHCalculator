import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Load Pages
import App          from '@/scripts/app'
import MainPage     from '@/scripts/pages/main'
import NotFoundPage from '@/scripts/pages/notFound'

export default function Router () {
    return (
        <Suspense fallback={<div></div>}>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<MainPage />} />
                    <Route path=":lang/:series" element={<MainPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    )
}
