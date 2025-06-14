import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
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
import { formData, projectDatasRState, rootSubrootflag, TaskData } from "../../Recoil/atom";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useLocation } from "react-router-dom";
import EstimateInput from "../../Utils/Common/EstimateInput";
import { cleanDate, commonTextFieldProps, customDatePickerProps, flattenTasks } from "../../Utils/globalfun";
import MultiTaskInput from "./MultiTaskInput";
import timezone from 'dayjs/plugin/timezone';
import CustomAutocomplete from "../ShortcutsComponent/CustomAutocomplete";
import DepartmentAssigneeAutocomplete from "../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete";
import { GetPrTeamsApi } from "../../Api/TaskApi/prTeamListApi";
import { toast } from "react-toastify";

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
    dayjs.extend(timezone);
    const projectModuleData = useRecoilValue(projectDatasRState);
    const taskDataValue = useRecoilValue(TaskData);
    const formDataValue = useRecoilValue(formData);
    console.log('formDataValue: ', formDataValue);
    const [rootSubrootflagval, setRootSubrootFlagVal] = useRecoilState(rootSubrootflag)
    const [taskType, setTaskType] = useState("single");
    const [tasksubType, setTaskSubType] = useState("multi2");
    const searchParams = new URLSearchParams(location?.search);
    const encodedData = searchParams.get("data");
    const [decodedData, setDecodedData] = useState(null);
    const [isDuplicateTask, setIsDuplicateTask] = useState(false);
    const [isTaskNameEmpty, setIsTaskNameEmpty] = useState(false);
    const [teams, setTeams] = useState([]);
    const [formValues, setFormValues] = React.useState({
        taskName: "",
        bulkTask: [],
        multiTaskName: [""],
        dueDate: null,
        startDate: null,
        assignee: "",
        createdBy: [],
        projectLead: "",
        status: "",
        priority: "",
        description: "",
        attachment: null,
        comment: "",
        progress: "",
        category: "",
        department: "",
        guests: [],
        projectLead: [],
        workcategoryid: "",
        milestoneChecked: 0,
        estimate_hrs: "",
        estimate1_hrs: "",
        estimate2_hrs: "",
    });
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

    const handleGetTeamMembers = async () => {
        let flag = location?.pathname?.includes("/tasks/") ? "subroot" : "root"
        let payload = location?.pathname?.includes("/tasks/") ? decodedData : formDataValue
        const apiRes = await GetPrTeamsApi(payload, flag);
        if (apiRes?.rd) {
            const assigneeMaster =
                JSON.parse(sessionStorage?.getItem("taskAssigneeData")) || [];
            const enrichedTeamMembers = apiRes.rd.map((member) => {
                const empDetails = assigneeMaster.find(
                    (emp) => emp.id === member.assigneeid
                );
                return {
                    ...member,
                    ...empDetails,
                };
            });
            setTeams(enrichedTeamMembers);
        } else {
            toast.error("Something went wrong");
            setTeams([]);
        }
    };

    useEffect(() => {
        if (decodedData || formDataValue) {
            handleGetTeamMembers();
        }
    }, [formDataValue, decodedData])

    const handleTaskChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskType(newTaskType);
        handleResetState();
    };

    useEffect(() => {
        const logedAssignee = JSON?.parse(localStorage?.getItem("UserProfileData"))
        const assigneeIdArray = formDataValue?.assigneids?.split(',')?.map(id => Number(id));
        const matchedAssignees = formDataValue?.assigneids ? taskAssigneeData?.filter(user => assigneeIdArray?.includes(user.id)) : [];
        if (open && (rootSubrootflagval?.Task === "AddTask" || rootSubrootflagval?.Task === "root")) {
            setFormValues({
                taskName: formDataValue?.taskname ?? "",
                multiTaskName: formDataValue?.actual ?? [""],
                bulkTask: formDataValue?.bulk ?? [],
                dueDate: cleanDate(formDataValue?.DeadLineDate) ?? null,
                department: formDataValue?.department != 0 ? formDataValue?.department : "",
                guests: matchedAssignees ?? [],
                createdBy: [logedAssignee] ?? [],
                projectLead: formDataValue?.projectLead ?? "",
                assignee: formDataValue?.assigneids ?? "",
                status: formDataValue?.statusid ?? "",
                priority: formDataValue?.priorityid ?? "",
                project: formDataValue?.projectid ?? "",
                description: formDataValue?.descr ?? "",
                attachment: formDataValue?.attachment ?? null,
                progress: formDataValue?.progress ?? "",
                startDate: cleanDate(formDataValue?.StartDate) ?? null,
                category: formDataValue?.workcategoryid ?? "",
                estimate: formDataValue?.estimate ?? [""],
                actual: formDataValue?.actual ?? [""],
                milestoneChecked: formDataValue?.ismilestone ? 1 : 0 ?? 0,
                estimate_hrs: formDataValue.estimate_hrs ?? 0,
                estimate1_hrs: formDataValue.estimate1_hrs ?? 0,
                estimate2_hrs: formDataValue.estimate2_hrs ?? 0,
            });
        } else if (rootSubrootflagval?.Task === "subroot") {
            setFormValues({
                ...formValues,
                guests: matchedAssignees ?? [],
                createdBy: [logedAssignee] ?? [],
            });
        }
    }, [open, formDataValue, rootSubrootflagval]);

    let data = flattenTasks(taskDataValue)
    const taskName = useMemo(() => formValues?.taskName?.trim() || "", [formValues?.taskName]);

    const projectId = useMemo(() => {
        if (rootSubrootflagval?.Task === "AddTask") {
            return formValues?.project || decodedData?.projectid || formDataValue?.projectid;
        } else {
            return formValues?.project || formDataValue?.projectid;
        }
    }, [formValues?.project, decodedData?.projectid, formDataValue?.projectid, rootSubrootflagval?.Task]);

    const flattenedTasks = useMemo(() => {
        if (location?.pathname?.includes("/projects")) {
            return projectModuleData ? flattenTasks(taskDataValue) : [];
        }
        return flattenTasks(taskDataValue);
    }, [location?.pathname, projectModuleData, taskDataValue]);

    useEffect(() => {
        if (!rootSubrootflagval?.Task) return;

        const isRoot = rootSubrootflagval?.Task === "root";
        const isAddOrSub = rootSubrootflagval?.Task === "AddTask" || rootSubrootflagval?.Task === "subroot";

        if (projectId) {
            setIsTaskNameEmpty(taskName === "");
        }

        if (!projectId || !taskName) {
            setIsDuplicateTask(false);
            return;
        }

        if (isAddOrSub) {
            const match = flattenedTasks.find(
                task =>
                    task?.projectid === projectId &&
                    task?.taskname?.trim()?.toLowerCase() === taskName.toLowerCase()
            );
            setIsDuplicateTask(!!match);
        } else if (isRoot) {
            if (formDataValue?.taskname?.trim()?.toLowerCase() === taskName.toLowerCase()) {
                setIsDuplicateTask(false);
            } else {
                const match = data.find(
                    task =>
                        task?.projectid === projectId &&
                        task?.taskname?.trim()?.toLowerCase() === taskName.toLowerCase()
                );
                setIsDuplicateTask(!!match);
            }
        } else {
            setIsDuplicateTask(false);
            setIsTaskNameEmpty(false);
        }
    }, [
        open,
        taskName,
        projectId,
        flattenedTasks,
        data,
        rootSubrootflagval?.Task,
        formDataValue?.taskname
    ]);

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleDateChange = (date, key) => {
        if (date) {
            const istDate = date.tz('Asia/Kolkata');
            setFormValues((prev) => ({
                ...prev,
                [key]: istDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
            }));
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
        const assignees = formValues?.guests && Object.values(
            formValues?.guests?.reduce((acc, user) => {
                const dept = user.department;
                if (!acc[dept]) {
                    acc[dept] = {
                        department: dept,
                        assignee: user.id.toString()
                    };
                } else {
                    acc[dept].assignee += `,${user.id}`;
                }
                return acc;
            }, {})
        );
        const updatedFormDataValue = {
            taskid: moduleData?.taskid ?? formDataValue.taskid ?? "",
            taskname: formValues.taskName ?? formDataValue.taskname,
            bulkTask: formValues?.bulkTask ?? formDataValue?.bulkTask,
            statusid: formValues.status ?? formDataValue.statusid,
            priorityid: formValues.priority ?? formDataValue.priorityid,
            projectid: moduleData?.projectid ?? formValues.project ?? formDataValue.projectid,
            projectLead: formValues?.projectLead ?? formDataValue?.projectLead,
            DeadLineDate: formValues.dueDate ?? formDataValue.DeadLineDate,
            workcategoryid: formValues.category ?? formDataValue.workcategoryid,
            StartDate: formValues.startDate ?? formDataValue.entrydate,
            remark: formValues.remark ?? formDataValue.remark,
            departmentid: formValues.department ?? formDataValue.departmentid,
            assigneids: idString ?? formDataValue.assigneids,
            createdBy: formValues.createdBy ?? formDataValue.createdBy,
            departmentAssigneelist: assignees ?? formDataValue.assigneids,
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
        const logedAssignee = JSON?.parse(localStorage?.getItem("UserProfileData"))
        setFormValues({
            taskName: "",
            bulkTask: [],
            multiTaskName: [""],
            dueDate: null,
            assignee: "",
            priority: "",
            description: "",
            attachment: null,
            guests: [logedAssignee],
            progress: "",
            startDate: null,
            category: "",
            estimate_hrs: "",
            estimate1_hrs: "",
            estimate2_hrs: "",
            milestoneChecked: false,
        });
    }

    // // departmentwise assignee
    // const departmentId = formValues?.department;
    // const departmentName = taskDepartment?.find(dept => dept.id == departmentId)?.labelname;
    // const filterAssigneeData = departmentName ? taskAssigneeData?.filter((item) => item.department == departmentName) : taskAssigneeData;




    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                // onClose={handleClear}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                {location?.pathname?.includes('/tasks') &&
                    <Box className="drawer-container">
                        <Box className="drawer-header">
                            <Typography variant="h6" className="drawer-title">
                                {taskType === 'multi_input'
                                    ? (rootSubrootflagval?.Task === "subroot" ? "Add Sub-Tasks" : "Add Tasks")
                                    : rootSubrootflagval?.Task === "AddTask"
                                        ? "Add Task"
                                        : rootSubrootflagval?.Task === "subroot"
                                            ? "Add Sub-Task"
                                            : "Edit Task"
                                }
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
                        <Box sx={{ display: 'flex', justifyContent: decodedData || rootSubrootflagval?.Task === "subroot" ? 'space-between' : "end", alignItems: 'start' }}>
                            {rootSubrootflagval?.Task === "subroot" ? <Typography variant="caption"
                                sx={{ color: '#7D7f85 !important' }}
                            >
                                {rootSubrootflagval?.Task === "subroot" && `/${formDataValue?.taskname}`}
                            </Typography>
                                :
                                <Typography variant="caption"
                                    sx={{ color: '#7D7f85 !important' }}
                                >
                                    {decodedData && decodedData?.project + '/' + decodedData?.module + (rootSubrootflagval?.Task == "subroot" ? '/' + formDataValue?.taskname : '')}
                                </Typography>
                            }
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
                                    <Grid item xs={12} sm={12} md={6}>
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
                                                error={isTaskNameEmpty || isDuplicateTask}
                                                helperText={
                                                    isTaskNameEmpty
                                                        ? "Task name is required."
                                                        : isDuplicateTask
                                                            ? "This Task name already exists for the selected project."
                                                            : ""
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <CustomAutocomplete
                                            label="Category"
                                            name="category"
                                            value={formValues.category}
                                            onChange={handleChange}
                                            options={taskCategory}
                                            placeholder="Select Category"
                                        />
                                    </Grid>
                                    {/* created at assignee */}
                                    <Grid item xs={12} sm={12} md={12}>
                                        <DepartmentAssigneeAutocomplete
                                            value={formValues?.createdBy}
                                            options={teams}
                                            label="Created By"
                                            placeholder="Select assignees"
                                            limitTags={2}
                                            onChange={(newValue) => handleChange({ target: { name: 'createdBy', value: newValue } })}
                                            disabled={true}
                                        />
                                    </Grid>
                                    {/* Assignee master */}
                                    <Grid item xs={12} sm={12} md={12}>
                                        <DepartmentAssigneeAutocomplete
                                            value={formValues?.guests}
                                            options={teams}
                                            label="Assign To"
                                            placeholder="Select assignees"
                                            limitTags={2}
                                            onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <CustomAutocomplete
                                            label="Status"
                                            name="status"
                                            value={formValues.status}
                                            onChange={handleChange}
                                            options={statusData}
                                            placeholder="Select Status"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <CustomAutocomplete
                                            label="Priority"
                                            name="priority"
                                            value={formValues.priority}
                                            onChange={handleChange}
                                            options={priorityData}
                                            placeholder="Select Priority"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <Box className="form-group">
                                            <Typography className="form-label" variant="subtitle1">
                                                Start Date
                                            </Typography>
                                            <DatePicker
                                                name="startDate"
                                                value={formValues.startDate ? dayjs(formValues.startDate).tz("Asia/Kolkata", true).local() : null}
                                                className="textfieldsClass"
                                                onChange={(date) => handleDateChange(date, 'startDate')}
                                                sx={{ width: "100%" }}
                                                format="DD/MM/YYYY"
                                                textField={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        className="textfieldsClass"
                                                        sx={{ padding: "0" }}
                                                    />
                                                )}
                                                {...customDatePickerProps}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <Box className="form-group">
                                            <Typography className="form-label" variant="subtitle1">
                                                Deadline Date
                                            </Typography>
                                            <DatePicker
                                                name="dueDate"
                                                value={formValues.dueDate ? dayjs(formValues.dueDate).tz("Asia/Kolkata", true).local() : null}
                                                className="textfieldsClass"
                                                onChange={(date) => handleDateChange(date, 'dueDate')}
                                                sx={{ width: "100%" }}
                                                format="DD/MM/YYYY"
                                                textField={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
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
                                    <Grid item xs={12} sm={12} md={4}>
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
                                    <Grid item xs={12} sm={12} md={4}>
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
                                    <Grid item xs={12} sm={12} md={4}>
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
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        <Typography variant="subtitle1" className="form-label">
                                            Description
                                        </Typography>
                                        <TextField
                                            name="description"
                                            value={formValues.description}
                                            onChange={handleChange}
                                            multiline
                                            rows={2}
                                            placeholder="Add a description..."
                                            {...commonTextFieldProps}
                                        />
                                    </Box>
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
                            <Grid item xs={12} sx={{ mt: 3, textAlign: "right" }}>
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
                                            disabled={
                                                formValues.bulkTask.length > 0
                                                    ? false
                                                    : isLoading || isTaskNameEmpty || isDuplicateTask
                                            }

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
                                {rootSubrootflagval?.Task == "AddTask" ? "Add Project Module" : "Edit Project Module"}
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
                                <Grid item xs={12} sm={12}>
                                    <CustomAutocomplete
                                        label="Project"
                                        name="project"
                                        value={formValues.project}
                                        onChange={handleChange}
                                        options={projectData}
                                        placeholder="Select Project"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
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
                                            error={isTaskNameEmpty || isDuplicateTask}
                                            helperText={
                                                isTaskNameEmpty
                                                    ? "Module name is required."
                                                    : isDuplicateTask
                                                        ? "This module name already exists for the selected project."
                                                        : ""
                                            }
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12}>
                                    <DepartmentAssigneeAutocomplete
                                        value={formValues?.createdBy}
                                        options={teams}
                                        label="Created By"
                                        placeholder="Select assignees"
                                        limitTags={2}
                                        onChange={(newValue) => handleChange({ target: { name: 'createdBy', value: newValue } })}
                                        disabled={true}
                                    />
                                </Grid>
                                {/* <Grid item xs={12} sm={12}>
                                    <DepartmentAssigneeAutocomplete
                                        value={formValues?.guests}
                                        options={filterAssigneeData}
                                        label="Assign To"
                                        placeholder="Select assignee"
                                        limitTags={2}
                                        onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                    />
                                </Grid> */}
                                <Grid item xs={12} sm={12}>
                                    <CustomAutocomplete
                                        label="Category"
                                        name="category"
                                        value={formValues.category}
                                        onChange={handleChange}
                                        options={taskCategory}
                                        placeholder="Select Category"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <CustomAutocomplete
                                        label="Status"
                                        name="status"
                                        value={formValues.status}
                                        onChange={handleChange}
                                        options={statusData}
                                        placeholder="Select Status"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <CustomAutocomplete
                                        label="Priority"
                                        name="priority"
                                        value={formValues.priority}
                                        onChange={handleChange}
                                        options={priorityData}
                                        placeholder="Select Priority"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Start Date
                                        </Typography>
                                        <DatePicker
                                            name="startDate"
                                            value={formValues.startDate ? dayjs(formValues.startDate).tz("Asia/Kolkata", true).local() : null}
                                            className="textfieldsClass"
                                            onChange={(date) => handleDateChange(date, 'startDate')}
                                            sx={{ width: "100%" }}
                                            format="DD/MM/YYYY"
                                            textField={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    className="textfieldsClass"
                                                    sx={{ padding: "0" }}
                                                />
                                            )}
                                            {...customDatePickerProps}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Box className="form-group">
                                        <Typography className="form-label" variant="subtitle1">
                                            Due Date
                                        </Typography>
                                        <DatePicker
                                            name="dueDate"
                                            value={formValues.dueDate ? dayjs(formValues.dueDate).tz("Asia/Kolkata", true).local() : null}
                                            className="textfieldsClass"
                                            onChange={(date) => handleDateChange(date, 'dueDate')}
                                            sx={{ width: "100%" }}
                                            format="DD/MM/YYYY"
                                            textField={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    className="textfieldsClass"
                                                    sx={{ padding: "0" }}
                                                />
                                            )}
                                            {...customDatePickerProps}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Box className="form-group">
                                    <Typography variant="subtitle1" className="form-label">
                                        Description
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
                            <Grid item xs={12} sx={{ mt: 3, textAlign: "right" }}>
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
                                            disabled={isLoading || isTaskNameEmpty || isDuplicateTask}
                                            onClick={() => handleSubmit({ module: true })}
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
