import React from 'react';
import { Chip, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate2 } from '../../../Utils/globalfun';

const FilterChips = ({ filters, onClearFilter, onClearAll }) => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '' && value !== null);

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <Box className="filterCheckedBox">
            {activeFilters.map(([key, value]) => (
                <Chip
                    size='small'
                    key={key}
                    label={
                        <Typography>
                            <span className="filterKey">{key}:</span> <span className="filterValue">{key.toLowerCase().includes('date') ? formatDate2(value) : value}</span>
                        </Typography>
                    }
                    onDelete={() => onClearFilter(key)}
                    deleteIcon={<CloseIcon className='closeIcon' />}
                    className='filterChip'
                />
            ))}
            <Button
                variant="text"
                size="small"
                onClick={onClearAll}
                className='clearAllBtn'
            >
                Clear All
            </Button>
        </Box>
    );
};

export default FilterChips;