import React from 'react';
import { Box, Skeleton } from '@mui/material';

// Row-shaped skeleton for dashboard list cards — mirrors the real row layout
// (title line left, chips + avatar right) with a light tone.
const SKEL_SX = { backgroundColor: 'rgba(0,0,0,0.05)' };

const RowSkeleton = ({ rows = 3, chips = 2, avatar = false }) => (
    <Box sx={{ px: 2, pb: 2 }}>
        {Array.from({ length: rows }).map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    py: 1.1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1, minWidth: 0 }}>
                    {avatar && <Skeleton variant="circular" width={26} height={26} sx={{ flexShrink: 0, ...SKEL_SX }} />}
                    <Skeleton variant="rounded" width={avatar ? '38%' : '45%'} height={16} sx={{ borderRadius: '6px', ...SKEL_SX }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
                    {Array.from({ length: chips }).map((_, c) => (
                        <Skeleton key={c} variant="rounded" width={58} height={20} sx={{ borderRadius: '6px', ...SKEL_SX }} />
                    ))}
                    <Skeleton variant="circular" width={26} height={26} sx={SKEL_SX} />
                </Box>
            </Box>
        ))}
    </Box>
);

export default RowSkeleton;
