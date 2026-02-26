import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Checkbox,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import '../../Components/Project/Dashboard/Styles/dashboard.scss';
import './templatedialog.scss';
import { TEMPLATE_DATA } from '../../Data/templateData';

const TemplateDialog = ({ open, onClose }) => {
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [templateContent, setTemplateContent] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    // Get designations from TEMPLATE_DATA keys
    const uniqueDesignations = Object.keys(TEMPLATE_DATA);
    setDesignations(uniqueDesignations);
    if (uniqueDesignations.length > 0 && !selectedDesignation) {
      setSelectedDesignation(uniqueDesignations[0]);
    }
  }, [open]);

  useEffect(() => {
    if (selectedDesignation && TEMPLATE_DATA[selectedDesignation.toLowerCase()]) {
      setSelectedTemplate(null);
      setTemplateContent([]);
    }
  }, [selectedDesignation]);

  const handleDesignationChange = (event, newDesignation) => {
    if (newDesignation !== null) {
      setSelectedDesignation(newDesignation);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateContent([...template.content]);
    // Select all items by default when template is selected
    setSelectedItems(new Set(template.content.map((_, index) => index)));
  };

  const handleItemToggle = (index) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(index)) {
      newSelectedItems.delete(index);
    } else {
      newSelectedItems.add(index);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === templateContent.length) {
      // If all are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // Select all items
      setSelectedItems(new Set(templateContent.map((_, index) => index)));
    }
  };

  const handleCopyContent = () => {
    if (selectedItems.size === 0) return; // Don't copy if nothing is selected

    const selectedContent = Array.from(selectedItems).map(index => templateContent[index]);
    const contentText = selectedContent.join('\n');

    navigator.clipboard.writeText(contentText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      console.log(`Copied ${selectedItems.size} item(s) to clipboard`);
    });
  };

  const currentTemplates = TEMPLATE_DATA[selectedDesignation?.toLowerCase()] || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          m: 0,
          width: '90vw',
          height: '85vh',
          maxWidth: '90vw',
          maxHeight: '85vh',
          borderRadius: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 25px 50px rgba(0,0,0,.25)',
          overflow: 'hidden',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,.5)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
            py: 2,
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                boxShadow: '0 0 10px rgba(25,118,210,.35)',
              }}
            />
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1976d2' }}>
              Template Manager
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              color: '#666',
              '&:hover': { backgroundColor: '#f0f0f0', color: '#333' },
            }}
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Designation Tabs */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <Box className="templatedialog-toggle-container">
            <Box className="toggle-scroll-container">
              <ToggleButtonGroup
                value={selectedDesignation}
                exclusive
                onChange={handleDesignationChange}
                aria-label="designation selection"
                className="toggle-group"
              >
                {designations.map((designation) => (
                  <ToggleButton
                    key={designation}
                    value={designation}
                    className="toggle-button"
                  >
                    {designation}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Left Panel - Templates */}
          <Box
            sx={{
              width: 320,
              flexShrink: 0,
              borderRight: '1px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
              <Typography
                 sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                Templates
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {currentTemplates.length === 0 ? (
                <Typography sx={{ color: '#666', fontSize: 14, textAlign: 'center', mt: 4 }}>
                  No templates available for {selectedDesignation}
                </Typography>
              ) : (
                currentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={selectedTemplate?.id === template.id ? 'templatedialog-card-selected' : 'templatedialog-card-normal'}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: '1px solid #f0f0f0',
                      '&:hover': {
                        backgroundColor: selectedTemplate?.id === template.id
                          ? 'rgba(115,103,240,0.18)'
                          : 'rgba(255,255,255,0.06)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 14 }}>
                        {template.title}
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: 12, mt: 1 }}>
                        {template.content.length} items
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>

          {/* Right Panel - Content */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#333',
                  }}
                >
                  {selectedTemplate ? selectedTemplate.title : 'Select a template'}
                </Typography>

                {templateContent.length > 0 && (
                  <Button
                    onClick={handleSelectAll}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontSize: 12,
                      color: '#666',
                      border: '1px solid #f0f0f0',
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    {selectedItems.size === templateContent.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {copySuccess && (
                  <Typography
                    className="templatedialog-copied-animation"
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#28C76F',
                      opacity: 1,
                      animation: 'fadeInOut 2s ease-in-out',
                    }}
                  >
                    ✓ Copied!
                  </Typography>
                )}

                {templateContent.length > 0 && (
                  <Button
                    onClick={handleCopyContent}
                    startIcon={<CopyIcon />}
                    disabled={selectedItems.size === 0}
                    className={`templatedialog-copy-btn ${copySuccess ? 'copy-success' : ''}`}
                    sx={{
                      textTransform: 'none',
                      fontSize: 13,
                      border: '1px solid',
                    }}
                  >
                    Copy ({selectedItems.size})
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              {templateContent.length === 0 ? (
                <Typography sx={{ color: '#666', fontSize: 14, textAlign: 'center', mt: 8 }}>
                  {selectedTemplate ? 'No content in this template' : 'Select a template to view content'}
                </Typography>
              ) : (
                <List>
                  {templateContent.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          px: 2,
                          py: 1.5,
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          mb: 1,
                          border: '1px solid #f0f0f0',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleItemToggle(index)}
                      >
                        <Checkbox
                          checked={selectedItems.has(index)}
                          onChange={() => handleItemToggle(index)}
                          size="small"
                          sx={{
                            color: '#666',
                            '&.Mui-checked': {
                              color: '#7367f0', // Theme primary color
                            },
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography sx={{ color: '#333', fontSize: 14, fontWeight: 500, ml: 1 }}>
                              {item}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
