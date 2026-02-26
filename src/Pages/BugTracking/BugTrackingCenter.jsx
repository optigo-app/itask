import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { List, LayoutGrid, Bug, X, Filter, Pencil, Trash2, Search, Upload } from 'lucide-react';
import BugGallery from './BugGallery';
import AssigneeAvatarGroup from '../../Components/ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import BugTrackingBugFiltersPopover from './BugTrackingBugFiltersPopover';
import dayjs from 'dayjs';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';

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
    setBugFilters
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
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Bug size={16} />}
                                    onClick={() => { setViewMode('gallery'); setIsCreatingNew(true); }}
                                    className='buttonClassname'
                                >
                                    New
                                </Button>
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
                                    />
                                </Box>
                            ) : (
                                searchedBugList.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <Box
                                            sx={{
                                                border: '2px dashed #e0e0e0',
                                                borderRadius: 2,
                                                p: 4,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                bgcolor: '#fafafa',
                                                '&:hover': { borderColor: '#7367f0', bgcolor: '#f5f5f9' },
                                                position: 'relative',
                                                minHeight: '200px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onDragOver={handleGalleryDragOver}
                                            onDrop={handleGalleryDrop}
                                            onClick={() => document.getElementById('list-upload').click()}
                                        >
                                            <input type="file" id="list-upload" hidden accept="image/*" onChange={e => { handleNewBugClick(e.target.files[0]); e.target.value = null; }} />
                                            <Upload size={48} color="#999" />
                                            <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Drop Image or Click to Upload New Bug</Typography>
                                            <Typography variant="body2" color="textSecondary">Drag and drop an image here or click to browse files</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 2 }}>
                                        <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }} className="bug-table-container">
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {searchedBugList.map((bug) => {
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
                                                                    '&:hover': { bgcolor: '#f5f5f5' }
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        {bug.imageDataUrl && (
                                                                            <img
                                                                                src={bug.imageDataUrl}
                                                                                alt="Bug thumbnail"
                                                                                style={{
                                                                                    width: 40,
                                                                                    height: 40,
                                                                                    borderRadius: 4,
                                                                                    objectFit: 'cover',
                                                                                    border: '1px solid #ddd'
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
                                                                                {bug.bugtitle || '(No Title)'}
                                                                            </Typography>
                                                                            {!!bug.description && (
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{
                                                                                        color: 'text.secondary',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        display: '-webkit-box',
                                                                                        WebkitLineClamp: 1,
                                                                                        WebkitBoxOrient: 'vertical'
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
                                                                        <Chip
                                                                            label={status.labelname}
                                                                            sx={{
                                                                                bgcolor: status.color || '#eee',
                                                                                color: '#fff',
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 600,
                                                                                height: '24px'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {priority && (
                                                                        <Chip
                                                                            label={priority.labelname}
                                                                            sx={{
                                                                                border: `1px solid ${priority.color || '#ccc'}`,
                                                                                color: priority.color || '#666',
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 600,
                                                                                height: '24px',
                                                                                bgcolor: 'transparent'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <AssigneeAvatarGroup
                                                                        assignees={solvedByUsers}
                                                                        size={24}
                                                                        maxVisible={3}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {bug.createddate ? dayjs(bug.createddate).format('DD/MM/YYYY') : ''}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => { e.stopPropagation(); handleSelectBug(bug); }}
                                                                            sx={{
                                                                                color: 'text.secondary',
                                                                                '&:hover': { color: 'primary.main' }
                                                                            }}
                                                                        >
                                                                            <Pencil size={16} />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => { e.stopPropagation(); setSelectedDeleteBug(bug); setConfirmDeleteOpen(true); }}
                                                                            sx={{
                                                                                color: 'text.secondary',
                                                                                '&:hover': { color: 'error.main' }
                                                                            }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </IconButton>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
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