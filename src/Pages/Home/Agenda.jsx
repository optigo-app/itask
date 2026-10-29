import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { getTimeLeft, renderAssigneeAvatars } from '../../Utils/globalfun'
import { Calendar, Plus, ArrowRight } from 'lucide-react';
import RowSkeleton from './RowSkeleton';

const Agenda = ({ agenda, navigate, isLoding }) => {
    const handleAddMeetings = () => navigate('/meetings')
    const [showAll, setShowAll] = useState(false);
    const visibleAgenda = showAll ? agenda : agenda?.slice(0, 8);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Agenda/Meetings
                    </Typography>
                    {agenda?.length > 0 && (
                        <Typography className='viewAllLink' onClick={handleAddMeetings}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {!isLoding && agenda != null ? (
                    <>
                        {agenda?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleAgenda?.map((event, idx) => (
                                    <Box className='listRow' key={idx}>
                                        <Box className={`timePill ${event?.isOverdue ? 'overdue' : event?.isToday ? 'today' : ''}`}>
                                            {event?.StartDate && getTimeLeft(event?.StartDate)}
                                        </Box>
                                        <Typography className='rowTitle' noWrap>
                                            {event?.meetingtitle}
                                        </Typography>
                                        <Box className='rowRight'>
                                            {renderAssigneeAvatars(event?.guests || [], () => { })}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {agenda?.length > 8 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                    <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                        {showAll ? 'See Less' : `See More (${agenda.length - 8})`}
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
                                <Calendar size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: .5, color: '#6D6B77' }}>
                                    No meetings found
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    There are no scheduled meetings at the moment.
                                </Typography>
                                <Button
                                    variant="contained"
                                    className="buttonClassname"
                                    size='small'
                                    onClick={handleAddMeetings}
                                    startIcon={<Plus size={18} />}
                                >
                                    Schedule a Meeting
                                </Button>
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

export default Agenda
