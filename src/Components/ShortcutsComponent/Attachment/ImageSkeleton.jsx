import React from 'react';
import { Skeleton, Stack, Box, Typography } from '@mui/material';

const ImageSkeleton = () => {
  return (
    <Stack spacing={2} sx={{ pt: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: '150px' }} animation="wave" />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[...Array(4)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={100}
            height={100}
            animation="wave"
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    </Stack>
  );
};

export default ImageSkeleton;
