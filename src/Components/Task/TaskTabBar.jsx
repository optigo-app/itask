import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FileCheck } from "lucide-react";
import { useTabStore } from "../../Store/useTabStore";
import { useLocation } from "react-router-dom";

const MAX_VISIBLE = 8;

const TaskTabBar = () => {
  const location = useLocation();
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredTab, setHoveredTab] = useState(null);
  const maxVisible = location.pathname.includes("/tasks/") ? 5 : MAX_VISIBLE;

  useEffect(() => {
    if (!activeTabId || tabs.length <= maxVisible) {
      setStartIndex(0);
      return;
    }
    const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
    if (activeIndex === -1) return;

    if (activeIndex < startIndex) {
      setStartIndex(activeIndex);
    } else if (activeIndex >= startIndex + maxVisible) {
      setStartIndex(activeIndex - maxVisible + 1);
    }
  }, [activeTabId, tabs.length, maxVisible]);

  if (tabs.length === 0) return null;

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + maxVisible < tabs.length;
  const visibleTabs = tabs.slice(startIndex, startIndex + maxVisible);

  const handlePrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setStartIndex((i) => Math.min(tabs.length - maxVisible, i + 1));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.3,
        flex: 1,
        overflow: "hidden",
        minWidth: 0,
        px: 0.5,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        pb: 0,
      }}
    >
      {/* Prev */}
      {tabs.length > maxVisible && (
        <Tooltip title="Previous tabs" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handlePrev}
              disabled={!canGoPrev}
              sx={{
                p: 0.4,
                width: 24,
                height: 24,
                mb: 0.3,
                color: canGoPrev ? "#fff" : "#ccc",
                bgcolor: canGoPrev ? "#7367f0" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#7367f0" },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Visible tabs */}
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isHovered = hoveredTab === tab.id;
        return (
          <Tooltip
            key={tab.id}
            title={tab.title || "Tasks"}
            arrow
            placement="top"
          >
            <Box
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                px: isActive ? 1.4 : 1.2,
                py: 0.5,
                borderRadius: "6px 6px 0 0",
                cursor: "pointer",
                height: 32,
                minWidth: 90,
                maxWidth: 150,
                flexShrink: 0,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                bgcolor: isActive
                  ? "#7367f0"
                  : isHovered
                    ? "rgba(115,103,240,0.04)"
                    : "transparent",
                color: isActive ? "#fff" : "#5c5b66",
                border: isActive
                  ? "1px solid #7367f0"
                  : "1px solid rgba(0,0,0,0.08)",
                borderBottom: isActive
                  ? "1px solid #7367f0"
                  : "1px solid rgba(0,0,0,0.08)",
                borderTop: isActive
                  ? "2px solid #7367f0"
                  : "1px solid rgba(0,0,0,0.08)",
                boxShadow: isActive
                  ? "0 2px 8px rgba(115,103,240,0.35), 0 1px 3px rgba(115,103,240,0.2)"
                  : "none",
                position: "relative",
                bottom: "-1px",
                zIndex: isActive ? 1 : 0,
                "&:hover": {
                  bgcolor: isActive ? "rgba(115,103,240,0.92)" : "rgba(115,103,240,0.06)",
                  color: isActive ? "#fff" : "#444",
                },
              }}
            >
              <FileCheck
                size={13}
                color={isActive ? "#fff" : isHovered ? "#7367f0" : "#8a8a96"}
                style={{ flexShrink: 0, transition: "color 0.2s" }}
              />
              <Box
                component="span"
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.01em",
                  userSelect: "none",
                }}
              >
                {tab.title || "Tasks"}
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                sx={{
                  p: 0.15,
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  opacity: isActive ? 1 : isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease, background-color 0.15s",
                  color: isActive ? "rgba(255,255,255,0.85)" : "#8a8a96",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.08)",
                    color: isActive ? "#fff" : "#444",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          </Tooltip>
        );
      })}

      {/* Next */}
      {tabs.length > maxVisible && (
        <Tooltip title="Next tabs" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={!canGoNext}
              sx={{
                p: 0.4,
                width: 24,
                height: 24,
                mb: 0.3,
                color: canGoNext ? "#fff" : "#ccc",
                bgcolor: canGoNext ? "#7367f0" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#7367f0" },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default TaskTabBar;
