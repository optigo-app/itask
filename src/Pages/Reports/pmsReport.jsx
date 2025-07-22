import React, { useEffect, useMemo, useState } from 'react';
import "./Reports.scss";
import {
    Box,
    Grid,
} from '@mui/material';
import dayjs from 'dayjs';
import ReportsGrid from '../../Components/Reports/ReportsGrid';
import { SquareChartGantt, User } from 'lucide-react';
import TaskReportCard from '../../Components/Reports/TaskReportCard';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { commonTextFieldProps } from '../../Utils/globalfun';
import PmFilters from '../../Components/Reports/PmFilters';
import { calculateProgress } from '../../Utils/TaskList/reusable';
import { actualTaskData } from '../../Recoil/atom';
import { useRecoilState, useRecoilValue } from 'recoil';

const TASK_OPTIONS = [
    { id: 1, value: "EmployeeWiseData", label: "Team", icon: <User size={18} /> },
    { id: 2, value: "ModuleWiseData", label: "Project", icon: <SquareChartGantt size={18} /> },
];

const PmsReport = () => {
    const [pmsReportData, setPmsReportData] = useState([]);
    const [viewMode, setViewMode] = useState('EmployeeWiseData');
    const [viewType, setViewType] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Today');
    const filterOptions = ['Today', 'Tomorrow', 'Week'];
    const [currentDate, setCurrentDate] = useState(dayjs());
    const actualData = useRecoilValue(actualTaskData);
    const { iswhTLoading, taskCategory, taskFinalData } = useFullTaskFormatFile();

    // helper function for date wise data get
    const isWithinDateRange = (task, filterType, customRange = {}, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        if (filterType === 'All') return true;

        const dateRaw = task?.[taskDateField];
        if (!dateRaw || dateRaw === '1900-01-01T00:00:00.000Z') return false;

        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) return false;

        const baseDate = new Date(currentDate);
        baseDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(baseDate);
        tomorrow.setDate(baseDate.getDate() + 1);

        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

        const startOfYear = new Date(baseDate.getFullYear(), 0, 1);
        const endOfYear = new Date(baseDate.getFullYear(), 11, 31);

        switch (filterType) {
            case 'Today':
                return date.toDateString() === baseDate.toDateString();
            case 'Tomorrow':
                return date.toDateString() === tomorrow.toDateString();
            case 'Week':
                return date >= startOfWeek && date <= endOfWeek;
            case 'ThisMonth':
                return date >= startOfMonth && date <= endOfMonth;
            case 'ThisYear':
                return date >= startOfYear && date <= endOfYear;
            case 'Custom': {
                const from = new Date(customRange.from);
                const to = new Date(customRange.to);
                if (isNaN(from) || isNaN(to)) return false;
                return date >= from && date <= to;
            }
            default:
                return true;
        }
    };

    // Employee Data Processing
    const processEmployeeData = (data, taskCategory, filterType, customRange, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        const EmployeeWiseDataMap = new Map();

        data?.forEach((task) => {
            if (!isWithinDateRange(task, filterType, customRange, taskDateField, currentDate)) return;

            const estimate = task.estimate_hrs || 0;
            const actual = task.workinghr || 0;
            const status = (task.status || "").toLowerCase();

            if (Array.isArray(task.assignee)) {
                task.assignee.forEach((assignee) => {
                    const empKey = assignee.userid || assignee.customercode || assignee.firstname;

                    if (!EmployeeWiseDataMap.has(empKey)) {
                        EmployeeWiseDataMap.set(empKey, {
                            ...assignee,
                            TotalTasks: 0,
                            Completed: 0,
                            InProgress: 0,
                            TotalEstimate: 0,
                            TotalActual: 0,
                            Tasks: [],
                            CategorySummaryMap: new Map(),
                        });
                    }

                    const emp = EmployeeWiseDataMap.get(empKey);
                    emp.TotalTasks += 1;
                    emp.TotalEstimate += estimate;
                    emp.TotalActual += actual;
                    emp.Tasks.push(task);

                    if (status === "completed") emp.Completed += 1;
                    if (status === "running") emp.InProgress += 1;

                    const labelObj = taskCategory?.find(c => c.id === task.workcategoryid);
                    const labelName = labelObj?.labelname || "Unknown";
                    const currentCount = emp.CategorySummaryMap.get(labelName) || 0;
                    emp.CategorySummaryMap.set(labelName, currentCount + 1);
                });
            }
        });

        return Array.from(EmployeeWiseDataMap.values()).map((emp) => {
            const progress = calculateProgress(emp.Completed, emp.TotalTasks);
            const diff = emp.TotalActual - emp.TotalEstimate;
            const performance = emp.TotalEstimate > 0
                ? Math.round((emp.TotalActual / emp.TotalEstimate) * 100)
                : 100;

            const CategorySummary = Array.from(emp.CategorySummaryMap.entries()).map(
                ([categoryname, count]) => ({ categoryname, count })
            );

            const { CategorySummaryMap, ...empData } = emp;

            return {
                ...empData,
                Progress: `${progress}%`,
                TotalDiff: diff,
                Performance: `${performance}%`,
                CategorySummary
            };
        });
    };

    // Module-wise Data Processing
    const processModuleWiseData = (data, ModuleList, taskCategory, filterType, customRange, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        const ModuleWiseDataMap = new Map();

        data?.forEach((task) => {
            if (!isWithinDateRange(task, filterType, customRange, taskDateField, currentDate)) return;

            const moduleId = task.moduleid;
            if (!moduleId) return;

            if (!ModuleWiseDataMap.has(moduleId)) {
                ModuleWiseDataMap.set(moduleId, {
                    moduleid: moduleId,
                    modulename: ModuleList?.find(m => m.taskid === moduleId)?.taskname || "Unknown",
                    TotalTasks: 0,
                    Completed: 0,
                    InProgress: 0,
                    TotalEstimate: 0,
                    TotalActual: 0,
                    Tasks: [],
                    CategorySummaryTemp: new Map(),
                });
            }

            const mod = ModuleWiseDataMap.get(moduleId);
            const status = (task.status || "").toLowerCase();

            mod.TotalTasks += 1;
            mod.TotalEstimate += task.estimate_hrs || 0;
            mod.TotalActual += task.workinghr || 0;
            mod.Tasks.push(task);

            if (status === "completed") mod.Completed += 1;
            if (status === "running") mod.InProgress += 1;

            const labelObj = taskCategory?.find(c => c.id === task.workcategoryid);
            const labelName = labelObj?.labelname || "Unknown";
            const currentCount = mod.CategorySummaryTemp.get(labelName) || 0;
            mod.CategorySummaryTemp.set(labelName, currentCount + 1);
        });

        return Array.from(ModuleWiseDataMap.values()).map((mod) => {
            const progress = calculateProgress(mod.Completed, mod.TotalTasks);
            const diff = mod.TotalActual - mod.TotalEstimate;
            const performance = mod.TotalEstimate > 0
                ? Math.round((mod.TotalActual / mod.TotalEstimate) * 100)
                : 100;

            const CategorySummary = Array.from(mod.CategorySummaryTemp.entries()).map(
                ([categoryname, count]) => ({ categoryname, count })
            );

            const { CategorySummaryTemp, ...modData } = mod;

            return {
                ...modData,
                Progress: `${progress}%`,
                TotalDiff: diff,
                Performance: `${performance}%`,
                CategorySummary
            };
        });
    };

    // for calling functions
    useEffect(() => {
        const customRange = {};

        if (viewMode === "EmployeeWiseData") {
            const empData = processEmployeeData(actualData, taskCategory, selectedFilter, customRange, 'DeadLineDate', currentDate);
            setPmsReportData(empData);
        } else {
            const modData = processModuleWiseData(actualData, taskFinalData?.ModuleList, taskCategory, selectedFilter, customRange, 'DeadLineDate', currentDate);
            setPmsReportData(modData);
        }
    }, [currentDate, actualData, selectedFilter, viewMode]);

    useEffect(() => {
        const viemodeValue = localStorage.getItem('rpviewMode') ?? 'EmployeeWiseData';
        const viewTypeValue = localStorage.getItem('rpviewType') ?? 'table';
        setViewMode(viemodeValue);
        setViewType(viewTypeValue);
    }, [])

    const projectOptions = useMemo(() => {
        const data = pmsReportData || [];
        const all = data.map(d => d.modulename).filter(Boolean);
        return [...new Set(all)];
    }, [pmsReportData, viewMode]);

    const assigneeOptions = useMemo(() => {
        const data = pmsReportData || [];
        const all = data.map(d => `${d.firstname} ${d.lastname}`.trim()).filter(Boolean);
        return [...new Set(all)];
    }, [pmsReportData, viewMode]);

    const columns = useMemo(() => {
        const nameColumn = {
            key: viewMode === 'EmployeeWiseData' ? 'Name' : 'modulename',
            label: 'Name',
            width: '300px',
        };
        return [
            nameColumn,
            { key: 'TotalTasks', label: 'Total Tasks', width: '100px' },
            { key: 'Completed', label: 'Completed', width: '100px' },
            { key: 'Progress', label: 'Progress', width: '100px' },
            { key: 'Performance', label: 'Performance', width: '120px' },
            { key: 'running', label: 'Running', width: '100px' },
            { key: 'onhold', label: 'OnHold', width: '100px' },
            { key: 'challenges', label: 'Challenges', width: '100px' },
            { key: 'TotalEstimate', label: 'Estimate (hrs)', width: '100px' },
            { key: 'TotalActual', label: 'Working (hrs)', width: '100px' },
            { key: 'TotalDiff', label: 'Diff (hrs)', width: '100px' },
        ];
    }, [viewMode]);

    const handleTaskChange = (event, newMode) => {
        if (newMode) {
            setViewMode(newMode);
            setSearchText('');
            setSelectedAssignee('');
            setSelectedProject('');
            localStorage.setItem('rpviewMode', newMode);
        }
    };

    const handleViewChange = (event, newViewType) => {
        if (newViewType) {
            setViewType(newViewType);
            localStorage.setItem('rpviewType', newViewType);
        }
    };

    const handleNavigate = (direction) => {
        const newDate = direction === 'prev'
            ? currentDate.subtract(1, 'day')
            : currentDate.add(1, 'day');
        setCurrentDate(newDate);
    };

    const handleToggleChange = (event, newFilter) => {
        if (newFilter !== null) {
            setSelectedFilter(newFilter);
        }
    };

    const formattedData = useMemo(() => {
        let data = pmsReportData || [];

        // Apply search filter across all fields
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            data = data.filter(row =>
                Object.values(row).some(
                    val =>
                        val &&
                        val.toString().toLowerCase().includes(search)
                )
            );
        }

        // Filter by selected assignee
        if (viewMode === 'EmployeeWiseData' && selectedAssignee) {
            data = data.filter(
                d => `${d.firstname} ${d.lastname}`.trim() === selectedAssignee
            );
        }

        // Filter by selected project
        if (viewMode === 'ModuleWiseData' && selectedProject) {
            data = data.filter(d => d.modulename == selectedProject);
        }

        return data.map(row => ({
            ...row,
            Diff: (
                <span style={{ color: row.Diff <= 0 ? 'green' : 'red', fontWeight: 500 }}>
                    {row.Diff > 0 ? `+${row.Diff}` : row.Diff}
                </span>
            )
        }));
    }, [taskFinalData, pmsReportData, viewMode, searchText, selectedProject, selectedAssignee]);

    if (iswhTLoading) {
        return <LoadingBackdrop isLoading={iswhTLoading} />;
    }

    return (
        <Box className="report-container">
            <PmFilters
                searchText={searchText}
                setSearchText={setSearchText}
                selectedAssignee={selectedAssignee}
                setSelectedAssignee={setSelectedAssignee}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedFilter={selectedFilter}
                filterOptions={filterOptions}
                currentDate={currentDate}
                assigneeOptions={assigneeOptions}
                projectOptions={projectOptions}
                viewMode={viewMode}
                handleTaskChange={handleTaskChange}
                TASK_OPTIONS={TASK_OPTIONS}
                viewType={viewType}
                handleViewChange={handleViewChange}
                onNavigate={handleNavigate}
                handleToggleChange={handleToggleChange}
                commonTextFieldProps={commonTextFieldProps}
            />
            <div
                style={{
                    margin: "20px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }}
            />

            {viewType === 'card' ? (
                <Grid container spacing={2}>
                    {formattedData?.map((item, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <TaskReportCard data={item} viewMode={viewMode} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <ReportsGrid columns={columns} data={formattedData} viewMode={viewMode} />
            )}
        </Box>
    );
};

export default PmsReport;
