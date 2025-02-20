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
    useTheme,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { CircleX, List, ListTodo, Logs } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import { formData, rootSubrootflag } from "../../Recoil/atom";
import dayjs from 'dayjs';
import { useLocation } from "react-router-dom";
import EstimateInput from "../../Utils/Common/EstimateInput";
import { Close, InsertDriveFile } from "@mui/icons-material";
import MultiSelectChipWithLimit from "../../DemoCode/AssigneeAutocomplete";
import { commonSelectProps, commonTextFieldProps, customDatePickerProps } from "../../Utils/globalfun";
import MultiTaskInput from "./MultiTaskInput";

const TASK_OPTIONS = [
    { id: 1, value: "single", label: "Single Task", icon: <ListTodo size={20} /> },
    { id: 2, value: "multi_input", label: "Multi-input Task", icon: <List size={20} /> },
];

const mulTASK_OPTIONS = [
    { id: 3, value: "multi1", label: "Multi-input Task", icon: <List size={20} /> },
    { id: 4, value: "multi2", label: "Bulk Task", icon: <Logs size={20} /> },
];

const SidebarDrawer = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    priorityData,
    projectData,
    taskCategory,
    taskDepartment,
    statusData,
}) => {
    const location = useLocation();
    const theme = useTheme();
    let pathname = location.pathname;
    const [checkedMultiTask, setCheckedMultiTask] = useState(false);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)
    const [estimateValues, setEstimateValues] = useState([""]);
    const [actualValues, setActualValues] = useState([""]);
    const [assignees, setAssignees] = React.useState([]);
    const [taskType, setTaskType] = useState("single");
    const [tasksubType, setTaskSubType] = useState("multi1");
    const [formValues, setFormValues] = React.useState({
        taskName: "",
        bulkTask: [],
        multiTaskName: [""],
        dueDate: null,
        assignee: "",
        priority: "",
        remark: "",
        attachment: null,
        comment: "",
        progress: "",
        startDate: null,
        category: "",
        estimate: [""],
        actual: [""],
        milestoneChecked: false,
    });
    console.log('formValues: ', formValues);

    const handleTaskChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskType(newTaskType);
    };
    const handleTaskSubChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskSubType(newTaskType);
    };

    const filterRefs = {
        priority: useRef(),
        project: useRef(),
        assignee: useRef(),
        progress: useRef(),
        status: useRef(),
        category: useRef(),
        department: useRef(),
    };

    useEffect(() => {
        const assigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData'));
        setAssignees(assigneeData);
        if (open && rootSubrootflagval?.Task === "root") {
            setFormValues({
                taskName: formDataValue?.taskname ?? "",
                multiTaskName: formDataValue?.actual ?? [""],
                bulkTask: formDataValue?.bulk ?? [""],
                dueDate: formDataValue?.DeadLineDate ?? null,
                department: formDataValue?.departmentid ?? "",
                assignee: formDataValue?.assigneeid ?? "",
                status: formDataValue?.statusid ?? "",
                priority: formDataValue?.priorityid ?? "",
                project: formDataValue?.projectid ?? "",
                remark: formDataValue?.remark ?? "",
                attachment: formDataValue?.attachment ?? null,
                comment: "",
                progress: formDataValue?.progress ?? "",
                startDate: formDataValue?.entrydate ?? null,
                category: formDataValue?.workcategoryid ?? "",
                estimate: formDataValue?.estimate ?? [""],
                actual: formDataValue?.actual ?? [""],
                milestoneChecked: formDataValue?.milestone ?? false,
            });
        }
    }, [open, formDataValue, rootSubrootflagval]);


    useEffect(() => {
        setTimeout(() => {
            if (open && rootSubrootflagval?.Task !== "root") {
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
    }, [open, checkedMultiTask, formValues, rootSubrootflagval]);

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // multilineTasks
    const handleMultilineTask = (newValues) => {
        setFormValues((prev) => ({
            ...prev,
            multiTaskName: newValues,
        }));
    };

    // estimated and actual estimate
    const handleEstimateChange = (newValues) => {
        setEstimateValues(newValues);
        setFormValues((prev) => ({
            ...prev,
            estimate: newValues,
        }));
    };

    const handleActualChange = (newValues) => {
        setActualValues(newValues);
        setFormValues((prev) => ({
            ...prev,
            actual: newValues,
        }));
    };

    // Handle file upload
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormValues((prev) => ({ ...prev, attachment: files }));
    };

    // remove file
    const handleRemoveFile = (index) => {
        setFormValues(prev => ({
            ...prev,
            attachment: prev.attachment.filter((_, i) => i !== index)
        }));
    };

    const handlebulkTaskSave = (updatedTasks) => {
        debugger
        console.log('multitask: ', updatedTasks);
        setFormValues((prev) => ({
            ...prev,
            bulkTask: updatedTasks,
        }));
    }

    // Handle form submission
    const handleSubmit = () => {
        onSubmit(formValues, formDataValue, { mode: taskType });
        onClose();
        setTaskType("single");
        setCheckedMultiTask(!checkedMultiTask)
        setFormValues({
            taskName: "",
            bulkTask: [],
            multiTaskName: [""],
            dueDate: null,
            assignee: "",
            priority: "",
            remark: "",
            attachment: null,
            comment: "",
            progress: "",
            startDate: null,
            category: "",
            estimate: [""],
            actual: [""],
            milestoneChecked: false,
        });
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        setTaskType("single");
        setFormValues({
            taskName: "",
            bulkTask: [],
            multiTaskName: [""],
            dueDate: null,
            assignee: "",
            priority: "",
            remark: "",
            attachment: null,
            comment: "",
            progress: "",
            startDate: null,
            category: "",
            estimate: [""],
            actual: [""],
            milestoneChecked: false,
        });
    }

    // departmentwise assignee
    const filterAssigneeData = formValues?.department ? assignees.filter((item) => item.departmentId == formValues?.department) : assignees;

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClear}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                <Box className="drawer-container">
                    <Box className="drawer-header">
                        <Typography variant="h6" className="drawer-title">
                            {pathname == '/projects' ? "Add Project" : "Add Task"}
                        </Typography>
                        <Stack direction="row" sx={{ pr: 5, alignItems: "center" }}>
                            <ToggleButtonGroup
                                value={taskType}
                                exclusive
                                onChange={handleTaskChange}
                                aria-label="task type"
                                size="small"
                                className="toggle-btn-group"
                            >
                                {TASK_OPTIONS?.map(({ id, value, label, icon }) => (
                                    <ToggleButton
                                        key={id}
                                        value={value}
                                        className="toggle-btn"
                                        sx={{
                                            borderRadius: "8px",
                                        }}
                                    >
                                        {icon}
                                        {label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Stack>
                    </Box>
                    <IconButton onClick={handleClear}
                        sx={{
                            position: "absolute",
                            top: "-4px",
                            right: "0px",
                        }}
                    >
                        <CircleX />
                    </IconButton>
                    <div style={{
                        margin: "20px 0",
                        border: "1px dashed #7d7f85",
                        opacity: 0.3,
                    }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formValues?.milestoneChecked}
                                        onChange={(e) => setFormValues((prev) => ({ ...prev, milestoneChecked: e.target.checked }))}
                                        color="primary"
                                        className="textfieldsClass, milestone-checkbox"
                                    />
                                }
                                label="Milestone"
                                className="milestone-label"
                            />
                        </Box>
                        {taskType === 'multi_input' &&
                            <Stack direction="row" sx={{ alignItems: "center" }}>
                                <ToggleButtonGroup
                                    value={tasksubType}
                                    exclusive
                                    onChange={handleTaskSubChange}
                                    aria-label="task type"
                                    size="small"
                                >
                                    {mulTASK_OPTIONS?.map(({ id, value, label, icon }) => (
                                        <Tooltip
                                            key={id}
                                            title={label}
                                            placement="top"
                                            arrow
                                            sx={{
                                                borderRadius: "8px",
                                                "&.Mui-selected": {
                                                    backgroundColor: "#685dd8 !important",
                                                    color: "#fff !important",
                                                },
                                            }}
                                        >
                                            <ToggleButton value={value}>{icon}</ToggleButton>
                                        </Tooltip>
                                    ))}
                                </ToggleButtonGroup>
                            </Stack>
                        }
                    </Box>
                    {taskType === 'single' &&
                        <>
                            <Grid container spacing={2} className="form-row">
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="taskName"
                                        >
                                            Task Name
                                        </Typography>
                                        <TextField
                                            name="taskName"
                                            placeholder="Enter task name"
                                            value={formValues.taskName}
                                            onChange={handleChange}
                                            {...commonTextFieldProps}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Category
                                        </Typography>
                                        <TextField
                                            name="category"
                                            value={formValues.category || ""}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs.category}
                                        >
                                            <MenuItem value="">
                                                <em>Select Category</em>
                                            </MenuItem>
                                            {taskCategory?.map((category) => (
                                                <MenuItem name={category?.id} key={category?.id} value={category?.id}>
                                                    {category.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>
                                {/* department */}
                                <Grid item xs={5}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Department
                                        </Typography>
                                        <TextField
                                            name="department"
                                            value={formValues.department || ""}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs.department}
                                        >
                                            <MenuItem value="">
                                                <em>Select Department</em>
                                            </MenuItem>
                                            {taskDepartment?.map((department) => (
                                                <MenuItem name={department?.id} key={department?.id} value={department?.id}>
                                                    {department.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>
                                {/* Assignee master */}
                                <Grid item xs={7}>
                                    <MultiSelectChipWithLimit
                                        options={filterAssigneeData}
                                        label="Assign To"
                                        placeholder="Select assignees"
                                        limitTags={2}
                                        onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography variant="subtitle1" className="form-label" htmlFor="status">
                                            Status
                                        </Typography>
                                        <TextField
                                            name="status"
                                            value={formValues?.status || ""}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs?.status}
                                        >
                                            <MenuItem value="">
                                                <em>Select Status</em>
                                            </MenuItem>
                                            {statusData?.map((status) => (
                                                <MenuItem name={status?.id} key={status?.id} value={status?.id}>
                                                    {status?.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography variant="subtitle1" className="form-label" htmlFor="priority">
                                            Priority
                                        </Typography>
                                        <TextField
                                            name="priority"
                                            value={formValues?.priority || ""}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs?.priority}
                                        >
                                            <MenuItem value="">
                                                <em>Select Priority</em>
                                            </MenuItem>
                                            {priorityData?.map((priority) => (
                                                <MenuItem name={priority?.id} key={priority?.id} value={priority?.id}>
                                                    {priority?.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="progress"
                                        >
                                            Project
                                        </Typography>
                                        <TextField
                                            name="project"
                                            value={formValues?.project || ""}
                                            onChange={handleChange}
                                            select
                                            {...commonTextFieldProps}
                                            {...commonSelectProps}
                                            ref={filterRefs?.project}
                                        >
                                            <MenuItem value="">
                                                <em>Select project</em>
                                            </MenuItem>
                                            {projectData?.map((project) => (
                                                <MenuItem name={project?.id} key={project?.id} value={project?.id}>
                                                    {project?.labelname}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Start Date
                                        </Typography>
                                        <DatePicker
                                            name="startDate"
                                            value={formValues.startDate ? dayjs(formValues.startDate) : null}
                                            className="textfieldsClass"
                                            onChange={(value) =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    startDate: value,
                                                }))
                                            }
                                            sx={{ minWidth: 320 }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    fullWidth
                                                    className="textfieldsClass"
                                                    sx={{ padding: "0" }}
                                                />
                                            )}
                                            {...customDatePickerProps}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Due Date
                                        </Typography>
                                        <DatePicker
                                            name="dueDate"
                                            value={formValues.dueDate ? dayjs(formValues.dueDate) : null}
                                            className="textfieldsClass"
                                            onChange={(value) =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    dueDate: value,
                                                }))
                                            }
                                            sx={{ minWidth: 320 }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    fullWidth
                                                    className="textfieldsClass"
                                                    sx={{ padding: "0" }}
                                                />
                                            )}
                                            {...customDatePickerProps}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} className="form-row">
                                <Grid item xs={4}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Estimate
                                        </Typography>
                                        <EstimateInput onChanges={handleEstimateChange} />
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Actual Estimate
                                        </Typography>
                                        <EstimateInput onChanges={handleActualChange} />
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Final Estimate
                                        </Typography>
                                        <EstimateInput onChanges={handleActualChange} />
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Comment & Remark */}
                            <Grid item xs={12}>
                                <Box className="form-group">
                                    <Typography variant="subtitle1" className="form-label">
                                        Remark
                                    </Typography>
                                    <TextField
                                        name="remark"
                                        value={formValues.remark}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        placeholder="Add a remark"
                                        {...commonTextFieldProps}
                                    />
                                </Box>
                            </Grid>

                            {/* File Upload */}
                            <Grid item xs={12}>
                                <Box className="form-group">
                                    <Typography
                                        variant="subtitle1"
                                        className="form-label"
                                        htmlFor="attachment"
                                    >
                                        Attachment
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <Button variant="outlined" component="label" className="secondary-btn">
                                            Upload File
                                            <input
                                                type="file"
                                                multiple
                                                hidden
                                                name="attachment"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        {formValues.attachment && formValues.attachment.length > 0 && (
                                            <Box
                                                sx={{
                                                    marginTop: "8px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#f5f5f5",
                                                    maxHeight: "150px",
                                                    overflowY: "auto"
                                                }}
                                            >
                                                {formValues.attachment.map((file, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginBottom: "8px",
                                                            '&:last-child': { marginBottom: 0 }
                                                        }}
                                                    >
                                                        <InsertDriveFile sx={{ marginRight: 1, color: '#7367f0' }} />
                                                        <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {file.name}
                                                        </Typography>
                                                        <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </>
                    }
                    {taskType === 'multi_input' &&
                        <>
                            <Grid item xs={6}>
                                <Box className="form-group">
                                    <Typography className="form-label" variant="subtitle1">
                                        Task Name
                                    </Typography>
                                    <MultiTaskInput multiType={tasksubType} onSave={handlebulkTaskSave} />
                                </Box>
                            </Grid>
                        </>
                    }
                    {(taskType !== 'multi_input' || (taskType === 'multi_input' && formValues.bulkTask.length > 0)) && (
                        <Grid item xs={12} sx={{ textAlign: "right" }}>
                            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        onClick={handleClear}
                                        sx={{ marginRight: "10px" }}
                                        className="secondary-btn"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="primary-btn"
                                    >
                                        {isLoading ? "Saving..." : "Save Task"}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default SidebarDrawer;
