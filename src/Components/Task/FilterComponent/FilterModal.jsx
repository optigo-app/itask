import React, { useEffect, useState, useRef } from "react";
import { Drawer, Box, TextField, Typography, MenuItem, Checkbox, ListItemText, Button, IconButton, Divider } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRecoilState, useSetRecoilState } from "recoil";
import { filterDrawer, selectedCategoryAtom, timerCompOpen } from "../../../Recoil/atom";
import { TimerIcon, FilterIcon, CircleX } from "lucide-react";
import { commonSelectProps, customDatePickerProps } from "../../../Utils/globalfun";
import dayjs from "dayjs";

const FiltersDrawer = ({
    filters,
    setFilters,
    searchTerm,
    onFilterChange,
    onClearAll,
    priorityData,
    assigneeData,
    statusData,
    taskProject,
    taskCategory,
    taskDepartment,
}) => {
    const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
    const [drawerOpen, setDrawerOpen] = useRecoilState(filterDrawer);

    const filterRefs = {
        priority: useRef(),
        status: useRef(),
        assignee: useRef(),
        department: useRef(),
        project: useRef(),
        category: useRef(),
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        onFilterChange(key, value);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            Object.keys(filterRefs).forEach((key) => {
                const element = filterRefs[key]?.current;
                if (element) {
                    const span = element.querySelector(".notranslate");
                    if (span) {
                        if (!filters[key] || filters[key] === "") {
                            span.textContent = `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        }
                    }
                }
            });
        }, 100);

        return () => clearTimeout(timeout);
    }, [drawerOpen, filters]);

    const handleClearAll = () => {
        setFilters({
            priority: "",
            status: "",
            assignee: "",
            department: "",
            project: "",
            category: "",
            dueDate: null,
        });
        onFilterChange("clearFilter", null);
        setSelectedCategory(null);
    };

    return (
        <>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box className="filterDrawerModal" sx={{ width: 350, padding: '10px 20px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" gutterBottom>Filters</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}>
                            <CircleX />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2, mt: 1 }} />
                    {[
                        { label: "Project", key: "project", data: taskProject },
                        { label: "Status", key: "status", data: statusData },
                        { label: "Assignee", key: "assignee", data: assigneeData },
                        { label: "Priority", key: "priority", data: priorityData },
                        { label: "Category", key: "category", data: taskCategory },
                        { label: "Department", key: "department", data: taskDepartment },
                    ]?.map((filter) => (
                        <Box key={filter.key} className="form-group" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">{filter.label}</Typography>
                            <TextField
                                aria-label={`Select ${filter?.label}`}
                                id={filter?.label}

                                name={filter?.key}
                                value={filters[filter?.key] ?? ""}
                                onChange={(e) => handleFilterChange(filter?.key, e.target.value)}
                                {...commonSelectProps}
                                ref={filterRefs[filter?.key]}
                                className="textfieldsClass"
                            >
                                <MenuItem value="">
                                    <em>Select {filter.label}</em>
                                </MenuItem>
                                {filter.data?.map((item) => (
                                    <MenuItem
                                        key={item?.id}
                                        value={filter.key === "assignee" ? `${item?.firstname} ${item?.lastname}` : item?.labelname}
                                    >
                                        {filter.key === "assignee" ? `${item?.firstname} ${item?.lastname}` : item?.labelname}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    ))}

                    {/* Due Date Filter */}
                    <Box className="form-group">
                        <Typography variant="subtitle1">Due Date</Typography>
                        <DatePicker
                            name="startDateTime"
                            value={filters?.dueDate ? dayjs(filters.dueDate) : null}
                            onChange={(newDate) => handleFilterChange("dueDate", newDate?.toISOString())}
                            className="textfieldsClass"
                            {...customDatePickerProps}
                            sx={{ minWidth: 350, padding: "0" }}
                            format="DD/MM/YYYY"
                            renderInput={(params) => (
                                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
                            )}
                        />
                    </Box>
                    <Box className="clearAllbtnBox">
                        <Button
                            variant="contained"
                            className="buttonClassname"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={handleClearAll}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default FiltersDrawer;