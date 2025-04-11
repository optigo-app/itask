import React from 'react'
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Box, Button } from '@mui/material'
import { priorityColors } from '../../Utils/globalfun'
import { FileCheck, Plus, SquareChartGantt } from 'lucide-react'

const UrgentTask = ({ urgentTask, navigate, isLoding }) => {

    const handleAddTask = () => {
        navigate('/tasks')
    }
    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Urgent Task
                </Typography>
                {!isLoding && urgentTask != null ? (
                    <>
                        {urgentTask?.length > 0 ? (
                            <Table>
                                <TableBody>
                                    {urgentTask?.map((task) => (
                                        <TableRow key={task.taskid}>
                                            <TableCell>{task.taskname}</TableCell>
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
                                    No task found
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    There are no active Task at the moment.
                                </Typography>
                                <Button
                                    variant="contained"
                                    className="buttonClassname"
                                    size="small"
                                    onClick={handleAddTask}
                                    startIcon={<Plus size={18} />}
                                >
                                    Add Task
                                </Button>
                            </Box>
                        }
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
                        <SquareChartGantt size={34} color="#7d7f85" />
                        <Typography variant="body2" sx={{ mt: 1, mb: 0.5, color: '#6D6B77 !important' }}>
                            Loding...
                        </Typography>
                    </Box>
                }
            </CardContent>
        </Card>
    )
}

export default UrgentTask
