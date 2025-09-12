import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  Portal,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import { Save, Clear, Person, Schedule, Close } from '@mui/icons-material';
import dayjs from 'dayjs';

// Sample data - replace with actual data from your APIs
const sampleEmployees = [
  { id: 1, name: 'John Doe', department: 'Development', email: 'john@company.com' },
  { id: 2, name: 'Jane Smith', department: 'Design', email: 'jane@company.com' },
  { id: 3, name: 'Mike Johnson', department: 'Testing', email: 'mike@company.com' },
  { id: 4, name: 'Sarah Wilson', department: 'Management', email: 'sarah@company.com' },
  { id: 5, name: 'Alex Brown', department: 'Development', email: 'alex@company.com' },
];

const SideDrawerQuickTask = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const [taskText, setTaskText] = useState('');
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    assignees: [],
    workingHours: '',
    dueDate: dayjs().hour(20).minute(0).second(0),
    startDate: dayjs(),
  });

  const textAreaRef = useRef(null);
  const menuRef = useRef(null);

  // Dynamic positioning logic
  useEffect(() => {
    const lastAtIndex = taskText.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = taskText.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const currentWord = spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex);
      
      if (currentWord.length >= 0 && !textAfterAt.includes(' ')) {
        setCurrentMention(currentWord);
        setShowEmployeeMenu(true);
        setSelectedIndex(0);
        
        // Smart positioning for sidedrawer
        if (textAreaRef.current) {
          const rect = textAreaRef.current.getBoundingClientRect();
          const menuHeight = 200;
          const viewportHeight = window.innerHeight;
          const spaceAbove = rect.top;
          const spaceBelow = viewportHeight - rect.bottom;
          
          // Always try to show above in sidedrawer for better UX
          const showAbove = spaceAbove > menuHeight || spaceBelow < menuHeight;
          
          setMenuPosition({
            top: showAbove ? rect.top - menuHeight - 5 : rect.bottom + 5,
            left: rect.left,
            width: Math.min(rect.width, 320) // Constrain width for sidedrawer
          });
        }
      } else {
        setShowEmployeeMenu(false);
      }
    } else {
      setShowEmployeeMenu(false);
    }
  }, [taskText]);

  const handleTaskTextChange = (e) => {
    setTaskText(e.target.value);
    setSelectedIndex(0);
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
    const lastAtIndex = taskText.lastIndexOf('@');
    const beforeAt = taskText.substring(0, lastAtIndex);
    const afterMention = taskText.substring(lastAtIndex).replace(/@\w*/, `@${employee.name}`);
    
    setTaskText(beforeAt + afterMention + ' ');
    
    if (!formData.assignees.find(a => a.id === employee.id)) {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, employee]
      }));
    }
    
    setShowEmployeeMenu(false);
    setCurrentMention('');
    setSelectedIndex(0);
    
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!taskText.trim()) {
      return;
    }

    const taskData = {
      taskDescription: taskText,
      assignees: formData.assignees,
      workingHours: formData.workingHours,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      createdAt: dayjs().toISOString(),
    };

    onSubmit?.(taskData);
    handleClear();
  };

  const handleClear = () => {
    setTaskText('');
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

  const filteredEmployees = sampleEmployees.filter(emp => 
    emp.name.toLowerCase().includes(currentMention.toLowerCase())
  );

  if (!open) return null;

  return (
    <>
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            Quick Task
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Task Input */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              ref={textAreaRef}
              fullWidth
              multiline
              rows={4}
              label="What needs to be done?"
              value={taskText}
              onChange={handleTaskTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your task... Use @ to mention team members"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  lineHeight: 1.4,
                }
              }}
            />
            
            {/* Employee Menu */}
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
                            py: 0.5,
                            px: 1.5,
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
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <Avatar sx={{ 
                              width: 28, 
                              height: 28, 
                              fontSize: '12px',
                              bgcolor: index === selectedIndex ? theme.palette.primary.main : theme.palette.grey[400]
                            }}>
                              {employee.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={employee.name}
                            secondary={employee.department}
                            primaryTypographyProps={{ 
                              fontSize: '13px',
                              fontWeight: index === selectedIndex ? 600 : 400
                            }}
                            secondaryTypographyProps={{ 
                              fontSize: '11px',
                              color: theme.palette.text.secondary
                            }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem sx={{ py: 0.5, px: 1.5 }}>
                        <ListItemText
                          primary="No employees found"
                          primaryTypographyProps={{ 
                            fontSize: '13px', 
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

          {/* Selected Assignees */}
          {formData.assignees.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Assigned to:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.assignees.map((assignee) => (
                  <Chip
                    key={assignee.id}
                    label={assignee.name}
                    size="small"
                    variant="outlined"
                    color="primary"
                    onDelete={() => handleRemoveAssignee(assignee.id)}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Working Hours */}
          {formData.assignees.length > 0 && (
            <Box sx={{ 
              border: `1px dashed ${theme.palette.primary.main}`, 
              borderRadius: theme.shape.borderRadius, 
              p: 1.5, 
              bgcolor: theme.palette.primary.main + '08',
              mb: 2
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ 
                color: theme.palette.primary.main, 
                mb: 1.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Person sx={{ fontSize: 16, mr: 1 }} />
                Task Details
              </Typography>
              
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
                    <Schedule sx={{ color: 'text.secondary', fontSize: 18 }} />
                  ),
                }}
              />
            </Box>
          )}

          {/* Task Preview */}
          {taskText && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: theme.palette.grey[50], 
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Preview:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '13px' }}>
                {taskText}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.assignees.length > 0 && (
                  <Chip 
                    label={`${formData.assignees.length} assignee${formData.assignees.length > 1 ? 's' : ''}`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
                {formData.workingHours && (
                  <Chip 
                    label={`${formData.workingHours}h`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Footer Actions */}
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            size="small"
            color="secondary"
          >
            Clear
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            size="small"
            color="primary"
            disabled={!taskText.trim()}
          >
            Create
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SideDrawerQuickTask;
