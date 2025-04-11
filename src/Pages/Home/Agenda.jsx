import React from 'react'
import { Box, Button, Card, CardContent, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { formatDate, formatDate2, formatDate3 } from '../../Utils/globalfun'
import { Calendar, Plus } from 'lucide-react';

const Agenda = ({ agenda, navigate, isLoding }) => {
    const handleAddMeetings = () => {
        navigate('/meetings')
    }
    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Agenda/Meetings
                </Typography>
                {!isLoding && agenda != null ? (
                    <>
                        {agenda?.length > 0 ? (
                            <Table>
                                <TableBody>
                                    {agenda?.map((event, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {event?.meetingtitle}
                                            </TableCell>

                                            <TableCell >
                                                {event?.StartDate && formatDate3(event?.StartDate)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                        <Typography variant="body2" sx={{ mt: 1, mb: 0.5, color: '#6D6B77 !important' }}>
                            Loding...
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

export default Agenda
