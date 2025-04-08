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
import { useRecoilState, useRecoilValue } from "recoil";
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
import CustomDateTimePicker from "../../../Utils/DateComponent/CustomDateTimePicker";
import dayjs from "dayjs";
import FileUploader from "../../ShortcutsComponent/FileUploader";

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    onRemove,
    isLoading,
}) => {
    const location = useLocation();
    const [view, setView] = useState("meeting");
    const [CalformDataValue, setCalFormDataValue] = useRecoilState(CalformData);
    const isDelete = Boolean(CalformDataValue?.id || CalformDataValue?.taskid);
    const [prModuleMaster, setPrModuleMaster] = useState([]);
    const [assignees, setAssignees] = useState([]);
    const [formValues, setFormValues] = React.useState({
        id: '',
        title: "",
        category: "",
        prModule: null,
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
        return enhancedTasks;
    }


    useEffect(() => {
        handleProjectModuleData();
        const taskAssigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData'));
        setAssignees(taskAssigneeData);
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (CalformDataValue) {
                console.log('CalformDataValue: ', CalformDataValue);
                setFormValues({
                    id: (CalformDataValue?.id || CalformDataValue?.meetingid) ?? "",
                    title: (CalformDataValue?.title || CalformDataValue?.meetingtitle) ?? "",
                    category: CalformDataValue?.category ?? "",
                    prModule: (CalformDataValue?.prModule || CalformDataValue?.prModule) ?? null,
                    start: (CalformDataValue?.start || CalformDataValue?.StartDate) ?? null,
                    end: (CalformDataValue?.end || CalformDataValue?.EndDate) ?? null,
                    guests: CalformDataValue?.guests ?? [],
                    description: (CalformDataValue?.description || CalformDataValue?.Desc) ?? "",
                    allDay: (CalformDataValue?.allDay || CalformDataValue?.isAllDay) ?? 0
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


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
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
        debugger
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
            id: '',
            title: "",
            category: "",
            prModule: null,
            start: null,
            end: null,
            guests: [],
            description: "",
            bulkTask: [],
            allDay: false
        });
        onClose();
        setCalFormDataValue(null);
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
                                        value={formValues?.prModule ?? null}
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
                                    value={formValues?.guests}
                                    options={assignees}
                                    label="Assign To"
                                    placeholder="Select assignees"
                                    limitTags={3}
                                    onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                />
                            </Grid>

                            {/* Progress, Start Date, Repeat */}
                            <Grid item xs={12}>
                                <CustomDateTimePicker
                                    label="Start Date & Time"
                                    name="startDateTime"
                                    value={formValues.start}
                                    width='380px'
                                    styleprops={commonTextFieldProps}
                                    onChange={(value) => {
                                        if (value) {
                                            const formattedDate = dayjs(value).utc().format("YYYY-MM-DDTHH:mm:ss.000[Z]");
                                            setFormValues((prev) => ({
                                                ...prev,
                                                start: formattedDate,
                                            }))
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomDateTimePicker
                                    label="End Date & Time"
                                    name="endDateTime"
                                    value={formValues.end}
                                    width='380px'
                                    styleprops={commonTextFieldProps}
                                    onChange={(value) => {
                                        if (value) {
                                            const formattedDate = dayjs(value).utc().format("YYYY-MM-DDTHH:mm:ss.000[Z]");
                                            setFormValues((prev) => ({
                                                ...prev,
                                                end: formattedDate,
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
                                    <CustomSwitch
                                        checked={formValues.allDay === 1}
                                        onChange={(event) => {
                                            setFormValues((prev) => ({
                                                ...prev,
                                                allDay: event.target.checked ? 1 : 0,
                                            }));
                                        }}
                                    />
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

                        <Grid item xs={12}>
                            <FileUploader formValues={formValues} setFormValues={setFormValues} />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: isDelete ? 'space-between' : 'flex-end', alignItems: 'center', mt: 2 }}>
                            {isDelete &&
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
                                    {isDelete
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
