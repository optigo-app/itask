import React from 'react';
import { Card, Grid, Typography, Box } from '@mui/material';
import { formatDate2, formatDate3, getStatusColor, priorityColors } from '../../../Utils/globalfun';

const SubtaskCard = ({ subtasks }) => {
    return (
        <>
            {subtasks?.map((subtask, index) => (
                <Card key={index} className="subtask-card" sx={{ marginBottom: 2 }}>
                    <Grid container spacing={2} padding={2}>
                        <Grid item xs={12} sm={8}>
                            {/* Title */}
                            <Typography variant="h6">{subtask?.taskname}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {/* Due Date */}
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px !important' }}>
                                <strong>Due Date:</strong> {formatDate2(subtask?.DeadLineDate)}
                            </Typography>

                            {/* Priority */}
                            <Box sx={{ 
                                color: priorityColors[subtask?.priority]?.color,
                                backgroundColor: priorityColors[subtask?.priority]?.backgroundColor,
                                padding: '5px 10px', 
                                borderRadius: '8px', 
                                fontSize: '14px', 
                                marginTop: '5px'
                            }}>
                                {subtask?.priority}
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            ))}
        </>
    );
};

export default SubtaskCard;
