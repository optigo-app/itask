import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, IconButton, Chip, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { List, LayoutGrid, Bug, X, Filter, Pencil, Trash2, Search } from 'lucide-react';
import BugGallery from './BugGallery';
import BugUploadBox from './BugUploadBox';
import AssigneeAvatarGroup from '../../Components/ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import BugTrackingBugFiltersPopover from './BugTrackingBugFiltersPopover';
import dayjs from 'dayjs';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import PriorityBadge from '../../Components/ShortcutsComponent/PriorityBadge';

const BugTrackingCenter = ({
    selectedTask,
    viewMode,
    setViewMode,
    bugList,
    selectedBugId,
    handleSelectBug,
    handleNewBugClick,
    handleDeleteSelectedBug,
    taskBugStatusData,
    taskBugPriorityData,
    taskAssigneeData,
    handleDeleteBug,
    onUploadClick,
    bugFilters,
    setBugFilters,
    onImageUpdate
}) => {
    const [anchorElBug, setAnchorElBug] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedDeleteBug, setSelectedDeleteBug] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    const handleGalleryDragOver = (e) => {
        e.preventDefault();
    };

    const handleGalleryDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleNewBugClick(file);
            setIsCreatingNew(false);
        }
    };

    const handleBugFilterClick = (event) => setAnchorElBug(event.currentTarget);
    const handleBugFilterClose = () => setAnchorElBug(null);

    const searchedBugList = useMemo(() => {
        const q = String(searchTerm || '').trim().toLowerCase();
        return (bugList || []).filter((bug) => {
            if (!q) return true;

            const status = taskBugStatusData?.find((s) => String(s.id) === String(bug.busstatusid));
            const priority = taskBugPriorityData?.find((p) => String(p.id) === String(bug.bugpriorityid));

            const solvedByRaw = bug?.bugsolvedby ?? bug?.solvedby;
            const solvedByIds = solvedByRaw != null && String(solvedByRaw).trim() !== ''
                ? String(solvedByRaw).split(',').map((x) => x.trim()).filter(Boolean)
                : [];

            const solvedByUsers = taskAssigneeData?.filter((u) =>
                solvedByIds.includes(String(u?.userid ?? u?.id))
            ) || [];

            const fields = [
                bug?.bugtitle,
                status?.labelname,
                priority?.labelname,
                bug?.createddate,
                ...solvedByUsers.map((u) => u?.name)
            ];

            return fields.some((field) => String(field || '').toLowerCase().includes(q));
        });
    }, [bugList, searchTerm, taskBugStatusData, taskBugPriorityData, taskAssigneeData]);

    // Create color mappings for badges
    const statusColors = useMemo(() => {
        const colors = {};
        taskBugStatusData?.forEach(status => {
            const statusKey = (status.labelname || '').toLowerCase().trim();
            if (statusKey) {
                colors[statusKey] = {
                    color: '#fff',
                    backgroundColor: status.color || '#eee'
                };
            }
        });
        return colors;
    }, [taskBugStatusData]);

    const priorityColors = useMemo(() => {
        const colors = {};
        taskBugPriorityData?.forEach(priority => {
            const priorityKey = (priority.labelname || '').toLowerCase().trim();
            if (priorityKey) {
                colors[priorityKey] = {
                    color: priority.color || '#666',
                    backgroundColor: priority.color ? `${priority.color}20` : '#f5f5f5'
                };
            }
        });
        return colors;
    }, [taskBugPriorityData]);

    return (
        <>
            <Box className="column center-column" sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#f8f9fa' }}>
                {!selectedTask ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                        <Bug size={64} style={{ opacity: 0.2 }} />
                        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Select a task to view bugs</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Task Header */}
                        <Box sx={{ padding: "10px 16px", borderBottom: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} className="header-title" noWrap>
                                    {selectedTask.taskname}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`#${selectedTask.taskno}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(0,0,0,0.04)',
                                            fontWeight: 500,
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        • {searchedBugList.length} Bugs
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ flex: 1 }} />
                            <TextField
                                placeholder="Search bugs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                className="textfieldsClass"
                                sx={{
                                    minWidth: 250,
                                    "@media (max-width: 600px)": { minWidth: "100%" },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={20} color="#7d7f85" opacity={0.5} />
                                        </InputAdornment>
                                    ),
                                }}
                                aria-label="Search tasks..."
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ToggleButtonGroup
                                    value={viewMode}
                                    exclusive
                                    onChange={(event, newValue) => { if (newValue) setViewMode(newValue); }}
                                    aria-label="view mode"
                                    size="small"
                                    className="toggle-group"
                                >
                                    <ToggleButton value="list" className="toggle-button" sx={{ borderRadius: "8px" }}>
                                        <List size={20} />
                                    </ToggleButton>
                                    <ToggleButton value="gallery" className="toggle-button" sx={{ borderRadius: "8px" }}>
                                        <LayoutGrid size={20} />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                <Tooltip title="Filters">
                                    <IconButton onClick={handleBugFilterClick}>
                                        <Filter size={20} />
                                    </IconButton>
                                </Tooltip>
                                {searchedBugList.length > 0 && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Bug size={16} />}
                                        onClick={() => { setViewMode('gallery'); setIsCreatingNew(true); }}
                                        className='buttonClassname'
                                    >
                                        New
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Content Area */}
                        <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                            {viewMode === 'gallery' ? (
                                <Box sx={{ height: '100%' }}>
                                    <BugGallery
                                        selectedTask={selectedTask}
                                        bugs={searchedBugList}
                                        selectedBugId={selectedBugId}
                                        onUploadClick={onUploadClick}
                                        onSelectBug={handleSelectBug}
                                        onDeleteSelected={handleDeleteSelectedBug}
                                        isCreatingNew={isCreatingNew}
                                        onNewBugClick={handleNewBugClick}
                                        onCancelNew={() => setIsCreatingNew(false)}
                                        onDragOver={handleGalleryDragOver}
                                        onDrop={handleGalleryDrop}
                                        onImageUpdate={onImageUpdate}
                                    />
                                </Box>
                            ) : (
                                searchedBugList.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <BugUploadBox
                                            onDragOver={handleGalleryDragOver}
                                            onDrop={handleGalleryDrop}
                                            onFileSelect={handleNewBugClick}
                                            inputId="list-upload"
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 2 }}>
                                        <TableContainer
                                            sx={{
                                                maxHeight: 'calc(100vh - 280px)',
                                                overflowY: 'auto',
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: '#f1f1f1',
                                                    borderRadius: '10px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: '#c1c1c1',
                                                    borderRadius: '10px',
                                                    '&:hover': {
                                                        background: '#a8a8a8',
                                                    },
                                                },
                                            }}
                                            className="bug-table-container"
                                        >
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Title</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Status</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Priority</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Assignee</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Created Date</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, minWidth: 100, textAlign: 'center' }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {searchedBugList.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                                    <Bug size={48} style={{ opacity: 0.2, color: '#adb5bd' }} />
                                                                    <Typography variant="body1" sx={{ color: '#adb5bd', fontWeight: 500 }}>
                                                                        No bugs found
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#ced4da' }}>
                                                                        Try adjusting your search or filters
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        searchedBugList.map((bug) => {
                                                            const status = taskBugStatusData?.find(s => String(s.id) === String(bug.busstatusid));
                                                            const priority = taskBugPriorityData?.find(p => String(p.id) === String(bug.bugpriorityid));
                                                            const solvedByRaw = bug?.bugsolvedby ?? bug?.solvedby;
                                                            const solvedByIDs = solvedByRaw != null && String(solvedByRaw).trim() !== ''
                                                                ? String(solvedByRaw).split(',').map((x) => x.trim()).filter(Boolean)
                                                                : [];
                                                            const solvedByUsers = taskAssigneeData?.filter((u) => solvedByIDs.includes(String(u?.userid ?? u?.id))) || [];

                                                            return (
                                                                <TableRow
                                                                    key={bug.bugId}
                                                                    onClick={() => handleSelectBug(bug)}
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        '&:hover': { bgcolor: '#f8f9ff' }
                                                                    }}
                                                                >
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                            {bug.imageDataUrl && (
                                                                                <Box
                                                                                    sx={{
                                                                                        width: 48,
                                                                                        height: 48,
                                                                                        borderRadius: '8px',
                                                                                        overflow: 'hidden',
                                                                                        flexShrink: 0,
                                                                                        border: '2px solid #e9ecef',
                                                                                        position: 'relative',
                                                                                        '&::after': {
                                                                                            content: '""',
                                                                                            position: 'absolute',
                                                                                            inset: 0,
                                                                                            background: 'linear-gradient(135deg, transparent 60%, rgba(115, 103, 240, 0.1))',
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={bug.imageDataUrl}
                                                                                        alt="Bug thumbnail"
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            height: '100%',
                                                                                            objectFit: 'cover',
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            )}
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontWeight: 600,
                                                                                        fontSize: '0.9rem',
                                                                                        color: '#2d3748',
                                                                                        mb: 0.3,
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}
                                                                                >
                                                                                    {bug.bugtitle || '(No Title)'}
                                                                                </Typography>
                                                                                {!!bug.description && (
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        sx={{
                                                                                            color: '#718096',
                                                                                            fontSize: '0.75rem',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            display: '-webkit-box',
                                                                                            WebkitLineClamp: 1,
                                                                                            WebkitBoxOrient: 'vertical',
                                                                                            lineHeight: 1.4
                                                                                        }}
                                                                                    >
                                                                                        {bug.description}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {status && (
                                                                            <StatusBadge
                                                                                task={{ status: status.labelname }}
                                                                                statusColors={statusColors}
                                                                                onStatusChange={() => { }}
                                                                                disable={true}
                                                                                fontSize="11px"
                                                                                padding="0.2rem 0.4rem"
                                                                                minWidth="80px"
                                                                            />
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {priority && (
                                                                            <PriorityBadge
                                                                                task={{ priority: priority.labelname }}
                                                                                priorityColors={priorityColors}
                                                                                onPriorityChange={() => { }}
                                                                                disable={true}
                                                                                fontSize="11px"
                                                                                padding="0.2rem 0.4rem"
                                                                                minWidth="80px"
                                                                            />
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <AssigneeAvatarGroup
                                                                                assignees={solvedByUsers}
                                                                                size={28}
                                                                                maxVisible={3}
                                                                            />
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: '0.8rem',
                                                                                color: '#718096',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            {bug.createddate ? dayjs(bug.createddate).format('DD/MM/YYYY') : '-'}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                            <Tooltip title="Edit Bug" arrow placement="top">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={(e) => { e.stopPropagation(); handleSelectBug(bug); }}
                                                                                    sx={{
                                                                                        color: '#6c757d',
                                                                                        '&:hover': {
                                                                                            color: '#7367f0',
                                                                                            bgcolor: 'rgba(115, 103, 240, 0.1)'
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Pencil size={16} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Delete Bug" arrow placement="top">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={(e) => { e.stopPropagation(); setSelectedDeleteBug(bug); setConfirmDeleteOpen(true); }}
                                                                                    sx={{
                                                                                        color: '#6c757d',
                                                                                        '&:hover': {
                                                                                            color: '#dc3545',
                                                                                            bgcolor: 'rgba(220, 53, 69, 0.1)'
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )
                            )}
                        </Box>
                    </>
                )}
            </Box>

            <BugTrackingBugFiltersPopover
                anchorEl={anchorElBug}
                open={Boolean(anchorElBug)}
                onClose={handleBugFilterClose}
                bugFilters={bugFilters}
                setBugFilters={setBugFilters}
                taskBugStatusData={taskBugStatusData}
                taskBugPriorityData={taskBugPriorityData}
                taskAssigneeData={taskAssigneeData}
            />

            <ConfirmationDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={() => { handleDeleteBug(selectedDeleteBug.bugId); setConfirmDeleteOpen(false); setSelectedDeleteBug(null); }}
                title="Delete Bug Report?"
                content="Are you sure you want to delete this bug report? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </>
    );
};

export default BugTrackingCenter;   