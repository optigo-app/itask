import React from 'react';
import '../ConfirmationDialog/for_confirmation.scss';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Divider, Stack, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const AuthenticationBannerSvg = ({ size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" opacity="0.9" />
      <path
        d="M32 18c-4.4 0-8 3.6-8 8v6h-3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2V34c0-1.1-.9-2-2-2h-3v-6c0-4.4-3.6-8-8-8z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M32 26c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

const InvalidDeviceBannerSvg = ({ size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 6.5c10.7 6.6 19.8 6.6 23.5 6.6v18.6c0 15.6-10.5 24.7-23.5 28.8C19 56.4 8.5 47.3 8.5 31.7V13.1c3.7 0 12.8 0 23.5-6.6Z"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.9"
      />
      <path
        d="M32 19v18"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 45.5h.01"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

const InvalidDeviceDialog = ({ open, title, message, onLogout, isAuthentication = false }) => {
  const isAuthIssue = isAuthentication || message?.toLowerCase().includes('device token missing') || message?.toLowerCase().includes('not authenticated');
  
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="invalid-device-dialog-title"
      aria-describedby="invalid-device-dialog-description"
      className='DRM'
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: 520,
          width: 'calc(100% - 32px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle 
        id="invalid-device-dialog-title" 
        className='alert-TitleCl' 
        sx={{ 
          pb: 0.5,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: isAuthIssue ? '#667eea' : '#f5576c',
          backgroundColor: 'transparent',
        }}
      >
        {title || (isAuthIssue ? 'Authentication Required' : 'Invalid Device')}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack direction="row" spacing={2} sx={{ pt: 1 }} alignItems="flex-start">
          <Box
            sx={{
              color: isAuthIssue ? '#667eea' : '#2575fc',
              background: isAuthIssue ? 'rgba(102, 126, 234, 0.08)' : 'rgba(37, 117, 252, 0.08)',
              borderRadius: 2,
              p: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isAuthIssue ? <AuthenticationBannerSvg /> : <InvalidDeviceBannerSvg />}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <DialogContentText 
              id="invalid-device-dialog-description" 
              className='alert-titleContent'
              sx={{ 
                fontSize: '1rem',
                fontWeight: 500,
                color: 'text.primary',
                lineHeight: 1.5,
              }}
            >
              {message || (isAuthIssue 
                ? 'Welcome! Please sign in to access your workspace and continue with your tasks.'
                : 'Invalid device. Please login again.')}
            </DialogContentText>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
                fontFamily: '"Public Sans", sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              {isAuthIssue 
                ? 'Sign in to access your projects, tasks, and collaborate with your team.'
                : 'You will be redirected to login after logout.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          className='buttonClassname' 
          onClick={onLogout} 
          autoFocus 
          fullWidth={!isAuthIssue}
          variant={isAuthIssue ? 'contained' : 'text'}
          startIcon={isAuthIssue ? <LoginIcon /> : undefined}
          sx={{
            ...(isAuthIssue && {
              backgroundColor: '#667eea',
              color: 'white',
              fontWeight: 600,
              py: 1,
              '&:hover': {
                backgroundColor: '#5a6fd8',
              },
            }),
          }}
        >
          {isAuthIssue ? 'Sign In' : 'Logout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvalidDeviceDialog;
