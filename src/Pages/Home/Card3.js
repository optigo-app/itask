import React from 'react'
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material'

const Card3 = ({ urgentTask }) => {
    const priorityColors = {
        Low: {
            color: "#4caf50",
            backgroundColor: "#e8f5e9",
        },
        Medium: {
            color: "#ff9800",
            backgroundColor: "#fff3e0",
        },
        High: {
            color: "#f44336",
            backgroundColor: "#ffebee",
        },
        Urgent: {
            color: "#d32f2f",
            backgroundColor: "#ffcccb",
        },
        Critical: {
            color: "#ffffff",
            backgroundColor: "#b71c1c",
        },
    };

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Urgent Task
                </Typography>
                <Table>
                    <TableBody>
                        {urgentTask?.map((task) => (
                            <TableRow key={task.taskId}>
                                <TableCell>{task.taskName}</TableCell>
                                <TableCell>
                                    <div style={{
                                        color: priorityColors[task?.priority]?.color,
                                        // backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                                        // width: 'fit-content',
                                        // padding: '0.2rem 0.8rem',
                                        // borderRadius: '5px',
                                        // textAlign: 'center',
                                        // fontSize: '13.5px',
                                        // fontWeight: '500',
                                        // display: 'flex',
                                        // justifyContent: 'center',
                                        // alignItems: 'center',
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
