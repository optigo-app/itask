import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  FileCheck,
  X as CloseAllIcon,
  ArrowLeftToLine,
  ArrowRightToLine,
  CopyX,
  RefreshCw,
} from "lucide-react";
import { useTabStore } from "../../Store/useTabStore";
import { useLocation } from "react-router-dom";
import { contextMenuProps } from "../../Utils/globalfun";

const MAX_VISIBLE = 8;

const TaskTabBar = () => {
  const location = useLocation();
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const closeTabsToLeft = useTabStore((s) => s.closeTabsToLeft);
  const closeTabsToRight = useTabStore((s) => s.closeTabsToRight);
  const closeOtherTabs = useTabStore((s) => s.closeOtherTabs);
  const closeAllTabs = useTabStore((s) => s.closeAllTabs);
  const triggerTabRefresh = useTabStore((s) => s.triggerTabRefresh);
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
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

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      tabId: tab.id,
      tabIndex: tabs.findIndex((t) => t.id === tab.id),
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleContextAction = (action) => {
    const tabId = contextMenu?.tabId;
    if (!tabId && action !== 'refresh') return;
    switch (action) {
      case 'refresh':
        triggerTabRefresh();
        break;
      case 'close':
        closeTab(tabId);
        break;
      case 'closeLeft':
        closeTabsToLeft(tabId);
        break;
      case 'closeRight':
        closeTabsToRight(tabId);
        break;
      case 'closeOthers':
        closeOtherTabs(tabId);
        break;
      case 'closeAll':
        closeAllTabs();
        break;
      default:
        break;
    }
    handleCloseContextMenu();
  };

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
                transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  bgcolor: "#7367f0",
                  transform: canGoPrev ? "scale(1.15) translateX(-2px)" : "none",
                },
                "&:active": {
                  transform: canGoPrev ? "scale(1.05) translateX(-1px)" : "none",
                  transition: "transform 0.08s ease",
                },
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
              onClick={() => {
                setActiveTab(tab.id);
                handleCloseContextMenu();
              }}
              onContextMenu={(e) => handleContextMenu(e, tab)}
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
                style={{
                  flexShrink: 0,
                  transition: "color 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isHovered && !isActive ? "scale(1.2)" : "scale(1)",
                }}
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
                  transition: "opacity 0.2s ease, background-color 0.15s, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  color: isActive ? "rgba(255,255,255,0.85)" : "#8a8a96",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.08)",
                    color: isActive ? "#fff" : "#444",
                    transform: "scale(1.2) rotate(90deg)",
                  },
                  "&:active": {
                    transform: "scale(1.1) rotate(90deg)",
                    transition: "transform 0.08s ease",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 12, transition: "transform 0.2s ease" }} />
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
                transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  bgcolor: "#7367f0",
                  transform: canGoNext ? "scale(1.15) translateX(2px)" : "none",
                },
                "&:active": {
                  transform: canGoNext ? "scale(1.05) translateX(1px)" : "none",
                  transition: "transform 0.08s ease",
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Tab context menu */}
      <Menu
        open={!!contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY + 6, left: contextMenu.mouseX }
            : undefined
        }
        {...contextMenuProps}
      >
        <MenuItem onClick={() => handleContextAction('refresh')}>
          <ListItemIcon>
            <RefreshCw size={18} />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleContextAction('close')}>
          <ListItemIcon sx={{ color: '#d32f2f' }}>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close</ListItemText>
        </MenuItem>
        {contextMenu?.tabIndex > 0 && (
          <MenuItem onClick={() => handleContextAction('closeLeft')}>
            <ListItemIcon>
              <ArrowLeftToLine size={18} />
            </ListItemIcon>
            <ListItemText>Close tabs to left</ListItemText>
          </MenuItem>
        )}
        {contextMenu?.tabIndex < tabs.length - 1 && (
          <MenuItem onClick={() => handleContextAction('closeRight')}>
            <ListItemIcon>
              <ArrowRightToLine size={18} />
            </ListItemIcon>
            <ListItemText>Close tabs to right</ListItemText>
          </MenuItem>
        )}
        {tabs.length > 1 && (
          <MenuItem onClick={() => handleContextAction('closeOthers')}>
            <ListItemIcon>
              <CopyX size={18} />
            </ListItemIcon>
            <ListItemText>Close other tabs</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => handleContextAction('closeAll')}
          sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#d32f2f', color: '#fff' } }}
        >
          <ListItemIcon sx={{ color: '#d32f2f' }}>
            <CloseAllIcon size={18} />
          </ListItemIcon>
          <ListItemText>Close all tabs</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskTabBar;
