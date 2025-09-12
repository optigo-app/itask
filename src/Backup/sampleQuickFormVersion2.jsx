import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Chip,
  Paper,
  Fade,
  Stack,
  Popper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  Portal
} from '@mui/material';
import { Save, Clear, Person, Flag, Schedule } from '@mui/icons-material';
import dayjs from 'dayjs';

// Sample data - replace with actual data from your APIs
const sampleEmployees = [
  { id: 1, name: 'John Doe', department: 'Development', email: 'john@company.com' },
  { id: 2, name: 'Jane Smith', department: 'Design', email: 'jane@company.com' },
  { id: 3, name: 'Mike Johnson', department: 'Testing', email: 'mike@company.com' },
  { id: 4, name: 'Sarah Wilson', department: 'Management', email: 'sarah@company.com' },
  { id: 5, name: 'Alex Brown', department: 'Development', email: 'alex@company.com' },
];

const sampleStatuses = [
  { id: 1, labelname: 'To Do', color: '#1976d2' },
  { id: 2, labelname: 'In Progress', color: '#ed6c02' },
  { id: 3, labelname: 'Review', color: '#9c27b0' },
  { id: 4, labelname: 'Completed', color: '#2e7d32' },
];

const samplePriorities = [
  { id: 1, labelname: 'High', color: '#d32f2f' },
  { id: 2, labelname: 'Medium', color: '#ed6c02' },
  { id: 3, labelname: 'Low', color: '#2e7d32' },
];

const SampleQuickFormVersion2 = () => {
  const theme = useTheme();
  const [taskText, setTaskText] = useState('');
  const [showFields, setShowFields] = useState(false);
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    assignees: [],
    workingHours: '',
    dueDate: dayjs().hour(20).minute(0).second(0), // Current date at 8 PM
    startDate: dayjs(), // Current date and time
  });

  const textAreaRef = useRef(null);
  const menuRef = useRef(null);

  // Check for @ symbol and handle employee menu
  useEffect(() => {
    const lastAtIndex = taskText.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = taskText.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const currentWord = spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex);
      
      if (currentWord.length >= 0 && !textAfterAt.includes(' ')) {
        setCurrentMention(currentWord);
        setShowEmployeeMenu(true);
        setSelectedIndex(0); // Reset selection when menu opens
        
        // Calculate dynamic menu position
        if (textAreaRef.current) {
          const rect = textAreaRef.current.getBoundingClientRect();
          const menuHeight = 200;
          const viewportHeight = window.innerHeight;
          const spaceAbove = rect.top;
          const spaceBelow = viewportHeight - rect.bottom;
          
          // Determine if menu should appear above or below
          const showAbove = spaceAbove > menuHeight && spaceBelow < menuHeight;
          
          setMenuPosition({
            top: showAbove ? rect.top - menuHeight - 10 : rect.bottom + 5,
            left: rect.left,
            width: rect.width
          });
        }
      } else {
        setShowEmployeeMenu(false);
      }
    } else {
      setShowEmployeeMenu(false);
    }
    
    // Show fields if we have assignees
    if (formData.assignees.length > 0) {
      setShowFields(true);
    } else {
      setShowFields(false);
    }
  }, [taskText, formData.assignees]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTaskTextChange = (e) => {
    setTaskText(e.target.value);
    setSelectedIndex(0); // Reset selection when typing
  };

  const handleKeyDown = (e) => {
    if (!showEmployeeMenu) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredEmployees.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredEmployees.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredEmployees[selectedIndex]) {
          handleEmployeeSelect(filteredEmployees[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowEmployeeMenu(false);
        setCurrentMention('');
        break;
      default:
        break;
    }
  };

  const handleEmployeeSelect = (employee) => {
    // Replace the current @mention with the selected employee
    const lastAtIndex = taskText.lastIndexOf('@');
    const beforeAt = taskText.substring(0, lastAtIndex);
    const afterMention = taskText.substring(lastAtIndex).replace(/@\w*/, `@${employee.name}`);
    
    setTaskText(beforeAt + afterMention + ' ');
    
    // Add employee to assignees if not already added
    if (!formData.assignees.find(a => a.id === employee.id)) {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, employee]
      }));
    }
    
    setShowEmployeeMenu(false);
    setCurrentMention('');
    setSelectedIndex(0);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 100);
  };

  const handleRemoveAssignee = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(a => a.id !== employeeId)
    }));
  };

  const filteredEmployees = sampleEmployees.filter(emp => 
    emp.name.toLowerCase().includes(currentMention.toLowerCase())
  );

  const handleSubmit = () => {
    if (!taskText.trim()) {
      alert('Please enter a task description');
      return;
    }

    const taskData = {
      taskDescription: taskText,
      assignees: formData.assignees,
      status: formData.status,
      priority: formData.priority,
      workingHours: formData.workingHours,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      createdAt: dayjs().toISOString(),
    };

    console.log('Task created:', taskData);
    alert('Task created successfully!');
    handleClear();
  };

  const handleClear = () => {
    setTaskText('');
    setShowFields(false);
    setShowEmployeeMenu(false);
    setCurrentMention('');
    setSelectedIndex(0);
    setFormData({
      assignees: [],
      workingHours: '',
      dueDate: dayjs().hour(20).minute(0).second(0),
      startDate: dayjs(),
    });
  };

  const extractMentions = (text) => {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(mention => mention.substring(1));
  };

  const mentions = extractMentions(taskText);

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, margin: '20px auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Quick Task Creator v2
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start typing your task. Use @ to mention people and unlock more options
          <br />
          <Typography component="span" variant="caption" sx={{ 
            fontStyle: 'italic',
            color: theme.palette.text.disabled
          }}>
            Keyboard shortcuts: ↑↓ navigate • Enter select • Esc close
          </Typography>
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            {/* Main Task Input */}
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  ref={textAreaRef}
                  fullWidth
                  multiline
                  rows={4}
                  label="What needs to be done?"
                  value={taskText}
                  onChange={handleTaskTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your task here... Use @ to mention team members (↑↓ to navigate, Enter to select, Esc to close)"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '16px',
                      lineHeight: 1.5,
                    }
                  }}
                />
                
                {/* Employee Selection Menu */}
                {showEmployeeMenu && (
                  <Portal>
                    <Paper
                      ref={menuRef}
                      elevation={8}
                      sx={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        width: Math.max(menuPosition.width, 280),
                        zIndex: theme.zIndex.modal + 1,
                        maxHeight: 200,
                        overflow: 'auto',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[8],
                        bgcolor: theme.palette.background.paper
                      }}
                    >
                      <List dense sx={{ py: 0.5 }}>
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee, index) => (
                            <ListItem
                              key={employee.id}
                              button
                              selected={index === selectedIndex}
                              onClick={() => handleEmployeeSelect(employee)}
                              sx={{
                                py: 1,
                                px: 2,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover
                                },
                                '&.Mui-selected': {
                                  backgroundColor: theme.palette.primary.light + '20',
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.light + '30'
                                  }
                                }
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  fontSize: '14px',
                                  bgcolor: index === selectedIndex ? theme.palette.primary.main : theme.palette.grey[400],
                                  color: index === selectedIndex ? theme.palette.primary.contrastText : theme.palette.text.primary
                                }}>
                                  {employee.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={employee.name}
                                secondary={employee.department}
                                primaryTypographyProps={{ 
                                  fontSize: '14px',
                                  fontWeight: index === selectedIndex ? 600 : 400,
                                  color: index === selectedIndex ? theme.palette.primary.main : theme.palette.text.primary
                                }}
                                secondaryTypographyProps={{ 
                                  fontSize: '12px',
                                  color: theme.palette.text.secondary
                                }}
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem sx={{ py: 1, px: 2 }}>
                            <ListItemText
                              primary="No employees found"
                              primaryTypographyProps={{ 
                                fontSize: '14px', 
                                color: theme.palette.text.secondary,
                                fontStyle: 'italic'
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Portal>
                )}
              </Box>
              
              {/* Show selected assignees */}
              {formData.assignees.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned to:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {formData.assignees.map((assignee) => (
                      <Chip
                        key={assignee.id}
                        label={assignee.name}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onDelete={() => handleRemoveAssignee(assignee.id)}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Grid>

            {/* Additional Fields - Show when @ is detected */}
            <Fade in={showFields}>
              <Grid item xs={12}>
                <Box sx={{ 
                  border: `1px dashed ${theme.palette.primary.main}`, 
                  borderRadius: theme.shape.borderRadius, 
                  p: 2, 
                  bgcolor: theme.palette.primary.main + '08'
                }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', mb: 2 }}>
                    <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Additional Task Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Working Hours */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Working Hours"
                        type="number"
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        placeholder="0"
                        size="small"
                        inputProps={{ min: 0, step: 0.5 }}
                        InputProps={{
                          endAdornment: (
                            <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Fade>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClear}
          color="secondary"
        >
          Clear
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          color="primary"
          disabled={!taskText.trim()}
        >
          Create Task
        </Button>
      </Box>

      {/* Task Preview */}
      {taskText && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Task Preview:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {taskText}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {formData.assignees.length > 0 && (
              <Chip 
                label={`Assignees: ${formData.assignees.length}`} 
                size="small" 
                variant="outlined" 
              />
            )}
            {formData.workingHours && (
              <Chip 
                label={`Hours: ${formData.workingHours}`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default SampleQuickFormVersion2;
