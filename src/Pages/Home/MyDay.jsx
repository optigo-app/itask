import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { getDynamicStatusColor, renderAssigneeAvatars } from '../../Utils/globalfun'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import DueChip from './DueChip'
import RowSkeleton from './RowSkeleton'

const MyDay = ({ tasks, navigate, isLoding, onTaskClick }) => {
    const handleViewAll = () => navigate('/tasks')
    const [showAll, setShowAll] = useState(false);
    const visibleTasks = showAll ? tasks : tasks?.slice(0, 8);
    // onTaskClick (from Home) resolves the root module and opens its tab
    const handleTaskClick = (task) => onTaskClick?.(task);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        My Day
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
                                        <Box className='listRow' key={task.taskid} onClick={() => handleTaskClick(task)}>
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
                                <CalendarCheck size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                                    Nothing due today
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    No tasks due today or overdue — plan ahead or take a breather.
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

export default MyDay
