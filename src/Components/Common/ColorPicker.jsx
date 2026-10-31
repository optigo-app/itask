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
    previewLabel, // actual label name shown in the live preview badge
    showPreview = true,
    size = "medium", // small, medium, large
    inline = false // render swatches directly (already inside another popover/dialog)
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [localKey, setLocalKey] = useState(selectedColor); // local pick, applied on Apply
    const [tabValue, setTabValue] = useState(0);
    const colorCategories = getColorOptionsByCategory();
    const colorOptions = getColorOptions();

    const handleClick = (event) => {
        setLocalKey(selectedColor);
        setAnchorEl(event.currentTarget);
    };
    React.useEffect(() => { if (inline) setLocalKey(selectedColor); }, [inline, selectedColor]);

    const handleClose = () => {
        setAnchorEl(null);
    };

    // swatch click previews locally; Apply commits via onColorSelect
    const handleColorSelect = (colorKey) => setLocalKey(colorKey);
    const handleApply = () => {
        onColorSelect(localKey);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'color-picker-popover' : undefined;

    const getSelectedColorInfo = () => {
        if (!selectedColor) return null;
        return colorOptions.find(color => color.key === selectedColor);
    };
    const localColorInfo = colorOptions.find(color => color.key === localKey) || null;

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

    const pickerBody = (
        <>
                <Box sx={{
                    p: 3,
                    pb: 2,
                    borderBottom: '1px dashed rgb(125, 127, 133)',
                }}>
                    <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, fontSize: '1.1rem' }}>
                        Choose Color
                    </Typography>
                </Box>

                {/* live preview - how the label badge looks once applied */}
                {showPreview && (
                    <Box sx={{
                        mx: 3, mt: 2, p: 1.25, borderRadius: '12px',
                        background: '#f8f9fb', border: '1px solid #ececf1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 0.75, minHeight: 66
                    }}>
                        {localColorInfo ? (
                            <>
                                <Box sx={{
                                    px: 1.5, py: 0.5, borderRadius: '6px',
                                    backgroundColor: localColorInfo.light,
                                    color: localColorInfo.dark,
                                    border: `1px solid ${localColorInfo.dark}33`,
                                    fontWeight: 600, fontSize: '0.85rem',
                                    textTransform: 'capitalize',
                                    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {previewLabel || localColorInfo.name}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#8a8a96', fontSize: '0.72rem' }}>
                                    {localColorInfo.name}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="caption" sx={{ color: '#9a9aa6' }}>
                                Pick a color to preview
                            </Typography>
                        )}
                    </Box>
                )}
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

                    <Grid container spacing={1.5} sx={{ mt: 1, maxHeight: "52vh", overflowY: "auto" }}>
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
                                                border: `4px solid ${localKey === color.key ? color.dark : 'transparent'}`,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    boxShadow: `0 0 0 3px #fff, 0 0 0 6px ${color.dark}55`,
                                                    zIndex: 10
                                                }
                                            }}
                                        >
                                            {localKey === color.key && (
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

                    {/* footer: Clear / Cancel / Apply */}
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            onClick={() => handleColorSelect(null)}
                            title="Clear selection"
                            sx={{
                                px: 1.5, height: 34, borderRadius: '10px',
                                border: '2px dashed #ccc',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                '&:hover': { borderColor: '#999', backgroundColor: '#f9f9f9' }
                            }}
                        >
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                                Clear
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }} />
                        <Button variant="text" size="small" onClick={handleClose}
                            sx={{ textTransform: 'none', color: '#6D6B77' }}>
                            Cancel
                        </Button>
                        <Button variant="contained" size="small" onClick={handleApply}
                            sx={{
                                textTransform: 'none', borderRadius: '8px',
                                background: '#7367f0 !important', px: 2.5,
                                '&:hover': { background: '#5e50ee !important' }
                            }}>
                            Apply
                        </Button>
                    </Box>
                </Box>
        </>
    );

    return (
        <Box sx={inline ? { width: 'min(420px, 92vw)' } : undefined}>
            {label && (
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                    {label}
                </Typography>
            )}

            {!inline && (
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
            )}

            {inline ? (
                <>{pickerBody}</>
            ) : (
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
                        maxWidth: 'min(420px, 92vw)',
                        minWidth: 'min(420px, 92vw)',
                        overflow: 'hidden'
                    }
                }}
            >
                {pickerBody}
            </Popover>
            )}
        </Box>
    );
};

export default ColorPicker;
