import React from 'react'
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { priorityColors } from '../../Utils/globalfun'

const Card3 = ({ urgentTask }) => {
 

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Urgent Task
                </Typography>
                {/* <div className="itask_separator" /> */}
                <Table>
                    <TableBody>
                        {urgentTask?.map((task) => (
                            <TableRow key={task.taskId}>
                                <TableCell>{task.taskName}</TableCell>
                                <TableCell>
                                    <div style={{
                                        color: priorityColors[task?.priority]?.color,
                                        backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                                        width: 'fit-content',
                                        padding: '0.2rem 0.8rem',
                                        borderRadius: '5px',
                                        textAlign: 'center',
                                        fontSize: '13.5px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        {task.priority}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default Card3
