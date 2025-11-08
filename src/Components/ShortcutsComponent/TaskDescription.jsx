import { Grid, Typography, Box, IconButton, TextareaAutosize, Button } from '@mui/material';
import { SquarePen } from 'lucide-react';

const TaskDescription = ({ taskDesc, taskDescEdit, handleShowEditDesc, handleDescChange, handleDescCancel, handleUpdateDesc }) => {
    return (
        <>
            <Grid item xs={12}>
                <Box className='taskDesc'>
                    <Typography className='taskDesclable'>Description</Typography>
                    <IconButton onClick={handleShowEditDesc} color="primary">
                        <SquarePen color='#7367f0' size={20} />
                    </IconButton>
                </Box>
            </Grid>
            <Grid item xs={12} paddingTop='5px !important'>
                <Box sx={{ position: 'relative' }}>
                    {!taskDescEdit ? (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>{typeof taskDesc === 'string' ? taskDesc : taskDesc?.descr}</Typography>
                        </Box>
                    ) : (
                        <Box sx={{
                            background: '#fff',
                            padding: '10px',
                            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            <TextareaAutosize
                                value={typeof taskDesc === 'string' ? taskDesc : taskDesc?.descr}
                                rows={8}
                                onChange={handleDescChange}
                                placeholder="Enter description here..."
                                className="textarea"
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            />
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', gap: '10px', mt: 1 }}>
                                <Button
                                    className='secondaryBtnClassname'
                                    onClick={handleDescCancel}
                                    sx={{ borderRadius: '8px' }}
                                    variant="contained"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className='buttonClassname'
                                    onClick={handleUpdateDesc}
                                    sx={{ borderRadius: '8px' }}
                                    variant="contained"
                                >
                                    Update
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Grid>
        </>
    );
};

export { TaskDescription };
