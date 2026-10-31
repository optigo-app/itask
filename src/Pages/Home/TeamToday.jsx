import React, { useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { getAvatarColors, getInitials } from '../../Utils/globalfun'
import { Users, ArrowRight } from 'lucide-react'
import RowSkeleton from './RowSkeleton'

// Admin "Team Today" — per-employee today-task count (Start / Deadline toggle).
// Click a row → /myTasks grid filtered to that assignee + today's date range.
const TeamToday = ({ rows, mode = 'deadline', onModeChange, isLoding, navigate }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleRows = showAll ? rows : rows?.slice(0, 8);

    const openEmployeeTasks = (assignee) => {
        if (!assignee?.id || mode === 'deadline') return;
        navigate('/taskview', { state: { assigneeId: assignee.id, mode } });
    };

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Team Today
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={mode}
                        onChange={(e, v) => v && onModeChange?.(v)}
                        sx={{
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            padding: "3px",
                            gap: "3px",
                            "& .MuiToggleButton-root": {
                                display: "flex",
                                alignItems: "center",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#666",
                                border: "none",
                                borderRadius: "7px",
                                lineHeight: 1.2,
                                padding: "4px 12px",
                                minHeight: "24px",
                                textTransform: "none",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.7)" },
                                "&.Mui-selected": {
                                    backgroundColor: "#fff",
                                    color: "#000",
                                    fontWeight: 600,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                    "&:hover": { backgroundColor: "#fff" },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="start">Start</ToggleButton>
                        <ToggleButton value="deadline">Deadline</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {!isLoding && rows != null ? (
                    <>
                        {rows?.length > 0 ? (
                            <>
                                <Box className='listBox'>
                                    {visibleRows.map(({ assignee, count }) => (
                                        <Box
                                            className='listRow'
                                            key={assignee?.id}
                                            sx={{ cursor: mode === 'deadline' ? 'default' : 'pointer' }}
                                            onClick={() => openEmployeeTasks(assignee)}
                                        >
                                            <Avatar
                                                sx={{ width: 28, height: 28, fontSize: '0.72rem', ...getAvatarColors(`${assignee?.firstname} ${assignee?.lastname}`) }}
                                            >
                                                {getInitials(assignee?.firstname, assignee?.lastname)}
                                            </Avatar>
                                            <Box className='rowMain'>
                                                <Typography className='rowTitle' noWrap>
                                                    {assignee?.firstname} {assignee?.lastname}
                                                </Typography>
                                            </Box>
                                            <Box className='rowMeta'>
                                                <Box className='metaSlot chip'>
                                                    <Box className='statusChip' sx={{ color: '#b45309', backgroundColor: '#fef3c7' }}>
                                                        {count} task{count > 1 ? 's' : ''}
                                                    </Box>
                                                </Box>
                                                {mode !== 'deadline' && <ArrowRight size={15} color="#7d7f85" />}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                                {rows?.length > 8 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                        <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                            {showAll ? 'See Less' : `See More (${rows.length - 8})`}
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
                                    Nothing on today
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    {mode === 'start' ? 'No tasks scheduled to start today.' : 'No tasks due today.'}
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <RowSkeleton rows={3} chips={1} />
                )}
            </CardContent>
        </Card>
    )
}

export default TeamToday
