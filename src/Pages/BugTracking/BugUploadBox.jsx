import React from 'react';
import { Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';

const BugUploadBox = ({ 
  onDragOver, 
  onDrop, 
  onFileSelect, 
  inputId = 'bug-upload',
  showCancelButton = false,
  onCancel
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '500px' },
        maxWidth: '90vw'
      }}
    >
      <Box
        sx={{
          border: '3px dashed #d0d0d0',
          borderRadius: 3,
          p: 6,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          bgcolor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          '&:hover': { 
            borderColor: '#7367f0', 
            bgcolor: '#f8f7ff',
            boxShadow: '0 8px 30px rgba(115, 103, 240, 0.15)',
            transform: 'translateY(-2px)'
          },
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <input
          type="file"
          id={inputId}
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && onFileSelect) {
              onFileSelect(file);
              e.target.value = null;
            }
          }}
        />
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#f5f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}
        >
          <Upload size={40} color="#7367f0" strokeWidth={2} />
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: '#2c2c2c',
            mb: 0.5
          }}
        >
          Drop Image or Click to Upload
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#666',
            fontSize: '0.95rem'
          }}
        >
          Drag and drop an image here or click to browse files
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#999',
            mt: 1,
            fontSize: '0.85rem'
          }}
        >
          Supported formats: JPG, PNG, GIF
        </Typography>
      </Box>
    </Box>
  );
};

export default BugUploadBox;
