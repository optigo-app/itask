import React from 'react';
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import { Search, Filter, ChevronLeft, ChevronRight, List } from 'lucide-react';
import BugTrackingFiltersPopover from './BugTrackingFiltersPopover';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import PriorityBadge from '../../Components/ShortcutsComponent/PriorityBadge';
import AssigneeAvatarGroup from '../../Components/ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import { statusColors, priorityColors } from '../../Utils/globalfun';

const BugTrackingTasks = ({
    filteredTasks,
    selectedTask,
    handleTaskClick,
    isSidebarOpen,
    showSearch,
    setShowSearch,
    searchTerm,
    setSearchTerm,
    handleFilterClick,
    anchorEl,
    handleFilterClose,
    listFilters,
    statusData,
    priorityData,
    taskCategory,
    handleListFilterChange,
    handleClearListFilters,
    setIsSidebarOpen
}) => {
    return (
        <Box className={`column left-column ${!isSidebarOpen ? 'collapsed' : ''}`}>
            <Box className="list-header">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: (isSidebarOpen && showSearch) ? 2 : 0 }}>
                    {isSidebarOpen && <Typography variant="h6">Tasks</Typography>}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isSidebarOpen && (
                            <>
                                <IconButton size="small" onClick={() => setShowSearch(!showSearch)}>
                                    <Search size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={handleFilterClick}>
                                    <Filter size={18} />
                                </IconButton>
                                <BugTrackingFiltersPopover
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleFilterClose}
                                    listFilters={listFilters}
                                    statusData={statusData}
                                    priorityData={priorityData}
                                    taskCategory={taskCategory}
                                    onListFilterChange={handleListFilterChange}
                                    onClear={handleClearListFilters}
                                />
                            </>
                        )}
                        <IconButton size="small" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </IconButton>
                    </Box>
                </Box>
                {isSidebarOpen && showSearch && (
                    <TextField
                        placeholder="Search tasks..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search size={16} style={{ marginRight: 8, color: '#999' }} />,
                            sx: { borderRadius: '8px' }
                        }}
                    />
                )}
            </Box>
            <Box className="task-list">
                {isSidebarOpen ? (
                    filteredTasks.map((task) => (
                        <Box
                            key={task.taskid}
                            className={`task-item ${selectedTask?.taskid === task.taskid ? 'active' : ''}`}
                            onClick={() => handleTaskClick(task)}
                        >
                            <Box className="task-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography className="task-no">#{task.taskno}</Typography>
                                <AssigneeAvatarGroup
                                    assignees={task?.assignee}
                                    task={task}
                                    size={22}
                                    maxVisible={2}
                                    showAddButton={false}
                                />
                            </Box>
                            <Typography className="task-name">{task.taskname}</Typography>

                            <Box className="task-footer" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                <Box className="badges-group" sx={{ display: 'flex', gap: 0.5 }}>
                                    <StatusBadge
                                        task={task}
                                        statusColors={statusColors}
                                        fontSize="10px"
                                        padding="2px 6px"
                                    />
                                    <PriorityBadge
                                        task={task}
                                        priorityColors={priorityColors}
                                        fontSize="10px"
                                        padding="2px 6px"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, gap: 2 }}>
                        {filteredTasks.map(task => (
                            <Tooltip key={task.taskid} title={task.taskname} placement="right">
                                <Box
                                    sx={{ cursor: 'pointer', color: selectedTask?.taskid === task.taskid ? '#7367f0' : '#666' }}
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <List size={20} />
                                </Box>
                            </Tooltip>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default BugTrackingTasks;
