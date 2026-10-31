import React, { useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Typography } from '@mui/material'
import { getAvatarColors, getInitials } from '../../Utils/globalfun'
import { Users } from 'lucide-react'
import RowSkeleton from './RowSkeleton'

const TeamWorkload = ({ rows, isLoding }) => {
    const [showAll, setShowAll] = useState(false);
    const [range, setRange] = useState('today');
    const countFor = (w) => range === 'today' ? (w?.today ?? 0) : range === 'week' ? (w?.week ?? 0) : range === 'month' ? (w?.month ?? 0) : (w?.year ?? 0);
    const rangeLabel = range === 'today' ? 'today' : range === 'week' ? 'this week' : range === 'month' ? 'this month' : 'this year';
    const rangeRows = (rows || [])
        .filter((w) => countFor(w) > 0)
        .sort((a, b) => countFor(b) - countFor(a));
    const visibleRows = showAll ? rangeRows : rangeRows?.slice(0, 8);
    const ranges = [
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
        { key: 'year', label: 'Year' },
    ];
    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Team Workload
                    </Typography>
                    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderRadius: '8px', p: '3px', gap: '2px' }}>
                        {ranges.map((r) => (
                            <Button
                                key={r.key}
                                size="small"
                                onClick={() => setRange(r.key)}
                                sx={{
                                    minWidth: 'auto', px: 1.5, py: '2px', fontSize: '0.7rem', textTransform: 'none',
                                    borderRadius: '6px', lineHeight: 1.4,
                                    color: range === r.key ? '#111' : '#7d7f85',
                                    fontWeight: range === r.key ? 600 : 500,
                                    bgcolor: range === r.key ? '#fff' : 'transparent',
                                    boxShadow: range === r.key ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                                    '&:hover': { bgcolor: range === r.key ? '#fff' : '#ececec' },
                                }}
                            >
                                {r.label}
                            </Button>
                        ))}
                    </Box>
                </Box>
                {!isLoding && rows != null ? (
                    <>
                        {rangeRows?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleRows.map((w) => (
                                    <Box className='listRow' key={w?.assignee?.id} sx={{ cursor: 'default' }}>
                                        <Avatar
                                            sx={{ width: 28, height: 28, fontSize: '0.72rem', ...getAvatarColors(`${w?.assignee?.firstname} ${w?.assignee?.lastname}`) }}
                                        >
                                            {getInitials(w?.assignee?.firstname, w?.assignee?.lastname)}
                                        </Avatar>
                                        <Box className='rowMain'>
                                            <Typography className='rowTitle' noWrap>
                                                {w?.assignee?.firstname} {w?.assignee?.lastname}
                                            </Typography>
                                        </Box>
                                        <Box className='rowMeta'>
                                            <Box className='metaSlot chip'>
                                                {w?.overdue > 0 && (
                                                    <Box className='statusChip' sx={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
                                                        {w?.overdue} overdue
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box className='metaSlot chip'>
                                                <Box className='statusChip' sx={{ color: '#4338ca', backgroundColor: '#e0e7ff' }}>
                                                    {countFor(w)} {rangeLabel}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {rangeRows?.length > 8 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                    <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                        {showAll ? 'See Less' : `See More (${rangeRows.length - 8})`}
                                    </Button>
                                </Box>
                            )}
                            </>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    mb: 2,
                                }}
                            >
                                <Users size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                                    No active workload
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    No one has open tasks due {rangeLabel}.
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <RowSkeleton rows={3} chips={2} avatar />
                )}
            </CardContent>
        </Card>
    )
}

export default TeamWorkload
