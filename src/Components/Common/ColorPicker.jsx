import React, { useState } from 'react';
import {
    Box,
    Typography,
    Popover,
    IconButton,
    Grid,
    Tooltip,
    Chip,
    Tabs,
    Tab,
    Button
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { getColorOptions, getColorOptionsByCategory, getContrastTextColor } from '../../Utils/globalfun';

const ColorPicker = ({
    selectedColor,
    onColorSelect,
    label = "Select Color",
    showPreview = true,
    size = "medium" // small, medium, large
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const colorCategories = getColorOptionsByCategory();
    const colorOptions = getColorOptions();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleColorSelect = (colorKey) => {
        onColorSelect(colorKey);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'color-picker-popover' : undefined;

    const getSelectedColorInfo = () => {
        if (!selectedColor) return null;
        return colorOptions.find(color => color.key === selectedColor);
    };

    const selectedColorInfo = getSelectedColorInfo();

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { width: 32, height: 32, minWidth: 32 };
            case 'large':
                return { width: 64, height: 64, minWidth: 64 };
            default:
                return { width: 48, height: 48, minWidth: 48 };
        }
    };

    const getColorGridSize = () => {
        switch (size) {
            case 'small':
                return { width: 50, height: 50 };
            case 'large':
                return { width: 80, height: 80 };
            default:
                return { width: 65, height: 65 };
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getCurrentColors = () => {
        switch (tabValue) {
            case 0:
                return colorCategories.light;
            case 1:
                return colorCategories.dark;
            case 2:
            default:
                return colorCategories.all;
        }
    };

    return (
        <Box>
            {label && (
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                    {label}
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                    onClick={handleClick}
                    sx={{
                        ...getSizeStyles(),
                        backgroundColor: selectedColorInfo?.light || '#f5f5f5',
                        border: `2px solid ${selectedColorInfo?.dark || '#ddd'}`,
                        borderRadius: '8px',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <PaletteIcon
                        sx={{
                            color: selectedColorInfo?.dark || '#666',
                            fontSize: size === 'small' ? 14 : size === 'large' ? 24 : 18
                        }}
                    />
                </IconButton>

                {showPreview && selectedColorInfo && (
                    <Chip
                        label={selectedColorInfo.name}
                        size="small"
                        sx={{
                            backgroundColor: selectedColorInfo.light,
                            color: selectedColorInfo.dark,
                            border: `1px solid ${selectedColorInfo.dark}`,
                            fontWeight: 500
                        }}
                    />
                )}
            </Box>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        p: 0,
                        borderRadius: '20px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(12px)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                        maxWidth: 420,
                        minWidth: 420,
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{
                    p: 3,
                    pb: 2,
                    borderBottom: '1px dashed rgb(125, 127, 133)',
                }}>
                    <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, fontSize: '1.1rem' }}>
                        Choose Color
                    </Typography>
                </Box>

                <Box sx={{ p: 3, pt: 2 }}>
                    {/* Color Category Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            mb: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            fontFamily: '"Public Sans", sans-serif',
                            fontSize: 12,
                            '& .MuiTab-root': {
                                textTransform: 'capitalize !important',
                                fontSize: '0.875rem',
                            },
                            '& .Mui-selected': {
                                color: '#7367f0 !important',
                                fontWeight: 600,
                                border: 'none',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#7367f0 !important',
                                height: 3,
                                borderRadius: '2px 2px 0 0'
                            }
                        }}
                        variant="fullWidth"
                    >
                        <Tab label={`Light (${colorCategories.light.length})`} />
                        <Tab label={`Dark (${colorCategories.dark.length})`} />
                        <Tab label={`All (${colorCategories.all.length})`} />
                    </Tabs>

                    <Grid container spacing={1.5} sx={{ mt: 1 }}>
                        {getCurrentColors().map((color) => {
                            const gridSize = getColorGridSize();
                            return (
                                <Grid item xs={4} sm={3} md={2.4} key={color.key}>
                                    <Tooltip title={color.name} placement="top">
                                        <Box
                                            onClick={() => handleColorSelect(color.key)}
                                            sx={{
                                                ...gridSize,
                                                borderRadius: '16px',
                                                background: `linear-gradient(135deg, ${color.light} 0%, ${color.dark} 100%)`,
                                                border: selectedColor === color.key
                                                    ? `4px solid ${color.dark}`
                                                    : 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    boxShadow: `0 6px 20px ${color.dark}50`,
                                                    zIndex: 10
                                                }
                                            }}
                                        >
                                            {selectedColor === color.key && (
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            backgroundColor: color.dark
                                                        }}
                                                    />
                                                </Box>
                                            )}

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 5,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    color: getContrastTextColor(color.dark),
                                                    fontWeight: 500,
                                                    fontSize: '0.65rem',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {color.key.charAt(0).toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Clear Selection Button */}
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                        <Box
                            onClick={() => handleColorSelect(null)}
                            sx={{
                                width: '100%',
                                height: 48,
                                borderRadius: '12px',
                                border: '3px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#999',
                                    backgroundColor: '#f9f9f9',
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                                Clear Selection
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};

export default ColorPicker;
