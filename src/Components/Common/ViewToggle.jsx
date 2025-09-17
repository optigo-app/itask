import React from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    Box
} from '@mui/material';
import {
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    GridView as GridViewIcon,
    TableRows as TableRowsIcon
} from '@mui/icons-material';

const ViewToggle = ({
    view = 'list', // 'list' or 'grid'
    onViewChange,
    size = 'small', // 'small', 'medium', 'large'
    variant = 'standard', // 'standard', 'outlined', 'contained'
    showLabels = false,
    disabled = false,
    sx = {}
}) => {
    const handleViewChange = (event, newView) => {
        if (newView !== null && onViewChange) {
            onViewChange(newView);
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'large':
                return 'medium';
            case 'medium':
                return 'small';
            default:
                return 'small';
        }
    };

    const getButtonProps = () => {
        const baseProps = {
            size: size,
            disabled: disabled
        };

        switch (variant) {
            case 'outlined':
                return {
                    ...baseProps,
                    sx: {
                        border: '1px solid #ddd',
                        '&.Mui-selected': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#7367f0',
                            color: '#7367f0'
                        }
                    }
                };
            case 'contained':
                return {
                    ...baseProps,
                    sx: {
                        backgroundColor: '#f5f5f5',
                        '&.Mui-selected': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#6c63ff'
                            }
                        }
                    }
                };
            default:
                return {
                    ...baseProps,
                    sx: {
                        '&.Mui-selected': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#6c63ff'
                            }
                        }
                    }
                };
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
            <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="view toggle"
                {...getButtonProps()}
            >
                <ToggleButton value="list" aria-label="list view">
                    <Tooltip title="List View" placement="top">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: showLabels ? 1 : 0 }}>
                            <ViewListIcon fontSize={getIconSize()} />
                            {showLabels && <span>List</span>}
                        </Box>
                    </Tooltip>
                </ToggleButton>
                
                <ToggleButton value="grid" aria-label="grid view">
                    <Tooltip title="Grid View" placement="top">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: showLabels ? 1 : 0 }}>
                            <ViewModuleIcon fontSize={getIconSize()} />
                            {showLabels && <span>Grid</span>}
                        </Box>
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

// Alternative ViewToggle with different icons
export const ViewToggleAlt = ({
    view = 'list',
    onViewChange,
    size = 'small',
    variant = 'standard',
    showLabels = false,
    disabled = false,
    sx = {}
}) => {
    const handleViewChange = (event, newView) => {
        if (newView !== null && onViewChange) {
            onViewChange(newView);
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'large':
                return 'medium';
            case 'medium':
                return 'small';
            default:
                return 'small';
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
            <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="view toggle"
                size={size}
                sx={{
                    '& .MuiToggleButton-root': {
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        '&.Mui-selected': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                            borderColor: '#7367f0',
                            '&:hover': {
                                backgroundColor: '#6c63ff'
                            }
                        },
                        '&:hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }
                }}
            >
                <ToggleButton value="list" aria-label="table view" disabled={disabled}>
                    <Tooltip title="Table View" placement="top">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: showLabels ? 1 : 0 }}>
                            <TableRowsIcon fontSize={getIconSize()} />
                            {showLabels && <span>Table</span>}
                        </Box>
                    </Tooltip>
                </ToggleButton>
                
                <ToggleButton value="grid" aria-label="card view" disabled={disabled}>
                    <Tooltip title="Card View" placement="top">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: showLabels ? 1 : 0 }}>
                            <GridViewIcon fontSize={getIconSize()} />
                            {showLabels && <span>Cards</span>}
                        </Box>
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default ViewToggle;
