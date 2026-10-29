import React from 'react';
import { Card, Typography, Box, IconButton } from '@mui/material';
import { cleanDate, formatDate2, priorityColors, statusColors } from '../../../Utils/globalfun';
import AddIcon from '@mui/icons-material/Add';
import { CalendarDays, Flag, Clock3 } from 'lucide-react';
import StatusBadge from '../../ShortcutsComponent/StatusBadge';
import PriorityBadge from '../../ShortcutsComponent/PriorityBadge';

const noop = () => {};

const dateVal = (d) => (d && cleanDate(d) ? formatDate2(cleanDate(d)) : '—');

const DateMeta = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
        <Icon size={13} strokeWidth={2} color="#9a9ab0" />
        <Typography
            variant="caption"
            sx={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                color: '#9a9ab0',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </Typography>
        <Typography
            variant="caption"
            sx={{ fontSize: '12px', fontWeight: 500, color: '#5d5e6f', whiteSpace: 'nowrap' }}
        >
            {value}
        </Typography>
    </Box>
);

const SubtaskCard = ({ subtasks, onAddDubTask, searchTerm = '' }) => {
    const term = searchTerm.trim().toLowerCase();
    const visible = term
        ? subtasks?.filter((s) =>
            [s?.taskname, s?.status, s?.secStatus, s?.priority, s?.taskno,
             dateVal(s?.StartDate), dateVal(s?.DeadLineDate), dateVal(s?.entrydate),
             ...(s?.assignee?.map((a) => `${a?.firstname ?? ''} ${a?.lastname ?? ''}`) ?? [])]
                .some((v) => (v ?? '').toLowerCase().includes(term)))
        : subtasks;

    return (
        <>
            {visible?.map((subtask, index) => (
                <Card
                    key={index}
                    className="subtask-card"
                    elevation={0}
                    sx={{
                        mb: 1.5,
                        p: '14px 16px',
                        border: '1px solid #eaeaef',
                        borderRadius: '12px',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(15, 15, 35, 0.04)',
                        transition: 'box-shadow .18s ease, border-color .18s ease',
                        '&:hover': {
                            borderColor: '#d9d3ff',
                            boxShadow: '0 4px 14px rgba(115, 103, 240, 0.10)',
                        },
                    }}
                >
                    {/* Header — title + add-subtask action */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                fontSize: '13.5px',
                                lineHeight: 1.4,
                                color: '#2b2c40',
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            {subtask?.taskname}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => onAddDubTask(subtask, { Task: 'subroot' })}
                            title="Add subtask"
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50% !important',
                                backgroundColor: '#7367f0',
                                color: '#fff',
                                flexShrink: 0,
                                '&:hover': { backgroundColor: '#5e50ee' },
                            }}
                        >
                            <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    {/* Badges — reusable StatusBadge / PriorityBadge (display-only) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={noop} fontSize="11.5px" disable />
                        <PriorityBadge task={subtask} priorityColors={priorityColors} onPriorityChange={noop} fontSize="11.5px" disable />
                    </Box>

                    {/* Meta row — dates */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                            mt: 1.25,
                            pt: 1,
                            borderTop: '1px solid #f4f4f7',
                            flexWrap: 'wrap',
                            rowGap: 0.75,
                        }}
                    >
                        <DateMeta icon={CalendarDays} label="Start" value={dateVal(subtask?.StartDate)} />
                        <DateMeta icon={Flag} label="Due" value={dateVal(subtask?.DeadLineDate)} />
                        <DateMeta icon={Clock3} label="Created" value={dateVal(subtask?.entrydate)} />
                    </Box>
                </Card>
            ))}
            {term && visible?.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 1 }}>
                    No subtasks matching "{term}"
                </Typography>
            )}
        </>
    );
};

export default SubtaskCard;
