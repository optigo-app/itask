import React, { useEffect, useMemo, useState } from 'react';
import { ModuleMilestoneReportApi } from '../../../Api/TaskApi/ModuleMilestoneReportApi';
import {
    Typography,
    Box,
    LinearProgress,
    useMediaQuery
} from '@mui/material';
import { formatDate2, formatDate, statusColors, getPerformanceStatus, isTaskToday } from '../../../Utils/globalfun';
import './ModuleMilestoneReport.scss';
import Filters from '../../../Components/Task/FilterComponent/Filters';
import FilterChips from '../../../Components/Task/FilterComponent/FilterChip';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Advfilters, filterDrawer, selectedCategoryAtom } from '../../../Recoil/atom';
import LoadingBackdrop from '../../../Utils/Common/LoadingBackdrop';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleList from '../../../Components/Reports/MilestoneReport/ModuleList';
import ModuleDrawer from '../../../Components/Reports/MilestoneReport/ModuleDrawer';
import MilestoneTimeline from '../../../Components/Project/Dashboard/MilestoneTimeline';
import { ToggleButton } from '@mui/material';
import { LayoutPanelLeft as SplitViewIcon, Milestone as MilestoneIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import './MilestoneReportCalendar.scss';

const ModuleMilestoneReport = () => {
    const [moduleRows, setModuleRows] = useState([]);
    const [milestoneRows, setMilestoneRows] = useState([]);
    const [selectedCalModule, setSelectedCalModule] = useState(null); // null = all modules
    const [openSideDrawer, setSideDrawer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isLaptop = useMediaQuery('(max-width:1150px)');
    const [filters, setFilters] = useRecoilState(Advfilters);
    const [showAdvancedFil, setShowAdvancedFil] = useRecoilState(filterDrawer);
    const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);

    const [masterData, setMasterData] = useState(null);
    const [priorityData, setPriorityData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [assigneeData, setAssigneeData] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [taskProject, setTaskProject] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);

    // Load master data and filter dropdown sources from sessionStorage (same as Project.jsx)
    useEffect(() => {
        setIsLoading(true);
        const structured = localStorage.getItem('structuredMasterData');
        if (structured) {
            setMasterData(JSON.parse(structured));
        }

        const get = (key, setter) => {
            const val = localStorage.getItem(key);
            if (val) setter(JSON.parse(val));
        };

        get('taskpriorityData', setPriorityData);
        get('taskstatusData', setStatusData);
        get('taskAssigneeData', setAssigneeData);
        get('taskdepartmentData', setTaskDepartment);
        get('taskprojectData', setTaskProject);
        get('taskworkcategoryData', setTaskCategory);
    }, []);

    // Fetch report data from SP-side mode (no full treelist dependency)
    useEffect(() => {
        let cancelled = false;
        const fetchReport = async () => {
            setIsLoading(true);
            const res = await ModuleMilestoneReportApi();
            if (cancelled) return;
            setModuleRows(res?.rd ?? []);
            setMilestoneRows(res?.rd1 ?? []);
            setIsLoading(false);
        };
        fetchReport();
        return () => { cancelled = true; };
    }, []);

    const rowData = useMemo(() => {
        const milestonesByModule = {};
        milestoneRows.forEach((m) => {
            const key = m?.moduleid;
            if (!key) return;
            (milestonesByModule[key] ||= []).push(m);
        });

        return moduleRows
            .map((module) => {
                const moduleMilestones = milestonesByModule[module.taskid] || [];
                if (moduleMilestones.length === 0) return null;

                const assigneeIds = String(module.assigneids ?? '')
                    .split(',')
                    .map((v) => parseInt(v, 10))
                    .filter(Boolean);
                const assignee = assigneeData.filter((u) => assigneeIds.includes(u.id));

                return {
                    moduleName: `${module.taskPr} / ${module.taskname}`,
                    milestones: moduleMilestones,
                    priorities: moduleMilestones.map((m) => m.priority),
                    statuses: moduleMilestones.map((m) => m.status),
                    tasknmes: moduleMilestones.map((m) => m.taskname),
                    deadlines: moduleMilestones.map((m) => m.DeadLineDate).filter(Boolean),
                    startDates: moduleMilestones.map((m) => m.StartDate).filter(Boolean),
                    taskid: module.taskid,
                    projectid: module.projectid,
                    taskPr: module.taskPr,
                    taskDpt: module.taskDpt,
                    priority: module.priority,
                    StartDate: module.StartDate,
                    DeadLineDate: module.DeadLineDate,
                    EndDate: module.EndDate ?? null,
                    category: module.category,
                    assignee,
                    isnew: module.isnew,
                };
            })
            .filter(Boolean);
    }, [moduleRows, milestoneRows, assigneeData]);

    const filteredRowData = useMemo(() => {
        if (!Array.isArray(rowData)) return [];
        const {
            status = '',
            priority = '',
            assignee = '',
            project = '',
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

        const inDateRange = (dateStr, range) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            const s = new Date(range?.startDate);
            const e = new Date(range?.endDate);
            if (isNaN(d) || isNaN(s) || isNaN(e)) return false;
            d.setHours(0, 0, 0, 0);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
            return d >= s && d <= e;
        };

        // dueDate/startDate come in as {startDate, endDate} ranges (or a single date string);
        // match the module's own date OR any of its milestone dates
        const matchesDate = (range, ownDate, listDates) => {
            if (!isValidFilter(range)) return true;
            if (typeof range === 'string') {
                const f = formatDate(range);
                return f === formatDate(ownDate) || (listDates || []).some((d) => formatDate(d) === f);
            }
            if (!range?.startDate || !range?.endDate) return true;
            return inDateRange(ownDate, range) || (listDates || []).some((d) => inDateRange(d, range));
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
                        return row?.isnew === 1 || row?.isnew === '1' || row?.isnew === true;
                    }
                    return (row?.category ?? '').toLowerCase() === catLower;
                });

            const matchesStatus =
                !isValidFilter(status) ||
                row.statuses?.some((s) => (s ?? '').toLowerCase() === status.toLowerCase());

            const projectLabel = typeof project === 'object' ? (project?.labelname || '') : project;
            const matchesProject =
                !isValidFilter(projectLabel) ||
                (row?.taskPr ?? '').toLowerCase() === projectLabel.toLowerCase();

            const matchesPriority =
                !isValidFilter(priority) ||
                (row?.priority ?? '').toLowerCase() === priority.toLowerCase() ||
                row.priorities?.some((p) => (p ?? '').toLowerCase() === priority.toLowerCase());

            const matchesDueDate = matchesDate(dueDate, row?.DeadLineDate, row?.deadlines);
            const matchesStartDate = matchesDate(startDate, row?.StartDate, row?.startDates);

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
                row.tasknmes?.some((t) => matchText(t)) ||
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
                matchesProject &&
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

    // Split view: milestones shown in the right panel for the selected module (or all)
    const panelMilestones = useMemo(() => {
        const rows = selectedCalModule
            ? filteredRowData.filter((r) => r.taskid === selectedCalModule.taskid)
            : filteredRowData;
        return rows.flatMap((row) =>
            (row?.milestones || []).map((m) => ({
                ...m,
                moduleid: row.taskid,
                moduleName: row.moduleName,
            }))
        );
    }, [filteredRowData, selectedCalModule]);

    const handleModuleCalSelect = (module) => {
        setSelectedCalModule(module);
        setSideDrawer(false);
    };

    const handleAllCalSelect = () => {
        setSelectedCalModule(null);
        setSideDrawer(false);
    };

    // Filters live inside the left panel (toggled by the funnel icon) — no top filter row
    const filtersPanel = showAdvancedFil ? (
        <Box className="moduleListFilters">
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
        </Box>
    ) : null;

    const chipsPanel = (
        <FilterChips
            filters={filters}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
        />
    );

    return (
        <Box className="project-moduleMain module-milestone-report">
            <AnimatePresence mode="wait">
                <motion.div
                    key="module-milestone-split"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    {/* Split layout: module list | milestone panel */}
                        <Box
                            sx={{
                                width: 'calc(100% + 40px)',
                                mx: '-20px',
                                mt: '-20px',
                                height: 'calc(100vh - 150px)',
                                display: 'flex',
                                position: 'relative',
                                backgroundColor: '#ffffff',
                                '@media (max-width: 712px)': {
                                    width: 'calc(100% + 20px)',
                                    mx: '-10px',
                                    mt: '-10px',
                                },
                            }}
                        >
                            {isLaptop ? (
                                <ModuleDrawer
                                    openSideDrawer={openSideDrawer}
                                    setSideDrawer={setSideDrawer}
                                    modules={filteredRowData}
                                    selectedModule={selectedCalModule}
                                    onModuleClick={handleModuleCalSelect}
                                    onAllClick={handleAllCalSelect}
                                    showAll={!selectedCalModule}
                                    onFilterClick={() => setShowAdvancedFil((v) => !v)}
                                    onFilterClose={() => setShowAdvancedFil(false)}
                                    filtersPanel={filtersPanel}
                                    chipsPanel={chipsPanel}
                                    filtersOpen={showAdvancedFil}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: '24%',
                                        minWidth: 260,
                                        height: '100%',
                                        borderRight: '1px solid #e0e0e0',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                >
                                    <ModuleList
                                        modules={filteredRowData}
                                        selectedModule={selectedCalModule}
                                        onModuleClick={handleModuleCalSelect}
                                        onAllClick={handleAllCalSelect}
                                        showAll={!selectedCalModule}
                                        onFilterClick={() => setShowAdvancedFil((v) => !v)}
                                        onFilterClose={() => setShowAdvancedFil(false)}
                                        filtersPanel={filtersPanel}
                                        chipsPanel={chipsPanel}
                                        filtersOpen={showAdvancedFil}
                                    />
                                </Box>
                            )}

                            <Box
                                sx={{
                                    flexGrow: 1,
                                    height: '100%',
                                    bgcolor: '#ffffff',
                                    padding: '12px 16px',
                                    position: 'relative',
                                    zIndex: 0,
                                    overflowY: 'auto',
                                }}
                            >
                                {isLaptop && (
                                    <Box sx={{ mb: 1 }}>
                                        <ToggleButton
                                            value="modules"
                                            size="small"
                                            onClick={() => setSideDrawer(true)}
                                            sx={{ borderRadius: '8px', textTransform: 'none', gap: 0.5 }}
                                        >
                                            <SplitViewIcon size={16} /> Modules
                                        </ToggleButton>
                                    </Box>
                                )}

                                {/* Panel header */}
                                <Box sx={{ mb: 1.5, mt: 0.5 }}>
                                    {selectedCalModule && (
                                        <Typography
                                            variant="caption"
                                            onClick={handleAllCalSelect}
                                            sx={{ color: '#7367f0', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
                                        >
                                            ← All Modules
                                        </Typography>
                                    )}
                                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                                        {selectedCalModule ? selectedCalModule.moduleName : 'All Modules'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#7d7f85' }}>
                                        {panelMilestones.length} milestone{panelMilestones.length === 1 ? '' : 's'}
                                    </Typography>
                                </Box>

                                {isLoading ? (
                                    <LoadingBackdrop isLoading={true} />
                                ) : panelMilestones.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8, color: '#7d7f85' }}>
                                        <MilestoneIcon size={48} style={{ color: '#e0e0e0' }} />
                                        <Typography>No milestones found</Typography>
                                    </Box>
                                ) : selectedCalModule ? (
                                    /* Selected module: timeline view */
                                    <MilestoneTimeline
                                        milestoneData={{ [selectedCalModule.taskid]: selectedCalModule.milestones }}
                                        decodedData={{ taskid: selectedCalModule.taskid, projectid: selectedCalModule.projectid }}
                                    />
                                ) : (
                                    /* All modules: cards only — click opens that module's milestones */
                                    <Box className="milestonePanelList">
                                        {filteredRowData.map((row) => {
                                            const ms = row.milestones || [];
                                            const doneCount = ms.filter((m) => (m?.progress_per ?? 0) === 100).length;
                                            const avgProgress = ms.length
                                                ? Math.round(ms.reduce((s, m) => s + (m?.progress_per ?? 0), 0) / ms.length)
                                                : 0;
                                            const statusCounts = ms.reduce((acc, m) => {
                                                const s = m?.status || 'No Status';
                                                acc[s] = (acc[s] || 0) + 1;
                                                return acc;
                                            }, {});
                                            const progressColor = getPerformanceStatus(avgProgress)?.color ?? '#9e9e9e';
                                            return (
                                                <Box
                                                    key={row.taskid}
                                                    className="milestonePanelItem moduleCardItem"
                                                    onClick={() => handleModuleCalSelect(row)}
                                                    title={`Open ${row.moduleName}`}
                                                >
                                                    <Box className="moduleCardItemMain">
                                                        <Box className="moduleCardItemTop">
                                                            <Typography className="moduleCardItemName" title={row.moduleName}>
                                                                {row.moduleName}
                                                            </Typography>
                                                            <Typography
                                                                className="moduleCardItemPercent"
                                                                sx={{ color: progressColor }}
                                                            >
                                                                {avgProgress}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={avgProgress}
                                                            className="moduleCardItemBar"
                                                            sx={{
                                                                '& .MuiLinearProgress-bar': { backgroundColor: progressColor },
                                                                backgroundColor: '#eceff4',
                                                            }}
                                                        />
                                                        <Box className="moduleCardItemMeta">
                                                            <Typography className="moduleCardItemStat">
                                                                {ms.length} milestone{ms.length === 1 ? '' : 's'} · {doneCount} done
                                                            </Typography>
                                                            <Box className="moduleCardItemStatuses">
                                                                {Object.entries(statusCounts).map(([label, count]) => (
                                                                    <span
                                                                        key={label}
                                                                        className="moduleCardItemStatus"
                                                                        style={{
                                                                            color: statusColors?.[label.toLowerCase()]?.color ?? '#7d7f85',
                                                                            backgroundColor: statusColors?.[label.toLowerCase()]?.backgroundColor ?? '#f1f1f4',
                                                                        }}
                                                                    >
                                                                        {label} {count}
                                                                    </span>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                        <Typography className="moduleCardItemDates">
                                                            {row.StartDate ? `St: ${formatDate2(row.StartDate)}` : 'St: -'}
                                                            {' · '}
                                                            {row.DeadLineDate ? `Due: ${formatDate2(row.DeadLineDate)}` : 'Due: -'}
                                                        </Typography>
                                                    </Box>
                                                    <ChevronRightIcon size={18} className="moduleCardItemChevron" />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}

export default ModuleMilestoneReport;
