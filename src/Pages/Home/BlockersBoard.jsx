import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { getDynamicStatusColor, renderAssigneeAvatars } from '../../Utils/globalfun'
import { OctagonAlert, ArrowRight } from 'lucide-react'
import DueChip from './DueChip'
import RowSkeleton from './RowSkeleton'

const BlockersBoard = ({ tasks, navigate, isLoding, onTaskClick }) => {
    const handleViewAll = () => navigate('/tasks')
    const [showAll, setShowAll] = useState(false);
    const visibleTasks = showAll ? tasks : tasks?.slice(0, 8);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Blockers
                        {tasks?.length > 0 && (
                            <Box component="span" className='countBadge danger'>{tasks.length}</Box>
                        )}
                    </Typography>
                    {tasks?.length > 0 && (
                        <Typography className='viewAllLink' onClick={handleViewAll}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {!isLoding && tasks != null ? (
                    <>
                        {tasks?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleTasks?.map((task) => {
                                    const statusMeta = getDynamicStatusColor((task?.status || '').toLowerCase());
                                    return (
                                        <Box className='listRow' key={task.taskid} onClick={() => onTaskClick?.(task)}>
                                            <Typography className='rowTitle' noWrap>
                                                {task.taskname}
                                            </Typography>
                                            <Box className='rowMeta'>
                                                <Box className='metaSlot chip'>
                                                    {task?.status && (
                                                        <Box className='statusChip' sx={{ color: statusMeta?.color, backgroundColor: statusMeta?.backgroundColor }}>
                                                            {task.status}
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box className='metaSlot chip'>
                                                    <DueChip date={task?.DeadLineDate} task={task} />
                                                </Box>
                                                <Box className='metaSlot avatars'>
                                                    {renderAssigneeAvatars(task?.assignee, () => { })}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {tasks?.length > 8 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                    <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                        {showAll ? 'See Less' : `See More (${tasks.length - 8})`}
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
                                <OctagonAlert size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                                    No blockers
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    Nothing is blocking the team right now.
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <RowSkeleton rows={3} chips={2} />
                )}
            </CardContent>
        </Card>
    )
}

export default BlockersBoard
