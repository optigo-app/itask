import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Divider
} from '@mui/material';
import { 
    getDynamicPriorityColor, 
    getDynamicStatusColor, 
    getColorOptions,
    colorMaster 
} from '../../Utils/globalfun';
import ViewToggle from '../Common/ViewToggle';
import ColorGridShortcuts from '../Common/ColorGridShortcuts';

const ColorMasterDemo = () => {
    const [priorityColors, setPriorityColors] = useState({});
    const [statusColors, setStatusColors] = useState({});
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        // Load stored color mappings
        const storedPriorityColors = JSON.parse(sessionStorage.getItem('priorityMasterColors') || '{}');
        const storedStatusColors = JSON.parse(sessionStorage.getItem('statusMasterColors') || '{}');
        setPriorityColors(storedPriorityColors);
        setStatusColors(storedStatusColors);
    }, []);

    const samplePriorities = ['Low', 'Medium', 'High', 'Urgent', 'Critical'];
    const sampleStatuses = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

    const addSampleData = () => {
        // Add sample priority colors
        const samplePriorityMapping = {
            'low': 'green',
            'medium': 'amber',
            'high': 'orange',
            'urgent': 'red',
            'critical': 'deepOrange'
        };

        // Add sample status colors
        const sampleStatusMapping = {
            'pending': 'grey',
            'in progress': 'blue',
            'completed': 'green',
            'on hold': 'orange',
            'cancelled': 'red'
        };

        sessionStorage.setItem('priorityMasterColors', JSON.stringify(samplePriorityMapping));
        sessionStorage.setItem('statusMasterColors', JSON.stringify(sampleStatusMapping));
        
        setPriorityColors(samplePriorityMapping);
        setStatusColors(sampleStatusMapping);
    };

    const clearSampleData = () => {
        sessionStorage.removeItem('priorityMasterColors');
        sessionStorage.removeItem('statusMasterColors');
        setPriorityColors({});
        setStatusColors({});
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Dynamic Color Master System Demo
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Button 
                        variant="contained" 
                        onClick={addSampleData}
                        sx={{ mr: 2 }}
                    >
                        Load Sample Data
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={clearSampleData}
                    >
                        Clear Sample Data
                    </Button>
                </Box>
                
                <ViewToggle
                    view={viewMode}
                    onViewChange={setViewMode}
                    size="medium"
                    variant="outlined"
                    showLabels={true}
                />
            </Box>

            <Grid container spacing={3}>
                {/* Color Palette */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Available Color Palette (20 Colors)
                            </Typography>
                            <Grid container spacing={1}>
                                {getColorOptions().map((color) => (
                                    <Grid item key={color.key}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 60,
                                                borderRadius: '8px',
                                                background: `linear-gradient(135deg, ${color.light} 0%, ${color.dark} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid #fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: color.dark,
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                {color.name}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Priority Colors Demo */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Dynamic Priority Colors
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Colors automatically selected based on master data
                            </Typography>
                            
                            {viewMode === 'list' ? (
                                <>
                                    {samplePriorities.map((priority) => {
                                        const colorInfo = getDynamicPriorityColor(priority);
                                        return (
                                            <Chip
                                                key={priority}
                                                label={priority}
                                                sx={{
                                                    backgroundColor: colorInfo.backgroundColor,
                                                    color: colorInfo.color,
                                                    border: `1px solid ${colorInfo.color}`,
                                                    mr: 1,
                                                    mb: 1,
                                                    fontWeight: 500
                                                }}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <ColorGridShortcuts
                                    data={samplePriorities.map((priority, index) => ({
                                        id: index,
                                        labelname: priority,
                                        displayorder: index + 1,
                                        colorkey: priorityColors[priority.toLowerCase()]
                                    }))}
                                    type="priority"
                                    showActions={false}
                                />
                            )}

                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Code Example:
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    p: 2,
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}
                            >
                                {`const colorInfo = getDynamicPriorityColor('High');
// Returns: { color: '#ff9800', backgroundColor: '#fff3e0', colorKey: 'orange' }`}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Status Colors Demo */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Dynamic Status Colors
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Colors automatically selected based on master data
                            </Typography>
                            
                            {viewMode === 'list' ? (
                                <>
                                    {sampleStatuses.map((status) => {
                                        const colorInfo = getDynamicStatusColor(status);
                                        return (
                                            <Chip
                                                key={status}
                                                label={status}
                                                sx={{
                                                    backgroundColor: colorInfo.backgroundColor,
                                                    color: colorInfo.color,
                                                    border: `1px solid ${colorInfo.color}`,
                                                    mr: 1,
                                                    mb: 1,
                                                    fontWeight: 500
                                                }}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <ColorGridShortcuts
                                    data={sampleStatuses.map((status, index) => ({
                                        id: index,
                                        labelname: status,
                                        displayorder: index + 1,
                                        colorkey: statusColors[status.toLowerCase().replace(' ', ' ')]
                                    }))}
                                    type="status"
                                    showActions={false}
                                />
                            )}

                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Code Example:
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    p: 2,
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}
                            >
                                {`const colorInfo = getDynamicStatusColor('Completed');
// Returns: { color: '#4caf50', backgroundColor: '#e8f5e9', colorKey: 'green' }`}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Usage Instructions */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                How to Use the Dynamic Color Master System
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        1. Add Master Data
                                    </Typography>
                                    <Typography variant="body2">
                                        Go to Master → Priority/Status and add new items with color selection using the color picker component.
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        2. Use in Components
                                    </Typography>
                                    <Typography variant="body2">
                                        Import getDynamicPriorityColor() or getDynamicStatusColor() functions and use them in your components.
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        3. Auto Text Color
                                    </Typography>
                                    <Typography variant="body2">
                                        The system automatically selects appropriate text colors based on background for optimal readability.
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Features
                            </Typography>
                            
                            <Grid container spacing={1}>
                                {[
                                    '39 predefined color variants (light/dark pairs)',
                                    'Dynamic color assignment based on master data',
                                    'Automatic text color selection for readability',
                                    'Grid and list view modes with toggle buttons',
                                    'Enhanced color picker with categorized tabs',
                                    'Session storage for color mappings',
                                    'Reusable ViewToggle component',
                                    'Fallback to default colors if not configured'
                                ].map((feature, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#4caf50',
                                                    mr: 1
                                                }}
                                            />
                                            <Typography variant="body2">
                                                {feature}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ColorMasterDemo;
