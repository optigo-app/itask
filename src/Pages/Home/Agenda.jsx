import React from 'react'
import { Card, CardContent, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { formatDate, formatDate2, formatDate3 } from '../../Utils/globalfun'

const Agenda = ({ agenda }) => {
    console.log('agenda: ', agenda);
    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Agenda/Meetings
                </Typography>
                {/* <div className="itask_separator" /> */}
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
            </CardContent>
        </Card>
    )
}

export default Agenda
