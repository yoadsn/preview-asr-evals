# Next.js v15 Dynamic APIs: Now Asynchronous

## Key Change Summary

In Next.js 15, several commonly used APIs have been made **asynchronous** that were previously synchronous:

- `params` and `searchParams` props (in pages, layouts, metadata APIs, route handlers)
- `cookies()`, `draftMode()`, and `headers()` from `next/headers`

## What This Means for Your Code

### Before (Next.js 14 and earlier):
```javascript
function Page({ params }) {
  return <p>ID: {params.id}</p>  // Direct access worked
}
```

### After (Next.js 15+):
```javascript
// Server Components - use await
async function Page({ params }) {
  const { id } = await params  // Must await params
  return <p>ID: {id}</p>
}

// Client Components - use React.use()
'use client'
import * as React from 'react'

function Page({ params }) {
  const { id } = React.use(params)  // Must unwrap Promise
  return <p>ID: {id}</p>
}
```

## Migration Path

**Build Enforcement**: Next.js will error in dev/build if you don't address these changes

## Why This Change?

This change supports better **Partial Prerendering** by allowing Next.js to statically render more of your page before needing to access dynamic data.

## Pro Tip

You can delay unwrapping the Promise until you actually need the value - this gives Next.js more opportunities for static optimization.
