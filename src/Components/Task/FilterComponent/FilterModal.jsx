import React from "react";
import { Drawer, Box, TextField, Typography, Button, IconButton, Divider } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRecoilState, useSetRecoilState } from "recoil";
import { filterDrawer, selectedCategoryAtom, timerCompOpen } from "../../../Recoil/atom";
import { TimerIcon, FilterIcon, CircleX } from "lucide-react";
import { customDatePickerProps } from "../../../Utils/globalfun";
import CustomAutocomplete from "../../ShortcutsComponent/CustomAutocomplete";
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
    secStatusData,
    taskProject,
    taskCategory,
    taskDepartment,
    isMulti = false,
}) => {
    const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
    const [drawerOpen, setDrawerOpen] = useRecoilState(filterDrawer);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        onFilterChange(key, value);
    };

    const handleClearAll = () => {
        setFilters({
            priority: "",
            status: "",
            secStatus: "",
            assignee: "",
            department: "",
            project: "",
            category: "",
            dueDate: null,
            entrydate: null,
        });
        onFilterChange("clearFilter", null);
        setSelectedCategory(null);
    };

    return (
        <>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} className="MainDrawer">
                <Box className="filterDrawerModal" sx={{
                    width: 350,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 20px 0',
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <Typography variant="h6" gutterBottom>Filters</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}>
                            <CircleX />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2, mt: 1, flexShrink: 0 }} />
                    <Box sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        pr: 0.5,
                        '&::-webkit-scrollbar': { width: '5px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: '3px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}>
                    {[
                        { label: "Project", key: "project", data: taskProject },
                        { label: "Status", key: "status", data: statusData },
                        ...(secStatusData ? [{ label: "What Next", key: "secStatus", data: secStatusData }] : []),
                        { label: "Assignee", key: "assignee", data: assigneeData },
                        { label: "Priority", key: "priority", data: priorityData },
                        { label: "Category", key: "category", data: taskCategory },
                        { label: "Department", key: "department", data: taskDepartment },
                    ]?.map((filter) => {
                        const rawVal = filters[filter?.key];
                        const multiVal = Array.isArray(rawVal) ? rawVal : (rawVal ? [rawVal] : []);
                        return (
                            <CustomAutocomplete
                                key={filter.key}
                                label={filter.label}
                                name={filter.key}
                                value={isMulti ? multiVal : (rawVal ?? "")}
                                options={filter.data}
                                placeholder={`Select ${filter.label}`}
                                multiple={isMulti}
                                valueMode="label"
                                disablePortal={false}
                                getOptionLabel={filter.key === "assignee"
                                    ? (opt) => `${opt?.firstname ?? ''} ${opt?.lastname ?? ''}`.trim()
                                    : undefined}
                                onChange={(e) => handleFilterChange(filter?.key, e.target.value)}
                            />
                        );
                    })}

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

                    {/* Created Date (entrydate) Filter */}
                    <Box className="form-group">
                        <Typography variant="subtitle1">Created Date</Typography>
                        <DatePicker
                            name="entrydate"
                            value={filters?.entrydate ? dayjs(filters.entrydate) : null}
                            onChange={(newDate) => handleFilterChange("entrydate", newDate?.toISOString())}
                            className="textfieldsClass"
                            {...customDatePickerProps}
                            sx={{ minWidth: 350, padding: "0" }}
                            format="DD/MM/YYYY"
                            renderInput={(params) => (
                                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
                            )}
                        />
                    </Box>
                    </Box>
                    {/* Footer — pinned to drawer bottom, never scrolls away */}
                    <Box className="clearAllbtnBox" sx={{
                        flexShrink: 0,
                        py: 1.5,
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#fff',
                    }}>
                        <Button
                            variant="contained"
                            className="buttonClassname"
                            size="small"
                            fullWidth
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