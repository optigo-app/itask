import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Grid,
    Tooltip,
    IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getDynamicPriorityColor, getDynamicStatusColor, getColorOptions } from '../../Utils/globalfun';

const ColorGridShortcuts = ({ 
    data, 
    type = 'priority', // 'priority' or 'status'
    onEdit,
    onDelete,
    showActions = true
}) => {
    const colorOptions = getColorOptions();
    
    const getColorForItem = (item) => {
        if (type === 'priority') {
            return getDynamicPriorityColor(item.labelname, item.colorkey);
        } else {
            return getDynamicStatusColor(item.labelname, item.colorkey);
        }
    };

    const getColorInfo = (colorKey) => {
        return colorOptions.find(color => color.key === colorKey);
    };

    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                    No {type} items found
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {type === 'priority' ? 'Priority' : 'Status'} Color Shortcuts
            </Typography>
            
            <Grid container spacing={2}>
                {data.map((item, index) => {
                    const colorInfo = getColorForItem(item);
                    const selectedColorInfo = getColorInfo(item.colorkey);
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || index}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: colorInfo?.backgroundColor || '#f5f5f5',
                                    border: `2px solid ${colorInfo?.color || '#ddd'}`,
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 8px 24px ${colorInfo?.color || '#ddd'}20`
                                    }
                                }}
                            >
                                {/* Color Preview */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '6px',
                                            backgroundColor: colorInfo?.color || '#ddd',
                                            mr: 1,
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: colorInfo?.color || '#666',
                                            flex: 1
                                        }}
                                    >
                                        {item.labelname}
                                    </Typography>
                                </Box>

                                {/* Color Name */}
                                {selectedColorInfo && (
                                    <Chip
                                        label={selectedColorInfo.name}
                                        size="small"
                                        sx={{
                                            backgroundColor: selectedColorInfo.light,
                                            color: selectedColorInfo.dark,
                                            fontSize: '11px',
                                            height: 20,
                                            mb: 1
                                        }}
                                    />
                                )}

                                {/* Display Order */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        color: colorInfo?.color || '#666',
                                        opacity: 0.8,
                                        mb: showActions ? 1 : 0
                                    }}
                                >
                                    Order: {item.displayorder || 'N/A'}
                                </Typography>

                                {/* Action Buttons */}
                                {showActions && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: 0.5
                                        }}
                                    >
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => onEdit && onEdit(item)}
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,1)',
                                                        color: colorInfo?.color
                                                    }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => onDelete && onDelete(item)}
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,1)',
                                                        color: '#f44336'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}

                                {/* Gradient Overlay for Visual Appeal */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: 40,
                                        height: 40,
                                        borderRadius: '0 12px 0 12px',
                                        background: `linear-gradient(135deg, ${colorInfo?.color || '#ddd'}20, transparent)`,
                                        pointerEvents: 'none'
                                    }}
                                />
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default ColorGridShortcuts;
