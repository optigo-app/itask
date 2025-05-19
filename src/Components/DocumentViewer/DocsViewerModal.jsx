import React, { useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DocsViewerModal = ({modalOpen, url, closeModal }) => {
  return (
    <Box p={3}>
      {/* MUI Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '85%',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 2,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Document Preview</Typography>
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box flexGrow={1}>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                url
              )}&embedded=true`}
              title="Google Docs Viewer"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DocsViewerModal;
