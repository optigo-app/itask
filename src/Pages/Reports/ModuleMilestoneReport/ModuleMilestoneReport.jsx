import React, { useEffect, useMemo, useState } from 'react';
import useFullTaskFormatFile from '../../../Utils/TaskList/FullTasKFromatfile';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    useMediaQuery
} from '@mui/material';
import { formatDate2, formatDate, priorityColors, statusColors, getCategoryTaskSummary, isTaskToday } from '../../../Utils/globalfun';
import StatusBadge from '../../../Components/ShortcutsComponent/StatusBadge';
import './ModuleMilestoneReport.scss';
import PriorityBadge from '../../../Components/ShortcutsComponent/PriorityBadge';
import HeaderButtons from '../../../Components/Task/FilterComponent/HeaderButtons';
import Filters from '../../../Components/Task/FilterComponent/Filters';
import FilterChips from '../../../Components/Task/FilterComponent/FilterChip';
import FiltersDrawer from '../../../Components/Task/FilterComponent/FilterModal';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Advfilters, filterDrawer, selectedCategoryAtom } from '../../../Recoil/atom';
import LoadingBackdrop from '../../../Utils/Common/LoadingBackdrop';
import { motion, AnimatePresence } from 'framer-motion';
import MileStoneTimelineModal from './MileStoneTimelineModal';

const ModuleMilestoneReport = () => {
    const { taskFinalData } = useFullTaskFormatFile();
    const [selectedModule, setSelectedModule] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isLaptop = useMediaQuery('(max-width:1150px)');
    const [filters, setFilters] = useRecoilState(Advfilters);
    const showAdvancedFil = useRecoilValue(filterDrawer);
    const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);

    const [masterData, setMasterData] = useState(null);
    const [priorityData, setPriorityData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [assigneeData, setAssigneeData] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [taskProject, setTaskProject] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [categorySummary, setCategorySummary] = useState([]);

    // Load master data and filter dropdown sources from sessionStorage (same as Project.jsx)
    useEffect(() => {
        setIsLoading(true);
        const structured = sessionStorage.getItem('structuredMasterData');
        if (structured) {
            setMasterData(JSON.parse(structured));
        }

        const get = (key, setter) => {
            const val = sessionStorage.getItem(key);
            if (val) setter(JSON.parse(val));
        };

        get('taskpriorityData', setPriorityData);
        get('taskstatusData', setStatusData);
        get('taskAssigneeData', setAssigneeData);
        get('taskdepartmentData', setTaskDepartment);
        get('taskprojectData', setTaskProject);
        get('taskworkcategoryData', setTaskCategory);
    }, []);

    const rowData = useMemo(() => {
        const modules = {};
        const { ModuleMilestoneData, ModuleList } = taskFinalData;

        if (ModuleMilestoneData && ModuleList) {
            ModuleList.forEach(module => {
                const moduleMilestones = ModuleMilestoneData[module.taskid] || [];

                if (moduleMilestones.length > 0) {
                    if (!modules[module.taskid]) {
                        modules[module.taskid] = {
                            moduleName: `${module.taskPr} / ${module.taskname}`,
                            milestones: [],
                            priorities: [],
                            statuses: [],
                            tasknmes: [],
                            deadlines: [],
                            startDates: [],
                            // identifiers for timeline
                            taskid: module.taskid,
                            projectid: module.projectid,
                            // single values (will fill later)
                            priority: null,
                            startDate: null,
                            deadline: null,
                            endDate: null,
                            assignee: null,
                        };
                    }

                    moduleMilestones.forEach(milestone => {
                        // push full milestone object
                        modules[module.taskid].milestones.push(milestone);

                        // arrays
                        modules[module.taskid].priorities.push(milestone.priority);
                        modules[module.taskid].statuses.push(milestone.status);
                        modules[module.taskid].tasknmes.push(milestone.taskname);
                        if (milestone.StartDate) modules[module.taskid].startDates.push(milestone.StartDate);
                        if (milestone.DeadLineDate) modules[module.taskid].deadlines.push(milestone.DeadLineDate);
                    });

                    // Set single line values from first milestone
                    modules[module.taskid].priority = module.priority;
                    modules[module.taskid].StartDate = module.StartDate;
                    modules[module.taskid].DeadLineDate = module.DeadLineDate;
                    modules[module.taskid].EndDate = module.EndDate ?? null;
                    modules[module.taskid].category = module.category;
                    modules[module.taskid].assignee = module.assignee;
                }
            });
        }
        setIsLoading(false);
        return Object.values(modules);
    }, [taskFinalData]);

    // compute CategorySummary for header tabs (similar to Project.jsx)
    useEffect(() => {
        if (Array.isArray(rowData) && rowData.length > 0 && Array.isArray(taskCategory) && taskCategory.length > 0) {
            const summary = getCategoryTaskSummary(rowData, taskCategory);
            setCategorySummary(summary);
        } else {
            setCategorySummary([]);
        }
    }, [rowData, taskCategory]);

    const filteredRowData = useMemo(() => {
        if (!Array.isArray(rowData)) return [];
        const {
            status = '',
            priority = '',
            assignee = '',
            searchTerm = '',
            dueDate = null,
            startDate = null,
            category = [],
        } = filters || {};

        const now = new Date();

        const isValidFilter = (value) =>
            value &&
            ![
                'Select Status',
                'Select Priority',
                'Select Assignee',
                'Select Project',
                'Select Department',
            ].includes(value);

        const normalizedSearchTerm = searchTerm?.trim()?.toLowerCase() || '';
        const isQuoted =
            (normalizedSearchTerm.startsWith('"') && normalizedSearchTerm.endsWith('"')) ||
            (normalizedSearchTerm.startsWith("'") && normalizedSearchTerm.endsWith("'"));
        const cleanSearchTerm = isQuoted
            ? normalizedSearchTerm.slice(1, -1)
            : normalizedSearchTerm;

        const exactMatch = (text) =>
            typeof text === 'string'
                ? new RegExp(`\\b${cleanSearchTerm}\\b`, 'i').test(text)
                : false;

        const partialMatch = (text) =>
            typeof text === 'string'
                ? text.toLowerCase().includes(cleanSearchTerm)
                : false;

        const matchText = (text) =>
            isQuoted ? exactMatch(text) : partialMatch(text);

        const isTaskDue = (dateStr) => {
            if (!dateStr) return false;
            return new Date(dateStr) < now;
        };

        const isUnsetDeadline = (dateStr) => {
            const date = new Date(dateStr);
            return !dateStr || date.toISOString().slice(0, 10) === '1900-01-01';
        };

        return rowData.filter((row) => {
            if (!row) return false;

            const matchesCategory =
                !Array.isArray(category) ||
                category.length === 0 ||
                category.some((cat) => {
                    const catLower = cat.toLowerCase();
                    if (catLower.includes('due')) {
                        return isTaskDue(row?.DeadLineDate) && !isUnsetDeadline(row?.DeadLineDate);
                    }
                    if (catLower.includes('unset deadline')) {
                        return isUnsetDeadline(row?.DeadLineDate);
                    }
                    if (catLower.includes('today')) {
                        return isTaskToday(row?.StartDate);
                    }
                    if (catLower.includes('new')) {
                        return row?.isnew == 1;
                    }
                    return (row?.category ?? '').toLowerCase() === catLower;
                });

            const matchesStatus =
                !isValidFilter(status) ||
                row.statuses?.some((s) => (s ?? '').toLowerCase() === status.toLowerCase());

            const matchesPriority =
                !isValidFilter(priority) ||
                (row?.priority ?? '').toLowerCase() === priority.toLowerCase();

            const matchesDueDate =
                !isValidFilter(dueDate) ||
                (row?.DeadLineDate && formatDate(row.DeadLineDate) === formatDate(dueDate));

            const matchesStartDate =
                !isValidFilter(startDate) ||
                (row?.StartDate && formatDate(row.StartDate) === formatDate(startDate));

            const matchesAssignee =
                !isValidFilter(assignee) ||
                (Array.isArray(row.assignee)
                    ? row.assignee.some(
                        (a) => `${a?.firstname} ${a?.lastname}`.toLowerCase() === assignee.toLowerCase()
                    )
                    : (row?.assignee ?? '').toLowerCase() === assignee.toLowerCase());

            const matchesSearch =
                !searchTerm ||
                matchText(row?.moduleName) ||
                row.statuses?.some((s) => matchText(s)) ||
                row.priorities?.some((p) => matchText(p)) ||
                matchText(row?.priority) ||
                matchText(row?.taskPr) ||
                matchText(row?.taskDpt) ||
                (row?.DeadLineDate ? formatDate(row?.DeadLineDate).includes(cleanSearchTerm) : false) ||
                (row?.StartDate ? formatDate(row?.StartDate).includes(cleanSearchTerm) : false) ||
                (row?.EndDate ? formatDate(row?.EndDate).includes(cleanSearchTerm) : false)
            return (
                matchesCategory &&
                matchesStatus &&
                matchesPriority &&
                matchesDueDate &&
                matchesStartDate &&
                matchesAssignee &&
                matchesSearch
            );
        });
    }, [rowData, filters]);

    const handleFilterChange = (key, value) => {
        if (key === 'clearFilter' && value == null) {
            setFilters({});
            return;
        }

        // Clear dropdown-based filters when "Select ..." option is chosen
        if (typeof value === 'string' && value.startsWith('Select ')) {
            setFilters((prevFilters) => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters[key];
                return updatedFilters;
            });
            return;
        }

        // Clear category filter when empty array passed (same behaviour as Project.jsx)
        if (key === 'category' && Array.isArray(value) && value.length === 0) {
            setFilters((prevFilters) => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters[key];
                return updatedFilters;
            });
            setSelectedCategory([]);
            return;
        }

        setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    };

    const handleClearFilter = (filterKey, value = null) => {
        if (filterKey === 'category') {
            const updatedCategory = value ? filters.category.filter((cat) => cat !== value) : [];
            setFilters((prev) => ({ ...prev, category: updatedCategory }));
            setSelectedCategory(updatedCategory);
        } else if (filterKey === 'dueDate') {
            setFilters((prev) => ({ ...prev, dueDate: null }));
        } else if (filterKey === 'startDate') {
            setFilters((prev) => ({ ...prev, startDate: null }));
        } else {
            setFilters((prev) => ({ ...prev, [filterKey]: '' }));
        }
    };

    const handleClearAllFilters = () => {
        setFilters({
            category: [],
            searchTerm: '',
            status: '',
            priority: '',
            department: '',
            assignee: '',
            project: '',
            dueDate: null,
            startDate: null,
        });
        setSelectedCategory([]);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedModule) return;
            if (event.key === 'f' || event.key === 'F') {
                event.preventDefault();
                setIsFullscreen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedModule]);

    return (
        <Box className="project-moduleMain module-milestone-report">
            {/* Header Buttons (reuse Project.jsx pattern) */}
            <HeaderButtons
                activeButton={"table"}
                onButtonClick={() => { }}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
                masterData={masterData}
                priorityData={priorityData}
                projectData={taskProject}
                statusData={statusData}
                taskCategory={taskCategory}
                taskAssigneeData={assigneeData}
                CategorySummary={categorySummary}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key="module-milestone-table"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    {/* Desktop Filters */}
                    {!isLaptop && showAdvancedFil && (
                        <>
                            <div
                                style={{
                                    margin: '20px 0',
                                    border: '1px dashed #7d7f85',
                                    opacity: 0.3,
                                }}
                            />
                            <Filters
                                {...filters}
                                onFilterChange={handleFilterChange}
                                isLoading={isLoading}
                                masterData={masterData}
                                priorityData={priorityData}
                                statusData={statusData}
                                assigneeData={assigneeData}
                                taskDepartment={taskDepartment}
                                taskProject={taskProject}
                                taskCategory={taskCategory}
                            />
                        </>
                    )}

                    {/* Mobile Filters Drawer */}
                    {isLaptop && (
                        <FiltersDrawer
                            {...filters}
                            filters={filters}
                            setFilters={setFilters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAllFilters}
                            isLoading={isLoading}
                            masterData={masterData}
                            priorityData={priorityData}
                            statusData={statusData}
                            assigneeData={assigneeData}
                            taskDepartment={taskDepartment}
                            taskProject={taskProject}
                            taskCategory={taskCategory}
                        />
                    )}

                    {/* Divider */}
                    <div
                        style={{
                            margin: '20px 0',
                            border: '1px dashed #7d7f85',
                            opacity: 0.3,
                        }}
                    />

                    {/* Filter Chips */}
                    <FilterChips
                        filters={filters}
                        onClearFilter={handleClearFilter}
                        onClearAll={handleClearAllFilters}
                    />

                    {/* Report Table */}
                    {isLoading && rowData?.length == 0 ? (
                        <LoadingBackdrop isLoading={true} />
                    ) :
                        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 210px)' }}>
                            <Table stickyHeader aria-label="module milestone report">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '40%' }}>Project/Module</TableCell>
                                        <TableCell sx={{ width: '20%' }}>Deadline</TableCell>
                                        <TableCell sx={{ width: '40%' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRowData?.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedModule(row)}
                                        >
                                            <TableCell className="project-module-cell">
                                                <Typography variant="body1" className='module-name'>
                                                    {row?.moduleName?.includes(' / ') ? (
                                                        <>
                                                            <strong>{row?.moduleName?.split(' / ')[0]}</strong>
                                                            {'/'}
                                                            {row?.moduleName?.split(' / ').slice(1).join(' / ')}
                                                        </>
                                                    ) : (
                                                        row.moduleName
                                                    )}
                                                </Typography>
                                                <PriorityBadge
                                                    task={row}
                                                    priorityColors={priorityColors}
                                                    onPriorityChange={() => { }}
                                                    fontSize="0.6rem"
                                                    padding="0.8px 4px"
                                                    disable={true}
                                                />
                                            </TableCell>
                                            <TableCell className="deadline-cell">
                                                <Typography variant="body1">Dt: {formatDate2(row.DeadLineDate)}</Typography>
                                                <Typography variant="caption">St: {formatDate2(row.StartDate)}</Typography>
                                            </TableCell>
                                            {/* <TableCell className="status-cell">
                                                {row?.statuses?.map((status, i) => (
                                                    <StatusBadge key={i} task={{ status }} statusColors={statusColors} disable={true} />
                                                ))}
                                            </TableCell> */}
                                            <TableCell className="status-cell">
                                                {row?.milestones?.map((milestone, i) => (
                                                    <Box
                                                        key={i}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-start',
                                                            gap: 0.25,
                                                            mb: 0.5,
                                                            p: '5px 10px',
                                                            borderRadius: 2,
                                                            backgroundColor: '#f8f9fb',
                                                            border: '1px solid #eceff4',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                width: '100%',
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            title={milestone?.taskname}
                                                        >
                                                            {milestone?.taskname}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {/* {milestone?.priority && (
                                                                <PriorityBadge
                                                                    task={milestone}
                                                                    priorityColors={priorityColors}
                                                                    disable={true}
                                                                    fontSize={9}
                                                                    padding={1}
                                                                />
                                                            )} */}
                                                            {milestone?.status && (
                                                                <StatusBadge
                                                                    task={milestone}
                                                                    statusColors={statusColors}
                                                                    disable={true}
                                                                    fontSize={9}
                                                                    padding={1}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }

                    <MileStoneTimelineModal
                        selectedModule={selectedModule}
                        setSelectedModule={setSelectedModule}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}

export default ModuleMilestoneReport;
