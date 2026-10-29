import React, { useState } from 'react'
import { Card, CardContent, Typography, Box, Button } from '@mui/material'
import { priorityColors, renderAssigneeAvatars } from '../../Utils/globalfun'
import { FileCheck, Plus, ArrowRight } from 'lucide-react'
import PriorityBadge from '../../Components/ShortcutsComponent/PriorityBadge'
import DueChip from './DueChip'
import RowSkeleton from './RowSkeleton'

const UrgentTask = ({ urgentTask, navigate, isLoding, onTaskClick }) => {

    const handleViewAll = () => navigate('/tasks')
    const onPriorityChange = () => { };
    const [showAll, setShowAll] = useState(false);
    const visibleTasks = showAll ? urgentTask : urgentTask?.slice(0, 8);

    // onTaskClick (from Home) resolves the root module and opens its tab
    const handleTaskClick = (task) => onTaskClick?.(task);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Urgent Tasks
                    </Typography>
                    {urgentTask?.length > 0 && (
                        <Typography className='viewAllLink' onClick={handleViewAll}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {!isLoding && urgentTask != null ? (
                    <>
                        {urgentTask?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleTasks?.map((task) => (
                                    <Box className='listRow' key={task.taskid} onClick={() => handleTaskClick(task)}>
                                        <Typography className='rowTitle' noWrap>
                                            {task.taskname}
                                        </Typography>
                                        <Box className='rowMeta'>
                                            <Box className='metaSlot chip'>
                                                <PriorityBadge
                                                    task={task}
                                                    priorityColors={priorityColors}
                                                    onPriorityChange={onPriorityChange}
                                                    disable={true}
                                                    fontSize={11.5}
                                                    padding="5px 8px"
                                                    minWidth={64}
                                                />
                                            </Box>
                                            <Box className='metaSlot chip'>
                                                <DueChip date={task?.DeadLineDate} task={task} />
                                            </Box>
                                            <Box className='metaSlot avatars'>
                                                {renderAssigneeAvatars(task?.assignee, () => { })}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {urgentTask?.length > 8 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                    <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                        {showAll ? 'See Less' : `See More (${urgentTask.length - 8})`}
                                    </Button>
                                </Box>
                            )}
                            </>
                        ) :
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
                                <FileCheck size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                                    No urgent tasks
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    You are all caught up — nothing needs immediate attention.
                                </Typography>
                                <Button
                                    variant="contained"
                                    className="buttonClassname"
                                    size="small"
                                    onClick={handleViewAll}
                                    startIcon={<Plus size={18} />}
                                >
                                    Add Task
                                </Button>
                            </Box>
                        }
                    </>
                ) :
                    <RowSkeleton rows={3} chips={2} />
                }
            </CardContent>
        </Card>
    )
}

export default UrgentTask
