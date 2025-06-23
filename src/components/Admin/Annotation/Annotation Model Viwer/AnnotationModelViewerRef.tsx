/**
 * @file src\components\Admin\Annotation\Annotation Model Viwer\AnnotationModelViewerRef.tsx
 * 
 * @fileoverview wrapper which allows a ref to be forwarded to a dynamically imported component (botanist model viewer)
 */

'use client'

// Typical import
import { Dispatch, forwardRef, lazy, SetStateAction, Suspense } from "react"

// Lazy import
const BotanistModelViewer = lazy(() => import("./AnnotationModelViewer"))

// Forward ref to botanist model viewer
const BotanistRefWrapper = forwardRef((props: { minHeight?: string, setViewerLoaded: Dispatch<SetStateAction<boolean>> }, ref: any) => <Suspense>
    <BotanistModelViewer {...props} ref={ref} />
</Suspense>)

// Display name, export
BotanistRefWrapper.displayName = 'BotanistRefWrapper'
export default BotanistRefWrapper