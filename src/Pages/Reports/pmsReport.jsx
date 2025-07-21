import React, { useEffect, useMemo, useState } from 'react';
import "./Reports.scss";
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Grid,
    TextField,
    Stack,
    Autocomplete,
} from '@mui/material';
import ReportsGrid from '../../Components/Reports/ReportsGrid';
import { Grid2x2, List, Square, SquareChartGantt, User } from 'lucide-react';
import TaskReportCard from '../../Components/Reports/TaskReportCard';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { commonTextFieldProps } from '../../Utils/globalfun';

const TASK_OPTIONS = [
    { id: 1, value: "EmployeeWiseData", label: "Team", icon: <User size={20} /> },
    { id: 2, value: "ModuleWiseData", label: "Project", icon: <SquareChartGantt size={20} /> },
];

const PmsReport = () => {
    const [viewMode, setViewMode] = useState('EmployeeWiseData');
    const [viewType, setViewType] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');

    const { iswhTLoading, taskFinalData } = useFullTaskFormatFile();

    useEffect(() => {
        const viemodeValue = localStorage.getItem('rpviewMode') ?? 'EmployeeWiseData';
        const viewTypeValue = localStorage.getItem('rpviewType') ?? 'table';
        setViewMode(viemodeValue);
        setViewType(viewTypeValue);
    }, [])

    const projectOptions = useMemo(() => {
        const data = taskFinalData?.[viewMode] || [];
        const all = data.map(d => d.modulename).filter(Boolean);
        return [...new Set(all)];
    }, [taskFinalData, viewMode]);

    const assigneeOptions = useMemo(() => {
        const data = taskFinalData?.[viewMode] || [];
        const all = data.map(d => `${d.firstname} ${d.lastname}`.trim()).filter(Boolean);
        return [...new Set(all)];
    }, [taskFinalData, viewMode]);

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

    const formattedData = useMemo(() => {
        let data = taskFinalData?.[viewMode] || [];

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
    }, [taskFinalData, viewMode, searchText, selectedProject, selectedAssignee]);

    if (iswhTLoading) {
        return <LoadingBackdrop isLoading={iswhTLoading} />;
    }

    const ViewToggleButtons = ({ view, onViewChange }) => {
        return (
          <ToggleButtonGroup
            size='small'
            value={view}
            exclusive
            onChange={onViewChange}
            aria-label="view mode"
    
          >
            <ToggleButton value="table" aria-label="table view" sx={{ borderRadius: '8px' }}>
              <List className="iconbtn" size={20} />
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view" sx={{ borderRadius: '8px' }}>
              <Square  className="iconbtn" size={20} />
            </ToggleButton>
          </ToggleButtonGroup>
        );
      };

    return (
        <Box className="report-container">
            <Box className="pmsSideBarTgBox">
                {/* 🔍 Search + Filters */}
                <Box sx={{ my: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <Box>
                        <TextField
                            variant="outlined"
                            placeholder='Search All Fields'
                            size="small"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ minWidth: 280 }}
                            {...commonTextFieldProps}
                        />
                    </Box>
                    <Box>
                        {viewMode === 'EmployeeWiseData' && (
                            <Autocomplete
                                options={assigneeOptions}
                                value={selectedAssignee || null}
                                onChange={(e, newValue) => setSelectedAssignee(newValue || '')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder='Assignee' size="small" {...commonTextFieldProps} />
                                )}
                                sx={{ minWidth: 280 }}
                                clearOnEscape
                                isOptionEqualToValue={(option, value) => option === value}
                            />
                        )}

                        {viewMode === 'ModuleWiseData' && (
                            <Autocomplete
                                options={projectOptions}
                                value={selectedProject || null}
                                onChange={(e, newValue) => setSelectedProject(newValue || '')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder='Project' size="small" {...commonTextFieldProps} />

                                )}
                                sx={{ minWidth: 280 }}
                                clearOnEscape
                                isOptionEqualToValue={(option, value) => option === value}
                            />
                        )}
                    </Box>
                </Box>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleTaskChange}
                    aria-label="task type"
                    size="small"
                    className="toggle-group"
                >
                    {TASK_OPTIONS.map(({ id, value, label, icon }) => (
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
                {/* Optional view type switcher: */}
                <ViewToggleButtons view={viewType} onViewChange={handleViewChange} />
            </Box>
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
