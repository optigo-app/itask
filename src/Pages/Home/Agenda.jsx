import React from 'react'
import { Card, CardContent, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { formatDate } from '../../Utils/globalfun'

const Card1 = ({ agenda }) => {
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
                                    {event?.taskTitle}
                                </TableCell>

                                <TableCell >
                                    {event?.time && formatDate(event?.time)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default Card1
