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
import { useRecoilValue } from 'recoil';
import FilterChips from '../../Components/Task/FilterComponent/FilterChip';

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
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const filterOptions = ['All', 'Today', 'Tomorrow', 'Week'];
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [filters, setFilters] = useState({
        timeFilter: 'Week',
        dateRangeFilter: {
            startDate: '',
            endDate: ''
        },
        department: '',
        assignee: '',
        project: '',
        search: ''
    });
    const actualData = useRecoilValue(actualTaskData);
    const { iswhTLoading, taskCategory, taskFinalData } = useFullTaskFormatFile();
    const [isLoading, setIsLoading] = useState(iswhTLoading);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    useEffect(() => {
        setIsLoading(iswhTLoading);
    }, [iswhTLoading]);

    // helper function for date wise data get
    const isWithinDateRange = (task, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        if (filters.timeFilter === 'All') return true;

        const dateRaw = task?.[taskDateField];
        if (!dateRaw || dateRaw === '1900-01-01T00:00:00.000Z') return false;

        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) return false;

        const baseDate = new Date(currentDate);
        baseDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(baseDate);
        tomorrow.setDate(baseDate.getDate() + 1);

        const startOfWeek = new Date(baseDate);
        // Calculate Monday as start of week (getDay(): 0=Sunday, 1=Monday, ...)
        const dayOfWeek = baseDate.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
        startOfWeek.setDate(baseDate.getDate() - daysFromMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        switch (filters.timeFilter) {
            case 'Today':
                return date.toDateString() === baseDate.toDateString();
            case 'Tomorrow':
                return date.toDateString() === tomorrow.toDateString();
            case 'Week':
                return date >= startOfWeek && date <= endOfWeek;
            case 'Date-Range': {
                const from = new Date(filters.dateRangeFilter.startDate);
                const to = new Date(filters.dateRangeFilter.endDate);
                if (isNaN(from) || isNaN(to)) return false;
                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const fromOnly = new Date(from.getFullYear(), from.getMonth(), from.getDate());
                const toOnly = new Date(to.getFullYear(), to.getMonth(), to.getDate());

                return dateOnly >= fromOnly && dateOnly <= toOnly;
            }
            default:
                return true;
        }
    };

    // Employee Data Processing
    const processEmployeeData = (data, taskCategory, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        const EmployeeWiseDataMap = new Map();

        data?.forEach((task) => {
            if (!isWithinDateRange(task, taskDateField, currentDate)) return;

            const estimate = task.estimate_hrs || 0;
            const actual = task.workinghr || 0;
            const status = (task.status || "").toLowerCase();

            if (Array.isArray(task.assignee)) {
                task.assignee.forEach((assignee) => {
                    // Only process assignees who are active (isactive: 1)
                    if (assignee.isactive !== 1) return;

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
            const performance = emp.TotalEstimate > 0 && emp.TotalActual > 0
                ? Math.round((emp.TotalActual / emp.TotalEstimate) * 100)
                : 0;

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
    const processModuleWiseData = (data, ModuleList, taskCategory, taskDateField = 'DeadLineDate', currentDate = new Date()) => {
        const ModuleWiseDataMap = new Map();
        setIsLoading(true);

        data?.forEach((task) => {
            if (!isWithinDateRange(task, taskDateField, currentDate)) return;
            const moduleId = task.moduleid;
            if (!moduleId) return;

            if (!ModuleWiseDataMap.has(moduleId)) {
                ModuleWiseDataMap.set(moduleId, {
                    moduleid: moduleId,
                    modulename: ModuleList?.find(m => m.taskid == moduleId)?.taskname || "",
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
            const performance = mod.TotalEstimate > 0 && mod.TotalActual > 0
                ? Math.round((mod.TotalActual / mod.TotalEstimate) * 100)
                : 0;

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
        if (viewMode === "EmployeeWiseData") {
            const empData = processEmployeeData(actualData, taskCategory, 'DeadLineDate', currentDate);
            setPmsReportData(empData);
            setIsLoading(false);
        } else if (taskFinalData?.ModuleList?.length > 0) {
            const modData = processModuleWiseData(actualData, taskFinalData?.ModuleList, taskCategory, 'DeadLineDate', currentDate);
            setPmsReportData(modData);
            setIsLoading(false);
        }
    }, [currentDate, actualData, viewMode, taskCategory, taskFinalData, filters]);

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

    const departmentOptions = useMemo(() => {
        const data = pmsReportData || [];
        const departments = data.map(d => d.department || 'Unknown').filter(Boolean);

        return [...new Set(departments)].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
        );
    }, [pmsReportData]);

    const columns = useMemo(() => {
        const nameColumn = {
            key: viewMode === 'EmployeeWiseData' ? 'firstname' : 'modulename',
            label: 'Name',
            width: '270px',
        };
        return [
            nameColumn,
            { key: 'TotalTasks', label: 'Total Tasks', width: '100px' },
            { key: 'Completed', label: 'Completed', width: '80px' },
            { key: 'Progress', label: 'Progress', width: '100px' },
            { key: 'Performance', label: 'Performance', width: '120px' },
            { key: 'running', label: 'Running', width: '100px' },
            { key: 'onhold', label: 'OnHold', width: '100px' },
            { key: 'challenges', label: 'Challenges', width: '100px' },
            { key: 'TotalEstimate', label: 'Estimate (hrs)', width: '118px' },
            { key: 'TotalActual', label: 'Working (hrs)', width: '118px' },
            { key: 'TotalDiff', label: 'Diff (hrs)', width: '90px' },
        ];
    }, [viewMode]);

    const handleTaskChange = (event, newMode) => {
        if (newMode) {
            setViewMode(newMode);
            setSearchText('');
            setSelectedAssignee('');
            setSelectedProject('');
            setSelectedDepartment('');
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
        let newDate;

        if (filters.timeFilter === 'Today') {
            newDate = direction === 'prev'
                ? currentDate.subtract(1, 'day')
                : currentDate.add(1, 'day');
        } else if (filters.timeFilter === 'Tomorrow') {
            newDate = direction === 'prev'
                ? currentDate.subtract(1, 'day')
                : currentDate.add(1, 'day');
        } else if (filters.timeFilter === 'Week') {
            newDate = direction === 'prev'
                ? currentDate.subtract(1, 'week')
                : currentDate.add(1, 'week');
        } else {
            newDate = direction === 'prev'
                ? currentDate.subtract(1, 'day')
                : currentDate.add(1, 'day');
        }

        setCurrentDate(newDate);
        updateDatePickerBasedOnFilter(filters.timeFilter, newDate);
    };

    const handleToggleChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilters((prev) => ({
                ...prev,
                timeFilter: newFilter,
                dateRangeFilter: {
                    startDate: '',
                    endDate: ''
                },
            }));
            const today = dayjs();
            setCurrentDate(today);
            updateDatePickerBasedOnFilter(newFilter, today);
        }
    };

    // Helper function to update date picker based on selected filter
    const updateDatePickerBasedOnFilter = (filter, date) => {
        const targetDate = date || currentDate;

        if (filter === 'Today') {
            setFilters(prev => ({
                ...prev,
                dateRangeFilter: {
                    startDate: targetDate.startOf('day').toISOString(),
                    endDate: targetDate.endOf('day').toISOString()
                }
            }));
        } else if (filter === 'Tomorrow') {
            const tomorrow = targetDate.add(1, 'day');
            setFilters(prev => ({
                ...prev,
                dateRangeFilter: {
                    startDate: tomorrow.startOf('day').toISOString(),
                    endDate: tomorrow.endOf('day').toISOString()
                }
            }));
        } else if (filter === 'Week') {
            // Set Monday as start of week
            const startOfWeek = targetDate.startOf('week').add(1, 'day');
            const endOfWeek = targetDate.endOf('week').add(1, 'day');
            setFilters(prev => ({
                ...prev,
                dateRangeFilter: {
                    startDate: startOfWeek.toISOString(),
                    endDate: endOfWeek.toISOString()
                }
            }));
        }
    };

    const handleDateChange = (range) => {
        if (!range.startDate || !range.endDate) {
            setFilters({
                timeFilter: 'Week',
                dateRangeFilter: {
                    startDate: '',
                    endDate: ''
                },
            });
        } else {
            setFilters({
                timeFilter: 'Date-Range',
                dateRangeFilter: range,
            });
        }
    };

    const handleClearFilter = (filter) => {
        if (filter === 'Date-Range') {
            setFilters(prev => ({
                ...prev,
                timeFilter: 'Week',
                dateRangeFilter: {
                    startDate: '',
                    endDate: ''
                },
            }));
        } else if (filter === 'department') {
            setSelectedDepartment('');
            setFilters(prev => ({ ...prev, department: '' }));
        } else if (filter === 'assignee') {
            setSelectedAssignee('');
            setFilters(prev => ({ ...prev, assignee: '' }));
        } else if (filter === 'project') {
            setSelectedProject('');
            setFilters(prev => ({ ...prev, project: '' }));
        } else if (filter === 'search') {
            setSearchText('');
            setFilters(prev => ({ ...prev, search: '' }));
        }
    };

    const handleClearAllFilters = () => {
        setFilters({
            timeFilter: 'All',
            dateRangeFilter: {
                startDate: '',
                endDate: ''
            },
            department: '',
            assignee: '',
            project: '',
            search: ''
        });
        setSearchText('');
        setSelectedProject('');
        setSelectedAssignee('');
        setSelectedDepartment('');
    };

    const handleChangePage = (event) => {
        setPage(event);
    };

    const handlePageSizeChange = (event) => {
        setRowsPerPage(event);
        setPage(1);
    };

    const handleSortChange = (key) => {
        setSortConfig(prev => {
            const isAsc = prev.key === key && prev.direction === 'asc';
            return {
                key,
                direction: isAsc ? 'desc' : 'asc',
            };
        });
    };

    const formattedData = useMemo(() => {
        let data = pmsReportData || [];
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            data = data.filter(row =>
                Object.values(row).some(
                    val => val && val.toString().toLowerCase().includes(search)
                )
            );
        }
        if (selectedDepartment) {
            data = data.filter(d => (d.department || 'Unknown') === selectedDepartment);
        }

        if (viewMode === 'EmployeeWiseData' && selectedAssignee) {
            data = data.filter(d => `${d.firstname} ${d.lastname}`.trim() === selectedAssignee);
        }

        if (viewMode === 'ModuleWiseData' && selectedProject) {
            data = data.filter(d => d.modulename == selectedProject);
        }
        if (sortConfig.key) {
            data = [...data].sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }

                return sortConfig.direction === 'asc'
                    ? String(valA || '').localeCompare(String(valB || ''))
                    : String(valB || '').localeCompare(String(valA || ''));
            });
        }
        return data;
    }, [pmsReportData, viewMode, searchText, selectedProject, selectedAssignee, sortConfig]);


    const totalPages = Math?.ceil(formattedData && formattedData?.length / rowsPerPage);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return formattedData.slice(start, end);
    }, [formattedData, page, rowsPerPage]);

    if (isLoading !== false) {
        return <LoadingBackdrop isLoading={true} />;
    }

    return (
        <Box className="report-container">
            <PmFilters
                searchText={searchText}
                setSearchText={(value) => {
                    setSearchText(value);
                    setFilters(prev => ({ ...prev, search: value }));
                }}
                selectedAssignee={selectedAssignee}
                setSelectedAssignee={(value) => {
                    setSelectedAssignee(value);
                    setFilters(prev => ({ ...prev, assignee: value }));
                }}
                selectedProject={selectedProject}
                setSelectedProject={(value) => {
                    setSelectedProject(value);
                    setFilters(prev => ({ ...prev, project: value }));
                }}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={(value) => {
                    setSelectedDepartment(value);
                    setFilters(prev => ({ ...prev, department: value }));
                }}
                selectedFilter={filters}
                filterOptions={filterOptions}
                currentDate={currentDate}
                assigneeOptions={assigneeOptions}
                projectOptions={projectOptions}
                departmentOptions={departmentOptions}
                viewMode={viewMode}
                handleTaskChange={handleTaskChange}
                TASK_OPTIONS={TASK_OPTIONS}
                viewType={viewType}
                handleViewChange={handleViewChange}
                handleDateChange={handleDateChange}
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
            <FilterChips
                filters={filters}
                onClearFilter={handleClearFilter}
                onClearAll={handleClearAllFilters}
                hideClearBtn={true}
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
                <ReportsGrid
                    columns={columns}
                    data={paginatedData}
                    page={page}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onPageSizeChange={handlePageSizeChange}
                    sortConfig={sortConfig}
                    onSortChange={handleSortChange}
                    viewMode={viewMode}
                    reportType="pms-report"
                />

            )}
        </Box>
    );
};

export default PmsReport;
