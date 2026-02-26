import React from 'react';
import { Card, Grid, Typography, Box, Button, IconButton } from '@mui/material';
import { cleanDate, formatDate2, formatDate3, getStatusColor, priorityColors } from '../../../Utils/globalfun';
import AddIcon from '@mui/icons-material/Add';

const SubtaskCard = ({ subtasks, onAddDubTask }) => {
    return (
        <>
            {subtasks?.map((subtask, index) => (
                <Card key={index} className="subtask-card" sx={{ marginBottom: 2 }}>
                    <Grid container spacing={2} padding={2}>
                        <Grid item xs={12} sm={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="h6">{subtask?.taskname}</Typography>
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

                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {/* Due Date */}
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px !important' }}>
                                <strong>Due Date:</strong> {subtask?.DeadLineDate && cleanDate(subtask?.DeadLineDate)
                                    ? formatDate2(cleanDate(subtask?.DeadLineDate))
                                    : '-'}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => onAddDubTask(subtask, { Task: 'subroot' })}
                                sx={{ borderRadius: '50% !important', mt: '5px', backgroundColor: '#7367f0', color: '#fff', '&:hover': { backgroundColor: '#7367f0' } }}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid> 
                </Card>
            ))}
        </>
    );
};

export default SubtaskCard;
