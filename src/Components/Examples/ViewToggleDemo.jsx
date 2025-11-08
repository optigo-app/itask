import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Chip,
    Paper,
    Divider
} from '@mui/material';
import {
    Person as PersonIcon,
    Assignment as TaskIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import ViewToggle, { ViewToggleAlt } from '../Common/ViewToggle';

const ViewToggleDemo = () => {
    const [taskView, setTaskView] = useState('list');
    const [userView, setUserView] = useState('grid');
    const [categoryView, setCategoryView] = useState('list');

    // Sample data
    const sampleTasks = [
        { id: 1, title: 'Complete project documentation', priority: 'High', status: 'In Progress', assignee: 'John Doe' },
        { id: 2, title: 'Review code changes', priority: 'Medium', status: 'Pending', assignee: 'Jane Smith' },
        { id: 3, title: 'Update user interface', priority: 'Low', status: 'Completed', assignee: 'Mike Johnson' },
        { id: 4, title: 'Fix critical bug', priority: 'Critical', status: 'In Progress', assignee: 'Sarah Wilson' }
    ];

    const sampleUsers = [
        { id: 1, name: 'John Doe', role: 'Developer', email: 'john@example.com', avatar: 'JD' },
        { id: 2, name: 'Jane Smith', role: 'Designer', email: 'jane@example.com', avatar: 'JS' },
        { id: 3, name: 'Mike Johnson', role: 'Manager', email: 'mike@example.com', avatar: 'MJ' },
        { id: 4, name: 'Sarah Wilson', role: 'Tester', email: 'sarah@example.com', avatar: 'SW' }
    ];

    const sampleCategories = [
        { id: 1, name: 'Development', count: 15, color: '#2196f3' },
        { id: 2, name: 'Design', count: 8, color: '#ff9800' },
        { id: 3, name: 'Testing', count: 12, color: '#4caf50' },
        { id: 4, name: 'Documentation', count: 5, color: '#9c27b0' }
    ];

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': '#4caf50',
            'Medium': '#ff9800',
            'High': '#f44336',
            'Critical': '#d32f2f'
        };
        return colors[priority] || '#757575';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#ff9800',
            'In Progress': '#2196f3',
            'Completed': '#4caf50'
        };
        return colors[status] || '#757575';
    };

    const renderTaskList = () => (
        <List>
            {sampleTasks.map((task) => (
                <ListItem key={task.id} divider>
                    <ListItemText
                        primary={task.title}
                        secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    sx={{
                                        backgroundColor: getPriorityColor(task.priority),
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                />
                                <Chip
                                    label={task.status}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: getStatusColor(task.status),
                                        color: getStatusColor(task.status),
                                        fontSize: '0.75rem'
                                    }}
                                />
                                <Typography variant="caption" sx={{ ml: 1, alignSelf: 'center' }}>
                                    Assigned to: {task.assignee}
                                </Typography>
                            </Box>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );

    const renderTaskGrid = () => (
        <Grid container spacing={2}>
            {sampleTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                                {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    sx={{
                                        backgroundColor: getPriorityColor(task.priority),
                                        color: 'white',
                                        alignSelf: 'flex-start'
                                    }}
                                />
                                <Chip
                                    label={task.status}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: getStatusColor(task.status),
                                        color: getStatusColor(task.status),
                                        alignSelf: 'flex-start'
                                    }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    {task.assignee}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderUserList = () => (
        <List>
            {sampleUsers?.map((user) => (
                <ListItem key={user.id} divider>
                    <Avatar sx={{ mr: 2, bgcolor: '#7367f0' }}>
                        {user.avatar}
                    </Avatar>
                    <ListItemText
                        primary={user.name}
                        secondary={
                            <Box>
                                <Typography variant="body2">{user.role}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {user.email}
                                </Typography>
                            </Box>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );

    const renderUserGrid = () => (
        <Grid container spacing={2}>
            {sampleUsers?.map((user) => (
                <Grid item xs={12} sm={6} md={3} key={user.id}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#7367f0', width: 56, height: 56 }}>
                            {user.avatar}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                            {user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {user.role}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {user.email}
                        </Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                ViewToggle Component Demo
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: 'textSecondary' }}>
                This demo showcases the ViewToggle component in different contexts with various styling options.
            </Typography>

            {/* Tasks Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TaskIcon />
                            Tasks
                        </Typography>
                        <ViewToggle
                            view={taskView}
                            onViewChange={setTaskView}
                            size="small"
                            variant="outlined"
                            showLabels={false}
                        />
                    </Box>
                    {taskView === 'list' ? renderTaskList() : renderTaskGrid()}
                </CardContent>
            </Card>

            {/* Users Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon />
                            Team Members
                        </Typography>
                        <ViewToggleAlt
                            view={userView}
                            onViewChange={setUserView}
                            size="medium"
                            showLabels={true}
                        />
                    </Box>
                    {userView === 'list' ? renderUserList() : renderUserGrid()}
                </CardContent>
            </Card>

            {/* Categories Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon />
                            Categories
                        </Typography>
                        <ViewToggle
                            view={categoryView}
                            onViewChange={setCategoryView}
                            size="large"
                            variant="contained"
                            showLabels={false}
                        />
                    </Box>
                    {categoryView === 'list' ? (
                        <List>
                            {sampleCategories?.map((category) => (
                                <ListItem key={category.id} divider>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            backgroundColor: category.color,
                                            mr: 2
                                        }}
                                    />
                                    <ListItemText
                                        primary={category.name}
                                        secondary={`${category.count} items`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Grid container spacing={2}>
                            {sampleCategories?.map((category) => (
                                <Grid item xs={12} sm={6} md={3} key={category.id}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                                            border: `2px solid ${category.color}30`
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: category.color,
                                                mx: 'auto',
                                                mb: 1
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {category.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {category.count} items
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Usage Examples
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Basic Usage:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', fontFamily: 'monospace', fontSize: '0.875rem', mb: 2 }}>
                        {`import ViewToggle from '../Common/ViewToggle';

<ViewToggle
    view={viewMode}
    onViewChange={setViewMode}
    size="small"
    variant="outlined"
    showLabels={false}
/>`}
                    </Paper>

                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Alternative Style:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', fontFamily: 'monospace', fontSize: '0.875rem', mb: 2 }}>
                        {`import { ViewToggleAlt } from '../Common/ViewToggle';

<ViewToggleAlt
    view={viewMode}
    onViewChange={setViewMode}
    size="medium"
    showLabels={true}
/>`}
                    </Paper>

                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Props:
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary="view"
                                secondary="Current view mode: 'list' or 'grid'"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="onViewChange"
                                secondary="Callback function when view changes"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="size"
                                secondary="Button size: 'small', 'medium', 'large'"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="variant"
                                secondary="Style variant: 'standard', 'outlined', 'contained'"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="showLabels"
                                secondary="Show text labels alongside icons"
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ViewToggleDemo;
