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
    Divider,
} from "@mui/material";
import { CircleX, Grid2x2, ListTodo } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilValue } from "recoil";
import { formData, projectDatasRState, rootSubrootflag, TaskData } from "../../Recoil/atom";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useLocation } from "react-router-dom";
import { cleanDate, commonTextFieldProps, customDatePickerProps, flattenTasks } from "../../Utils/globalfun";
import timezone from 'dayjs/plugin/timezone';
import CustomAutocomplete from "../ShortcutsComponent/CustomAutocomplete";
import { GetPrTeamsApi } from "../../Api/TaskApi/prTeamListApi";
import { toast } from "react-toastify";
import TaskFormSection from "./TaskFormSection";
import ModuleDrawerForm from "./ModuleDrawerForm";
import DynamicDropdownSection from "./DynamicDropdownSection";
import MultiTaskInput from "./MultiTaskInput";

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
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)
    const [taskType, setTaskType] = useState("single");
    const searchParams = new URLSearchParams(location?.search);
    const encodedData = searchParams.get("data");
    const [decodedData, setDecodedData] = useState(null);
    const [isDuplicateTask, setIsDuplicateTask] = useState(false);
    const [isTaskNameEmpty, setIsTaskNameEmpty] = useState(false);
    const [teams, setTeams] = useState([]);
    const [advMasterData, setAdvMasterData] = useState([]);
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


    useEffect(() => {
        const masterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData'));
        const selectedGroupIds = formDataValue?.maingroupids
            ?.split(",")
            ?.map((id) => parseInt(id, 10));

        const filteredData = masterData?.filter(item =>
            selectedGroupIds?.includes(item.id)
        );
        setAdvMasterData(filteredData);
    }, [formDataValue])

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
        debugger
        const logedAssignee = JSON?.parse(localStorage?.getItem("UserProfileData"))
        const assigneeIdArray = formDataValue?.assigneids?.split(',')?.map(id => Number(id));
        const matchedAssignees = formDataValue?.assigneids ? taskAssigneeData?.filter(user => assigneeIdArray?.includes(user.id)) : [];
        const createdById = taskAssigneeData?.filter(user => user.id == formDataValue?.createdbyid)
        if (open && (rootSubrootflagval?.Task === "AddTask" || rootSubrootflagval?.Task === "root")) {
            setFormValues({
                taskName: formDataValue?.taskname ?? "",
                multiTaskName: formDataValue?.actual ?? [""],
                bulkTask: formDataValue?.bulk ?? [],
                dueDate: cleanDate(formDataValue?.DeadLineDate) ?? null,
                department: formDataValue?.department != 0 ? formDataValue?.department : "",
                guests: (matchedAssignees?.length > 0 ? matchedAssignees : [logedAssignee]) ?? [logedAssignee],
                createdBy: (createdById?.length > 0 ? createdById : [logedAssignee]) ?? [logedAssignee],
                projectLead: formDataValue?.projectLead ?? "",
                assignee: formDataValue?.assigneids ?? logedAssignee?.id,
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
                guests: (matchedAssignees?.length > 0 ? matchedAssignees : [logedAssignee]) ?? [logedAssignee],
                createdBy: (createdById?.length > 0 ? createdById : [logedAssignee]) ?? [logedAssignee],
            });
        }
    }, [open, formDataValue, rootSubrootflagval]);

    console.log('formValues: ', formValues);


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

    // for advanced master
    const handleDropdownChange = (dropdownItem, selectedId) => {
        setFormValues((prev) => {
            const updatedDropdowns = Array.isArray(prev.dynamicDropdowns)
                ? [...prev.dynamicDropdowns]
                : [];
            const existingIndex = updatedDropdowns.findIndex(
                (item) => item.label === dropdownItem.label
            );
            const newEntry = {
                teamId: dropdownItem.teamId,
                teamName: dropdownItem.teamName,
                groupId: dropdownItem.groupId,
                groupName: dropdownItem.groupName,
                label: dropdownItem.label,
                selectedId,
            };
            if (existingIndex !== -1) {
                updatedDropdowns[existingIndex] = newEntry;
            } else {
                updatedDropdowns.push(newEntry);
            }
            return {
                ...prev,
                dynamicDropdowns: updatedDropdowns,
            };
        });
    };

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
        const structured = {};
        formValues?.dynamicDropdowns?.forEach((item, index) => {
            const key = `group${index + 1}_attr`;
            structured[key] = item.selectedId;
        });
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
            dynamicDropdowns: structured ?? formDataValue.dynamicDropdowns,
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

    const renderTextField = (label, name, value, placeholder, error, helperText, onChange) => (
        <Box className="form-group">
            <Typography variant="subtitle1" className="form-label">{label}</Typography>
            <TextField
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                error={error}
                helperText={helperText}
                {...commonTextFieldProps}
            />
        </Box>
    );

    const renderAutocomplete = (label, name, value, placeholder, options, onChange) => (
        <CustomAutocomplete
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
        />
    );

    const renderDateField = (label, name, value, onChange) => (
        <Box className="form-group">
            <Typography className="form-label" variant="subtitle1">{label}</Typography>
            <DatePicker
                name={name}
                value={value ? dayjs(value).tz("Asia/Kolkata", true).local() : null}
                onChange={(date) => onChange(date, name)}
                sx={{ width: '100%' }}
                format="DD/MM/YYYY"
                className="textfieldsClass"
                textField={(params) => (
                    <TextField {...params} size="small" className="textfieldsClass" sx={{ p: 0 }} />
                )}
                {...customDatePickerProps}
            />
        </Box>
    );

    const renderTaskActionButtons = () => {
        const isDisabled =
            formValues.bulkTask.length > 0
                ? false
                : isLoading || isTaskNameEmpty || isDuplicateTask;

        return (
            (taskType !== 'multi_input' || (taskType === 'multi_input' && formValues.bulkTask.length > 0)) && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        width: '800px',
                        bgcolor: '#fff',
                        py: 2,
                        px: 3,
                        zIndex: 1301,
                        textAlign: 'right',
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleClear}
                        sx={{ marginRight: '10px' }}
                        className="secondaryBtnClassname"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isDisabled}
                        className="primary-btn"
                    >
                        {isLoading ? 'Saving...' : 'Save Task'}
                    </Button>
                </Box>
            )
        );
    };

    const renderTaskHeader = () => (
        <Box sx={{ display: 'flex', justifyContent: decodedData || rootSubrootflagval?.Task === "subroot" ? 'space-between' : "end", alignItems: 'start' }}>
            {rootSubrootflagval?.Task === "subroot" ? (
                <Typography variant="caption" sx={{ color: '#7D7f85 !important' }}>
                    /{formDataValue?.taskname}
                </Typography>
            ) : (
                <Typography variant="caption" sx={{ color: '#7D7f85 !important' }}>
                    {decodedData && `${decodedData?.project}/${decodedData?.module}${rootSubrootflagval?.Task === "subroot" ? `/${formDataValue?.taskname}` : ''}`}
                </Typography>
            )}

            {rootSubrootflagval?.Task !== "root" && (
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
                                sx={{ borderRadius: "8px" }}
                            >
                                {icon}
                                {label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
            )}
        </Box>
    );

    const TaskDrawerHeader = ({ taskType, rootSubrootflagval, handleClear }) => {
        const getTitle = () => {
            if (taskType === "multi_input") {
                return rootSubrootflagval?.Task === "subroot" ? "Add Sub-Tasks" : "Add Tasks";
            }
            if (rootSubrootflagval?.Task === "AddTask") return "Add Task";
            if (rootSubrootflagval?.Task === "subroot") return "Add Sub-Task";
            return "Edit Task";
        };
        return (
            <>
                <Box className="drawer-header">
                    <Typography variant="h6" className="drawer-title">
                        {getTitle()}
                    </Typography>
                    <IconButton onClick={handleClear}>
                        <CircleX />
                    </IconButton>
                </Box>
                <div
                    style={{
                        margin: "10px 0",
                        border: "1px dashed #7d7f85",
                        opacity: 0.3,
                    }}
                />
            </>
        );
    };

    const dropdownConfigs = useMemo(() => {
        return advMasterData?.flatMap((team) =>
            team.groups.map((group) => ({
                teamId: team.id,
                teamName: team.name,
                groupId: group.id,
                groupName: group.name,
                label: `${team.name}/${group.name}`,
                options: group.attributes.map((attr) => ({
                    id: attr.id,
                    labelname: attr.name,
                })),
            }))
        );
    }, [advMasterData]);

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                {location?.pathname?.includes('/tasks') &&
                    <Box className="drawer-container">
                        <TaskDrawerHeader
                            taskType={taskType}
                            rootSubrootflagval={rootSubrootflagval}
                            handleClear={handleClear}
                        />
                        {renderTaskHeader()}
                        <Grid container spacing={2} alignItems="stretch">
                            <Grid item xs={12} md={taskType == "single" && dropdownConfigs?.length > 0 ? 7.5 : 12}>
                                <TaskFormSection
                                    taskType={taskType}
                                    formValues={formValues}
                                    handleChange={handleChange}
                                    handleDateChange={handleDateChange}
                                    handleEstimateChange={handleEstimateChange}
                                    handlebulkTaskSave={handlebulkTaskSave}
                                    isTaskNameEmpty={isTaskNameEmpty}
                                    isDuplicateTask={isDuplicateTask}
                                    taskCategory={taskCategory}
                                    statusData={statusData}
                                    priorityData={priorityData}
                                    teams={teams}
                                    renderAutocomplete={renderAutocomplete}
                                    renderDateField={renderDateField}
                                    renderTextField={renderTextField}
                                    commonTextFieldProps={commonTextFieldProps}
                                />
                            </Grid>
                            {taskType == "single" && dropdownConfigs?.length > 0 &&
                                <DynamicDropdownSection
                                    dropdownConfigs={dropdownConfigs}
                                    formValues={formValues}
                                    handleDropdownChange={handleDropdownChange}
                                    divider={true}
                                    mdValue={12}
                                    taskType="single"
                                />
                            }
                            {taskType === 'multi_input' && (
                                <Grid item xs={12}>
                                    <Box className="form-group">
                                        {formValues.bulkTask.length === 0 && (
                                            <Typography className="form-label" variant="subtitle1">
                                                Task Name
                                            </Typography>
                                        )}
                                        <MultiTaskInput
                                            onSave={handlebulkTaskSave}
                                            dropdownConfigs={dropdownConfigs}
                                            formValues={formValues}
                                            taskType={taskType}
                                            handleDropdownChange={handleDropdownChange}
                                            divider={true}
                                            mdValue={12}
                                            mainMdValue={4}
                                        />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                        {renderTaskActionButtons()}
                    </Box>
                }
                {location?.pathname?.includes('/projects') &&
                    <ModuleDrawerForm
                        rootSubrootflagval={rootSubrootflagval}
                        formValues={formValues}
                        handleChange={handleChange}
                        handleDateChange={handleDateChange}
                        handleClear={handleClear}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        isTaskNameEmpty={isTaskNameEmpty}
                        isDuplicateTask={isDuplicateTask}
                        teams={teams}
                        projectData={projectData}
                        taskCategory={taskCategory}
                        statusData={statusData}
                        priorityData={priorityData}
                        commonTextFieldProps={commonTextFieldProps}
                        renderAutocomplete={renderAutocomplete}
                        renderDateField={renderDateField}
                    />
                }
            </Drawer>
        </>
    );
};

export default SidebarDrawer;
