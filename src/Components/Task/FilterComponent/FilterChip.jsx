import React from 'react';
import { Chip, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate2 } from '../../../Utils/globalfun';

const FilterChips = ({ filters, onClearFilter, onClearAll, hideClearBtn = false }) => {
    const activeFilters = [];

    Object.entries(filters).forEach(([key, value]) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return;

        // category (array)
        if (key === 'category' && Array.isArray(value)) {
            value.forEach((val) => {
                activeFilters.push({ key: 'Category', value: val, rawKey: key });
            });
        }

        // dateRangeFilter object
        else if (
            key === 'dateRangeFilter' &&
            value?.startDate?.trim() &&
            value?.endDate?.trim()
        ) {
            activeFilters.push({
                key: 'Date Range',
                value: `${formatDate2(value.startDate)} - ${formatDate2(value.endDate)}`,
                rawKey: key,
            });
        }

        // ISO date fields like startDate or dueDate
        else if (['startDate', 'dueDate'].includes(key)) {
            const formatted = formatDate2(value);
            activeFilters.push({
                key: key === 'startDate' ? 'Start Date' : 'Due Date',
                value: formatted,
                rawKey: key,
            });
        }

        // other fields
        else if (typeof value === 'string') {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            activeFilters.push({ key: label, value: value.trim(), rawKey: key });
        }
    });

    if (activeFilters.length === 0) return null;

    return (
        <Box className="filterCheckedBox">
            {activeFilters.map(({ key, value, rawKey }, idx) => (
                <Chip
                    key={`${key}-${idx}`}
                    size="small"
                    label={
                        <Typography>
                            <span className="filterKey">{key}:</span>{' '}
                            <span className="filterValue">{value}</span>
                        </Typography>
                    }
                    {...(!hideClearBtn && {
                        onDelete: () => onClearFilter(rawKey, value),
                        deleteIcon: <CloseIcon className="closeIcon" />,
                    })}
                    className="filterChip"
                />

            ))}
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
