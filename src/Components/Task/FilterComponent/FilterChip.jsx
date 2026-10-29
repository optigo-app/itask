import React from 'react';
import { Chip, Button, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate2 } from '../../../Utils/globalfun';

const FILTER_LABELS = { secStatus: 'What Next' };

const FilterChips = ({ filters, onClearFilter, onClearAll, hideClearBtn = false }) => {
    // Group by rawKey → one chip per filter: { label, rawKey, values[] }
    const groupedFilters = new Map();
    const filterLabel = (key) => FILTER_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

    const pushValue = (rawKey, label, value) => {
        if (!groupedFilters.has(rawKey)) {
            groupedFilters.set(rawKey, { label, rawKey, values: [] });
        }
        groupedFilters.get(rawKey).values.push(value);
    };

    Object.entries(filters).forEach(([key, value]) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return;

        // category (array)
        if (key === 'category' && Array.isArray(value)) {
            value.forEach((val) => {
                if (val) pushValue(key, 'Category', val);
            });
        }

        // multi-select string arrays (status, priority, secStatus, project, ...)
        else if (Array.isArray(value)) {
            value.forEach((val) => {
                if (val) pushValue(key, filterLabel(key), val);
            });
        }

        // dateRangeFilter object
        else if (
            key === 'dateRangeFilter' &&
            value?.startDate?.trim() &&
            value?.endDate?.trim()
        ) {
            pushValue(key, 'Date Range', `${formatDate2(value.startDate)} - ${formatDate2(value.endDate)}`);
        }

        // ISO date fields like startDate, dueDate or entrydate
        else if (['startDate', 'dueDate', 'entrydate'].includes(key)) {
            const dateLabel = { startDate: 'Start Date', dueDate: 'Due Date', entrydate: 'Created Date' }[key];
            if (value && typeof value === 'object' && value.startDate && value.endDate) {
                pushValue(key, dateLabel, `${formatDate2(value.startDate)} - ${formatDate2(value.endDate)}`);
            } else if (value && typeof value === 'string' && value !== "") {
                const formatted = formatDate2(value);
                if (formatted && formatted !== "null" && formatted !== "Invalid Date") {
                    pushValue(key, dateLabel, formatted);
                }
            }
        }

        // other fields
        else if (value && typeof value === 'object') {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            let displayValue = "";

            if (['assignee', 'seniour', 'employee'].includes(key)) {
                const fullName = `${value.firstname || ''} ${value.lastname || ''}`.trim();
                displayValue = fullName ? fullName : (value.userid || value.labelname || value.taskname);
            } else if (key === 'module') {
                displayValue = value.taskname || value.labelname || value.projectname;
            } else {
                displayValue = value.labelname || value.taskname || JSON.stringify(value);
            }

            if (displayValue) {
                pushValue(key, label, displayValue);
            }
        }
        else if (typeof value === 'string') {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            pushValue(key, label, value.trim());
        }
    });

    if (groupedFilters.size === 0) return null;

    return (
        <Box className="filterCheckedBox">
            {[...groupedFilters.values()].map(({ label, rawKey, values }) => (
                <Box
                    key={rawKey}
                    sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}
                >
                    {/* Filter label sits outside — each value gets its own chip */}
                    <span className="filterKey">{label}:</span>
                    {values.map((val, idx) => (
                        <Chip
                            key={`${rawKey}-${idx}`}
                            size="small"
                            label={<span className="filterValue">{val}</span>}
                            {...(!hideClearBtn && {
                                onDelete: () => onClearFilter(rawKey, val),
                                deleteIcon: <CloseIcon className="closeIcon" />,
                            })}
                            className="filterChip"
                        />
                    ))}
                </Box>
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
