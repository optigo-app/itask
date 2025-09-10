import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Grid,
    Switch,
    FormControlLabel,
    Chip,
    Paper,
    Alert,
    IconButton,
    Tooltip,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const CalendarViewDemo = () => {
    const [showComparison, setShowComparison] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const calendarRef = useRef();

    // Sample task data with enhanced visual differentiation
    const [taskData] = useState({
        originalTasks: [
            {
                id: 'original-1',
                title: '📅 Database Migration (Original)',
                start: dayjs().startOf('week').add(1, 'day').hour(9).format(),
                end: dayjs().startOf('week').add(1, 'day').hour(13).format(),
                category: 'Development',
                priority: 'High',
                assignee: 'John Doe',
                status: 'original',
                backgroundColor: 'rgba(158, 158, 158, 0.2)',
                borderColor: '#9e9e9e',
                textColor: '#616161',
                classNames: ['original-task'],
                extendedProps: {
                    priority: 'High',
                    assignee: 'John Doe',
                    status: 'original',
                    classNames: ['original-task']
                }
            },
            {
                id: 'original-2',
                title: '✅ API Testing (Original)',
                start: dayjs().startOf('week').add(2, 'day').hour(9).format(),
                end: dayjs().startOf('week').add(2, 'day').hour(12).format(),
                category: 'Testing',
                priority: 'Medium',
                assignee: 'Jane Smith',
                status: 'original',
                backgroundColor: 'rgba(158, 158, 158, 0.2)',
                borderColor: '#9e9e9e',
                textColor: '#616161',
                classNames: ['original-overlay-task'],
                extendedProps: {
                    priority: 'Medium',
                    assignee: 'Jane Smith',
                    status: 'original',
                    classNames: ['original-overlay-task']
                }
            },
            {
                id: 'original-3',
                title: 'Client Presentation',
                start: dayjs().startOf('week').add(4, 'day').hour(14).format(),
                end: dayjs().startOf('week').add(4, 'day').hour(16).format(),
                category: 'Meeting',
                priority: 'High',
                assignee: 'John Doe',
                status: 'original',
                backgroundColor: 'rgba(158, 158, 158, 0.3)',
                borderColor: '#9e9e9e',
                textColor: '#616161',
                classNames: ['original-task']
            },
            {
                id: 'original-4',
                title: 'Code Documentation',
                start: dayjs().startOf('week').add(5, 'day').hour(10).format(),
                end: dayjs().startOf('week').add(5, 'day').hour(12).format(),
                category: 'Documentation',
                priority: 'Low',
                assignee: 'Jane Smith',
                status: 'original',
                backgroundColor: 'rgba(158, 158, 158, 0.3)',
                borderColor: '#9e9e9e',
                textColor: '#616161',
                classNames: ['original-task']
            }
        ],
        currentTasks: [
            {
                id: 'current-1',
                title: '📅 Database Migration',
                start: dayjs().startOf('week').add(3, 'day').hour(10).format(), // Rescheduled
                end: dayjs().startOf('week').add(3, 'day').hour(14).format(),
                category: 'Development',
                priority: 'High',
                assignee: 'John Doe',
                status: 'rescheduled',
                changeReason: 'Dependencies not ready',
                originalDate: dayjs().startOf('week').add(1, 'day').format('MMM DD'),
                backgroundColor: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                borderColor: '#ff9800',
                textColor: '#e65100',
                classNames: ['rescheduled-task', 'pulse-animation'],
                extendedProps: {
                    priority: 'High',
                    assignee: 'John Doe',
                    status: 'rescheduled',
                    classNames: ['rescheduled-task', 'pulse-animation']
                }
            },
            {
                id: 'current-2',
                title: '✅ API Testing',
                start: dayjs().startOf('week').add(2, 'day').hour(9).format(), // Same as original
                end: dayjs().startOf('week').add(2, 'day').hour(12).format(),
                category: 'Testing',
                priority: 'Medium',
                assignee: 'Jane Smith',
                status: 'on_schedule',
                backgroundColor: 'linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%)',
                borderColor: '#4caf50',
                textColor: '#2e7d32',
                classNames: ['on-schedule-task']
            },
            {
                id: 'current-3',
                title: '📅 Client Presentation',
                start: dayjs().startOf('week').add(5, 'day').hour(14).format(), // Moved to Friday
                end: dayjs().startOf('week').add(5, 'day').hour(16).format(),
                category: 'Meeting',
                priority: 'High',
                assignee: 'John Doe',
                status: 'rescheduled',
                changeReason: 'Client availability',
                originalDate: dayjs().startOf('week').add(4, 'day').format('MMM DD'),
                backgroundColor: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                borderColor: '#ff9800',
                textColor: '#e65100',
                classNames: ['rescheduled-task', 'pulse-animation']
            },
            {
                id: 'current-4',
                title: '✨ Bug Fixes Sprint',
                start: dayjs().startOf('week').add(1, 'day').hour(9).format(), // New task
                end: dayjs().startOf('week').add(1, 'day').hour(15).format(),
                category: 'Development',
                priority: 'Critical',
                assignee: 'John Doe',
                status: 'new_task',
                changeReason: 'Critical production issues',
                backgroundColor: 'linear-gradient(135deg, #e1f5fe 0%, #81d4fa 100%)',
                borderColor: '#03a9f4',
                textColor: '#01579b',
                classNames: ['new-task', 'glow-animation']
            }
        ],
        postponedTasks: [
            {
                id: 'postponed-1',
                title: 'Code Documentation',
                originalStart: dayjs().startOf('week').add(5, 'day').hour(10).format(),
                postponedTo: dayjs().startOf('week').add(7, 'day').hour(10).format(),
                category: 'Documentation',
                priority: 'Low',
                assignee: 'Jane Smith',
                status: 'postponed',
                changeReason: 'Higher priority tasks added'
            }
        ]
    });

    // Get events based on comparison mode
    const getCalendarEvents = () => {
        if (!showComparison) {
            return taskData.currentTasks;
        }
        
        // Show both original and current with enhanced visual differentiation
        const originalEvents = taskData.originalTasks.map(task => ({
            ...task,
            title: `🔍 [ORIGINAL] ${task.title}`,
            backgroundColor: 'repeating-linear-gradient(45deg, rgba(158, 158, 158, 0.2), rgba(158, 158, 158, 0.2) 10px, rgba(200, 200, 200, 0.3) 10px, rgba(200, 200, 200, 0.3) 20px)',
            borderColor: '#757575',
            textColor: '#424242',
            display: 'background',
            classNames: ['original-overlay-task']
        }));
        
        return [...originalEvents, ...taskData.currentTasks];
    };

    // Calculate metrics
    const calculateMetrics = () => {
        const originalHours = taskData.originalTasks.reduce((sum, task) => {
            const start = dayjs(task.start);
            const end = dayjs(task.end);
            return sum + end.diff(start, 'hour');
        }, 0);
        
        const currentHours = taskData.currentTasks.reduce((sum, task) => {
            const start = dayjs(task.start);
            const end = dayjs(task.end);
            return sum + end.diff(start, 'hour');
        }, 0);
        
        const rescheduled = taskData.currentTasks.filter(t => t.status === 'rescheduled').length;
        const newTasks = taskData.currentTasks.filter(t => t.status === 'new_task').length;
        const onSchedule = taskData.currentTasks.filter(t => t.status === 'on_schedule').length;
        const postponed = taskData.postponedTasks.length;
        
        return {
            originalHours,
            currentHours,
            difference: currentHours - originalHours,
            rescheduled,
            newTasks,
            onSchedule,
            postponed,
            totalChanges: rescheduled + newTasks + postponed
        };
    };

    const metrics = calculateMetrics();

    // Handle event click
    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const taskId = event.id;
        const currentTask = taskData.currentTasks.find(t => t.id === taskId);
        
        if (currentTask) {
            setSelectedEvent(currentTask);
            setDialogOpen(true);
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'rescheduled': return '📅';
            case 'new_task': return '✨';
            case 'on_schedule': return '✅';
            case 'postponed': return '⏸️';
            default: return '📋';
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'rescheduled': return 'warning';
            case 'new_task': return 'success';
            case 'on_schedule': return 'primary';
            case 'postponed': return 'error';
            default: return 'default';
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon color="primary" />
                        Calendar View - Task Schedule Comparison
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Visual calendar representation of original vs current task schedules
                    </Typography>
                </Box>

                {/* Controls */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showComparison}
                                        onChange={(e) => setShowComparison(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Show Original vs Current Comparison"
                            />
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    label="✅ On Schedule" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%)',
                                        color: '#2e7d32',
                                        fontWeight: 'bold'
                                    }}
                                    size="small" 
                                />
                                <Chip 
                                    label="📅 Rescheduled" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                                        color: '#e65100',
                                        fontWeight: 'bold',
                                        animation: 'pulse 2s infinite'
                                    }}
                                    size="small" 
                                />
                                <Chip 
                                    label="✨ New Task" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #e1f5fe 0%, #81d4fa 100%)',
                                        color: '#01579b',
                                        fontWeight: 'bold',
                                        boxShadow: '0 0 10px rgba(3, 169, 244, 0.5)'
                                    }}
                                    size="small" 
                                />
                                {showComparison && (
                                    <Chip 
                                        label="🔍 Original Plan" 
                                        sx={{
                                            background: 'repeating-linear-gradient(45deg, rgba(158, 158, 158, 0.3), rgba(158, 158, 158, 0.3) 5px, rgba(200, 200, 200, 0.4) 5px, rgba(200, 200, 200, 0.4) 10px)',
                                            color: '#424242',
                                            border: '2px dashed #757575'
                                        }}
                                        variant="outlined" 
                                        size="small" 
                                    />
                                )}
                                <Chip 
                                    label="⏸️ Postponed" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                        color: '#c62828',
                                        fontWeight: 'bold',
                                        opacity: 0.7
                                    }}
                                    size="small" 
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Metrics Dashboard */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="primary" />
                        Schedule Overview - Current Week
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                                <CardContent>
                                    <Typography variant="h4" color="primary">
                                        {metrics.currentHours}h
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Current Hours
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {taskData.currentTasks.length} tasks
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                                <CardContent>
                                    <Typography variant="h4" color="success.main">
                                        {metrics.onSchedule}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        On Schedule
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        no changes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
                                <CardContent>
                                    <Typography variant="h4" color="warning.main">
                                        {metrics.rescheduled}
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
                        <Grid item xs={12} sm={6} md={2.4}>
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
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ textAlign: 'center', backgroundColor: '#ffebee' }}>
                                <CardContent>
                                    <Typography variant="h4" color="error.main">
                                        {metrics.postponed}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Postponed
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        moved to next week
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Change Summary */}
                    {metrics.totalChanges > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">
                                {metrics.totalChanges} schedule changes detected this week
                            </Typography>
                            <Typography variant="body2">
                                Workload {metrics.difference >= 0 ? 'increased' : 'decreased'} by {Math.abs(metrics.difference)} hours
                                {showComparison ? ' (original plan shown as background events)' : ''}
                            </Typography>
                        </Alert>
                    )}
                </Paper>

                {/* Calendar with Enhanced Styling */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <style>
                        {`
                            /* Enhanced Calendar Animations and Styles */
                            @keyframes pulse {
                                0% { transform: scale(1); opacity: 1; }
                                50% { transform: scale(1.02); opacity: 0.8; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                            
                            @keyframes glow {
                                0% { box-shadow: 0 0 5px rgba(3, 169, 244, 0.5); }
                                50% { box-shadow: 0 0 20px rgba(3, 169, 244, 0.8), 0 0 30px rgba(3, 169, 244, 0.6); }
                                100% { box-shadow: 0 0 5px rgba(3, 169, 244, 0.5); }
                            }
                            
                            @keyframes slideIn {
                                from { transform: translateX(-10px); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                            
                            /* Task-specific styling */
                            .fc-event.rescheduled-task {
                                animation: pulse 3s infinite;
                                border-left: 5px solid #ff5722 !important;
                                border-radius: 8px !important;
                                box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3) !important;
                            }
                            
                            .fc-event.new-task {
                                animation: glow 2s infinite;
                                border-left: 5px solid #2196f3 !important;
                                border-radius: 8px !important;
                                position: relative;
                            }
                            
                            .fc-event.new-task::before {
                                content: "NEW";
                                position: absolute;
                                top: -8px;
                                right: -8px;
                                background: #ff4444;
                                color: white;
                                font-size: 8px;
                                padding: 2px 4px;
                                border-radius: 3px;
                                font-weight: bold;
                                z-index: 10;
                            }
                            
                            .fc-event.on-schedule-task {
                                border-left: 5px solid #4caf50 !important;
                                border-radius: 8px !important;
                                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2) !important;
                                animation: slideIn 0.5s ease-out;
                            }
                            
                            .fc-event.original-task {
                                opacity: 0.4 !important;
                                border: 2px dashed #757575 !important;
                                background: repeating-linear-gradient(
                                    45deg,
                                    rgba(158, 158, 158, 0.1),
                                    rgba(158, 158, 158, 0.1) 10px,
                                    rgba(200, 200, 200, 0.2) 10px,
                                    rgba(200, 200, 200, 0.2) 20px
                                ) !important;
                            }
                            
                            .fc-event.original-overlay-task {
                                opacity: 0.3 !important;
                                border: 3px dashed #9e9e9e !important;
                                background: repeating-linear-gradient(
                                    -45deg,
                                    rgba(158, 158, 158, 0.1),
                                    rgba(158, 158, 158, 0.1) 8px,
                                    rgba(200, 200, 200, 0.2) 8px,
                                    rgba(200, 200, 200, 0.2) 16px
                                ) !important;
                                z-index: 1 !important;
                            }
                            
                            /* Priority indicators */
                            .fc-event[data-priority="Critical"]::after {
                                content: "🔥";
                                position: absolute;
                                top: 2px;
                                right: 2px;
                                font-size: 12px;
                            }
                            
                            .fc-event[data-priority="High"]::after {
                                content: "⚡";
                                position: absolute;
                                top: 2px;
                                right: 2px;
                                font-size: 12px;
                            }
                            
                            /* Hover effects */
                            .fc-event:hover {
                                transform: scale(1.02) !important;
                                transition: all 0.2s ease !important;
                                z-index: 999 !important;
                            }
                            
                            .fc-event.rescheduled-task:hover {
                                box-shadow: 0 4px 16px rgba(255, 152, 0, 0.5) !important;
                            }
                            
                            .fc-event.new-task:hover {
                                box-shadow: 0 4px 16px rgba(3, 169, 244, 0.6) !important;
                            }
                            
                            .fc-event.on-schedule-task:hover {
                                box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4) !important;
                            }
                            
                            /* Calendar grid enhancements */
                            .fc-timegrid-slot {
                                border-color: rgba(0, 0, 0, 0.05) !important;
                            }
                            
                            .fc-timegrid-slot:hover {
                                background-color: rgba(33, 150, 243, 0.05) !important;
                            }
                            
                            .fc-col-header-cell {
                                background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%) !important;
                                font-weight: bold !important;
                            }
                            
                            .fc-today {
                                background-color: rgba(33, 150, 243, 0.08) !important;
                            }
                            
                            /* Event text styling */
                            .fc-event-title {
                                font-weight: 600 !important;
                                font-size: 12px !important;
                                line-height: 1.2 !important;
                            }
                            
                            .fc-event-time {
                                font-weight: 500 !important;
                                font-size: 10px !important;
                            }
                        `}
                    </style>
                    <Box sx={{ height: 600 }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={getCalendarEvents()}
                            eventClick={handleEventClick}
                            height="100%"
                            slotMinTime="08:00:00"
                            slotMaxTime="18:00:00"
                            allDaySlot={false}
                            eventDisplay="block"
                            dayMaxEvents={false}
                            eventOverlap={true}
                            selectOverlap={true}
                            eventClassNames={(arg) => {
                                return arg.event.extendedProps.classNames || [];
                            }}
                            eventDidMount={(info) => {
                                // Add priority data attribute for CSS styling
                                if (info.event.extendedProps.priority) {
                                    info.el.setAttribute('data-priority', info.event.extendedProps.priority);
                                }
                                
                                // Add custom tooltip
                                info.el.setAttribute('title', 
                                    `${info.event.title}\n` +
                                    `Status: ${info.event.extendedProps.status || 'N/A'}\n` +
                                    `Priority: ${info.event.extendedProps.priority || 'N/A'}\n` +
                                    `Assignee: ${info.event.extendedProps.assignee || 'N/A'}`
                                );
                            }}
                        />
                    </Box>
                </Paper>

                {/* Postponed Tasks */}
                {taskData.postponedTasks.length > 0 && (
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            ⏸️ Postponed Tasks
                        </Typography>
                        {taskData.postponedTasks.map(task => (
                            <Card key={task.id} sx={{ mb: 1, opacity: 0.7, border: '2px dashed #f44336' }}>
                                <CardContent sx={{ py: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {task.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Originally: {dayjs(task.originalStart).format('ddd, MMM DD HH:mm')}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                                                Reason: {task.changeReason}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label="POSTPONED" 
                                            color="error" 
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                )}

                {/* Task Detail Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedEvent && getStatusIcon(selectedEvent.status)}
                        Task Details
                    </DialogTitle>
                    <DialogContent>
                        {selectedEvent && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {selectedEvent.title}
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip 
                                            label={selectedEvent.status.replace('_', ' ').toUpperCase()} 
                                            color={getStatusColor(selectedEvent.status)}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Priority
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedEvent.priority}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Assignee
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedEvent.assignee}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Category
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedEvent.category}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Schedule
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {dayjs(selectedEvent.start).format('ddd, MMM DD HH:mm')} - {dayjs(selectedEvent.end).format('HH:mm')}
                                        </Typography>
                                    </Grid>
                                    
                                    {selectedEvent.status === 'rescheduled' && (
                                        <Grid item xs={12}>
                                            <Alert severity="warning">
                                                <Typography variant="subtitle2">Rescheduled</Typography>
                                                <Typography variant="body2">
                                                    Originally planned for: {selectedEvent.originalDate}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Reason: {selectedEvent.changeReason}
                                                </Typography>
                                            </Alert>
                                        </Grid>
                                    )}
                                    
                                    {selectedEvent.status === 'new_task' && (
                                        <Grid item xs={12}>
                                            <Alert severity="success">
                                                <Typography variant="subtitle2">New Task Added</Typography>
                                                <Typography variant="body2">
                                                    Reason: {selectedEvent.changeReason}
                                                </Typography>
                                            </Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Implementation Notes */}
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Calendar View Features Demonstrated:
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ FullCalendar integration with task data
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Visual differentiation for task statuses
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Original vs current schedule overlay
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Interactive event details on click
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Real-time metrics dashboard
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Postponed tasks separate display
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Color-coded status indicators
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ✅ Schedule change reasons and tracking
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CalendarViewDemo;
