import React, { useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Typography } from '@mui/material'
import { getAvatarColors, getInitials } from '../../Utils/globalfun'
import { Users } from 'lucide-react'
import RowSkeleton from './RowSkeleton'

const TeamWorkload = ({ rows, isLoding }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleRows = showAll ? rows : rows?.slice(0, 8);
    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Team Workload
                    </Typography>
                </Box>
                {!isLoding && rows != null ? (
                    <>
                        {rows?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleRows.map(({ assignee, total, overdue }) => (
                                    <Box className='listRow' key={assignee?.id} sx={{ cursor: 'default' }}>
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
                                                {overdue > 0 && (
                                                    <Box className='statusChip' sx={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
                                                        {overdue} overdue
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box className='metaSlot chip'>
                                                <Box className='statusChip' sx={{ color: '#4338ca', backgroundColor: '#e0e7ff' }}>
                                                    {total} task{total > 1 ? 's' : ''}
                                                </Box>
                                            </Box>
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
                                    No active workload
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    No one has open tasks assigned right now.
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
