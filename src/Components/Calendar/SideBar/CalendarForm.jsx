import React, { useEffect, useRef, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    IconButton,
    Grid,
    ListItemIcon,
    Autocomplete,
    Stack,
    Switch,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
} from "@mui/material";
import { CircleX, Component, Edit, List, Logs, X } from "lucide-react";
import "./CalendarForm.scss";
import { useRecoilValue } from "recoil";
import { CalformData } from "../../../Recoil/atom";
import { styled, useTheme } from '@mui/material/styles';
import CustomDateTimePicker from "../../../Utils/DateComponent/CustomDateTimePicker"
import { convertToIST } from "../../../Utils/Common/convertToIST";
import MultiSelectChipWithLimit from "../../ShortcutsComponent/AssigneeAutocomplete";
import { useLocation } from "react-router-dom";
import CustomSwitch from "../../../Utils/Common/CustomSwitch";
import { commonSelectProps, commonTextFieldProps } from "../../../Utils/globalfun";
import MultiTaskInput from "../../FormComponent/MultiTaskInput";
import ProjectModuleList from "../ProjectModuleList";
import projectJson from "../../../Data/projects.json"
import CustomTimePicker from "../../../Utils/DateComponent/CustomTimePicker";
import CustomDatePicker from "../../../Utils/DateComponent/CustomDatePicker";

const mulTASK_OPTIONS = [
    { id: 3, value: "multi1", label: "Multi-input Task", icon: <List size={20} /> },
    { id: 4, value: "multi2", label: "Bulk Task", icon: <Logs size={20} /> },
];

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    onRemove,
    isLoading,
}) => {
    const location = useLocation();
    const theme = useTheme();
    const [view, setView] = useState("meeting");
    const [tasksubType, setTaskSubType] = useState("multi1");
    const CalformDataValue = useRecoilValue(CalformData);
    const [category, setCategory] = useState([]);
    const [assignees, setAssignees] = React.useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [formValues, setFormValues] = React.useState({
        id: '',
        title: "",
        category: "",
        eventUrl: "",
        start: null,
        end: null,
        guests: [],
        description: "",
        bulkTask: [],
        allDay: false
    });

    const filterRefs = {
        category: useRef(),
        guests: useRef(),
    };

    const calendarsColor = {
        Personal: theme.palette.error.main,
        Business: theme.palette.primary.main,
        Family: theme.palette.warning.main,
        Holiday: theme.palette.success.main,
        ETC: theme.palette.info.main,
    };

    const handleTaskSubChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskSubType(newTaskType);
    };
    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    }

    useEffect(() => {
        const cateData = JSON?.parse(sessionStorage.getItem('taskworkcategoryData'));
        setCategory(cateData);
    }, [])

    // set value when edit
    useEffect(() => {
        const assigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData'));
        setAssignees(assigneeData);
        setTimeout(() => {
            if (CalformDataValue) {
                setFormValues({
                    id: CalformDataValue?.id ?? "",
                    title: CalformDataValue?.title ?? "",
                    category: CalformDataValue?.category ?? "",
                    eventUrl: CalformDataValue?.eventUrl ?? "",
                    start: CalformDataValue?.start ?? null,
                    end: CalformDataValue?.end ?? null,
                    guests: CalformDataValue?.guests ?? [],
                    description: CalformDataValue?.description ?? "",
                    allDay: CalformDataValue?.allDay ?? false
                });
            }
        }, 300);
    }, [open, CalformDataValue]);

    // set placeholder in select menu
    useEffect(() => {
        setTimeout(() => {
            if (open && CalformDataValue) {
                Object.keys(filterRefs).forEach((key) => {
                    const element = filterRefs[key].current;
                    if (element) {
                        const span = element.querySelector(".notranslate");
                        if (span && !formValues[key]) {
                            span.textContent = `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        }
                    }
                });
            }
        }, 300);
    }, [open, CalformDataValue, formValues]);

    // Handle form value changes
    const generateRandomId = () => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            id: prev.id || generateRandomId(),
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = () => {
        if (view === "meeting") {
            if (formValues?.category !== '' && formValues?.title !== '' && formValues?.start !== null && formValues?.end !== null) {
                const updatedFormValues = {
                    ...formValues,
                    isMeeting: true,
                }
                onSubmit(updatedFormValues);
                handleClear();
            }
        } else {
            if (formValues?.bulkTask?.length > 0) {
                onSubmit(formValues);
                handleClear();
            }
        }
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        setFormValues({
            title: "",
            category: "",
            eventUrl: "",
            start: null,
            end: null,
            guests: [],
            description: "",
            allDay: false
        });
    }

    // remove event
    const handleRemoveEvent = () => {
        onRemove(formValues);
        handleClear();
    };

    const getFormTitle = () => {
        const isMeetingPath = location.pathname.includes('meeting');
        const isUpdate = CalformDataValue?.id && CalformDataValue.id !== '';

        if (isMeetingPath) {
            return isUpdate ? "Update Meeting" : "Add Meeting";
        } else {
            return isUpdate ? "Update Event" : "Add Event";
        }
    };

    const handlebulkTaskSave = (updatedTasks) => {
        setFormValues((prev) => ({
            ...prev,
            bulkTask: updatedTasks,
        }));
    }

    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    const handleModuleClick = (module) => {
        setSelectedModule(module);
        setIsEditing(!isEditing);
    };

    const handleRemoveModule = () => {
        setSelectedModule(null);
    }

    return (
        <Drawer anchor="right" open={open} onClose={handleClear} className="MainDrawer">
            <Box className="MD_WrpDiv">
                <Box className="drawer-containerCal">
                    {/* Header */}
                    <Box className="drawer-header">
                        <Typography variant="h6" className="drawer-title">
                            {getFormTitle()}
                        </Typography>
                        <IconButton className="cal_closeBtn" onClick={handleClear}>
                            <CircleX />
                        </IconButton>
                    </Box>
                    <div
                        style={{
                            // marginTop: '5px',
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                    />
                    <Box className="cal_toogleBtn">
                        <Box>
                            {/* {view === "meeting" &&
                                <>
                                    {selectedModule ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Typography variant="body1" className="project-label">{selectedModule}</Typography>
                                            <IconButton onClick={handleRemoveModule} className="remove-module-btn">
                                                <X size={15} />
                                            </IconButton>
                                        </Box>
                                    ) :
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Typography variant="body2" className="project-label">Select Project</Typography>
                                            <IconButton onClick={toggleEditing}>
                                                {isEditing ? <X size={18} /> : <Edit size={18} />}
                                            </IconButton>
                                        </Box>
                                    }
                                </>
                            } */}
                        </Box>
                        <ToggleButtonGroup
                            value={view}
                            exclusive
                            onChange={handleViewChange}
                            className="toggle-group"
                        >
                            <ToggleButton value="meeting" className="toggle-button">
                                Meeting
                            </ToggleButton>
                            <ToggleButton value="task" className="toggle-button">
                                Task
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    {view !== "meeting" &&
                        <Grid item xs={12}>
                            <ProjectModuleList selectedModule={selectedModule} handleModuleClick={handleModuleClick} />
                        </Grid>
                    }
                    {view === "meeting" ? (
                        <Box className="drawer-form">
                            <Grid item xs={12}>
                                {/* {isEditing &&
                                    <ProjectModuleList selectedModule={selectedModule} handleModuleClick={handleModuleClick} />
                                } */}
                            </Grid>
                            <Grid container spacing={1} className="form-row">
                                {/* Task Name and Due Date */}
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="title"
                                        >
                                            Title
                                        </Typography>
                                        <TextField
                                            name="title"
                                            placeholder="Enter task name"
                                            value={formValues.title}
                                            onChange={handleChange}
                                            {...commonTextFieldProps}
                                        />
                                    </Box>
                                </Grid>

                                {/* project */}
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="category"
                                        >
                                            Project/Module
                                        </Typography>
                                        <Autocomplete
                                            options={projectJson}
                                            getOptionLabel={(option) => `${option?.taskPr}/${option?.module}`}
                                            {...commonTextFieldProps}
                                            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select Project/Module" />}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    console.log("Selected project:", newValue);
                                                    // You can add additional logic here to handle the selected project
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* guests and Priority */}
                                <Grid item xs={12}>
                                    <MultiSelectChipWithLimit
                                        options={assignees}
                                        label="Assign To"
                                        placeholder="Select assignees"
                                        limitTags={3}
                                        onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                    />
                                </Grid>

                                {/* Event category */}
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="category"
                                        >
                                            Category
                                        </Typography>
                                        <TextField
                                            name="category"
                                            value={formValues.category}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs.category}
                                            required
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <span className="notranslate">Select Category</span>
                                            </MenuItem>
                                            {category?.map((category) => (
                                                <MenuItem
                                                    key={category?.id}
                                                    value={category?.labelname}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    {category?.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>

                                {/* Progress, Start Date, Repeat */}
                                <Grid item xs={6}>
                                    <CustomDatePicker
                                        label="Start Date"
                                        name="startDateTime"
                                        value={formValues.start}
                                        width='100%'
                                        styleprops={commonTextFieldProps}
                                        onChange={(value) => {
                                            if (value) {
                                                const isIst = convertToIST(value);
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    start: isIst,
                                                }))
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <CustomTimePicker
                                        label="Start Time"
                                        name="endDateTime"
                                        width='100%'
                                        value={formValues.start}
                                        styleprops={commonTextFieldProps}
                                        onChange={(value) => {
                                            if (value) {
                                                const isIst = convertToIST(value);
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    end: isIst,
                                                }))
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <CustomDatePicker
                                        label="End Date"
                                        name="endDateTime"
                                        width='100%'
                                        value={formValues.end}
                                        styleprops={commonTextFieldProps}
                                        onChange={(value) => {
                                            if (value) {
                                                const isIst = convertToIST(value);
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    end: isIst,
                                                }))
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <CustomTimePicker
                                        label="End Time"
                                        name="endDateTime"
                                        width='100%'
                                        value={formValues.end}
                                        styleprops={commonTextFieldProps}
                                        onChange={(value) => {
                                            if (value) {
                                                const isIst = convertToIST(value);
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    end: isIst,
                                                }))
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            {/* all day flag for drag and drop */}
                            <Grid item xs={12} sx={{ marginBlock: 1.5 }}>
                                <Box className="form-group">
                                    <Typography
                                        variant="subtitle1"
                                        className="form-label"
                                        htmlFor="title"
                                    >
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <CustomSwitch checked={formValues.allDay} onChange={(event) => {
                                            setFormValues((prev) => ({
                                                ...prev,
                                                allDay: event.target.checked,
                                            }))
                                        }} />
                                        <Typography>All Day</Typography>
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Comment & description */}
                            <Grid item xs={12}>
                                <Box className="form-group">
                                    <Typography variant="subtitle1" className="form-label">
                                        description
                                    </Typography>
                                    <TextField
                                        name="description"
                                        value={formValues.description}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        placeholder="Add a description"
                                        {...commonTextFieldProps}
                                    />
                                </Box>
                            </Grid>

                            {/* Submit Button */}
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: CalformDataValue?.id && CalformDataValue?.id != '' ? 'space-between' : 'flex-end', alignItems: 'center', mt: 2 }}>
                                {CalformDataValue?.id && CalformDataValue?.id != '' &&
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRemoveEvent(formValues)}
                                        disabled={isLoading}
                                        className="dangerbtnClassname"
                                    >
                                        Delete
                                    </Button>
                                }
                                <Box>
                                    <Button
                                        variant="outlined"
                                        onClick={handleClear}
                                        sx={{ marginRight: "10px" }}
                                        className="secondaryBtnClassname"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="buttonClassname"
                                    >
                                        {CalformDataValue?.id && CalformDataValue?.id !== ''
                                            ? (isLoading ? "Updating..." : "Update")
                                            : (isLoading ? "Adding..." : "Add")
                                        }

                                    </Button>
                                </Box>
                            </Grid>
                        </Box>
                    ) :
                        <Box className="MlTask_CalBox">
                            <MultiTaskInput multiType={tasksubType} onSave={handlebulkTaskSave} />

                            {(view !== 'task' || (formValues?.bulkTask?.length > 0)) && (
                                <Grid item xs={12} sx={{ textAlign: "right" }} className="mt_calSaveBtn">
                                    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                onClick={handleClear}
                                                sx={{ marginRight: "10px" }}
                                                className="secondaryBtnClassname"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleSubmit}
                                                disabled={isLoading}
                                                className="buttonClassname"
                                            >
                                                {isLoading ? "Saving..." : "Save Task"}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </Box>
                    }
                </Box>
            </Box>
        </Drawer>
    );
};

export default CalendarForm;
