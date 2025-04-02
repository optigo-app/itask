import React, { useEffect, useRef, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
    Grid,
    Autocomplete,
    Stack,
} from "@mui/material";
import { CircleX, List, Logs, X } from "lucide-react";
import "./CalendarForm.scss";
import { useRecoilValue } from "recoil";
import { CalformData } from "../../../Recoil/atom";
import { useTheme } from '@mui/material/styles';
import { convertToIST } from "../../../Utils/Common/convertToIST";
import MultiSelectChipWithLimit from "../../ShortcutsComponent/AssigneeAutocomplete";
import { useLocation } from "react-router-dom";
import CustomSwitch from "../../../Utils/Common/CustomSwitch";
import { commonTextFieldProps, mapTaskLabels } from "../../../Utils/globalfun";
import CustomTimePicker from "../../../Utils/DateComponent/CustomTimePicker";
import CustomDatePicker from "../../../Utils/DateComponent/CustomDatePicker";
import { fetchModuleDataApi } from "../../../Api/TaskApi/ModuleDataApi";

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    onRemove,
    isLoading,
}) => {
    const location = useLocation();
    const [view, setView] = useState("meeting");
    const CalformDataValue = useRecoilValue(CalformData);
    const [category, setCategory] = useState([]);
    const [prModuleMaster, setPrModuleMaster] = useState([]);
    const [assignees, setAssignees] = React.useState([]);
    const [formValues, setFormValues] = React.useState({
        id: '',
        title: "",
        category: "",
        prModule: "",
        start: null,
        end: null,
        guests: [],
        description: "",
        bulkTask: [],
        allDay: false
    });

    console.log('formValues: ', formValues);
    const filterRefs = {
        category: useRef(),
        guests: useRef(),
    };

    const handleProjectModuleData = async () => {
        const taskProject = JSON?.parse(sessionStorage?.getItem('taskprojectData'));
        const taskDepartment = JSON?.parse(sessionStorage?.getItem('taskdepartmentData'));
        const taskCategory = JSON?.parse(sessionStorage?.getItem('taskworkcategoryData'));
        const taskData = await fetchModuleDataApi();
        const labeledTasks = mapTaskLabels(taskData);
        const enhanceTask = (task) => {
            const project = taskProject?.find(item => item?.id == task?.projectid);
            const department = taskDepartment?.find(item => item?.id == task?.departmentid);
            const category = taskCategory?.find(item => item?.id == task?.workcategoryid);

            return {
                ...task,
                taskPr: project ? project?.labelname : '',
                taskDpt: department ? department?.labelname : '',
                category: category?.labelname,
            };
        };
        const enhancedTasks = labeledTasks?.map(task => enhanceTask(task));
        setPrModuleMaster(enhancedTasks);
    }


    useEffect(() => {
        const cateData = JSON?.parse(sessionStorage.getItem('taskworkcategoryData'));
        setCategory(cateData);
        handleProjectModuleData();
    }, [])

    useEffect(() => {
        const assigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData'));
        setAssignees(assigneeData);
        setTimeout(() => {
            if (CalformDataValue) {
                setFormValues({
                    id: CalformDataValue?.id ?? "",
                    title: CalformDataValue?.title ?? "",
                    category: CalformDataValue?.category ?? "",
                    prModule: CalformDataValue?.eventUrl ?? "",
                    start: CalformDataValue?.start ?? null,
                    end: CalformDataValue?.end ?? null,
                    guests: CalformDataValue?.guests ?? [],
                    description: CalformDataValue?.description ?? "",
                    allDay: CalformDataValue?.allDay ?? false
                });
            }
        }, 300);
    }, [open, CalformDataValue]);

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

    const handleProjectModuleChange = (_, newValue) => {
        console.log('newValue: ', newValue);
        setFormValues(prev => ({
            ...prev,
            prModule: newValue ?? ""
        }));
    };

    const handleSubmit = () => {
        if (view === "meeting") {
            if (formValues) {
                const idString = formValues?.guests?.map(user => user.id)?.join(",");
                const updatedFormValues = {
                    ...formValues,
                    isMeeting: true,
                    assigneids: idString ?? "",
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

    const handleClear = () => {
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
        onClose();
    }

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
                            marginBottom: '15px',
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                    />
                    <Box className="drawer-form">
                        <Grid item xs={12}>
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
                                        options={prModuleMaster}
                                        getOptionLabel={(option) => `${option?.taskPr}/${option?.taskname}`}
                                        {...commonTextFieldProps}
                                        onChange={handleProjectModuleChange}
                                        renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select Project/Module" />}
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

                </Box>
            </Box>
        </Drawer>
    );
};

export default CalendarForm;
