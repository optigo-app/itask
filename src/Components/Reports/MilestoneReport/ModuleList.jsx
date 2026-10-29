import { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Popover,
} from '@mui/material';
import { ChevronDown, Layers, Search, Flag, ListFilter } from 'lucide-react';
import { formatDate2 } from '../../../Utils/globalfun';

const ModuleList = ({ modules, selectedModule, onModuleClick, onAllClick, showAll, onFilterClick, onFilterClose, filtersPanel, chipsPanel, filtersOpen }) => {
    const [expandedProjects, setExpandedProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const filteredModules = useMemo(() => {
        if (!searchTerm) return modules;
        const lowerSearch = searchTerm.toLowerCase();
        return modules.filter((module) =>
            (module.moduleName || '').toLowerCase().includes(lowerSearch) ||
            (module.taskPr || '').toLowerCase().includes(lowerSearch)
        );
    }, [modules, searchTerm]);

    const groupedModules = useMemo(() => {
        const grouped = {};
        filteredModules.forEach((module) => {
            const project = module.taskPr || 'No Project';
            (grouped[project] ||= []).push(module);
        });

        const sortedGrouped = {};
        Object.keys(grouped)
            .sort((a, b) => {
                if (a === 'No Project') return 1;
                if (b === 'No Project') return -1;
                return a.localeCompare(b);
            })
            .forEach((project) => {
                sortedGrouped[project] = grouped[project];
            });
        return sortedGrouped;
    }, [filteredModules]);

    const totalMilestones = useMemo(
        () => filteredModules.reduce((sum, m) => sum + (m?.milestones?.length || 0), 0),
        [filteredModules]
    );

    const handleAccordionChange = (project) => (event, isExpanded) => {
        setExpandedProjects((prev) =>
            isExpanded ? [project] : prev.filter((p) => p !== project)
        );
    };

    return (
        <Box className="moduleListMain">
            <Box className="moduleListHeader stickyHeader">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Modules</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={filtersOpen ? 'Close filters' : 'Filters'} arrow>
                            <IconButton size="small" onClick={onFilterClick} aria-label="Filters" ref={setFilterAnchorEl}>
                                <ListFilter size={18} style={{ color: filtersOpen ? '#7367f0' : '#7d7f85' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#7d7f85', mt: 0.5, mb: 2 }}>
                    Select a module to view its milestones
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} style={{ color: '#7d7f85' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#7367f0',
                                },
                            },
                        },
                    }}
                />
                {chipsPanel}
            </Box>

            <Popover
                open={Boolean(filtersOpen) && Boolean(filtersPanel)}
                anchorEl={filterAnchorEl}
                onClose={onFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{
                    sx: {
                        width: 340,
                        maxWidth: '94vw',
                        maxHeight: '72vh',
                        overflowY: 'auto',
                        p: 2,
                        mt: 0.5,
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                    },
                }}
            >
                {filtersPanel}
            </Popover>

            <Box className="moduleListContent">
                {/* All modules option */}
                <Box
                    className={`moduleCard allModulesCard ${showAll ? 'selected' : ''}`}
                    onClick={onAllClick}
                >
                    <Layers size={18} className="moduleCardIcon" />
                    <Box className="moduleInfo">
                        <Typography className="moduleName">All Modules</Typography>
                        <Typography className="moduleMeta">
                            {filteredModules.length} modules · {totalMilestones} milestones
                        </Typography>
                    </Box>
                </Box>

                {Object.keys(groupedModules)?.length === 0 ? (
                    <Box className="emptyState">
                        <Layers className="emptyIcon" size={48} />
                        <Typography className="emptyText">
                            {searchTerm ? `No modules found matching "${searchTerm}"` : 'No modules with milestones'}
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(groupedModules)?.map(([project, projectModules]) => (
                        <Accordion
                            key={project}
                            className="projectAccordion"
                            expanded={expandedProjects.includes(project)}
                            onChange={handleAccordionChange(project)}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronDown size={20} />}
                                aria-controls={`${project}-content`}
                                id={`${project}-header`}
                            >
                                <Box className="projectHeader">
                                    <Layers className="projectIcon" size={18} />
                                    <Typography className="projectName">{project}</Typography>
                                    <Typography className="moduleCount">
                                        ({projectModules.length})
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {projectModules?.map((module) => (
                                    <Box
                                        key={module.taskid}
                                        className={`moduleCard ${!showAll && selectedModule?.taskid === module.taskid ? 'selected' : ''}`}
                                        onClick={() => onModuleClick(module)}
                                    >
                                        <Flag size={16} className="moduleCardIcon" />
                                        <Box className="moduleInfo">
                                            <Typography className="moduleName" title={module?.taskname}>
                                                {module?.moduleName?.split(' / ').slice(1).join(' / ') || module?.moduleName}
                                            </Typography>
                                            <Typography className="moduleMeta">
                                                {module?.milestones?.length || 0} milestones
                                                {module?.DeadLineDate ? ` · due ${formatDate2(module.DeadLineDate)}` : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default ModuleList;
