# Large Dataset Persistence Architecture

## Quick Start

1. **Install dependency**
   ```bash
   npm install @tanstack/react-query
   ```

2. **Already done**: `QueryClientProvider` is mounted in `src/index.js`.

3. **Already done**: `PersistentTaskShell` is mounted inside `Layout` in `src/App.js`.

## How It Works

### Route Navigation (`/tasks` → `/projects` → `/tasks`)
- `PersistentTaskShell` stays mounted at Layout level.
- React hides it with `display: none` on non-task routes.
- All tab state, filters, and TanStack Query cache remain in memory.
- Returning to `/tasks` shows data **instantly** with **zero API calls**.

### Browser Refresh (F5)
- TanStack Query memory cache is lost.
- `useTaskDataQuery` checks IndexedDB on mount.
- If IndexedDB has data, it seeds React Query cache instantly.
- UI shows cached data while a background API call refreshes it.

### Hard Reload (Ctrl+Shift+R)
- IndexedDB survives hard reloads.
- Same flow as F5: IndexedDB → React Query → instant UI.
- Only if IndexedDB is cleared does the app fetch from scratch.

### Multiple Browser Tabs
- Zustand + sessionStorage: independent per tab.
- IndexedDB: shared across tabs (safe because keys are deterministic per project/module).

## Files

| File | Purpose |
|------|---------|
| `taskDataCache.js` | IndexedDB wrapper for large datasets |
| `queryClient.js` | TanStack Query config + query key factory |
| `useTaskDataQuery.js` | Hook: React Query + IndexedDB hydration |
| `PersistentTaskShell.jsx` | Layout-level mount for tab shell |
| `VirtualizedTaskTable.jsx` | Optional virtualization for 10k+ rows |

## Cache Invalidation

```js
import { invalidateTaskCache } from "../Utils/QueryClient/queryClient";

// After adding/editing/deleting a task:
invalidateTaskCache(); // Clears all task queries, triggers refetch
```

## Refresh Button

Already wired in `Task.jsx`:
- Triggers existing `submitRefreshKey` (your current mechanism)
- Also calls `refetchTaskData()` (React Query manual refetch)

## Performance Checklist

- [ ] Use `VirtualizedTaskTable` when rendering > 5,000 rows
- [ ] Keep `useMemo` for filtered/sorted data derivations
- [ ] Avoid passing new object references as props on every render
- [ ] Consider Web Workers for heavy client-side processing
