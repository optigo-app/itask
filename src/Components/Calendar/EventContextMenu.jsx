import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Pencil, Trash, Trash2, CalendarClock, RefreshCw } from 'lucide-react';

const EventContextMenu = ({
  contextMenu,
  onClose,
  onEdit,
  onDelete,
  onPermanentDelete,
  onMoveToDate,
  onRepeat,
  showMove,
  showPermanentDelete,
}) => {
  const event = contextMenu?.event;

  return (
    <Menu
      open={contextMenu.mouseY !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu.mouseY !== null && contextMenu.mouseX !== null
          ? { top: contextMenu.mouseY + 4, left: contextMenu.mouseX }
          : undefined
      }
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          minWidth: 240,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          py: 1,
          px: 0.5,
          mt: 1,
        },
      }}
    >
      {/* Edit */}
      <MenuItem
        onClick={() => onEdit(event)}
        sx={{
          py: 1.25,
          px: 1.5,
          borderRadius: '8px',
          mx: 0.5,
          mb: 0.5,
          '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: '#7367f0' }}>
          <Pencil size={18} />
        </ListItemIcon>
        <ListItemText
          primary="Edit"
          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
        />
      </MenuItem>

      {/* Move to Date */}
      {showMove && onMoveToDate && (
        <MenuItem
          onClick={() => onMoveToDate(event)}
          sx={{
            py: 1.25,
            px: 1.5,
            borderRadius: '8px',
            mx: 0.5,
            '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#7367f0' }}>
            <CalendarClock size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Move to Date"
            secondary="Reschedule this event"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 11, color: '#888' }}
          />
        </MenuItem>
      )}

      {/* Repeat */}
      {showMove && onRepeat && (
        <MenuItem
          onClick={() => onRepeat(event)}
          sx={{
            py: 1.25,
            px: 1.5,
            borderRadius: '8px',
            mx: 0.5,
            '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#7367f0' }}>
            <RefreshCw size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Repeat"
            secondary="Create a copy of this event"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 11, color: '#888' }}
          />
        </MenuItem>
      )}

      <Divider sx={{ my: 0.5, mx: 1, borderColor: 'rgba(0,0,0,0.06)' }} />

      {/* Delete */}
      <MenuItem
        onClick={() => onDelete(event)}
        sx={{
          py: 1.25,
          px: 1.5,
          borderRadius: '8px',
          mx: 0.5,
          mb: 0.5,
          '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: '#7367f0' }}>
          <Trash size={18} />
        </ListItemIcon>
        <ListItemText
          primary="Delete"
          secondary="Remove from calendar only"
          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
          secondaryTypographyProps={{ fontSize: 11, color: '#888' }}
        />
      </MenuItem>

      {/* Permanent Delete */}
      {showPermanentDelete && onPermanentDelete && (
        <MenuItem
          onClick={() => onPermanentDelete(event)}
          sx={{
            py: 1.25,
            px: 1.5,
            borderRadius: '8px',
            mx: 0.5,
            color: '#d90429',
            '&:hover': { backgroundColor: 'rgba(217, 4, 41, 0.08)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#d90429' }}>
            <Trash2 size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Permanent Delete"
            secondary="Delete calendar + task permanently"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 11, color: '#a3021f' }}
          />
        </MenuItem>
      )}
    </Menu>
  );
};

export default EventContextMenu;
