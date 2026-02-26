import React, { useState, useEffect, useMemo } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Autocomplete,
    Divider,
} from '@mui/material';
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { X } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { Advfilters } from '../../../Recoil/atom';
import { commonTextFieldProps } from '../../../Utils/globalfun';

const DynamicColumnFilterDrawer = ({
    open,
    onClose,
    availableColumns = [],
    masterData = {},
    idToAttr = new Map(),
    masterColNameSet = new Set()
}) => {
    const [filters, setFilters] = useRecoilState(Advfilters);
    const [dynamicFilters, setDynamicFilters] = useState({});
    const taskAssigneeData = JSON?.parse(sessionStorage.getItem('taskAssigneeData'));
    const taskWorkCategoryData = JSON?.parse(sessionStorage.getItem("taskworkcategoryData"));
    const taskStatusData = JSON?.parse(sessionStorage.getItem("taskstatusData"));
    const taskPriorityData = JSON?.parse(sessionStorage.getItem("taskpriorityData"));


    // Excluded fields that shouldn't appear in dynamic filters
    const excludedFields = [
        "start_date",
        "deadline",
        "assignee",
        "workcategoryid",
        "taskname",
        "estimate_hrs",
        "working_hr",
        "id",
        "workcategoryid",
        "taskno",
        'statusid',
        'priorityid',
        "createdbyid"
    ];

    // Get filterable columns (exclude the specified fields and group columns like G1, G2, etc.)
    const filterableColumns = useMemo(() => {
        return availableColumns.filter(col =>
            !excludedFields.includes(col.toLowerCase()) &&
            !/^G\d+$/i.test(col)
        );
    }, [availableColumns]);

    useEffect(() => {
        const currentDynamicFilters = {};
        filterableColumns.forEach(col => {
            if (filters[col]) {
                currentDynamicFilters[col] = filters[col];
            }
        });
        setDynamicFilters(currentDynamicFilters);
    }, [filters, filterableColumns]);

    const handleFilterChange = (columnName, value) => {
        const newDynamicFilters = { ...dynamicFilters };

        if (value && value !== '') {
            newDynamicFilters[columnName] = value;
        } else {
            delete newDynamicFilters[columnName];
        }

        setDynamicFilters(newDynamicFilters);

        // Update global filters
        setFilters(prev => ({
            ...prev,
            [columnName]: value || ''
        }));
    };

    const handleClearFilter = (columnName) => {
        const newDynamicFilters = { ...dynamicFilters };
        delete newDynamicFilters[columnName];
        setDynamicFilters(newDynamicFilters);

        setFilters(prev => ({
            ...prev,
            [columnName]: ''
        }));
    };

    const handleClearAllFilters = () => {
        setDynamicFilters({});
        const clearedFilters = {};
        filterableColumns.forEach(col => {
            clearedFilters[col] = '';
        });
        setFilters(prev => ({
            ...prev,
            ...clearedFilters
        }));
    };

    const getColumnDisplayName = (columnName) => {
        const name = (columnName || '').toString();
        const key = name.toLowerCase();
        if (key === 'workcategoryid') return 'CATEGORY';
        if (key === 'statusid') return 'STATUS';
        if (key === 'priorityid') return 'PRIORITY';
        if (key === 'createdbyid') return 'CREATED BY';
        return name?.replace(/_/g, ' ')?.toUpperCase();
    };

    const getColumnOptions = (columnName) => {
        if (columnName === 'assignee') {
            return taskAssigneeData || [];
        } else if (columnName === 'workcategoryid') {
            return taskWorkCategoryData || [];
        } else if (columnName === 'statusid') {
            return taskStatusData || [];
        } else if (columnName === 'priorityid') {
            return taskPriorityData || [];
        } else if (masterColNameSet.has(columnName)) {
            // Get structured master data from sessionStorage
            const structuredAdvMasterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData')) || [];

            // Find ALL matching groups by name (case-insensitive) and collect all attributes
            const allAttributes = [];

            structuredAdvMasterData.forEach(master => {
                master.groups.forEach(group => {
                    const groupNameNormalized = group.name.toLowerCase().replace(/[#\s]/g, '');
                    const columnNameNormalized = columnName.toLowerCase().replace(/[#\s]/g, '');

                    // Check if group name matches column name
                    if (groupNameNormalized === columnNameNormalized && group.attributes) {
                        group.attributes.forEach(attr => {
                            // Avoid duplicates by checking if attribute already exists
                            const existingAttr = allAttributes.find(existing => existing.id === attr.id);
                            if (!existingAttr) {
                                allAttributes.push({
                                    id: attr.id,
                                    labelname: attr.name,
                                    bindid: attr.bindid
                                });
                            }
                        });
                    }
                });
            });

            return allAttributes;
        } else if (masterData[columnName]) {
            return masterData[columnName];
        }
        return [];
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,
                    padding: 2,
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterAltIcon size={20} />
                    <Typography variant="h6">
                        Dynamic Filters
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Active Filters */}
            {/* {activeFiltersCount > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Active Filters
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Object.entries(dynamicFilters).map(([column, value]) => {
                            // Handle object values (like assignee objects)
                            let displayValue = value;
                            if (typeof value === 'object' && value !== null) {
                                if (value.firstname && value.lastname) {
                                    displayValue = `${value.firstname} ${value.lastname}`;
                                } else if (value.labelname) {
                                    displayValue = value.labelname;
                                } else {
                                    displayValue = JSON.stringify(value);
                                }
                            }

                            return (
                                <Chip
                                    key={column}
                                    label={`${getColumnDisplayName(column)}: ${displayValue}`}
                                    onDelete={() => handleClearFilter(column)}
                                    size="small"
                                    variant="outlined"
                                />
                            );
                        })}
                    </Stack>
                    <Button
                        size="small"
                        onClick={handleClearAllFilters}
                        sx={{ mt: 1 }}
                    >
                        Clear All
                    </Button>
                </Box>
            )} */}

            {/* Filter Controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {filterableColumns.map((column) => {
                    const options = getColumnOptions(column);
                    const displayName = getColumnDisplayName(column);

                    return (
                        <Box key={column}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {displayName}
                            </Typography>

                            {/* Master Column Fields */}
                            {masterColNameSet.has(column) ? (
                                <Autocomplete
                                    size="small"
                                    value={dynamicFilters[column] || null}
                                    {...commonTextFieldProps}
                                    onChange={(event, newValue) => {
                                        // Handle structured master data selection
                                        const selectedValue = typeof newValue === 'object' && newValue?.labelname
                                            ? newValue.labelname
                                            : newValue;
                                        handleFilterChange(column, selectedValue);
                                    }}
                                    options={options}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'object' && option?.labelname) {
                                            return option.labelname;
                                        }
                                        return String(option || '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={`Select ${displayName}`}
                                            variant="outlined"
                                            className="textfieldsClass"
                                        />
                                    )}
                                />
                            )
                                /* Regular Options Fields */
                                : options.length > 0 ? (
                                    <Autocomplete
                                        size="small"
                                        value={dynamicFilters[column] || null}
                                        onChange={(event, newValue) => handleFilterChange(column, newValue)}
                                        options={options.map(option => option.labelname || option.name || String(option))}
                                        getOptionLabel={(option) => String(option || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={`Select ${displayName}`}
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                )
                                    /* Text Input Fields */
                                    : (
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={dynamicFilters[column] || ''}
                                            onChange={(e) => handleFilterChange(column, e.target.value)}
                                            placeholder={`Filter by ${displayName}`}
                                            variant="outlined"
                                        />
                                    )}
                        </Box>
                    );
                })}
            </Box>

            {filterableColumns.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                        No additional filters available
                    </Typography>
                </Box>
            )}
        </Drawer>
    );
};

export default DynamicColumnFilterDrawer;
