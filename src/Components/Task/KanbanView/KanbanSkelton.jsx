import * as React from 'react';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function KanbanCardSkeleton() {
  return (
    <Grid container spacing={2}>
      {/* Responsive layout for cards */}
      {[1, 2, 3, 4].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Stack spacing={1}>
            <Skeleton variant="rectangular" animation="wave" width="100%" height={500} />
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
