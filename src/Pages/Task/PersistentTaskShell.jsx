/**
 * PersistentTaskShell
 *
 * Mounts at the application Layout level so it NEVER unmounts
 * when navigating between routes (e.g., /tasks -> /projects -> /tasks).
 *
 * This is the ultimate solution for preventing data loss:
 * - Tab components stay mounted in the React tree (hidden via CSS)
 * - TanStack Query cache stays warm in memory
 * - IndexedDB provides backup persistence across browser refreshes
 *
 * The shell is visible only when the current route starts with /tasks.
 * All other routes render normally on top while the shell stays hidden.
 */

import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import TaskTabShell from "./TaskTabShell";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";

const HIDDEN_TASK_ROUTES = ['/tasks/unassigned'];

const PersistentTaskShell = () => {
  const location = useLocation();

  // Show on /tasks and /tasks/* but NOT on /tasks/unassigned or other excluded sub-routes
  const isTaskRoute =
    location.pathname === '/tasks' ||
    (location.pathname.startsWith('/tasks/') &&
      !HIDDEN_TASK_ROUTES.some((route) => location.pathname.startsWith(route)));

  return (
    <Box
      sx={{
        // When not on /tasks, hide the shell with CSS but keep it mounted in React tree
        // This preserves all component state, TanStack Query cache, and Zustand sync
        display: isTaskRoute ? 'flex' : 'none',
        ...(isTaskRoute && {
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }),
      }}
    >
      <Suspense fallback={<LoadingBackdrop />}>
        <TaskTabShell />
      </Suspense>
    </Box>
  );
};

export default React.memo(PersistentTaskShell);
