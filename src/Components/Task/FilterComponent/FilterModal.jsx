import React from "react";
import { Box, TextField, Typography, Button, IconButton } from "@mui/material";
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
            {/* inline filters — all fields on screen, wrap to a 2nd row on overflow (no drawer) */}
            {drawerOpen && (
                <Box className="filterInlinePanel" sx={{
                    mt: 1.5, p: 1.5,
                    border: '1px solid #ececf1', borderRadius: '10px', background: '#fafafc',
                    display: 'flex', flexWrap: 'wrap', gap: 1.25, rowGap: 1.5,
                    alignItems: 'flex-end',
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
                            <Box key={filter.key} className="form-group" sx={{ flex: '1 1 150px', minWidth: 150, mb: 0 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.72rem', color: '#6b7280' }}>
                                    {filter.label}
                                </Typography>
                                <CustomAutocomplete
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
                            </Box>
                        );
                    })}

                    {/* Due Date Filter */}
                    <Box className="form-group" sx={{ flex: '1 1 180px', minWidth: 180, mb: 0 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.72rem', color: '#6b7280' }}>Due Date</Typography>
                        <DatePicker
                            name="startDateTime"
                            value={filters?.dueDate ? dayjs(filters.dueDate) : null}
                            onChange={(newDate) => handleFilterChange("dueDate", newDate?.toISOString())}
                            className="textfieldsClass"
                            {...customDatePickerProps}
                            sx={{ width: '100%', padding: "0" }}
                            format="DD/MM/YYYY"
                            renderInput={(params) => (
                                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
                            )}
                        />
                    </Box>

                    {/* Created Date (entrydate) Filter */}
                    <Box className="form-group" sx={{ flex: '1 1 180px', minWidth: 180, mb: 0 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.72rem', color: '#6b7280' }}>Created Date</Typography>
                        <DatePicker
                            name="entrydate"
                            value={filters?.entrydate ? dayjs(filters.entrydate) : null}
                            onChange={(newDate) => handleFilterChange("entrydate", newDate?.toISOString())}
                            className="textfieldsClass"
                            {...customDatePickerProps}
                            sx={{ width: '100%', padding: "0" }}
                            format="DD/MM/YYYY"
                            renderInput={(params) => (
                                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
                            )}
                        />
                    </Box>

                    <Box className="clearAllbtnBox" sx={{ ml: 'auto' }}>
                        <Button
                            variant="contained"
                            className="buttonClassname"
                            size="small"
                            onClick={handleClearAll}
                            sx={{ textTransform: 'none' }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default FiltersDrawer;