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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Save, Clear, Person, Schedule, Close, ExpandMore, Help } from '@mui/icons-material';
import dayjs from 'dayjs';

// Sample data
const sampleEmployees = [
  { id: 1, name: 'Alice', department: 'Development', email: 'alice@company.com' },
  { id: 2, name: 'Bob', department: 'Design', email: 'bob@company.com' },
  { id: 3, name: 'John', department: 'Testing', email: 'john@company.com' },
  { id: 4, name: 'Mary', department: 'Management', email: 'mary@company.com' },
  { id: 5, name: 'Tom', department: 'Development', email: 'tom@company.com' },
  { id: 6, name: 'David', department: 'Marketing', email: 'david@company.com' },
];

const sampleCategories = ['Volunteering', 'Outreach', 'Event', 'Logistics', 'Development', 'Testing', 'Design'];
const samplePriorities = ['Low', 'Medium', 'High', 'Critical'];
const sampleStatuses = ['Open', 'InProgress', 'Scheduled', 'Review', 'Completed'];

const StructuredQuickTask = ({ open = true, onClose, onSubmit }) => {
  const theme = useTheme();
  const [taskText, setTaskText] = useState('');
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [parsedTasks, setParsedTasks] = useState([]);

  const textAreaRef = useRef(null);
  const menuRef = useRef(null);

  // Parse structured task format
  const parseStructuredTasks = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const tasks = [];
    let currentMainTask = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Determine task level based on indentation
      const level = line.match(/^(\s*-*\s*)/)[1].length;
      const isMainTask = !line.startsWith('-') && !line.startsWith(' -');
      const isSubTask = line.startsWith('- ') || line.startsWith(' - ');
      const isSubSubTask = line.startsWith('-- ') || line.startsWith(' -- ');

      // Extract task content and metadata
      const taskData = extractTaskMetadata(trimmedLine.replace(/^-+\s*/, ''));

      const task = {
        id: Date.now() + Math.random(),
        level: isMainTask ? 0 : isSubTask ? 1 : 2,
        ...taskData
      };

      if (isMainTask) {
        currentMainTask = task;
        tasks.push(task);
      } else if (currentMainTask) {
        if (!currentMainTask.subtasks) currentMainTask.subtasks = [];
        if (isSubTask) {
          task.parentId = currentMainTask.id;
          currentMainTask.subtasks.push(task);
        } else if (isSubSubTask && currentMainTask.subtasks.length > 0) {
          const lastSubTask = currentMainTask.subtasks[currentMainTask.subtasks.length - 1];
          if (!lastSubTask.subtasks) lastSubTask.subtasks = [];
          task.parentId = lastSubTask.id;
          lastSubTask.subtasks.push(task);
        }
      }
    });

    return tasks;
  };

  // Extract metadata from task text
  const extractTaskMetadata = (text) => {
    const assignees = [];
    const categories = [];
    let priority = null;
    let status = null;
    let dueDate = null;
    let estimate = null;
    let notes = null;

    // Extract assignees (@Name)
    const assigneeMatches = text.match(/@(\w+)/g);
    if (assigneeMatches) {
      assigneeMatches.forEach(match => {
        const name = match.substring(1);
        const employee = sampleEmployees.find(emp =>
          emp.name.toLowerCase() === name.toLowerCase()
        );
        if (employee) assignees.push(employee);
      });
    }

    // Extract due date (+date time)
    const dateMatch = text.match(/\+([^#!%~"]+?)(?=\s*[#!%~"]|$)/);
    if (dateMatch) {
      dueDate = dateMatch[1].trim();
    }

    // Extract category (#Category)
    const categoryMatch = text.match(/#(\w+)/);
    if (categoryMatch) {
      categories.push(categoryMatch[1]);
    }

    // Extract priority (!Priority)
    const priorityMatch = text.match(/!(\w+)/);
    if (priorityMatch) {
      priority = priorityMatch[1];
    }

    // Extract status (%Status)
    const statusMatch = text.match(/%(\w+)/);
    if (statusMatch) {
      status = statusMatch[1];
    }

    // Extract estimate (~estimate)
    const estimateMatch = text.match(/~([^@+#!%"]+?)(?=\s*[@+#!%"]|$)/);
    if (estimateMatch) {
      estimate = estimateMatch[1].trim();
    }

    // Extract notes ("notes")
    const notesMatch = text.match(/"([^"]+)"/);
    if (notesMatch) {
      notes = notesMatch[1];
    }

    // Clean task name by removing metadata
    const cleanTaskName = text
      .replace(/@\w+/g, '')
      .replace(/\+[^#!%~"]+/g, '')
      .replace(/#\w+/g, '')
      .replace(/!\w+/g, '')
      .replace(/%\w+/g, '')
      .replace(/~[^@+#!%"]+/g, '')
      .replace(/"[^"]+"/g, '')
      .trim();

    return {
      taskName: cleanTaskName,
      assignees,
      categories,
      priority,
      status,
      dueDate,
      estimate,
      notes
    };
  };

  // Handle @ mentions
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

        if (textAreaRef.current) {
          const rect = textAreaRef.current.getBoundingClientRect();
          const menuHeight = 200;
          const viewportHeight = window.innerHeight;
          const spaceAbove = rect.top;
          const spaceBelow = viewportHeight - rect.bottom;

          const showAbove = spaceAbove > menuHeight || spaceBelow < menuHeight;

          setMenuPosition({
            top: showAbove ? rect.top - menuHeight - 5 : rect.bottom + 5,
            left: rect.left,
            width: Math.min(rect.width, 320)
          });
        }
      } else {
        setShowEmployeeMenu(false);
      }
    } else {
      setShowEmployeeMenu(false);
    }

    // Parse tasks when text changes
    if (taskText.trim()) {
      const parsed = parseStructuredTasks(taskText);
      setParsedTasks(parsed);
    } else {
      setParsedTasks([]);
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
    setShowEmployeeMenu(false);
    setCurrentMention('');
    setSelectedIndex(0);

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 100);
  };

  const handleSubmit = () => {
    if (!taskText.trim()) return;

    const structuredTasks = parseStructuredTasks(taskText);
    console.log('Structured Tasks Created:', structuredTasks);
    alert(`Created ${structuredTasks.length} main tasks with subtasks!`);
    onSubmit?.(structuredTasks);
    handleClear();
  };

  const handleClear = () => {
    setTaskText('');
    setShowEmployeeMenu(false);
    setCurrentMention('');
    setSelectedIndex(0);
    setParsedTasks([]);
  };

  const filteredEmployees = sampleEmployees.filter(emp =>
    emp.name.toLowerCase().includes(currentMention.toLowerCase())
  );

  const exampleText = `Organize Food Drive @Alice @Bob +September 1 9am #Volunteering !High %InProgress ~5d
- Reach out to local businesses @John #Outreach !Medium %Open ~2d
-- Grocery stores @Mary #Outreach !Low %Open ~4h
-- Restaurants @Alice @Tom #Outreach !Low %Open ~4h
-- Religious organizations @David #Outreach !Low %Open ~6h
- Kickoff event +September 1 7pm @Alice #Event !High %Scheduled ~3h
- Pickup donations +October 1 3pm @Bob #Logistics !High %Open ~1d
-- "Make sure to book the trucks!" +September 15 12pm @Mary @Tom #Logistics !High %Open ~2h`;

  if (!open) return null;

  return (
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
          Structured Quick Add
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Help Section */}
        <Accordion sx={{ mx: 2, mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
              <Help sx={{ fontSize: 16, mr: 1 }} />
              Format Guide
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ fontSize: '12px', color: theme.palette.text.secondary }}>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Syntax:</strong>
              </Typography>
              <Typography variant="caption" display="block">• @Name → assignee(s)</Typography>
              <Typography variant="caption" display="block">• +date time → due date</Typography>
              <Typography variant="caption" display="block">• #Category → category/tag</Typography>
              <Typography variant="caption" display="block">• !Priority → priority level</Typography>
              <Typography variant="caption" display="block">• %Status → task status</Typography>
              <Typography variant="caption" display="block">• ~estimate → estimated effort/time</Typography>
              <Typography variant="caption" display="block">• "notes" → notes</Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                <strong>Indentation:</strong> Use - for subtasks, -- for sub-subtasks
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Task Input */}
        <Box sx={{ p: 2, position: 'relative' }}>
          <TextField
            ref={textAreaRef}
            fullWidth
            multiline
            rows={8}
            label="Enter structured tasks"
            value={taskText}
            onChange={handleTaskTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Enter one task per line:

Main Task @Alice +Sept 1 9am #Category !High %Open ~5d
- Subtask @Bob #Category !Medium %Open ~2d
-- Sub-subtask @Tom #Category !Low %Open ~4h

Use shift+enter to save`}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '13px',
                lineHeight: 1.4,
                fontFamily: 'monospace'
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

        {/* Quick Example Button */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setTaskText(exampleText)}
            sx={{ fontSize: '11px' }}
          >
            Load Example
          </Button>
        </Box>

        {/* Parsed Tasks Preview */}
        {parsedTasks.length > 0 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.primary.main }}>
              Parsed Tasks ({parsedTasks.length})
            </Typography>
            <Box sx={{
              bgcolor: theme.palette.grey[50],
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${theme.palette.divider}`,
              p: 1.5,
              maxHeight: 200,
              overflow: 'auto'
            }}>
              {parsedTasks.map((task, index) => (
                <Box key={task.id} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                    {task.taskName}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {task.assignees.map(assignee => (
                      <Chip key={assignee.id} label={assignee.name} size="small" variant="outlined" />
                    ))}
                    {task.priority && (
                      <Chip label={`!${task.priority}`} size="small" color="error" variant="outlined" />
                    )}
                    {task.status && (
                      <Chip label={`%${task.status}`} size="small" color="info" variant="outlined" />
                    )}
                    {task.categories.map(cat => (
                      <Chip key={cat} label={`#${cat}`} size="small" color="primary" variant="outlined" />
                    ))}
                    {task.estimate && (
                      <Chip label={`~${task.estimate}`} size="small" color="secondary" variant="outlined" />
                    )}
                  </Stack>
                  {task.subtasks && task.subtasks.map(subtask => (
                    <Box key={subtask.id} sx={{ ml: 2, mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '11px' }}>
                        - {subtask.taskName}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Divider />
      <Box>
        <Typography>https://workupload.com/file/jQqQUyfeVsz</Typography>
      </Box>
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
          Create Tasks
        </Button>
      </Box>
    </Box>
  );
};

export default StructuredQuickTask;
