import React, { useMemo } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Avatar,
    Divider,
} from '@mui/material';
import { Bug, X, History, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { ImageUrl, getDynamicStatusColor, getAvatarColors, getInitials } from '../../Utils/globalfun';
import SafeAvatar from '../ShortcutsComponent/SafeAvatar';

// Activity field -> friendly label
const FIELD_LABELS = {
    statusId: 'Status',
    assigneeId: 'Assignee',
    categoryId: 'Category',
    priorityId: 'Priority',
    attachments: 'Attachments',
    title: 'Title',
    description: 'Description',
    dueDate: 'Due Date',
};

const getFieldLabel = (field) => {
    if (!field) return 'Update';
    if (FIELD_LABELS[field]) return FIELD_LABELS[field];
    // camelCase -> Title Case, strip trailing "Id"
    return String(field)
        .replace(/Id$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());
};

const StatusCard = ({ statusId, count, meta }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 1.25,
                px: 1.5,
                borderRadius: '10px',
                backgroundColor: 'rgba(0,0,0,0.025)',
                border: '1px solid rgba(0,0,0,0.06)',
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: meta.color,
                    flexShrink: 0,
                }}
            />
            <Typography
                sx={{
                    flex: 1,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {meta.label}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#333' }}>
                {count}
            </Typography>
        </Box>
    );
};

const SectionTitle = ({ icon, text }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
        {icon}
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {text}
        </Typography>
    </Box>
);

const BugDashboardDialog = ({ open, onClose, data }) => {
    const totalBugs = data?.rd?.[0]?.totalBugs ?? 0;
    const statusCounts = Array.isArray(data?.rd1) ? data.rd1 : [];
    const activityLog = Array.isArray(data?.rd3) ? data.rd3 : [];
    const assigneeCounts = Array.isArray(data?.rd4) ? data.rd4 : [];
    const taskAssigneeData = useMemo(
        () => JSON?.parse(localStorage.getItem('taskAssigneeData')) || [],
        []
    );
    const bugCategoryData = useMemo(
        () => JSON?.parse(sessionStorage.getItem('bug_categoryData')) || [],
        []
    );
    const bugStatusData = useMemo(
        () => JSON?.parse(localStorage.getItem('taskbugstatusData')) || [],
        []
    );

    // Resolve status label + colors via the bug status master (taskbugstatusData)
    const getStatusMeta = (statusId) => {
        const rec = bugStatusData?.find((s) => s.id == statusId);
        const label = rec?.labelname ?? `Status ${statusId}`;
        const colors = getDynamicStatusColor(label);
        return { label, color: colors?.color ?? '#7367f0' };
    };

    const getUserName = (id) => {
        const user = taskAssigneeData?.find((u) => u.id == id);
        return user ? `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() : `User ${id}`;
    };

    const getUser = (id) => taskAssigneeData?.find((u) => u.id == id);

    const getCategoryName = (id) => {
        const cat = bugCategoryData?.find((c) => c.id == id);
        return cat?.labelname ?? cat?.name ?? `Category ${id}`;
    };

    // Map raw old/new values to readable labels where possible
    const formatActivityValue = (field, value) => {
        if (value === null || value === undefined || value === '') return '-';
        if (field === 'statusId') return getStatusMeta(Number(value)).label;
        if (field === 'assigneeId') return getUserName(value);
        if (field === 'categoryId') return getCategoryName(value);
        return String(value);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 420,
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-8px 0 32px rgba(0,0,0,0.10)',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bug size={20} color="#d32f2f" />
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                        Bug Dashboard
                    </Typography>
                    <Box
                        sx={{
                            ml: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: '10px',
                            backgroundColor: '#d32f2f',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                        }}
                    >
                        {totalBugs}
                    </Box>
                </Box>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ color: '#999', p: 0.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                >
                    <X size={18} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ px: 3, py: 2.5, flex: 1, overflowY: 'auto' }}>
                {/* Status-wise cards */}
                {statusCounts.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', color: '#888', py: 3, fontSize: '0.9rem' }}>
                        No bugs found
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1.5,
                        }}
                    >
                        {statusCounts.map((item) => (
                            <StatusCard key={item?.statusId} statusId={item?.statusId} count={item?.count ?? 0} meta={getStatusMeta(item?.statusId)} />
                        ))}
                    </Box>
                )}

                {/* Assignee-wise counts */}
                {assigneeCounts.length > 0 && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <SectionTitle icon={<Users size={15} color="#7367f0" />} text="Assignees" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {assigneeCounts.map((item) => {
                                const user = getUser(item?.assigneeId);
                                const name = getUserName(item?.assigneeId);
                                return (
                                    <Box
                                        key={item?.assigneeId}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.25,
                                            p: 1,
                                            px: 1.5,
                                            borderRadius: '10px',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            backgroundColor: 'rgba(0,0,0,0.015)',
                                        }}
                                    >
                                        <SafeAvatar
                                            alt={name}
                                            src={ImageUrl(user) || null}
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                fontSize: '0.8rem',
                                                ...getAvatarColors(name),
                                            }}
                                        >
                                            {getInitials(name)}
                                        </SafeAvatar>
                                        <Typography sx={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {name}
                                        </Typography>
                                        <Box
                                            sx={{
                                                px: 1.25,
                                                py: 0.25,
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(115, 103, 240, 0.12)',
                                                color: '#7367f0',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {item?.count ?? 0}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}

                {/* Recent activity */}
                {activityLog.length > 0 && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <SectionTitle icon={<History size={15} color="#7367f0" />} text="Recent Activity" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {activityLog.map((log) => (
                                <Box
                                    key={log?.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1,
                                        px: 1.5,
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {getFieldLabel(log?.field)}:{' '}
                                            <Box component="span" sx={{ color: '#999', fontWeight: 500 }}>
                                                {formatActivityValue(log?.field, log?.oldvalue)}
                                            </Box>
                                            {' → '}
                                            <Box component="span" sx={{ color: '#7367f0', fontWeight: 700 }}>
                                                {formatActivityValue(log?.field, log?.newvalue)}
                                            </Box>
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Bug #{log?.bugid} · {getUserName(log?.userid)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#aaa', flexShrink: 0 }}>
                                        {log?.entrydate ? dayjs(log.entrydate).format('DD MMM, hh:mm A') : ''}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default BugDashboardDialog;
