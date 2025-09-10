import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Chip,
    Paper,
    Divider,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    DatePicker,
    LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RefreshIcon from '@mui/icons-material/Refresh';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const CalendarComparisonDemo = () => {
    // Comparison state management
    const [comparisonMode, setComparisonMode] = useState(false);
    const [baseWeek, setBaseWeek] = useState(dayjs());
    const [comparisonWeek, setComparisonWeek] = useState(dayjs().subtract(1, 'week'));
    const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'sideBySide', 'difference'
    
    // Sample data for task schedule comparison - Current Week vs Previous Week
    const [currentWeekTasks] = useState([
        {
            id: 1,
            title: 'Database Migration',
            originalDate: dayjs().startOf('week').add(1, 'day'),
            currentDate: dayjs().startOf('week').add(3, 'day'), // Rescheduled
            duration: 4,
            category: 'Development',
            priority: 'High',
            status: 'rescheduled',
            reason: 'Dependencies not ready'
        },
        {
            id: 2,
            title: 'API Testing',
            originalDate: dayjs().startOf('week').add(2, 'day'),
            currentDate: dayjs().startOf('week').add(2, 'day'), // Same date
            duration: 3,
            category: 'Testing',
            priority: 'Medium',
            status: 'on_schedule'
        },
        {
            id: 3,
            title: 'Client Presentation',
            originalDate: dayjs().startOf('week').add(4, 'day'),
            currentDate: dayjs().startOf('week').add(5, 'day'), // Moved to Friday
            duration: 2,
            category: 'Meeting',
            priority: 'High',
            status: 'rescheduled',
            reason: 'Client availability'
        },
        {
            id: 4,
            title: 'Bug Fixes Sprint',
            originalDate: null, // New task
            currentDate: dayjs().startOf('week').add(1, 'day'),
            duration: 6,
            category: 'Development',
            priority: 'High',
            status: 'new_task',
            reason: 'Urgent production issues'
        },
        {
            id: 5,
            title: 'Code Documentation',
            originalDate: dayjs().startOf('week').add(5, 'day'),
            currentDate: null, // Removed/postponed
            duration: 2,
            category: 'Documentation',
            priority: 'Low',
            status: 'postponed',
            reason: 'Lower priority due to urgent tasks'
        }
    ]);

    // Original schedule (what was planned at start of week)
    const [originalSchedule] = useState([
        {
            id: 1,
            title: 'Database Migration',
            date: dayjs().startOf('week').add(1, 'day'),
            duration: 4,
            category: 'Development',
            priority: 'High'
        },
        {
            id: 2,
            title: 'API Testing',
            date: dayjs().startOf('week').add(2, 'day'),
            duration: 3,
            category: 'Testing',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'Client Presentation',
            date: dayjs().startOf('week').add(4, 'day'),
            duration: 2,
            category: 'Meeting',
            priority: 'High'
        },
        {
            id: 5,
            title: 'Code Documentation',
            date: dayjs().startOf('week').add(5, 'day'),
            duration: 2,
            category: 'Documentation',
            priority: 'Low'
        }
    ]);

    // Current actual schedule
    const [currentSchedule] = useState([
        {
            id: 1,
            title: 'Database Migration',
            date: dayjs().startOf('week').add(3, 'day'),
            duration: 4,
            category: 'Development',
            priority: 'High'
        },
        {
            id: 2,
            title: 'API Testing',
            date: dayjs().startOf('week').add(2, 'day'),
            duration: 3,
            category: 'Testing',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'Client Presentation',
            date: dayjs().startOf('week').add(5, 'day'),
            duration: 2,
            category: 'Meeting',
            priority: 'High'
        },
        {
            id: 4,
            title: 'Bug Fixes Sprint',
            date: dayjs().startOf('week').add(1, 'day'),
            duration: 6,
            category: 'Development',
            priority: 'High'
        }
    ]);

    // Calculate week ranges
    const getWeekRange = (date) => {
        const start = date.startOf('isoWeek');
        const end = date.endOf('isoWeek');
        return { start, end };
    };

    const baseWeekRange = getWeekRange(baseWeek);
    const comparisonWeekRange = getWeekRange(comparisonWeek);

    // Calculate task schedule comparison metrics
    const calculateScheduleMetrics = () => {
        const originalTotal = originalSchedule.reduce((sum, task) => sum + task.duration, 0);
        const currentTotal = currentSchedule.reduce((sum, task) => sum + task.duration, 0);
        const difference = currentTotal - originalTotal;
        const percentageChange = originalTotal > 0 ? ((difference / originalTotal) * 100).toFixed(1) : 0;

        // Count different types of changes
        const rescheduledTasks = currentWeekTasks.filter(task => task.status === 'rescheduled').length;
        const newTasks = currentWeekTasks.filter(task => task.status === 'new_task').length;
        const postponedTasks = currentWeekTasks.filter(task => task.status === 'postponed').length;
        const onScheduleTasks = currentWeekTasks.filter(task => task.status === 'on_schedule').length;

        return {
            originalTotal,
            currentTotal,
            difference,
            percentageChange,
            originalCount: originalSchedule.length,
            currentCount: currentSchedule.length,
            rescheduledTasks,
            newTasks,
            postponedTasks,
            onScheduleTasks,
            totalChanges: rescheduledTasks + newTasks + postponedTasks
        };
    };

    const metrics = calculateScheduleMetrics();

    // Week picker component
    const WeekPicker = ({ label, value, onChange, color = 'primary' }) => (
        <Box sx={{ minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: `${color}.main` }}>
                {label}
            </Typography>
            <DatePicker
                value={value}
                onChange={onChange}
                format="YYYY-MM-DD"
                slotProps={{
                    textField: {
                        size: 'small',
                        sx: {
                            '& .MuiOutlinedInput-root': {
                                borderColor: `${color}.main`
                            }
                        }
                    }
                }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                Week {value.isoWeek()}: {getWeekRange(value).start.format('MMM DD')} - {getWeekRange(value).end.format('MMM DD')}
            </Typography>
        </Box>
    );

    // Task card component with schedule change indicators
    const TaskCard = ({ task, isOriginal = false, showChanges = false }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'rescheduled': return '#ff9800';
                case 'new_task': return '#4caf50';
                case 'postponed': return '#f44336';
                case 'on_schedule': return '#2196f3';
                default: return '#757575';
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'rescheduled': return '📅';
                case 'new_task': return '✨';
                case 'postponed': return '⏸️';
                case 'on_schedule': return '✅';
                default: return '📋';
            }
        };

        return (
            <Card 
                sx={{ 
                    mb: 1, 
                    border: `2px solid ${isOriginal ? '#757575' : getStatusColor(task.status || 'default')}`,
                    backgroundColor: isOriginal ? '#f5f5f5' : '#ffffff',
                    opacity: task.status === 'postponed' ? 0.6 : 1
                }}
            >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {!isOriginal && getStatusIcon(task.status)}
                                {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isOriginal ? 
                                    `${task.date.format('ddd, MMM DD')} • ${task.duration}h` :
                                    task.currentDate ? 
                                        `${task.currentDate.format('ddd, MMM DD')} • ${task.duration}h` :
                                        'Postponed'
                                }
                            </Typography>
                            {showChanges && task.status === 'rescheduled' && task.originalDate && (
                                <Typography variant="caption" sx={{ display: 'block', color: '#ff9800', fontStyle: 'italic' }}>
                                    Originally: {task.originalDate.format('ddd, MMM DD')}
                                </Typography>
                            )}
                            {showChanges && task.reason && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
                                    Reason: {task.reason}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Chip 
                                label={task.category} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                            />
                            <Chip 
                                label={task.priority} 
                                size="small" 
                                color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'}
                            />
                            {!isOriginal && task.status && (
                                <Chip 
                                    label={task.status.replace('_', ' ').toUpperCase()} 
                                    size="small" 
                                    sx={{ 
                                        backgroundColor: getStatusColor(task.status),
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Render task schedule comparison view
    const renderTaskComparisonView = () => {
        if (!comparisonMode) {
            return (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Current Week Task Schedule Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enable comparison mode to see original vs current schedule changes
                    </Typography>
                    
                    {/* Show current week tasks */}
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Current Week Tasks ({dayjs().startOf('week').format('MMM DD')} - {dayjs().endOf('week').format('MMM DD')})
                        </Typography>
                        {currentSchedule.map(task => (
                            <TaskCard key={task.id} task={task} isOriginal={false} showChanges={false} />
                        ))}
                    </Box>
                </Paper>
            );
        }

        switch (viewMode) {
            case 'sideBySide':
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Paper sx={{ p: 2, borderLeft: '4px solid #757575' }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#757575' }}>
                                    Original Schedule (Start of Week)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    What was planned initially
                                </Typography>
                                {originalSchedule.map(task => (
                                    <TaskCard key={task.id} task={task} isOriginal={true} />
                                ))}
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper sx={{ p: 2, borderLeft: '4px solid #2196f3' }}>
                                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                    Current Schedule (Now)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Actual current schedule with changes
                                </Typography>
                                {currentSchedule.map(task => (
                                    <TaskCard key={task.id} task={task} isOriginal={false} />
                                ))}
                            </Paper>
                        </Grid>
                    </Grid>
                );

            case 'overlay':
                return (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Schedule Changes Overview - Current Week
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Chip label="✅ On Schedule" color="primary" sx={{ mr: 1 }} />
                            <Chip label="📅 Rescheduled" color="warning" sx={{ mr: 1 }} />
                            <Chip label="✨ New Task" color="success" sx={{ mr: 1 }} />
                            <Chip label="⏸️ Postponed" color="error" variant="outlined" />
                        </Box>
                        {currentWeekTasks
                            .sort((a, b) => {
                                if (!a.currentDate) return 1;
                                if (!b.currentDate) return -1;
                                return a.currentDate.valueOf() - b.currentDate.valueOf();
                            })
                            .map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    isOriginal={false}
                                    showChanges={true}
                                />
                            ))}
                    </Paper>
                );

            case 'difference':
                const changedTasks = currentWeekTasks.filter(task => 
                    task.status === 'rescheduled' || task.status === 'new_task' || task.status === 'postponed'
                );

                return (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Schedule Changes Only - What Changed This Week
                        </Typography>
                        {changedTasks.length === 0 ? (
                            <Alert severity="success">
                                <Typography variant="subtitle2">Perfect! No schedule changes this week</Typography>
                                <Typography variant="body2">All tasks are running according to original plan</Typography>
                            </Alert>
                        ) : (
                            <>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">{changedTasks.length} schedule changes detected</Typography>
                                    <Typography variant="body2">Review the changes below and their reasons</Typography>
                                </Alert>
                                {changedTasks.map(task => (
                                    <TaskCard 
                                        key={task.id} 
                                        task={task} 
                                        isOriginal={false}
                                        showChanges={true}
                                    />
                                ))}
                            </>
                        )}
                    </Paper>
                );

            default:
                return null;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CompareArrowsIcon color="primary" />
                        Task Schedule Comparison Demo
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Compare original planned tasks vs current actual schedule for the current week
                    </Typography>
                </Box>

                {/* Controls */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={comparisonMode}
                                        onChange={(e) => setComparisonMode(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Enable Comparison Mode"
                            />
                        </Grid>

                        {comparisonMode && (
                            <>
                                <Grid item>
                                    <WeekPicker
                                        label="Base Week"
                                        value={baseWeek}
                                        onChange={setBaseWeek}
                                        color="primary"
                                    />
                                </Grid>

                                <Grid item>
                                    <WeekPicker
                                        label="Comparison Week"
                                        value={comparisonWeek}
                                        onChange={setComparisonWeek}
                                        color="warning"
                                    />
                                </Grid>

                                <Grid item>
                                    <Tooltip title="Swap weeks">
                                        <IconButton
                                            onClick={() => {
                                                const temp = baseWeek;
                                                setBaseWeek(comparisonWeek);
                                                setComparisonWeek(temp);
                                            }}
                                            color="primary"
                                        >
                                            <SwapHorizIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>

                                <Grid item>
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>View Mode</InputLabel>
                                        <Select
                                            value={viewMode}
                                            onChange={(e) => setViewMode(e.target.value)}
                                            label="View Mode"
                                        >
                                            <MenuItem value="overlay">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <VisibilityIcon fontSize="small" />
                                                    Overlay
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="sideBySide">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CompareArrowsIcon fontSize="small" />
                                                    Side by Side
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="difference">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AnalyticsIcon fontSize="small" />
                                                    Differences Only
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Paper>

                {/* Task Schedule Metrics Dashboard */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnalyticsIcon color="primary" />
                        {comparisonMode ? 'Schedule Change Metrics' : 'Current Week Overview'}
                    </Typography>
                    <Grid container spacing={2}>
                        {comparisonMode ? (
                            <>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="#757575">
                                                {metrics.originalTotal}h
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Original Plan
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {metrics.originalCount} tasks
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="primary">
                                                {metrics.currentTotal}h
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Current Plan
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {metrics.currentCount} tasks
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card sx={{ 
                                        textAlign: 'center', 
                                        backgroundColor: metrics.difference >= 0 ? '#e8f5e8' : '#ffebee' 
                                    }}>
                                        <CardContent>
                                            <Typography 
                                                variant="h4" 
                                                color={metrics.difference >= 0 ? 'success.main' : 'error.main'}
                                            >
                                                {metrics.difference >= 0 ? '+' : ''}{metrics.difference}h
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Hour Change
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                vs original
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="warning.main">
                                                {metrics.totalChanges}
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Total Changes
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                schedule modifications
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#f3e5f5' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="secondary.main">
                                                {metrics.percentageChange >= 0 ? '+' : ''}{metrics.percentageChange}%
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Workload Change
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                percentage change
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="primary">
                                                {metrics.currentTotal}h
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Total Hours
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                this week
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="success.main">
                                                {metrics.onScheduleTasks}
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                On Schedule
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                tasks unchanged
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="warning.main">
                                                {metrics.rescheduledTasks}
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Rescheduled
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                date changes
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                                        <CardContent>
                                            <Typography variant="h4" color="success.main">
                                                {metrics.newTasks}
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                New Tasks
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                added this week
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        )}
                    </Grid>
                    
                    {/* Change breakdown when in comparison mode */}
                    {comparisonMode && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Schedule Change Breakdown:</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={`✅ ${metrics.onScheduleTasks} On Schedule`} 
                                    color="primary" 
                                    size="small" 
                                />
                                <Chip 
                                    label={`📅 ${metrics.rescheduledTasks} Rescheduled`} 
                                    color="warning" 
                                    size="small" 
                                />
                                <Chip 
                                    label={`✨ ${metrics.newTasks} New Tasks`} 
                                    color="success" 
                                    size="small" 
                                />
                                <Chip 
                                    label={`⏸️ ${metrics.postponedTasks} Postponed`} 
                                    color="error" 
                                    size="small" 
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Main Task Schedule Comparison View */}
                <Box sx={{ mb: 3 }}>
                    {renderTaskComparisonView()}
                </Box>

                {/* Implementation Notes */}
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Implementation Features Demonstrated:
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Task schedule change tracking and comparison
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Original vs current schedule visualization
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Multiple view modes (Overview, Side-by-side, Changes Only)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Task status indicators (New, Rescheduled, Postponed, On Schedule)
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Schedule change metrics and analytics
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Reason tracking for schedule modifications
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Visual differentiation for different task states
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Current week focus with detailed change breakdown
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CalendarComparisonDemo;
