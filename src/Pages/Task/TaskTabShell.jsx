import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useTabStore } from "../../Store/useTabStore";
import { useLocation, useNavigate, UNSAFE_LocationContext as LocationContext } from "react-router-dom";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";
import {
  generateCacheKey,
  setTabDataCache,
} from "../../Utils/IndexedDB/taskDataCache";
import {
  taskQueryKeys,
  setTaskQueryData,
} from "../../Utils/QueryClient/queryClient";
import Task from "./Task";

const TaskTabShell = React.memo(() => {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // track which tabs have been mounted at least once (lazy mount)
  const [mountedOnce, setMountedOnce] = useState(new Set());

  useEffect(() => {
    if (activeTabId && !mountedOnce.has(activeTabId)) {
      setMountedOnce((prev) => new Set(prev).add(activeTabId));
    }
  }, [activeTabId]);

  // Detect URL parameter 'data' on navigation and open/activate corresponding tab
  // ONLY run when already on /tasks routes — skip for /projects/dashboard and others
  useEffect(() => {
    if (!location.pathname.startsWith('/tasks')) return;

    const searchParams = new URLSearchParams(location.search);
    const encodedData = searchParams.get("data");
    if (!encodedData) return;

    try {
      const decoded = decodeURIComponent(encodedData);
      const parsedData = JSON.parse(atob(decoded));
      if (parsedData) {
        const store = useTabStore.getState();
        const tabId = store.openTaskTab({
          title: parsedData.module || parsedData.project || "Tasks",
          route: "/tasks",
          queryData: parsedData,
        });

        if (tabId) {
          // Prefetch module/task data so the tab loads instantly
          // Use taskmodulelist when no specific taskid; treelist only when taskid is present
          (async () => {
            try {
              const taskid = parsedData?.taskid;
              const hasTaskId = taskid !== undefined && taskid !== '' && taskid !== '0' && taskid !== 0;
              let rawData;
              if (!hasTaskId) {
                rawData = await fetchModuleDataApi({ taskid: 0, moduleid: 0 });
              } else {
                rawData = await fetchTaskDataFullApi({
                  ...parsedData,
                  isarchive: 0,
                  iscompleted: 0,
                });
              }
              if (rawData?.rd?.[0]?.stat != 0) {
                const cacheKey = generateCacheKey(parsedData, false, false);
                await setTabDataCache(tabId, cacheKey, {
                  rawData,
                  fetchedAt: Date.now(),
                });
                setTaskQueryData(parsedData, false, false, rawData);
              }
            } catch (error) {
              console.error("Prefetch from URL param failed:", error);
            }
          })();

          navigate("/tasks", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error parsing URL data in TaskTabShell:", error);
    }
  }, [location.search, navigate]);

  // default open one empty tab if none exist
  useEffect(() => {
    const store = useTabStore.getState();
    if (store.tabs.length === 0) {
      store.openTaskTab({ title: "Tasks", route: "/tasks", queryData: null });
    }
  }, [tabs.length]);

  // restore scroll when switching back to a tab
  useEffect(() => {
    if (!activeTabId || !containerRef.current) return;
    const state = useTabStore.getState().tabState[activeTabId];
    if (state?.scrollTop != null) {
      const scroller = containerRef.current.querySelector(
        `.tab-pane[data-tabid="${activeTabId}"]`
      );
      if (scroller) {
        scroller.scrollTop = state.scrollTop;
      }
    }
  }, [activeTabId]);

  const handleScroll = (e, tabId) => {
    useTabStore.getState().setTabScroll(tabId, e.currentTarget.scrollTop);
  };

  // Stable location for tab-mode Task components.
  // By providing this via LocationContext, useLocation() inside Task
  // returns a stable value and does NOT cause re-renders when the
  // user navigates to other routes (e.g. /projects).
  const stableLocation = React.useMemo(
    () => ({
      pathname: "/tasks",
      search: "",
      hash: "",
      state: null,
      key: "tab-stable",
    }),
    []
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const shouldRender = isActive || mountedOnce.has(tab.id);
          if (!shouldRender) return null;
          return (
            <Box
              key={tab.id}
              data-tabid={tab.id}
              className={`tab-pane ${isActive ? "active" : ""}`}
              sx={{
                position: "absolute",
                inset: 0,
                overflow: "auto",
                display: isActive ? "block" : "none",
                height: "100%",
                // Skip rendering/layout for hidden tabs (major perf win)
                contentVisibility: isActive ? "auto" : "hidden",
                contain: isActive ? "none" : "strict",
              }}
              onScroll={isActive ? (e) => handleScroll(e, tab.id) : undefined}
            >
              <LocationContext.Provider value={{ location: stableLocation }}>
                <Task
                  tabId={tab.id}
                  queryDataOverride={tab.queryData}
                  isActive={isActive}
                />
              </LocationContext.Provider>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

export default TaskTabShell;
