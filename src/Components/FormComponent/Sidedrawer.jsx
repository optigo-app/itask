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
} from "@mui/material";
import { CircleX, Grid2x2, ListTodo } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilValue } from "recoil";
import { formData, projectDatasRState, rootSubrootflag, TaskData } from "../../Recoil/atom";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useLocation } from "react-router-dom";
import { cleanDate, commonTextFieldProps, customDatePickerProps, flattenTasks, mapTaskLabels } from "../../Utils/globalfun";
import timezone from 'dayjs/plugin/timezone';
import CustomAutocomplete from "../ShortcutsComponent/CustomAutocomplete";
import { GetPrTeamsApi } from "../../Api/TaskApi/prTeamListApi";
import { toast } from "react-toastify";
import TaskFormSection from "./TaskFormSection";
import ModuleDrawerForm from "./ModuleDrawerForm";
import DynamicDropdownSection from "./DynamicDropdownSection";
import MultiTaskInput from "./MultiTaskInput";
import Breadcrumb from "../BreadCrumbs/Breadcrumb";
import CustomDateTimePicker from "../../Utils/DateComponent/CustomDateTimePicker";
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";
import { getAdvancedtaseditApi } from "../../Api/MasterApi/AssigneeMaster";
import { set } from "lodash";

const TASK_OPTIONS = [
    { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
    { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
];

const SidebarDrawer = ({
    open,
    onClose,
    onSubmit,
    prModule = false,
    categoryDisabled = false,
    allDayShow = false,
    isLoading,
    priorityData,
    projectData,
    taskCategory,
    statusData,
    secStatusData,
    taskAssigneeData,
    handleMeetingDt,
    handleRemoveMetting
}) => {
    const location = useLocation();
    const theme = useTheme();
    const date = new Date();
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const formDataValue = useRecoilValue(formData);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)
    const [taskType, setTaskType] = useState("single");
    const [decodedData, setDecodedData] = useState(null);
    const [isDuplicateTask, setIsDuplicateTask] = useState(false);
    const [isTaskNameEmpty, setIsTaskNameEmpty] = useState(false);
    const [teams, setTeams] = useState([]);
    const [dynamicFilterData, setDynamicFilterData] = useState([]);
    const [advMasterData, setAdvMasterData] = useState([]);
    const [prModuleMaster, setPrModuleMaster] = useState([]);
    const [selectedMainGroup, setSelectedMainGroup] = useState('');
    const [formValues, setFormValues] = React.useState({
        taskName: "",
        bulkTask: [],
        multiTaskName: [""],
        dueDate: null,
        startDate: date?.toISOString(),
        assignee: "",
        createdBy: [],
        projectLead: "",
        status: "",
        secstatus: "",
        priority: "",
        description: "",
        attachment: null,
        comment: "",
        progress: "",
        category: "",
        department: "",
        guests: [],
        projectLead: [],
        prModule: {},
        workcategoryid: "",
        milestoneChecked: 0,
        estimate_hrs: "",
        estimate1_hrs: "",
        estimate2_hrs: "",
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const encodedData = searchParams.get("data");
        if (encodedData) {
            try {
                const decodedString = decodeURIComponent(encodedData);
                const jsonString = atob(decodedString);
                const parsedData = JSON.parse(jsonString);
                setDecodedData(parsedData);
            } catch (error) {
                console.error("Error decoding data:", error);
            }
        } else {
            setDecodedData(null);
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        const masterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData'));
        const selectedGroupIds = decodedData ? decodedData?.maingroupids : formDataValue?.maingroupids
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
            const data = location?.pathname?.includes("/meetings") ? taskAssigneeData : enrichedTeamMembers;
            setTeams(data);
        } else {
            toast.error("Something went wrong");
            setTeams([]);
        }
    };

    const mapMergedToStructured = (mergedData, masterData) => {
        const result = [];
        const mainTeam = masterData.find(team => team.id === mergedData?.bindedmaingroupid);
        if (!mainTeam || !mainTeam.groups) return result;
        for (const key in mergedData) {
            if (key.toLowerCase() === 'id' || key.toUpperCase().startsWith('G')) continue;
            const selectedId = mergedData[key];
            if (!selectedId) continue;
            let matched = false;
            for (const group of mainTeam.groups) {
                if (!group.attributes) continue;
                const attribute = group.attributes.find(attr => attr.id === selectedId);
                if (attribute) {
                    if ((group.name || '').toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, '')) {
                        result.push({
                            teamId: mainTeam.id,
                            teamName: mainTeam.name || '',
                            groupId: group.id,
                            groupName: group.name,
                            label: `${mainTeam.name || ''}/${group.name}`,
                            selectedId: selectedId
                        });
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;
        }

        return result;
    };

    const structuredAdvData = JSON.parse(
        sessionStorage.getItem("structuredAdvMasterData")
    ) || [];

    const handleGetDynamicFilterValue = async () => {
        const selectedRow = formDataValue;
        if (selectedRow?.maingroupids !== "0" && selectedRow?.maingroupids !== "") {
            const apiRes = await getAdvancedtaseditApi(selectedRow?.taskid);
            if (apiRes) {
                const merged = {};
                for (const key in apiRes?.rd[0]) {
                    if (apiRes?.rd[0]?.hasOwnProperty(key) && apiRes?.rd1[0]?.hasOwnProperty(key)) {
                        merged[apiRes?.rd[0][key]] = apiRes?.rd1[0][key];
                    }
                }
                const structuredResult = mapMergedToStructured(merged, structuredAdvData);
                setSelectedMainGroup(structuredResult[0]?.teamName)
                setDynamicFilterData(structuredResult);
            } else {
                toast.error("Something went wrong");
                setTeams([]);
            }
        }
    }

    useEffect(() => {
        if (open) {
            handleGetTeamMembers();
            handleGetDynamicFilterValue();
        }
    }, [open])

    const handleTaskChange = (event, newTaskType) => {
        if (newTaskType !== null) setTaskType(newTaskType);
        handleResetState();
    };

    useEffect(() => {
        const loggedAssignee = JSON.parse(localStorage?.getItem("UserProfileData"));
        const assigneeIdArray = formDataValue?.assigneids?.split(',')?.map(Number) || [];
        const matchedAssignees = taskAssigneeData?.filter(user => assigneeIdArray.includes(user.id)) || [];
        const createdByUsers = taskAssigneeData?.filter(user => user.id === loggedAssignee?.id) || [];
        const categoryflag = location?.pathname?.includes("meeting");
        const category = taskCategory?.find(cat => cat.labelname?.toLowerCase() === "meeting");
        const fallbackPrModule = {
            projectid: formDataValue?.projectid ?? decodedData?.projectid,
            projectname: formDataValue?.taskPr ?? decodedData?.project,
            taskPr: formDataValue?.taskPr ?? decodedData?.project,
            taskid: formDataValue?.taskid ?? decodedData?.taskid,
            taskname: formDataValue?.taskname ?? decodedData?.module,
        };
        const isAddMode = ["AddTask", "root", "meeting"].includes(rootSubrootflagval?.Task);
        if (open && isAddMode) {
            setFormValues(prev => ({
                ...prev,
                taskName: formDataValue?.taskname || formDataValue?.title || formDataValue?.meetingtitle || "",
                multiTaskName: formDataValue?.actual ?? [""],
                bulkTask: formDataValue?.bulk ?? [],
                dueDate: cleanDate(formDataValue?.DeadLineDate) ?? null,
                endDate: cleanDate(formDataValue?.EndDate || formDataValue?.end) ?? null,
                department: formDataValue?.department || "",
                guests: matchedAssignees.length ? matchedAssignees : [loggedAssignee],
                createdBy: createdByUsers.length ? createdByUsers : [loggedAssignee],
                projectLead: formDataValue?.projectLead ?? "",
                assignee: formDataValue?.assigneids ?? loggedAssignee?.id,
                status: formDataValue?.statusid ?? "",
                secStatus: formDataValue?.secstatusid ?? "",
                priority: formDataValue?.priorityid ?? "",
                project: (formDataValue?.projectid || formValues?.prModule?.priorityid) ?? "",
                prModule: formDataValue?.prModule || (fallbackPrModule?.projectid && fallbackPrModule) || null,
                dynamicDropdowns: dynamicFilterData ?? [],
                description: formDataValue?.descr ?? "",
                attachment: formDataValue?.attachment ?? null,
                progress: formDataValue?.progress ?? "",
                startDate: cleanDate(formDataValue?.StartDate || formDataValue?.start) ?? date?.toISOString(),
                category: categoryflag ? category?.id : (formDataValue?.workcategoryid || formDataValue?.category) ?? "",
                estimate: formDataValue?.estimate ?? [""],
                actual: formDataValue?.actual ?? [""],
                milestoneChecked: formDataValue?.ismilestone ? 1 : 0,
                estimate_hrs: formDataValue?.estimate_hrs ?? 0,
                estimate1_hrs: formDataValue?.estimate1_hrs ?? 0,
                estimate2_hrs: formDataValue?.estimate2_hrs ?? 0,
                isAllDay: formDataValue?.isAllDay ?? 0,
            }));
        } else if (rootSubrootflagval?.Task === "subroot") {
            setFormValues(prev => ({
                ...prev,
                guests: matchedAssignees.length ? matchedAssignees : [loggedAssignee],
                createdBy: createdByUsers.length ? createdByUsers : [loggedAssignee],
                prModule: formDataValue?.prModule || (fallbackPrModule?.projectid && fallbackPrModule) || null,
                startDate: cleanDate(formDataValue?.StartDate || formDataValue?.start) ?? date?.toISOString(),
            }));
        }
    }, [open, formDataValue, rootSubrootflagval, dynamicFilterData]);

    const taskName = useMemo(() => formValues?.taskName?.trim() || "", [formValues?.taskName]);

    const selectedId = useMemo(() => {
        const isProjectPath = location?.pathname?.includes("/projects");

        if (rootSubrootflagval?.Task === "AddTask") {
            return isProjectPath
                ? formValues?.project || decodedData?.projectid || formDataValue?.projectid
                : formValues?.moduleid || decodedData?.moduleid || formDataValue?.moduleid;
        } else {
            return isProjectPath
                ? formValues?.project || formDataValue?.projectid
                : formValues?.moduleid || formDataValue?.moduleid;
        }
    }, [
        formValues?.project,
        formValues?.moduleid,
        decodedData?.projectid,
        decodedData?.moduleid,
        formDataValue?.projectid,
        formDataValue?.moduleid,
        rootSubrootflagval?.Task,
        location?.pathname
    ]);

    useEffect(() => {
        if (!rootSubrootflagval?.Task) return;
        if (selectedId) {
            setIsTaskNameEmpty(taskName === "");
        }
        if (!selectedId || !taskName) {
            return;
        }
        setIsTaskNameEmpty(taskName.trim() === "");
        setIsDuplicateTask(false);
    }, [
        open,
        taskName,
        selectedId,
        rootSubrootflagval?.Task,
        location?.pathname
    ]);

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => {
            const updatedValues = {
                ...prev,
                [name]: value,
            };
            const statusValue = statusData?.find((st) => st.id == value)?.labelname
            if (name === "status" && statusValue?.toLowerCase() === "completed") {
                updatedValues.endDate = date.toISOString();
            }

            return updatedValues;
        });
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
            setFormValues((prev) => ({
                ...prev,
                [key]: date
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
        if (taskType !== "multi_input") {
            if (!formValues?.taskName?.trim()) {
                setIsTaskNameEmpty(true);
                return;
            }
        }
        const moduleData = rootSubrootflagval?.Task === "AddTask" ? decodedData : null;
        const assigneeIds = formValues.guests?.map(user => user.id)?.join(",") ?? "";
        const departmentAssigneeList = Object.values(
            formValues.guests?.reduce((acc, user) => {
                const dept = user.department;
                if (!acc[dept]) {
                    acc[dept] = { department: dept, assignee: user.id.toString() };
                } else {
                    acc[dept].assignee += `,${user.id}`;
                }
                return acc;
            }, {}) || {}
        );
        const dynamicDropdowns = formValues?.dynamicDropdowns?.reduce((acc, item) => {
            acc[`group${item.groupId}_attr`] = item.selectedId;
            return acc;
        }, {}) || {};
        const selectedMainGroupId = structuredAdvData?.find(d => d?.name == selectedMainGroup)?.id;
        const selectedMainGroupid = advMasterData?.find(d => d?.name == selectedMainGroup)?.id;
        const statusValue = statusData?.find(d => d.id == formValues.status);
        const updatedFormDataValue = {
            taskid: moduleData?.taskid || formDataValue?.taskid || formValues?.prModule?.taskid || "",
            meetingid: formDataValue?.meetingid ?? "",
            taskname: formValues.taskName ?? formDataValue?.taskname,
            bulkTask: formValues.bulkTask ?? formDataValue?.bulkTask,
            statusid: formValues.status ?? formDataValue?.statusid,
            secstatusid: formValues.secStatus ?? formDataValue?.secstatusid,
            completion_timestamp: statusValue?.labelname?.toLowerCase() === "completed" ? date.toISOString() : "",
            priorityid: formValues.priority ?? formDataValue?.priorityid,
            projectid: moduleData?.projectid || formValues?.prModule?.projectid || formValues.project || formDataValue?.projectid,
            projectLead: formValues.projectLead ?? formDataValue?.projectLead,
            DeadLineDate: formValues.dueDate ?? formDataValue?.DeadLineDate,
            workcategoryid: formValues.category ?? formDataValue?.workcategoryid,
            StartDate: formValues.startDate ?? formDataValue?.entrydate,
            EndDate: formValues.endDate ?? formDataValue?.EndDate,
            remark: formValues.remark ?? formDataValue?.remark,
            departmentid: formValues.department ?? formDataValue?.departmentid,
            assigneids: assigneeIds ?? formDataValue?.assigneids,
            createdBy: formValues.createdBy ?? formDataValue?.createdBy,
            departmentAssigneelist: departmentAssigneeList ?? formDataValue?.assigneids,
            descr: formValues.description ?? formDataValue?.descr,
            ismilestone: formValues.milestoneChecked ? 1 : 0,
            isAllDay: formValues?.isAllDay ?? formDataValue?.isAllDay,
            estimate_hrs: formValues.estimate_hrs ?? formDataValue?.estimate_hrs,
            estimate1_hrs: formValues.estimate1_hrs ?? formDataValue?.estimate1_hrs,
            estimate2_hrs: formValues.estimate2_hrs ?? formDataValue?.estimate2_hrs,
            maingroupids: selectedMainGroupid ?? formDataValue?.maingroupids,
            dynamicDropdowns: dynamicDropdowns ?? formDataValue?.dynamicDropdowns,
            bindedMainGroupid: selectedMainGroupId ?? '',

        };

        onSubmit(updatedFormDataValue, { mode: taskType }, module);
        handleClear();
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        handleResetState();
        setTaskType("single");
        setSelectedMainGroup('');
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
        setIsTaskNameEmpty(false);
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
        setIsTaskNameEmpty(false);
        setSelectedMainGroup('');
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

    const renderAutocomplete = (label, name, value, placeholder, options, onChange, disabled) => (
        <CustomAutocomplete
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled || name === "category" ? categoryDisabled : false}
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

    const renderDateTimeField = (label, name, value, onChange) => (
        <Box className="form-group">
            <CustomDateTimePicker
                label={label}
                name={name}
                value={value ? dayjs(value).tz("Asia/Kolkata", true).local() : null}
                width='100%'
                styleprops={commonTextFieldProps}
                onChange={(date) => onChange(date, name)}
            // error={Boolean(errors.start)}
            // helperText={errors.start}
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
                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    right: 0,
                    width: '800px',
                    bgcolor: '#fff',
                    py: 2,
                    px: 3,
                    zIndex: 1301,
                    display: 'flex',
                    justifyContent: formValues?.taskName && location?.pathname?.includes('/calendar') ? 'space-between' : 'flex-end'
                }}>
                    {formValues?.taskName && location?.pathname?.includes('/calendar') &&
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleRemoveMetting(formDataValue)}
                                disabled={isLoading}
                                className="dangerbtnClassname"
                            >
                                Delete
                            </Button>
                        </Box>
                    }
                    <Box>
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
                </Box>
            )
        );
    };

    const renderTaskHeader = () => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>

            <Typography variant="caption" sx={{ color: '#7D7f85 !important' }}>
                <Breadcrumb breadcrumbTitles={formDataValue?.breadcrumbTitles || decodedData?.breadcrumbTitles} />
            </Typography>

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
        if (open) {
            handleProjectModuleData();
        }
    }, [open])

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                {['/tasks', '/meetings', '/calendar']?.some(path => location?.pathname?.includes(path)) &&
                    <Box className="drawer-container">
                        <TaskDrawerHeader
                            taskType={taskType}
                            rootSubrootflagval={rootSubrootflagval}
                            handleClear={handleClear}
                        />
                        {location?.pathname?.includes('/tasks') &&
                            <>
                                {renderTaskHeader()}
                            </>
                        }
                        <Grid container spacing={2} alignItems="stretch">
                            <Grid item xs={12} md={taskType == "single" && dropdownConfigs?.length > 0 ? 7.5 : 12}>
                                <TaskFormSection
                                    taskType={taskType}
                                    prModule={prModule}
                                    formValues={formValues}
                                    allDayShow={allDayShow}
                                    handleChange={handleChange}
                                    handleDateChange={handleDateChange}
                                    handleEstimateChange={handleEstimateChange}
                                    handlebulkTaskSave={handlebulkTaskSave}
                                    isTaskNameEmpty={isTaskNameEmpty}
                                    isDuplicateTask={isDuplicateTask}
                                    taskCategory={taskCategory}
                                    statusData={statusData}
                                    secStatusData={secStatusData}
                                    priorityData={priorityData}
                                    teams={location?.pathname?.includes('/tasks') ? teams : taskAssigneeData}
                                    prModuleMaster={prModuleMaster}
                                    renderAutocomplete={renderAutocomplete}
                                    renderDateField={renderDateTimeField}
                                    renderTextField={renderTextField}
                                    commonTextFieldProps={commonTextFieldProps}
                                    handleMeetingDt={handleMeetingDt}
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
                                    selectedMainGroup={selectedMainGroup}
                                    setSelectedMainGroup={setSelectedMainGroup}
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
                                            renderDateField={renderDateField}
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
                        renderDateField={renderDateTimeField}
                    />
                }
            </Drawer>
        </>
    );
};

export default SidebarDrawer;
