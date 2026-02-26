import React, { useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    Chip,
    Paper,

    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { formatDate2, getArchiveChipStyles, getArchiveInfoFromEndDate } from "../../../Utils/globalfun";
import { RestoreArchiveTaskApi } from "../../../Api/TaskApi/RestoreArchivedTaskApi";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import AssigneeAvatarGroup from "../../ShortcutsComponent/Assignee/AssigneeAvatarGroup";
import { useSetRecoilState } from "recoil";
import { fetchlistApiCall } from "../../../Recoil/atom";

const collectDescendantIds = (task) => {
    const ids = [];
    const visit = (t) => {
        const id = t?.taskid;
        if (id != null && id !== '' && !ids.includes(id)) {
            ids.push(id);
        }
        const children = Array.isArray(t?.subtasks) ? t.subtasks : [];
        children.forEach(visit);
    };
    visit(task);
    return ids;
};

const findPathToTask = (tasks = [], targetId) => {
    if (!Array.isArray(tasks) || targetId == null) return null;
    for (const t of tasks) {
        if (t?.taskid === targetId) return [t];
        const childPath = findPathToTask(t?.subtasks || [], targetId);
        if (childPath) return [t, ...childPath];
    }
    return null;
};

const buildRestoreIds = (task, rootTasks) => {
    const descendantIds = collectDescendantIds(task);
    const path = findPathToTask(rootTasks, task?.taskid);
    const ancestorIds = Array.isArray(path)
        ? path.map((n) => n?.taskid).filter((id) => id != null && id !== '')
        : [];
    const merged = [...ancestorIds, task?.taskid, ...descendantIds];
    return Array.from(new Set(merged));
};

const ArchiveTable = ({ data, isLoading = false }) => {

    const [displayTasks, setDisplayTasks] = useState([]);
    const [restoringIds, setRestoringIds] = useState(() => new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);

    useEffect(() => {
        if (Array.isArray(data) && data.length > 0) {
            setDisplayTasks(data);
        } else {
            setDisplayTasks([]);
        }
    }, [data]);

    const handleUnarchive = async (task) => {
        const taskId = task?.taskid;
        if (!taskId) {
            toast.error('Task id not found');
            return;
        }

        setRestoringIds((prev) => {
            const next = new Set(prev);
            next.add(taskId);
            return next;
        });

        try {
            const restoreids = buildRestoreIds(task, displayTasks).join(',');
            const res = await RestoreArchiveTaskApi({ taskid: taskId, restoreids });
            if (res) {
                setDisplayTasks((prev) => (prev || []).filter((t) => t?.taskid !== taskId));
                toast.success('Task restored');
                setOpenChildTask(Date.now());
            } else {
                toast.error('Restore failed');
            }
        } catch (e) {
            toast.error('Restore failed');
        } finally {
            setRestoringIds((prev) => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        }
    };

    const handleUnarchiveClick = (task) => {
        if (restoringIds.has(task?.taskid)) return;
        setSelectedTask(task);
        setConfirmOpen(true);
    };

    const handleConfirmUnarchive = async () => {
        const task = selectedTask;
        setConfirmOpen(false);
        setSelectedTask(null);
        if (!task) return;
        await handleUnarchive(task);
    };

    const activeColumns = useMemo(() => [
        { key: 'taskname', label: 'Task', width: 280 },
        { key: 'taskPr', label: 'Project', width: 140 },
        { key: 'assignee', label: 'Assignee', width: 160 },
        { key: 'completedAt', label: 'Completed', width: 140 },
        { key: 'archiveAt', label: 'Archive On', width: 140 },
        { key: 'archiveStatus', label: 'Archive Status', width: 140 },
        { key: 'priority', label: 'Priority', width: 120 },
    ], []);

    const rows = useMemo(() => {
        return (displayTasks || []).map((t) => {
            const archiveInfo = getArchiveInfoFromEndDate(t, 7) || {
                label: 'Archived',
                isReady: true,
                daysLeft: 0,
                completedAt: t?.Completion_timestamp || t?.EndDate || t?.StartDate || '',
                archiveAt: t?.DeadLineDate || t?.StartDate || '',
            };

            return { task: t, archiveInfo };
        });
    }, [displayTasks]);

    const getCellValue = (task, archiveInfo, colKey) => {
        if (colKey === 'taskname') return task?.taskname;
        if (colKey === 'taskid') return task?.taskid;
        if (colKey === 'estimate_hrs') return task?.estimate_hrs;
        if (colKey === 'ticketno') return task?.ticketno;
        if (colKey === 'maintaskid') return task?.maintaskid;
        if (colKey === 'maintenanceno') return task?.maintenanceno;
        if (colKey === 'priorityid') return task?.priority || task?.priorityid;
        if (colKey === 'workcategoryid') return task?.category || task?.workcategoryid;
        if (colKey === 'departmentid') return task?.taskDpt || task?.departmentid;

        if (colKey === 'StartDate') return task?.StartDate ? formatDate2(task?.StartDate) : '-';
        if (colKey === 'DeadLineDate') return task?.DeadLineDate ? formatDate2(task?.DeadLineDate) : '-';

        if (colKey === 'completedAt') return archiveInfo?.completedAt ? formatDate2(archiveInfo.completedAt) : '-';
        if (colKey === 'archiveAt') return archiveInfo?.archiveAt ? formatDate2(archiveInfo.archiveAt) : '-';

        if (colKey === 'archiveStatus') return archiveInfo?.label;
        if (colKey === 'assignee') return task?.assignee ?? [];

        return task?.[colKey];
    };

    return (
        <Box sx={{ width: "100%" }}>
            <TableContainer
                component={Paper}
                sx={{
                    boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
                className="TaskTVMain"
            >
                <Table size="small" stickyHeader aria-label="Archive table" sx={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHead className="sticky-table-head">
                        <TableRow>
                            {activeColumns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    sx={{
                                        fontWeight: 600,
                                        width: col.width,
                                        paddingLeft: "10px !important",
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 600, width: 120, paddingLeft: "10px" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={activeColumns.length + 1} sx={{ py: 4 }}>
                                    <Typography sx={{ textAlign: "center" }}>
                                        {isLoading ? "Loading..." : "No archive items"}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {rows?.map(({ task, archiveInfo }) => {
                            const chipSx = getArchiveChipStyles(archiveInfo);

                            return (
                                <TableRow key={`archive-${task?.taskid}`} hover>
                                    {activeColumns.map((col) => {
                                        const val = getCellValue(task, archiveInfo, col.key);

                                        if (col.key === 'archiveStatus') {
                                            return (
                                                <TableCell key={`${task?.taskid}-${col.key}`}>
                                                    <Chip
                                                        label={val || '-'}
                                                        size="small"
                                                        sx={{
                                                            ...(chipSx || {}),
                                                            height: "22px",
                                                            fontSize: "11px",
                                                            fontWeight: 800,
                                                            "& .MuiChip-label": { padding: "0 8px" },
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        }

                                        if (col.key === 'taskname') {
                                            return (
                                                <TableCell key={`${task?.taskid}-${col.key}`} sx={{ pl: '10px !important' }}>
                                                    {val || "-"}
                                                </TableCell>
                                            );
                                        }

                                        if (col.key === 'assignee') {
                                            const assignees = Array.isArray(val) ? val : (task?.assignee ?? []);
                                            return (
                                                <TableCell key={`${task?.taskid}-${col.key}`}>
                                                    <AssigneeAvatarGroup
                                                        assignees={assignees}
                                                        task={task}
                                                        maxVisible={3}
                                                        showAddButton={false}
                                                        size={30}
                                                        spacing={0.5}
                                                    />
                                                </TableCell>
                                            );
                                        }

                                        return (
                                            <TableCell key={`${task?.taskid}-${col.key}`}>
                                                {val ?? '-'}
                                            </TableCell>
                                        );
                                    })}

                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleUnarchiveClick(task)}
                                            disabled={restoringIds.has(task?.taskid)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                borderRadius: '8px',
                                            }}
                                        >
                                            {restoringIds.has(task?.taskid) ? 'Restoring...' : 'Unarchive'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <ConfirmationDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setSelectedTask(null);
                }}
                onConfirm={handleConfirmUnarchive}
                title="Restore task"
                content="Are you sure you want to unarchive this task?"
                confirmLabel="Unarchive"
                cancelLabel="Cancel"
            />
        </Box>
    );
};

export default ArchiveTable;