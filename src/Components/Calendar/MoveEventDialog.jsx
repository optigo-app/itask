import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import { CalendarClock, X } from 'lucide-react';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';

const MoveEventDialog = ({ open, event, moveToDate, onChangeDate, onClose, onConfirm }) => {

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        onClose();
      }}
      disableBackdropClick
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxWidth: 420,
          width: '100%',
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarClock size={20} color="#7367f0" />
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
            Move Event
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: '#999', p: 0.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <CustomDateTimePicker
            name="individualMoveDate"
            value={moveToDate}
            width="100%"
            textFieldProps={{
              label: 'New Date & Time',
              InputLabelProps: { shrink: true },
              sx: {
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  height: '46px',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(115, 103, 240, 0.4)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7367f0', borderWidth: '1.5px' },
                },
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.10)' },
                '& .MuiInputLabel-root': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#888',
                  transform: 'translate(14px, -9px) scale(0.85)',
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#7367f0' },
                '& .MuiInputAdornment-root .MuiButtonBase-root': { color: '#7367f0' },
              },
            }}
            onChange={onChangeDate}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          fullWidth
          sx={{
            borderRadius: '10px',
            py: 1,
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'none',
            color: '#666',
            backgroundColor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          fullWidth
          disabled={!moveToDate}
          sx={{
            borderRadius: '10px',
            py: 1,
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'none',
            color: '#fff',
            backgroundColor: '#7367f0',
            '&:hover': { backgroundColor: '#6555d9' },
            '&:disabled': { backgroundColor: 'rgba(115, 103, 240, 0.35)', color: '#fff' },
          }}
        >
          Move
        </Button>
      </Box>
    </Dialog>
  );
};

export default MoveEventDialog;
