import React, { useState, useEffect, useMemo, useRef } from 'react';
import './FullTaskView.scss';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    TableSortLabel,
    IconButton,
} from '@mui/material';

import { fetchFullTaskReportApi } from '../../../Api/TaskApi/fetchFullTaskReportApi';
import { GetPrTeamsApi } from '../../../Api/TaskApi/prTeamListApi';
import LoadingBackdrop from '../../../Utils/Common/LoadingBackdrop';
import StatusBadge from '../../ShortcutsComponent/StatusBadge';
import TablePaginationFooter from '../../ShortcutsComponent/Pagination/TablePaginationFooter';
import { background, formatDaysDisplay, getUserProfileData, priorityColors, statusColors } from '../../../Utils/globalfun';
import PriorityBadge from '../../ShortcutsComponent/PriorityBadge';
import AssigneeAvatarGroup from '../../ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { assigneeId, formData, openFormDrawer, rootSubrootflag, selectedRowData } from '../../../Recoil/atom';
import ProfileCardModal from '../../ShortcutsComponent/ProfileCard';
import { Eye } from 'lucide-react';
import TaskDetail from '../TaskDetails/TaskDetails';
import SidebarDrawer from '../../FormComponent/Sidedrawer';
import { toast } from 'react-toastify';
import { AddTaskDataApi } from '../../../Api/TaskApi/AddTaskApi';
import FullTaskViewFilters from './FullTaskViewFilters';

const DATE_RANGE_OPTIONS = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
];

const getDateRangeByPreset = (preset) => {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    if (preset === 'today') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (preset === 'week') {
        const currentDay = now.getDay();
        const diffToMonday = (currentDay + 6) % 7;
        startDate.setDate(now.getDate() - diffToMonday);
        startDate.setHours(0, 0, 0, 0);

        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        endDate.setMonth(now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };
};

const FullTaskView = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [isPageSizeManuallyChanged, setIsPageSizeManuallyChanged] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'FullPath', direction: 'asc' });

    // Master data for mapping
    const [statusData, setStatusData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [secStatusData, setSecStatusData] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [taskProject, setTaskProject] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [taskAssigneeData, setTaskAssigneeData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [profileTaskId, setProfileTaskId] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [detailTask, setDetailTask] = useState(null);
    const setAssigneeId = useSetRecoilState(assigneeId);
    const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
    const setFormDataValue = useSetRecoilState(formData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRangePreset, setDateRangePreset] = useState('month');
    const defaultStartDateRange = useMemo(() => getDateRangeByPreset('month'), []);
    const [filters, setFilters] = useState({
        status: null,
        priority: null,
        category: null,
        assignee: null,
        startDate: defaultStartDateRange,
        dueDate: null,
    });

    // Custom tooltip refs
    const hoverTooltipRef = useRef(null);
    const hoverTooltipHandlersRef = useRef(new Map());

    useEffect(() => {
        const retrieveData = (key, setter) => {
            const data = sessionStorage.getItem(key);
            if (data) {
                setter(JSON.parse(data));
            }
        };
        retrieveData("taskstatusData", setStatusData);
        retrieveData("tasksecstatusData", setSecStatusData);
        retrieveData("taskpriorityData", setPriorityData);
        retrieveData("taskdepartmentData", setTaskDepartment);
        retrieveData("taskprojectData", setTaskProject);
        retrieveData("taskworkcategoryData", setTaskCategory);
        retrieveData("taskAssigneeData", setTaskAssigneeData);
    }, []);

    useEffect(() => {
        return () => {
            hoverTooltipHandlersRef.current.forEach(handlers => {
                if (handlers.hide) handlers.hide();
            });
            hoverTooltipHandlersRef.current.clear();
        };
    }, []);

    const handleSearchEnter = () => {
        const nextSearch = searchInput;
        const isSameSearch = searchQuery === nextSearch;
        setSearchQuery(nextSearch);
        setPage(1);

        if (isSameSearch && page === 1) {
            fetchData();
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setPage(1);
    };

    const getApiOrderBy = () => `order by ${sortConfig.key} ${sortConfig.direction}`;

    const normalizeData = (items) => {
        return items.map(item => {
            const taskAssigneeData = JSON.parse(sessionStorage.getItem("taskAssigneeData")) || [];
            const taskDepartment = JSON.parse(sessionStorage.getItem("taskdepartmentData")) || [];
            const taskProject = JSON.parse(sessionStorage.getItem("taskprojectData")) || [];
            const taskCategory = JSON.parse(sessionStorage.getItem("taskworkcategoryData")) || [];
            const secStatusData = JSON.parse(sessionStorage.getItem("tasksecstatusData")) || [];
            const statusData = JSON.parse(sessionStorage.getItem("taskstatusData")) || [];
            const priorityData = JSON.parse(sessionStorage.getItem("taskpriorityData")) || [];

            const status = statusData.find(s => s.id == item?.statusid);
            const priority = priorityData.find(p => p.id == item?.priorityid);

            const assigneeIdArray = item?.assigneids
                ?.split(",")
                ?.map((id) => Number(id));
            const matchedAssignees = taskAssigneeData
                ?.filter((user) => assigneeIdArray?.includes(user.id))
                ?.map((user) => ({
                    ...user,
                }));
            const category = taskCategory.find(c => c.id == item?.workcategoryid);
            const project = taskProject.find(p => p.id == item?.projectid);
            const secstatus = secStatusData.find(s => s.id == item?.secstatusid);
            const department = taskDepartment.find(d => d.id == item?.departmentid);
            return {
                ...item,
                status: status ? status.labelname : '',
                priority: priority ? priority.labelname : '',
                assignees: matchedAssignees || [],
                category: category ? category.labelname : '',
                project: project ? project.labelname : '',
                secstatus: secstatus ? secstatus.labelname : '',
                department: department ? department.labelname : '',
            };
        });
    };

    const formatFullPath = (fullPath) => {
        if (!fullPath) return { display: '-', full: '', parts: [] };
        const parts = String(fullPath).split('-->').map((part) => part.trim()).filter(Boolean);
        if (parts.length === 0) return { display: '-', full: '', parts: [] };

        if (parts.length === 1) {
            return {
                prefix: '',
                last: parts[0],
                full: parts[0],
                parts,
            };
        }

        if (parts.length === 2) {
            return {
                prefix: parts[0],
                last: parts[1],
                full: parts.join(' / '),
                parts,
            };
        }

        const last = parts[parts.length - 1];
        const first = parts[0];
        return {
            prefix: `${first} / ...`,
            last,
            full: parts.join(' / '),
            parts,
        };
    };

    const getPageSizeFromResponse = (response, fallbackSize) => {
        const records = [response?.rd1?.[0], response?.rd2?.[0], response?.rd3?.[0], response?.rd4?.[0]];
        const keys = ['pagesize', 'page_size', 'limit', 'rowsperpage'];

        for (const record of records) {
            if (!record || typeof record !== 'object') continue;
            for (const key of Object.keys(record)) {
                const normalizedKey = key.toLowerCase();
                if (!keys.includes(normalizedKey)) continue;
                const value = Number(record[key]);
                if (Number.isFinite(value) && value > 0) return value;
            }
        }

        const rowLength = Number(response?.rd?.length || 0);
        if (rowLength > 0) return rowLength;

        return fallbackSize;
    };

    const isInDateRange = (value, range) => {
        if (!range?.startDate || !range?.endDate || !value) return true;
        const current = new Date(value);
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        if (Number.isNaN(current.getTime()) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
        current.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return current >= start && current <= end;
    };

    const getApiFilterObject = () => {
        const profileData = getUserProfileData();
        const isAdmin = profileData?.designation?.toLowerCase() === "admin";
        return {
            search: searchQuery?.trim() || '',
            priorityid: filters?.priority?.id ?? "",
            assigneeid: isAdmin ? (filters?.assignee?.id ?? "") : (profileData?.id ?? ""),
            statusid: filters?.status?.id ?? "",
            workcategoryid: filters?.category?.id ?? "",
            startdatefrom: filters?.startDate?.startDate ? filters.startDate.startDate.split('T')[0] : '',
            startdateto: filters?.startDate?.endDate ? filters.startDate.endDate.split('T')[0] : '',
            duedatefrom: filters?.dueDate?.startDate ? filters.dueDate.startDate.split('T')[0] : '',
            duedateto: filters?.dueDate?.endDate ? filters.dueDate.endDate.split('T')[0] : '',
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetchFullTaskReportApi(
                getApiOrderBy(),
                rowsPerPage.toString(),
                page.toString(),
                getApiFilterObject()
            );
            if (response?.rd) {
                const normalizedRows = normalizeData(response.rd || []);
                setData(normalizedRows);
                setTotalCount(response?.rd[0]?.icount || 0);

                if (!isPageSizeManuallyChanged && page === 1) {
                    const apiPageSize = getPageSizeFromResponse(response, rowsPerPage);
                    if (apiPageSize !== rowsPerPage) {
                        setRowsPerPage(apiPageSize);
                    }
                }
            } else {
                setData([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage, sortConfig, searchQuery, filters?.status, filters?.priority, filters?.category, filters?.assignee, filters?.startDate, filters?.dueDate]);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (size) => {
        setIsPageSizeManuallyChanged(true);
        setRowsPerPage(Number(size));
        setPage(1);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleDateRangePresetChange = (presetId) => {
        setDateRangePreset(presetId);
        setPage(1);
    };

    const hanldePAvatarClick = (task, clickedAssigneeId, assignees) => {
        setAssigneeId(clickedAssigneeId);
        setSelectedItem(Array.isArray(assignees) ? assignees : []);
        setProfileTaskId(task?.taskid ?? "");
        setProfileOpen(true);
    }

    const handleViewTask = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setTaskDetailModalOpen(true);
        setFormDataValue(task);
        setDetailTask(task);
    };

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const handleDrawerToggle = () => {
        setFormDrawerOpen(!formdrawerOpen);
    };

    const handleFormSubmit = async (formValues, mode, module) => {
        const rootflag = rootSubrootflagval?.Task == "AddTask"
            ? { Task: "subroot" }
            : rootSubrootflagval;

        const addTaskApi = await AddTaskDataApi(formValues, rootflag ?? {}, module);
        if (addTaskApi && addTaskApi?.rd[0]?.stat == 1) {
            toast.success(formValues?.taskid ? 'Task Updated Successfully...' : 'Task Added Successfully...');
            fetchData();
        } else {
            toast.error("Something went wrong...");
        }
        return addTaskApi;
    };

    const handleNavigate = async (task) => {
        const userLoginData = getUserProfileData();
        const teamApiRes = await GetPrTeamsApi(task, "root");
        const isLimitedAccess = teamApiRes?.rd?.find((item) => item.assigneeid == userLoginData?.id)?.islimitedaccess;

        const isReadOnly = task?.assignees?.find(a => a.id == userLoginData?.id)?.isreadonly == 1;

        let urlData = {
            module: task?.taskname,
            project: task.project,
            taskid: task?.taskid,
            projectid: task?.projectid,
            moduleid: task?.RootTaskId,
            roottaskid: task?.RootTaskId,
            maingroupids: task?.maingroupids,
            isLimited: isLimitedAccess ?? 0,
            isreadonly: isReadOnly ? 1 : 0,
            fromFullTaskView: true,
            breadcrumbTitles: task?.breadcrumbTitles
        };
        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        const formattedPrName = task?.project?.trim()?.replace(/\s+/g, '-') || '';
        const url = `/tasks/${formattedPrName}/?data=${encodedFormData}`;
        navigate(url);
    };

    const presetRange = useMemo(() => getDateRangeByPreset(dateRangePreset), [dateRangePreset]);

    const filteredRows = useMemo(() => {
        return data.filter((row) => {
            const matchesPresetStartDate = isInDateRange(row?.StartDate, presetRange);
            const matchesStartDate = isInDateRange(row?.StartDate, filters?.startDate);
            const matchesDueDate = isInDateRange(row?.DeadLineDate, filters?.dueDate);

            return matchesPresetStartDate && matchesStartDate && matchesDueDate;
        });
    }, [data, filters, presetRange]);

    const hasFrontendFilters = Boolean(
        filters?.startDate?.startDate ||
        filters?.dueDate?.startDate ||
        dateRangePreset
    );

    const displayRows = filteredRows;
    const effectiveTotalCount = hasFrontendFilters ? filteredRows.length : totalCount;
    const totalPages = Math.max(1, Math.ceil((effectiveTotalCount || 0) / rowsPerPage));

    const tableHeaders = [
        { label: "Task Title", key: "FullPath", sortKey: "FullPath", width: "36%" },
        { label: "Project", key: "project", sortKey: "projectid", width: "12%" },
        { label: "What Next", key: "secstatus", sortKey: "secstatusid", width: "12%" },
        { label: "Assignees", key: "assignees", sortKey: "assigneids", width: "12%" },
        { label: "Start Date", key: "StartDate", sortKey: "StartDate", width: "10%" },
        { label: "Due Date", key: "DeadLineDate", sortKey: "DeadLineDate", width: "10%" },
        { label: "Estimate", key: "estimate_hrs", sortKey: "estimate_hrs", width: "8%" },
        { label: "Action", key: "action", sortKey: "taskid", width: "8%" },
    ];

    const renderAssigneeAvatars = (assignees, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut, showAddButton = true) => (
        <AssigneeAvatarGroup
            assignees={assignees}
            task={task}
            maxVisible={3}
            showAddButton={showAddButton}
            hoveredTaskId={hoveredTaskId}
            hoveredColumnName={hoveredColumnname}
            onAvatarClick={(assigneesList, clickedId) => hanldePAvatarClick(task, clickedId, assigneesList)}
            onAddClick={(task) => handleAssigneeShortcut(task, { Task: 'root' })}
            size={30}
            spacing={0.5}
        />
    );

    const ensureTooltip = () => {
        if (!hoverTooltipRef.current) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-task-tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.display = 'none';
            tooltip.style.zIndex = '9999';
            tooltip.style.pointerEvents = 'none';
            document.body.appendChild(tooltip);
            hoverTooltipRef.current = tooltip;
        }
        return hoverTooltipRef.current;
    };

    const renderTooltipHtml = (pathData) => {
        if (!pathData?.parts || pathData.parts.length === 0) return '';

        const partsHtml = pathData.parts.map((part, idx) => {
            const isLast = idx === pathData.parts.length - 1;
            const color = isLast ? '#7367f0' : '#6b7280';
            const fontWeight = isLast ? '600' : '400';
            const separator = idx > 0 ? '<span style="color: #9ca3af; margin: 0 8px;">›</span>' : '';
            return `${separator}<span style="font-size: 13px; color: ${color}; font-weight: ${fontWeight};">${part}</span>`;
        }).join('');

        return `
            <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15); max-width: 400px;">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #374151;">Task Path</div>
                <div>${partsHtml}</div>
            </div>
        `;
    };

    return (
        <Box className="fullTaskReportMain">
            {loading && <LoadingBackdrop />}

            <FullTaskViewFilters
                searchInput={searchInput}
                onSearchChange={(value) => {
                    setSearchInput(value);
                }}
                onSearchEnter={handleSearchEnter}
                dateRangePreset={dateRangePreset}
                onDateRangePresetChange={handleDateRangePresetChange}
                dateRangeOptions={DATE_RANGE_OPTIONS}
                filters={filters}
                onFilterChange={handleFilterChange}
                taskAssigneeData={taskAssigneeData}
                statusData={statusData}
                priorityData={priorityData}
                taskCategory={taskCategory}
            />

            <TableContainer component={Paper} className='muiTableTaContainer'>
                <Table aria-label="task table" className='muiTable'>
                    <TableHead className='muiTableHead'>
                        <TableRow>
                            {tableHeaders.map((header) => (
                                <TableCell key={header.key} width={header.width}>
                                    <TableSortLabel
                                        active={sortConfig.key === header.sortKey}
                                        direction={sortConfig.key === header.sortKey ? sortConfig.direction : 'asc'}
                                        onClick={() => handleSort(header.sortKey)}
                                    >
                                        {header.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayRows.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={tableHeaders.length}>
                                    <Typography variant="body2" p={2} textAlign="center">No data found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {displayRows.map((row, index) => {
                            const pathFormatted = formatFullPath(row.FullPath);
                            return (
                                <TableRow
                                    key={row.id || row.taskid || `${row.FullPath}-${index}`}
                                >
                                    <TableCell className="fullPathCell">
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                            <Box
                                                className="fullPathText"
                                                component="div"
                                                sx={{ display: 'inline', cursor: 'default' }}
                                                ref={(el) => {
                                                    if (el && !hoverTooltipHandlersRef.current.has(el)) {
                                                        const tooltip = ensureTooltip();
                                                        const show = () => {
                                                            tooltip.innerHTML = renderTooltipHtml(pathFormatted);
                                                            tooltip.style.display = 'block';
                                                        };
                                                        const move = (e) => {
                                                            tooltip.style.left = e.pageX + 10 + 'px';
                                                            tooltip.style.top = e.pageY + 10 + 'px';
                                                        };
                                                        const hide = () => {
                                                            tooltip.style.display = 'none';
                                                        };
                                                        el.addEventListener('mouseenter', show);
                                                        el.addEventListener('mousemove', move);
                                                        el.addEventListener('mouseleave', hide);
                                                        hoverTooltipHandlersRef.current.set(el, { show, move, hide });
                                                    }
                                                }}
                                            >
                                                {!!pathFormatted.prefix && (
                                                    <Typography component="span" variant="body2" className="fullPathPrefix">
                                                        {pathFormatted.prefix}
                                                    </Typography>
                                                )}
                                                {!!pathFormatted.prefix && (
                                                    <Typography component="span" variant="body2" className="fullPathEllipsis">
                                                        /
                                                    </Typography>
                                                )}
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    className="fullPathLast"
                                                    onClick={() => handleNavigate(row)}
                                                >
                                                    {pathFormatted.last || '-'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box className="taskMetaRow">
                                            {row?.status && (
                                                <StatusBadge task={row} statusColors={statusColors} onStatusChange={() => { }} fontSize="10px" padding="2px 6px" disable={true} />
                                            )}
                                            {row?.priority && (
                                                <PriorityBadge task={row} priorityColors={priorityColors} onPriorityChange={() => { }} fontSize="10px" padding="2px 6px" disable={true} />
                                            )}
                                            {row?.secstatus && (
                                                <StatusBadge task={row} statusColors={statusColors} onStatusChange={() => { }} fontSize="10px" padding="2px 6px" disable={true} flag="secondaryStatus" />
                                            )}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {row?.project || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {row?.secstatus || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {renderAssigneeAvatars(row.assignees, row, null, null, hanldePAvatarClick, null, false)}
                                    </TableCell>
                                    <TableCell>{row.StartDate ? new Date(row.StartDate).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>{row.DeadLineDate ? formatDaysDisplay(row?.DeadLineDate, row) : '-'}</TableCell>
                                    <TableCell>{row.estimate_hrs}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleViewTask(row, { Task: 'root' })}>
                                            <Eye size={18} color="#808080" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {!loading && totalCount > 0 && (
                <TablePaginationFooter
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    onPageChange={handleChangePage}
                    onPageSizeChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 50, 100, 150, 200]}
                />
            )}

            <ProfileCardModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                profileData={selectedItem}
                background={background}
                taskId={profileTaskId}
                onRemoved={() => { }}
            />

            <TaskDetail
                open={taskDetailModalOpen}
                onClose={handleTaskModalClose}
                taskData={detailTask}
                handleTaskFavorite={() => { }}
            />

            <SidebarDrawer
                open={formdrawerOpen}
                onClose={handleDrawerToggle}
                onSubmit={handleFormSubmit}
                isLoading={loading}
                priorityData={priorityData}
                projectData={taskProject}
                statusData={statusData}
                secStatusData={secStatusData}
                taskCategory={taskCategory}
                taskDepartment={taskDepartment}
                taskAssigneeData={taskAssigneeData}
            />
        </Box>
    );
};

export default FullTaskView;
