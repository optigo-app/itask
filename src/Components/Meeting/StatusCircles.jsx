// src/components/StatusCircles.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';

const StatusCircles = ({ meeting, redCount, yellowCount, greenCount, handleOpenStatusModal }) => {
  const circleStyle = {
    minWidth: 30,
    minHeight: 30,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '1px',
    marginLeft: '1px',
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box
        sx={{
          ...circleStyle,
          backgroundColor: '#FFE0E0',
          cursor: 'pointer',
          boxShadow:
            'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;',
        }}
        onClick={() => handleOpenStatusModal(meeting)}
      >
        <Typography variant="body2" sx={{ color: '#FF4D4F !important' }}>
          {redCount}
        </Typography>
      </Box>
      <Box
        sx={{
          ...circleStyle,
          backgroundColor: '#FFF7E6',
          cursor: 'pointer',
          boxShadow:
            'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;',
        }}
        onClick={() => handleOpenStatusModal(meeting)}
      >
        <Typography variant="body2" sx={{ color: '#FAAD14 !important' }}>
          {yellowCount}
        </Typography>
      </Box>
      <Box
        sx={{
          ...circleStyle,
          backgroundColor: '#F6FFED',
          cursor: 'pointer',
          boxShadow:
            'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;',
        }}
        onClick={() => handleOpenStatusModal(meeting)}
      >
        <Typography variant="body2" sx={{ color: '#52C41A !important' }}>
          {greenCount}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatusCircles;
