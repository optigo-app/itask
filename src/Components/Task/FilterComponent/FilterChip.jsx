import React from 'react';
import { Chip, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate2 } from '../../../Utils/globalfun';

const FilterChips = ({ filters, onClearFilter, onClearAll }) => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
        if (key === 'category') return Array.isArray(value) && value.length > 0;
        return value !== '' && value !== null;
    });

    if (activeFilters.length === 0) return null;

    return (
        <Box className="filterCheckedBox">
            {activeFilters.map(([key, value]) => {
                if (key === 'category' && Array.isArray(value)) {
                    return value.map((cat) => (
                        <Chip
                            size="small"
                            key={`category-${cat}`}
                            label={
                                <Typography>
                                    <span className="filterKey">category:</span>{' '}
                                    <span className="filterValue">{cat}</span>
                                </Typography>
                            }
                            onDelete={() =>
                                onClearFilter('category', cat)
                            }
                            deleteIcon={<CloseIcon className="closeIcon" />}
                            className="filterChip"
                        />
                    ));
                }

                return (
                    <Chip
                        size="small"
                        key={key}
                        label={
                            <Typography>
                                <span className="filterKey">{key}:</span>{' '}
                                <span className="filterValue">
                                    {key.toLowerCase().includes('date')
                                        ? formatDate2(value)
                                        : value}
                                </span>
                            </Typography>
                        }
                        onDelete={() => onClearFilter(key)}
                        deleteIcon={<CloseIcon className="closeIcon" />}
                        className="filterChip"
                    />
                );
            })}
            <Button
                variant="text"
                size="small"
                onClick={onClearAll}
                className="clearAllBtn"
            >
                Clear All
            </Button>
        </Box>
    );
};

export default FilterChips;
