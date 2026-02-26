import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    useTheme,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
} from "@mui/material";
import { CircleX, Grid2x2, ListTodo, NotepadTextDashed } from "lucide-react";
import "./SidebarDrawer.scss";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { actualTaskData, fetchlistApiCall, formData, projectDatasRState, rootSubrootflag, TaskData } from "../../Recoil/atom";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useLocation } from "react-router-dom";
import { cleanDate, commonTextFieldProps, customDatePickerProps, flattenTasks, getUserProfileData, mapKeyValuePair, mapTaskLabels } from "../../Utils/globalfun";
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
import TemplateDialog from "../Common/TemplateDialog"; // Import TemplateDialog component
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";
import { getAdvancedtaseditApi } from "../../Api/MasterApi/AssigneeMaster";
import { EstimateCalApi } from "../../Api/TaskApi/EstimateCalApi";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import { buildAncestorSumSplitestimate } from "../../Utils/estimationUtils";

const findModuleRecursively = (tasks, targetId) => {
    if (!tasks) return null;
    for (const t of tasks) {
        if (String(t.taskid) === String(targetId)) return t.moduleid || t.projectid;
        if (t.subtasks?.length > 0) {
            const res = findModuleRecursively(t.subtasks, targetId);
            if (res) return res;
        }
    }
    return null;
};

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
    const taskDataValue = useRecoilValue(TaskData);
    const actualTaskDataValue = useRecoilValue(actualTaskData);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const [taskType, setTaskType] = useState("single");
    const [decodedData, setDecodedData] = useState(null);
    const [isDuplicateTask, setIsDuplicateTask] = useState(false);
    const [isTaskNameEmpty, setIsTaskNameEmpty] = useState(false);
    const [isCategoryEmpty, setIsCategoryEmpty] = useState(false);
    const [teams, setTeams] = useState([]);
    const [dynamicFilterData, setDynamicFilterData] = useState([]);
    const [dynamicFilterLoading, setDynamicFilterLoading] = useState(false);
    const [advMasterData, setAdvMasterData] = useState([]);
    const [prModuleMaster, setPrModuleMaster] = useState([]);
    const [selectedMainGroup, setSelectedMainGroup] = useState('');
    const [deadlineCleared, setDeadlineCleared] = useState(false);
    const [isDeadlineEmpty, setIsDeadlineEmpty] = useState(false);
    const [deadlineMenuSignal, setDeadlineMenuSignal] = useState(0);
    const [hoursBaseline, setHoursBaseline] = useState({
        estimate_hrs: 0,
        estimate1_hrs: 0,
        estimate2_hrs: 0,
        workinghr: 0,
    });
    const [splitSelectionActive, setSplitSelectionActive] = useState(false);
    const [splitSelectionMeta, setSplitSelectionMeta] = useState(null);
    const [splitConfirmOpen, setSplitConfirmOpen] = useState(false);
    const [pendingSubmitModule, setPendingSubmitModule] = useState(null);
    const [pendingSplitMeta, setPendingSplitMeta] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false); // TemplateDialog modal state
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
            try {
                setDynamicFilterLoading(true);
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
            } finally {
                setTimeout(() => {
                    setDynamicFilterLoading(false);
                }, 20);
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
        const loggedAssignee = getUserProfileData();
        const assigneeIdArray = formDataValue?.assigneids?.split(',')?.map(Number) || [];
        const matchedAssignees = taskAssigneeData?.filter(user => assigneeIdArray.includes(user.id)) || [];
        const createdByUsers = formDataValue?.createdbyid ? taskAssigneeData?.filter(user => user.id === formDataValue?.createdbyid) : taskAssigneeData?.filter(user => user.id === loggedAssignee?.id) || [];
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
            setDeadlineCleared(false);
            setHoursBaseline({
                estimate_hrs: Number(formDataValue?.estimate_hrs ?? 0),
                estimate1_hrs: Number(formDataValue?.estimate1_hrs ?? 0),
                estimate2_hrs: Number(formDataValue?.estimate2_hrs ?? 0),
            });
            setSplitSelectionActive(false);
            setSplitSelectionMeta(null);
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
                workinghr: formDataValue?.workinghr ?? 0,
                isAllDay: formDataValue?.isAllDay ?? 0,
            }));
        } else if (rootSubrootflagval?.Task === "subroot") {
            setDeadlineCleared(false);
            setHoursBaseline({
                estimate_hrs: Number(formDataValue?.estimate_hrs ?? 0),
                estimate1_hrs: Number(formDataValue?.estimate1_hrs ?? 0),
                estimate2_hrs: Number(formDataValue?.estimate2_hrs ?? 0),
                workinghr: Number(formDataValue?.workinghr ?? 0),
            });
            setSplitSelectionActive(false);
            setSplitSelectionMeta(null);
            setFormValues(prev => ({
                ...prev,
                guests: matchedAssignees.length ? matchedAssignees : [loggedAssignee],
                createdBy: createdByUsers.length ? createdByUsers : [loggedAssignee],
                prModule: formDataValue?.prModule || (fallbackPrModule?.projectid && fallbackPrModule) || null,
                startDate: cleanDate(formDataValue?.StartDate || formDataValue?.start) ?? date?.toISOString(),
            }));
        }
    }, [open, formDataValue, rootSubrootflagval, dynamicFilterData]);

    const getSubtaskCountForSplit = () => {
        const rootTaskId = formDataValue?.taskid;
        if (!rootTaskId) return 0;
        const subtasks = actualTaskDataValue.filter(t => String(t.parentid) === String(rootTaskId));
        return subtasks.length;
    };

    const getChangedHourFields = () => {
        const fields = ['estimate_hrs', 'estimate1_hrs', 'estimate2_hrs', 'workinghr'];
        return fields.filter((field) => {
            const current = Number(formValues?.[field] ?? 0);
            const baseline = Number(hoursBaseline?.[field] ?? 0);
            return current !== baseline;
        });
    };

    const buildSplitMeta = () => {
        const subtaskCount = getSubtaskCountForSplit();
        const changedFields = getChangedHourFields();
        if (!subtaskCount || changedFields.length === 0) return null;
        const perSubtask = changedFields.reduce((acc, field) => {
            const total = Number(formValues?.[field] ?? 0);
            const raw = total / subtaskCount;
            const rounded = Number.isFinite(raw) ? Math.round(raw * 100) / 100 : 0;
            acc[field] = rounded;
            return acc;
        }, {});
        return { subtaskCount, changedFields, perSubtask };
    };

    const buildSplitMetaForAllFields = (valuesOverride) => {
        const subtaskCount = getSubtaskCountForSplit();
        if (!subtaskCount) return null;
        const fields = ['estimate_hrs', 'estimate1_hrs', 'estimate2_hrs', 'workinghr'];
        const source = valuesOverride || formValues;
        const perSubtask = fields.reduce((acc, field) => {
            const total = Number(source?.[field] ?? 0);
            const raw = total / subtaskCount;
            const rounded = Number.isFinite(raw) ? Math.round(raw * 100) / 100 : 0;
            acc[field] = rounded;
            return acc;
        }, {});
        return { subtaskCount, changedFields: fields, perSubtask };
    };

    const splitAndAdjust = (total, count) => {
        const safeCount = Number(count) || 0;
        if (safeCount <= 0) return [];
        const safeTotal = Number(total) || 0;
        const raw = safeTotal / safeCount;
        const rounded = Number.isFinite(raw) ? Math.round(raw * 100) / 100 : 0;
        const out = Array(safeCount).fill(rounded);
        const sum = Math.round(out.reduce((a, b) => a + b, 0) * 100) / 100;
        const diff = Math.round((safeTotal - sum) * 100) / 100;
        out[out.length - 1] = Math.round((out[out.length - 1] + diff) * 100) / 100;
        return out;
    };

    const buildSplitEstimateString = (valuesOverride) => {
        const source = valuesOverride || formValues;
        const rootTaskId = formDataValue?.taskid ?? source?.taskid ?? "";
        if (!rootTaskId) return '';

        // Use actualTaskDataValue to get all real subtasks
        const subtasks = actualTaskDataValue.filter(t => String(t.parentid) === String(rootTaskId));

        const rootNode = {
            taskid: rootTaskId,
            subtasks,
        };

        const buildEntriesRecursive = (node, totals) => {
            const nodeId = String(node?.taskid ?? '');
            if (!nodeId) return [];

            const currentEntry = `${nodeId}#${Number(totals?.estimate ?? 0) || 0}#${Number(totals?.actual ?? 0) || 0}#${Number(totals?.final ?? 0) || 0}#${Number(totals?.working ?? 0) || 0}`;

            // Use actualTaskDataValue to find all children, ignoring any UI filtering
            const children = actualTaskDataValue.filter(t => String(t.parentid) === nodeId);

            if (!children.length) return [currentEntry];

            const estSplits = splitAndAdjust(totals?.estimate, children.length);
            const actSplits = splitAndAdjust(totals?.actual, children.length);
            const finSplits = splitAndAdjust(totals?.final, children.length);
            const workSplits = splitAndAdjust(totals?.working, children.length);

            const childEntries = children.flatMap((child, idx) =>
                buildEntriesRecursive(child, {
                    estimate: estSplits[idx] ?? 0,
                    actual: actSplits[idx] ?? 0,
                    final: finSplits[idx] ?? 0,
                    working: workSplits[idx] ?? 0,
                })
            );

            return [currentEntry, ...childEntries];
        };

        const entries = buildEntriesRecursive(rootNode, {
            estimate: Number(source?.estimate_hrs ?? 0) || 0,
            actual: Number(source?.estimate1_hrs ?? 0) || 0,
            final: Number(source?.estimate2_hrs ?? 0) || 0,
            working: Number(source?.workinghr ?? 0) || 0,
        });
        return entries.join(',');
    };

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
            setIsCategoryEmpty(!formValues?.category);
        }
        if (!selectedId || !taskName) {
            return;
        }
        setIsTaskNameEmpty(taskName.trim() === "");
        setIsCategoryEmpty(!formValues?.category);
        setIsDuplicateTask(false);
    }, [
        open,
        taskName,
        selectedId,
        formValues?.category,
        rootSubrootflagval?.Task,
        location?.pathname
    ]);

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Reset validation states when user starts typing
        if (name === "taskName") {
            setIsTaskNameEmpty(false);
        }
        if (name === "category") {
            setIsCategoryEmpty(false);
        }

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

    console.log(formValues);

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
        if (key === 'dueDate') {
            setDeadlineCleared(!date);
            setIsDeadlineEmpty(false);
        }
        if (date) {
            setFormValues((prev) => ({
                ...prev,
                [key]: date
            }));
        } else {
            setFormValues((prev) => ({
                ...prev,
                [key]: null
            }));
        }
    };

    // Handle estimate form value changes
    const handleEstimateChange = (field, newValue) => {
        setFormValues((prev) => {
            const next = {
                ...prev,
                [field]: newValue.toString(),
            };
            if (splitSelectionActive) {
                const nextMeta = buildSplitMetaForAllFields(next);
                setSplitSelectionMeta(nextMeta);
            }
            return next;
        });
    };

    const handlebulkTaskSave = (updatedTasks) => {
        setFormValues((prev) => ({
            ...prev,
            bulkTask: updatedTasks,
        }));
    }

    const getSubmitDeadlineValue = (deadlineOverride) => {
        if (deadlineOverride) return deadlineOverride;

        if (deadlineCleared) return "";

        const localValue = formValues?.dueDate ?? cleanDate(formDataValue?.DeadLineDate) ?? formDataValue?.DeadLineDate;
        if (!localValue) return localValue;

        if (dayjs.isDayjs(localValue)) {
            return localValue.toDate().toISOString();
        }
        const parsed = dayjs(localValue);
        return parsed.isValid() ? parsed.toDate().toISOString() : localValue;
    };

    const submitTask = async (module, deadlineOverride, splitMeta) => {
        const moduleData = rootSubrootflagval?.Task === "AddTask" ? decodedData : null;
        const assigneeIds = formValues.guests?.map(user => user.id)?.join(",") ?? "";

        const departmentAssigneeList = Object.values(
            formValues.guests?.reduce((acc, user) => {
                const dept = user.department;
                if (!acc[dept]) acc[dept] = { department: dept, assignee: user.id.toString() };
                else acc[dept].assignee += `,${user.id}`;
                return acc;
            }, {}) || {}
        );

        const dynamicDropdowns = formValues?.dynamicDropdowns?.reduce((acc, item) => {
            acc[`group${item.groupId}_attr`] = item.selectedId;
            return acc;
        }, {}) || {};

        const selectedMainGroupId = structuredAdvData?.find(d => d?.name === selectedMainGroup)?.id;
        const selectedMainGroupid = advMasterData?.find(d => d?.name === selectedMainGroup)?.id;
        const statusValue = statusData?.find(d => d.id === formValues.status);

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
            DeadLineDate: getSubmitDeadlineValue(deadlineOverride),
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
            workinghr: formValues.workinghr ?? formDataValue?.workinghr,
            maingroupids: selectedMainGroupid ?? formDataValue?.maingroupids,
            dynamicDropdowns: dynamicDropdowns ?? formDataValue?.dynamicDropdowns,
            bindedMainGroupid: selectedMainGroupId ?? '',
            repeatflag: module?.repeat ? "Repeat" : "",
            parentid: formValues.parentid ?? formDataValue?.parentid,
            ...(splitMeta && { splitAcrossSubtasks: true, splitMeta })
        };

        const isAddSubtaskMode = rootSubrootflagval?.Task === 'subroot';
        const isAddTaskMode = rootSubrootflagval?.Task === 'AddTask';

        // If adding a root task, estimation parent is the module/project (from decodedData or prModule)
        let parentTaskIdForSum = isAddSubtaskMode
            ? updatedFormDataValue?.taskid
            : (updatedFormDataValue?.parentid && String(updatedFormDataValue?.parentid) !== '0')
                ? updatedFormDataValue.parentid
                : (isAddTaskMode ? (decodedData?.moduleid || decodedData?.projectid || updatedFormDataValue?.moduleid || updatedFormDataValue?.projectid) : null);

        const shouldSumToParent = Boolean(parentTaskIdForSum) && String(parentTaskIdForSum) !== '0';

        let sumChildValues = {
            estimate_hrs: updatedFormDataValue?.estimate_hrs,
            estimate1_hrs: updatedFormDataValue?.estimate1_hrs,
            estimate2_hrs: updatedFormDataValue?.estimate2_hrs,
            workinghr: updatedFormDataValue?.workinghr,
        };

        if (taskType === 'multi_input' && updatedFormDataValue.bulkTask?.length > 0) {
            const bulkTotal = updatedFormDataValue.bulkTask.reduce((acc, t) => {
                acc.estimate_hrs += parseFloat(t.estimate || 0);
                return acc;
            }, { estimate_hrs: 0, estimate1_hrs: 0, estimate2_hrs: 0, workinghr: 0 });
            sumChildValues = bulkTotal;
        }

        try {
            let parentSumSplitestimate = '';
            if (shouldSumToParent) {
                const foundModuleId = findModuleRecursively(actualTaskDataValue, parentTaskIdForSum);
                const rootId = foundModuleId || updatedFormDataValue?.projectid || decodedData?.taskid || updatedFormDataValue?.parentid || parentTaskIdForSum;

                const taskData = await fetchTaskDataFullApi({ taskid: rootId, teamid: '1' });
                if (taskData && taskData.rd1) {
                    const labeledTasks = mapKeyValuePair(taskData);
                    parentSumSplitestimate = buildAncestorSumSplitestimate(labeledTasks, {
                        parentTaskId: parentTaskIdForSum,
                        childTaskId: isAddSubtaskMode ? '' : updatedFormDataValue?.taskid,
                        childValues: sumChildValues,
                        isNewChild: isAddSubtaskMode || isAddTaskMode || taskType === 'multi_input',
                    });
                }
            }

            const submitResult = await onSubmit(updatedFormDataValue, { mode: taskType }, module);
            if (submitResult?.rd?.[0]?.stat === 1) {
                if (parentSumSplitestimate) {
                    await EstimateCalApi(parentSumSplitestimate).catch(err => console.error('Error updating parent estimate:', err));
                }
                setOpenChildTask(Date.now());
                handleClear();
            } else {
                console.error("Sidedrawer: Task submit failed", submitResult);
            }
        } catch (err) {
            console.error('Error during submission flow:', err);
        }
    };

    const handleSubmit = async (module) => {
        setIsSubmitting(true);
        try {
            if (taskType !== "multi_input") {
                if (!formValues?.taskName?.trim()) {
                    setIsTaskNameEmpty(true);
                    return;
                }
                if (!formValues?.category) {
                    setIsCategoryEmpty(true);
                    return;
                }
                const effectiveDeadline = getSubmitDeadlineValue();
                if (!effectiveDeadline) {
                    setIsDeadlineEmpty(true);
                    setDeadlineMenuSignal((prev) => prev + 1);
                    return;
                }
            }
            const subtaskCount = getSubtaskCountForSplit();
            const isAddingSubtask = rootSubrootflagval?.Task === 'subroot';

            // Skip split dialog when adding a new subtask - just sum to parent
            if (isAddingSubtask) {
                await submitTask(module);
                return;
            }

            if (taskType === 'single' && splitSelectionActive && subtaskCount > 0) {
                const splitestimate = buildSplitEstimateString();
                EstimateCalApi(splitestimate).catch((err) => console.error(err));
                // Removed redundant setOpenChildTask(true) here as submitTask handles it
                const splitMeta = buildSplitMetaForAllFields();
                await submitTask(module, undefined, splitMeta);
                return;
            }
            const changedFields = getChangedHourFields();
            if (taskType === 'single' && subtaskCount > 0 && changedFields.length > 0) {
                const splitestimate = buildSplitEstimateString();
                const splitMeta = buildSplitMeta();
                setPendingSplitMeta(splitMeta);
                setPendingSubmitModule(module ?? null);
                setSplitConfirmOpen(true);
                return;
            }
            await submitTask(module);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSplitConfirmClose = () => {
        setSplitConfirmOpen(false);
        setPendingSubmitModule(null);
        setPendingSplitMeta(null);
    };

    const handleSplitConfirmCancel = () => {
        setFormValues((prev) => ({
            ...prev,
            estimate_hrs: hoursBaseline?.estimate_hrs ?? 0,
            estimate1_hrs: hoursBaseline?.estimate1_hrs ?? 0,
            estimate2_hrs: hoursBaseline?.estimate2_hrs ?? 0,
        }));
        setSplitSelectionActive(false);
        setSplitSelectionMeta(null);
        handleSplitConfirmClose();
    };

    const handleSplitConfirmSplitEqually = () => {
        const splitMeta = buildSplitMetaForAllFields();
        setSplitSelectionActive(true);
        setSplitSelectionMeta(splitMeta);
        handleSplitConfirmClose();
    };

    const handleClear = () => {
        onClose();
        setTaskType("single");
        handleResetState();
    };

    const handleResetState = () => {
        const logedAssignee = getUserProfileData()
        setDeadlineCleared(false);
        setIsDeadlineEmpty(false);
        setSplitSelectionActive(false);
        setSplitSelectionMeta(null);
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
        setIsCategoryEmpty(false);
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

    const renderAutocomplete = (label, name, value, placeholder, options, onChange, error = false, helperText = '', disabled) => (
        <CustomAutocomplete
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled || name === "category" ? categoryDisabled : false}
            error={error}
            helperText={helperText}
        />
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
                error={name === 'dueDate' ? isDeadlineEmpty : false}
                helperText={name === 'dueDate' && isDeadlineEmpty ? 'Deadline is required' : ''}
            />
        </Box>
    );

    const renderTaskActionButtons = () => {
        const isDisabled =
            formValues.bulkTask.length > 0
                ? false
                : isLoading || isSubmitting || isTaskNameEmpty || isDuplicateTask || isCategoryEmpty;

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
                    justifyContent: formValues?.taskName && location?.pathname?.includes('/myCalendar') ? 'space-between' : 'flex-end'
                }}>
                    {formValues?.taskName && location?.pathname?.includes('/myCalendar') &&
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleRemoveMetting(formDataValue)}
                                disabled={isLoading || isSubmitting}
                                className="dangerbtnClassname"
                            >
                                Delete
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSubmit({ repeat: true })}
                                disabled={isLoading || isSubmitting}
                                className="buttonClassname"
                            >
                                Repeat
                            </Button>
                        </Box>
                    }
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={handleClear}
                            sx={{ marginRight: '10px' }}
                            className="secondaryBtnClassname"
                            disabled={isSubmitting}
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
                            {(isLoading || isSubmitting) ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Saving...
                                </>
                            ) : 'Save Task'}
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {taskType === "multi_input" && (
                            <IconButton
                                onClick={() => setTemplateDialogOpen(true)}
                                title="Open Template Manager"
                            >
                                <NotepadTextDashed />
                            </IconButton>
                        )}
                        <IconButton onClick={handleClear} title="Close Drawer">
                            <CircleX />
                        </IconButton>
                    </Box>
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
                {isLoading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: '400px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                    }}>
                        <CircularProgress size={48} sx={{ mb: 2, color: 'white' }} />
                        <Typography variant="body1" color="text.secondary">
                            Loading form data...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {['/tasks', '/meetings', '/myCalendar']?.some(path => location?.pathname?.includes(path)) &&
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
                                            splitHintMeta={splitSelectionMeta}
                                            showSplitHint={splitSelectionActive && getSubtaskCountForSplit() > 0}
                                            handlebulkTaskSave={handlebulkTaskSave}
                                            openDeadlineMenuSignal={deadlineMenuSignal}
                                            isTaskNameEmpty={isTaskNameEmpty}
                                            isDuplicateTask={isDuplicateTask}
                                            isCategoryEmpty={isCategoryEmpty}
                                            taskCategory={taskCategory}
                                            statusData={statusData}
                                            secStatusData={secStatusData}
                                            priorityData={priorityData}
                                            teams={location?.pathname?.includes('/tasks') ? teams : taskAssigneeData?.filter((emp) => emp.isactive === 1)}
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
                                            loading={dynamicFilterLoading}
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
                                                    selectedMainGroup={selectedMainGroup}
                                                    setSelectedMainGroup={setSelectedMainGroup}
                                                    handleDropdownChange={handleDropdownChange}
                                                    renderDateField={renderDateTimeField}
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
                                isCategoryEmpty={isCategoryEmpty}
                                isDeadlineEmpty={isDeadlineEmpty}
                                openDeadlineMenuSignal={deadlineMenuSignal}
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
                    </>
                )}
            </Drawer>

            <Dialog
                open={splitConfirmOpen}
                onClose={handleSplitConfirmCancel}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Split Hours Across Subtasks
                </DialogTitle>

                <DialogContent dividers>
                    {/* Info Box */}
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.action.hover,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            This task has {pendingSplitMeta?.subtaskCount ?? 0} subtasks
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            You changed the parent task hours. Choose how you want to apply
                            these changes to subtasks.
                        </Typography>
                    </Box>

                    {/* Changed Fields */}
                    {!!pendingSplitMeta?.changedFields?.length && (
                        <Box sx={{ mt: 0.5 }}>
                            <Grid container spacing={1}>
                                {[
                                    { label: 'Estimate', field: 'estimate_hrs' },
                                    { label: 'Actual Estimate', field: 'estimate1_hrs' },
                                    { label: 'Final Estimate', field: 'estimate2_hrs' },
                                ].map(({ label, field }) => {
                                    const subtaskCount = Number(pendingSplitMeta?.subtaskCount || 0);
                                    const total = Number(formValues?.[field] || 0);
                                    const perSubtaskRaw = pendingSplitMeta?.perSubtask?.[field];
                                    const perSubtask = Number(
                                        perSubtaskRaw ?? (subtaskCount ? total / subtaskCount : 0)
                                    );
                                    const isChanged = Boolean(pendingSplitMeta?.changedFields?.includes(field));

                                    return (
                                        <Grid item xs={4} key={field}>
                                            <Box
                                                sx={{
                                                    p: 1,
                                                    borderRadius: 2,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    bgcolor: theme.palette.background.paper,
                                                    opacity: isChanged ? 1 : 0.55,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        mb: 0.25,
                                                    }}
                                                >
                                                    {label}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, lineHeight: 1.25 }}
                                                >
                                                    {total} hrs
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: 'block', lineHeight: 1.2, mt: 0.25 }}
                                                >
                                                    Per subtask: <span style={{ fontWeight: 600 }}>{perSubtask} hrs</span>
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={handleSplitConfirmCancel}
                        variant="outlined"
                        className="secondaryBtnClassname"
                        sx={{ minWidth: 140 }}
                    >
                        Cancel & Revert
                    </Button>

                    <Button
                        onClick={handleSplitConfirmSplitEqually}
                        variant="contained"
                        className="buttonClassname"
                        sx={{ minWidth: 160 }}
                    >
                        Split Equally
                    </Button>
                </DialogActions>
            </Dialog>

            <TemplateDialog
                open={templateDialogOpen}
                onClose={() => setTemplateDialogOpen(false)}
            />

        </>
    );
};

export default SidebarDrawer;
