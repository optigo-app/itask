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
    ToggleButtonGroup,
    ToggleButton,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { CircleX, Grid2x2, ListTodo } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import { formData, rootSubrootflag } from "../../Recoil/atom";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useLocation } from "react-router-dom";
import EstimateInput from "../../Utils/Common/EstimateInput";
import MultiSelectChipWithLimit from "../ShortcutsComponent/AssigneeAutocomplete";
import { commonSelectProps, commonTextFieldProps, convertWordsToSpecialChars, customDatePickerProps } from "../../Utils/globalfun";
import MultiTaskInput from "./MultiTaskInput";
import FileUploader from "../ShortcutsComponent/FileUploader";

const TASK_OPTIONS = [
    { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
    { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
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
    taskAssigneeData
}) => {
    const location = useLocation();
    const theme = useTheme();
    dayjs.extend(utc);
    const [checkedMultiTask, setCheckedMultiTask] = useState(false);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const [rootSubrootflagval, setRootSubrootFlagVal] = useRecoilState(rootSubrootflag)
    const [taskType, setTaskType] = useState("single");
    const [tasksubType, setTaskSubType] = useState("multi2");
    const searchParams = new URLSearchParams(location?.search);
    const encodedData = searchParams.get("data");
    const [decodedData, setDecodedData] = useState(null);
    const [formValues, setFormValues] = React.useState({
        taskName: "",
        bulkTask: [],
        multiTaskName: [""],
        dueDate: null,
        startDate: null,
        assignee: "",
        priority: "",
        description: "",
        attachment: null,
        comment: "",
        progress: "",
        category: "",
        department: "",
        guests: [],
        workcategoryid: "",
        milestoneChecked: 0,
        estimate_hrs: "",
        estimate1_hrs: "",
        estimate2_hrs: "",
    });
    console.log('dddformValues: ', formValues);
    const handleTaskChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskType(newTaskType);
        handleResetState();
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
        const assigneeIdArray = formDataValue?.assigneids?.split(',')?.map(id => Number(id));
        const matchedAssignees = taskAssigneeData?.filter(user => assigneeIdArray?.includes(user.id));
        if (open && rootSubrootflagval?.Task === "root") {
            setFormValues({
                taskName: formDataValue?.taskname ?? "",
                multiTaskName: formDataValue?.actual ?? [""],
                bulkTask: formDataValue?.bulk ?? [],
                dueDate: formDataValue?.DeadLineDate ?? null,
                department: formDataValue?.departmentid ?? "",
                guests: matchedAssignees ?? [],
                assignee: formDataValue?.assigneids ?? "",
                status: formDataValue?.statusid ?? "",
                priority: formDataValue?.priorityid ?? "",
                project: formDataValue?.projectid ?? "",
                description: formDataValue?.descr ?? "",
                attachment: formDataValue?.attachment ?? null,
                progress: formDataValue?.progress ?? "",
                startDate: formDataValue?.StartDate ?? null,
                category: formDataValue?.workcategoryid ?? "",
                estimate: formDataValue?.estimate ?? [""],
                actual: formDataValue?.actual ?? [""],
                milestoneChecked: formDataValue?.ismilestone ? 1 : 0 ?? 0,
                estimate_hrs: formDataValue.estimate_hrs ?? 0,
                estimate1_hrs: formDataValue.estimate1_hrs ?? 0,
                estimate2_hrs: formDataValue.estimate2_hrs ?? 0,
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
    const handleDateChange = (date, key) => {
        debugger
        if (date) {
          const istDate = date.tz('Asia/Kolkata');
      
          setFormValues((prev) => ({
            ...prev,
            [key]: istDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
          }));
      
          console.log(`Selected ${key} in IST:`, istDate.format('YYYY-MM-DDTHH:mm:ss.SSS'));
        }
      };
      

    // Handle estimate form value changes
    const handleEstimateChange = (field, newValue) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: newValue.toString(),
        }));
    };

    const handlebulkTaskSave = (updatedTasks) => {
        setFormValues((prev) => ({
            ...prev,
            bulkTask: updatedTasks,
        }));
    }

    const handleSubmit = (module) => {
        debugger
        const moduleData = rootSubrootflagval?.Task === "AddTask" ? decodedData : null;
        const idString = formValues?.guests?.map(user => user.id)?.join(",");
        const updatedFormDataValue = {
            taskid: moduleData?.taskid ?? formDataValue.taskid ?? "",
            taskname: formValues.taskName ?? formDataValue.taskname,
            bulkTask: formValues?.bulkTask ?? formDataValue?.bulkTask,
            statusid: formValues.status ?? formDataValue.statusid,
            priorityid: formValues.priority ?? formDataValue.priorityid,
            projectid: moduleData?.projectid ?? formValues.project ?? formDataValue.projectid,
            DeadLineDate: formValues.dueDate ?? formDataValue.DeadLineDate,
            workcategoryid: formValues.category ?? formDataValue.workcategoryid,
            StartDate: formValues.startDate ?? formDataValue.entrydate,
            remark: formValues.remark ?? formDataValue.remark,
            departmentid: formValues.department ?? formDataValue.departmentid,
            assigneids: idString ?? formDataValue.assigneids,
            descr: formValues.description ?? formDataValue.descr,
            ismilestone: formValues.milestoneChecked ? 1 : 0 ?? formDataValue.ismilestone,
            estimate_hrs: formValues?.estimate_hrs ?? formDataValue.estimate_hrs,
            estimate1_hrs: formValues?.estimate1_hrs ?? formDataValue.estimate1_hrs,
            estimate2_hrs: formValues?.estimate2_hrs ?? formDataValue.estimate2_hrs,
        };
        onSubmit(updatedFormDataValue, { mode: taskType }, module);
        handleClear();
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        handleResetState();
        setTaskType("single");
        setCheckedMultiTask(prev => !prev);
        setFormValues({
            taskName: "",
            bulkTask: [],
            multiTaskName: [""],
            dueDate: null,
            assignee: "",
            priority: "",
            description: "",
            attachment: null,
            guests: [],
            progress: "",
            startDate: null,
            category: "",
            estimate_hrs: "",
            estimate1_hrs: "",
            estimate2_hrs: "",
            milestoneChecked: false,
        });
    };

    const handleResetState = () => {
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
    // const filterAssigneeData = formValues?.department ? taskAssigneeData?.filter((item) => item.departmentId == formValues?.department) : taskAssigneeData;

    useEffect(() => {
        if (encodedData) {
            try {
                const decodedString = decodeURIComponent(encodedData);
                const jsonString = atob(decodedString);
                const parsedData = JSON.parse(jsonString);
                setDecodedData(parsedData);
            } catch (error) {
                console.error("Error decoding data:", error);
            }
        }
    }, [encodedData]);

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClear}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                {location?.pathname?.includes('/tasks') &&
                    <Box className="drawer-container">
                        <Box className="drawer-header">
                            <Typography variant="h6" className="drawer-title">
                                {taskType === 'multi_input' ? "Add Tasks" : "Add Task"}
                            </Typography>
                            <IconButton onClick={handleClear}>
                                <CircleX />
                            </IconButton>
                        </Box>
                        <div style={{
                            margin: "10px 0",
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: decodedData ? 'space-between' : "end", alignItems: 'start' }}>
                            {decodedData && <Typography variant="caption"
                                sx={{ color: '#7D7f85 !important' }}
                            >
                                {decodedData?.project + '/' + decodedData?.module + (rootSubrootflagval?.Task == "subroot" ? '/' + formDataValue?.taskname : '')}
                            </Typography>}
                            {rootSubrootflagval?.Task !== "root" &&
                                <Box className="tSideBarTgBox">
                                    <ToggleButtonGroup
                                        value={taskType}
                                        exclusive
                                        onChange={handleTaskChange}
                                        aria-label="task type"
                                        size="small"
                                        className="toggle-group"
                                    >
                                        {TASK_OPTIONS?.map(({ id, value, label, icon }) => (
                                            <ToggleButton
                                                key={id}
                                                value={value}
                                                className="toggle-button"
                                                sx={{
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                {icon}
                                                {label}
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Box>
                            }
                        </Box>
                        {taskType === 'single' &&
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={Boolean(formValues?.milestoneChecked)}
                                                onChange={(e) =>
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        milestoneChecked: e.target.checked ? 1 : 0,
                                                    }))
                                                }
                                                color="primary"
                                                className="textfieldsClass milestone-checkbox"
                                            />
                                        }
                                        label="Milestone"
                                        className="milestone-label"
                                    />
                                </Box>
                            </Box>
                        }
                        {taskType === 'single' &&
                            <>
                                <Grid container spacing={1} className="form-row">
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
                                    <Grid item xs={6}>
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
                                    <Grid item xs={6}>
                                        <MultiSelectChipWithLimit
                                            value={formValues?.guests}
                                            options={taskAssigneeData}
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
                                            <Typography className="form-label" variant="subtitle1">
                                                Start Date
                                            </Typography>
                                            <DatePicker
                                                name="startDate"
                                                value={formValues.startDate ? dayjs(formValues.startDate).tz("Asia/Kolkata", true).local() : null}
                                                className="textfieldsClass"
                                                onChange={(date) => handleDateChange(date, 'startDate')}
                                                sx={{ minWidth: 345 }}
                                                format="DD/MM/YYYY"
                                                textField={(params) => (
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
                                                Deadline Date
                                            </Typography>
                                            <DatePicker
                                                name="dueDate"
                                                value={formValues.dueDate ? dayjs(formValues.dueDate).tz("Asia/Kolkata", true).local() : null}
                                                className="textfieldsClass"
                                                onChange={(date) => handleDateChange(date, 'dueDate')}
                                                sx={{ minWidth: 345 }}
                                                format="DD/MM/YYYY"
                                                textField={(params) => (
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
                                <Grid container spacing={1} className="form-row" sx={{ mt: 0.5 }}>
                                    <Grid item xs={4}>
                                        <Box className="form-group">
                                            <Typography className="form-label" variant="subtitle1">
                                                Estimate
                                            </Typography>
                                            <EstimateInput
                                                value={formValues.estimate_hrs}
                                                onChange={(value) => handleEstimateChange("estimate_hrs", value)}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box className="form-group">
                                            <Typography className="form-label" variant="subtitle1">
                                                Actual Estimate
                                            </Typography>
                                            <EstimateInput
                                                value={formValues.estimate1_hrs}
                                                onChange={(value) => handleEstimateChange("estimate1_hrs", value)}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box className="form-group">
                                            <Typography className="form-label" variant="subtitle1">
                                                Final Estimate
                                            </Typography>
                                            <EstimateInput
                                                value={formValues.estimate2_hrs}
                                                onChange={(value) => handleEstimateChange("estimate2_hrs", value)}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                                {/* Comment & Remark */}
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography variant="subtitle1" className="form-label">
                                            Description
                                        </Typography>
                                        <TextField
                                            name="description"
                                            value={convertWordsToSpecialChars(formValues.description)}
                                            onChange={handleChange}
                                            multiline
                                            rows={2}
                                            placeholder="Add a description..."
                                            {...commonTextFieldProps}
                                        />
                                    </Box>
                                </Grid>

                                {/* File Upload */}
                                <Grid item xs={12}>
                                    <FileUploader formValues={formValues} setFormValues={setFormValues} />
                                </Grid>
                            </>
                        }
                        {taskType === 'multi_input' &&
                            <>
                                <Grid item xs={6}>
                                    <Box className="form-group">
                                        {formValues.bulkTask.length === 0 &&
                                            <Typography className="form-label" variant="subtitle1">
                                                Task Name
                                            </Typography>
                                        }
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
                                            className="secondaryBtnClassname"
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
                }
                {location?.pathname?.includes('/projects') &&
                    <Box className="pr_drawer-container">
                        <Box className="drawer-header">
                            <Typography variant="h6" className="drawer-title">
                                Add Projet Module
                            </Typography>
                            <IconButton onClick={handleClear}>
                                <CircleX />
                            </IconButton>
                        </Box>
                        <div style={{
                            margin: "10px 0",
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                        />
                        <>
                            <Grid container spacing={1} className="form-row">
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography
                                            variant="subtitle1"
                                            className="form-label"
                                            htmlFor="taskName"
                                        >
                                            Module
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
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Start Date
                                        </Typography>
                                        <DatePicker
                                            name="startDate"
                                            value={formValues.startDate ? dayjs(formValues.startDate).tz("Asia/Kolkata", true).local() : null}
                                            className="textfieldsClass"
                                            onChange={(date) => handleDateChange(date, 'startDate')}
                                            sx={{ minWidth: 400 }}
                                            format="DD/MM/YYYY"
                                            textField={(params) => (
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
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Due Date
                                        </Typography>
                                        <DatePicker
                                            name="dueDate"
                                            value={formValues.dueDate ? dayjs(formValues.dueDate).tz("Asia/Kolkata", true).local() : null}
                                            className="textfieldsClass"
                                            onChange={(date) => handleDateChange(date, 'dueDate')}
                                            sx={{ minWidth: 400 }}
                                            format="DD/MM/YYYY"
                                            textField={(params) => (
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
                            {/* Comment & Remark */}
                            <Grid item xs={12}>
                                <Box className="form-group">
                                    <Typography variant="subtitle1" className="form-label">
                                        Description
                                    </Typography>
                                    <TextField
                                        name="description"
                                        value={convertWordsToSpecialChars(formValues.description)}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        placeholder="Add a description"
                                        {...commonTextFieldProps}
                                    />
                                </Box>
                            </Grid>

                            {/* File Upload */}
                            <Grid item xs={12}>
                                <FileUploader formValues={formValues} setFormValues={setFormValues} />
                            </Grid>

                            {/* Action button */}
                            <Grid item xs={12} sx={{ textAlign: "right" }}>
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
                                            color="primary"
                                            onClick={() => handleSubmit({ module: true })}
                                            disabled={isLoading}
                                            className="primary-btn"
                                        >
                                            {isLoading ? "Saving..." : "Save"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        </>
                    </Box>
                }
            </Drawer>
        </>
    );
};

export default SidebarDrawer;
