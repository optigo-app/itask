import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { useTabStore } from "../../Store/useTabStore";

const TabLimitDialog = () => {
  const open = useTabStore((s) => s.tabLimitDialogOpen);
  const tabs = useTabStore((s) => s.tabs);
  const pendingPayload = useTabStore((s) => s.pendingTabPayload);
  const confirmReplaceTab = useTabStore((s) => s.confirmReplaceTab);
  const cancelReplaceTab = useTabStore((s) => s.cancelReplaceTab);
  const maxTabs = useTabStore((s) => s.maxTabs);
  const [selectedTabIds, setSelectedTabIds] = useState([]);

  // Auto-open pending tab if user closes tabs while dialog is open
  useEffect(() => {
    if (open && pendingPayload && tabs.length < maxTabs) {
      // Find first non-active tab to replace, or just the first tab
      const tabToClose = tabs.find((t) => t.id !== useTabStore.getState().activeTabId) || tabs[0];
      if (tabToClose) {
        confirmReplaceTab(tabToClose.id);
      }
      setSelectedTabIds([]);
    }
  }, [open, tabs.length, maxTabs, pendingPayload, confirmReplaceTab]);

  const handleClose = () => {
    setSelectedTabIds([]);
    cancelReplaceTab();
  };

  const toggleTabSelection = (tabId) => {
    setSelectedTabIds((prev) =>
      prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId]
    );
  };

  const handleConfirm = () => {
    if (selectedTabIds.length > 0) {
      confirmReplaceTab(selectedTabIds);
      setSelectedTabIds([]);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <AlertTriangle size={22} color="#ff9800" />
        <Typography variant="subtitle1" fontWeight={600}>
          Tab Limit Reached
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: 'rgba(115, 103, 240, 0.06)',
            borderRadius: 2,
            border: '1px solid rgba(115, 103, 240, 0.15)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            You currently have <strong>{tabs.length}</strong> of <strong>{maxTabs}</strong> tabs open.
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
            To open <strong>"{pendingPayload?.title || "New Tab"}"</strong>, please select{' '}
            <strong>{Math.max(1, tabs.length - maxTabs + 1)}</strong> tab(s) to close:
          </Typography>
        </Box>
        <FormControl component="fieldset" fullWidth>
          <FormGroup>
            {tabs.map((tab) => (
              <FormControlLabel
                key={tab.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedTabIds.includes(tab.id)}
                    onChange={() => toggleTabSelection(tab.id)}
                  />
                }
                label={
                  <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>
                    {tab.title || "Tasks"}
                  </Typography>
                }
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              />
            ))}
          </FormGroup>
        </FormControl>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} size="small" className="secondaryBtnClassname">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedTabIds.length === 0}
          size="small"
          className="buttonClassname"
        >
          Close & Open
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TabLimitDialog;
