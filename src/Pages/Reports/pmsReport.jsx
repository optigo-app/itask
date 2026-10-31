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
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import SomethingWentWrong from '../../Components/Auth/SomethingWentWrong';
import { commonTextFieldProps } from '../../Utils/globalfun';
import PmFilters from '../../Components/Reports/PmFilters';
import FilterChips from '../../Components/Task/FilterComponent/FilterChip';
import { PmsReportApi, PmsReportDetailApi } from '../../Api/TaskApi/PmsReportApi';
import { mapPmsReportData, mapPmsDetailTasks, getPmsDateWindow } from '../../Utils/TaskList/pmsReportMapper';

const TASK_OPTIONS = [
    { id: 1, value: "EmployeeWiseData", label: "Team", icon: <User size={18} /> },
    { id: 2, value: "ModuleWiseData", label: "Project", icon: <SquareChartGantt size={18} /> },
];

const PmsReport = () => {
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
            startDate: dayjs().startOf('week').add(1, 'day').toISOString(),
            endDate: dayjs().endOf('week').add(1, 'day').toISOString()
        },
        department: '',
        assignee: '',
        project: '',
        search: ''
    });
    const [reportRes, setReportRes] = useState(null);
    const [reportError, setReportError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    // Server-side aggregation (mode=pmsreport) - refetch only when the date window moves
    useEffect(() => {
        let cancelled = false;
        const fetchReport = async () => {
            setIsLoading(true);
            const window = getPmsDateWindow(filters, currentDate);
            const res = await PmsReportApi(window);
            if (cancelled) return;
            const statRow = res?.rd?.[0];
            // stat:0 = SP-level failure (e.g. "Contact your Admin"); missing rd = transport/API failure
            if (statRow?.stat == 0 || !Array.isArray(res?.rd)) {
                const msg = (statRow?.stat_msg || '').replace(/^"+|"+$/g, '').trim();
                setReportError(msg || 'Failed to load the PMS report. Please try again.');
                setReportRes(null);
            } else {
                setReportError(null);
                setReportRes(res);
            }
            setIsLoading(false);
        };
        fetchReport();
        return () => { cancelled = true; };
    }, [currentDate, filters.timeFilter, filters.dateRangeFilter, retryKey]);

    const pmsReportData = useMemo(() => mapPmsReportData(reportRes, viewMode), [reportRes, viewMode]);

    // Lazy task drill-down for the detail modal - one group's tasks only
    const handleRowOpen = async (row) => {
        const window = getPmsDateWindow(filters, currentDate);
        const rows = await PmsReportDetailApi({
            moduleid: viewMode === 'ModuleWiseData' ? (row?.moduleid || 0) : 0,
            assigneeid: viewMode === 'ModuleWiseData' ? 0 : (row?.id || 0),
            ...window,
        });
        if (rows?.[0]?.stat == 0) return [];
        return mapPmsDetailTasks(rows);
    };

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

    if (reportError) {
        return (
            <Box className="report-container">
                <SomethingWentWrong
                    message={reportError}
                    onRetry={() => setRetryKey((k) => k + 1)}
                />
            </Box>
        );
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
                    onRowOpen={handleRowOpen}
                />

            )}
        </Box>
    );
};

export default PmsReport;
