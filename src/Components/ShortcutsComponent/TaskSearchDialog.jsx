import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Dialog, TextField, InputAdornment, Typography, IconButton, CircularProgress, Divider } from '@mui/material';
import { Search, X, CornerDownLeft, CalendarDays, FolderOpen } from 'lucide-react';
import { useRecoilState } from 'recoil';
import useSafeRedirect from '../../Utils/useSafeRedirect';
import { taskSearchOpen } from '../../Recoil/atom';
import { TaskSearchApi } from '../../Api/TaskApi/TaskSearchApi';
import { cleanDate, formatDate2, openTaskModuleTab, priorityColors, statusColors } from '../../Utils/globalfun';

// MM-1081 / MM1081 / TT-55 / 1081 → taskno lookup (index seek); else taskname
const parseToken = (q) => {
    const t = (q || '').trim();
    // Send raw input — taskno may be stored as TT5040 or TT-5040; the SP matches both
    if (/^(mm|tt)-?\d+/i.test(t) || /^\d+$/.test(t)) {
        return { taskno: t, search: '' };
    }
    return { taskno: '', search: t };
};

const Badge = ({ label, map }) => {
    const c = map?.[(label || '').toLowerCase()] || {};
    return (
        <Box component="span" sx={{
            px: 0.9, py: '1px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
            color: c.color ?? '#7d7f85', backgroundColor: c.backgroundColor ?? '#7d7f8526',
            textTransform: 'capitalize', whiteSpace: 'nowrap',
        }}>
            {label || '-'}
        </Box>
    );
};

// id -> label via frontend masters (same source as StatusBadge/PriorityBadge)
const masters = {
    status: JSON.parse(sessionStorage.getItem('taskstatusData') || '[]'),
    secStatus: JSON.parse(sessionStorage.getItem('tasksecstatusData') || '[]'),
    priority: JSON.parse(sessionStorage.getItem('taskpriorityData') || '[]'),
    project: JSON.parse(sessionStorage.getItem('taskprojectData') || '[]'),
};
const labelFor = (list, id, fallback) => list?.find?.((m) => m?.id === id)?.labelname || fallback || '';

const TaskSearchDialog = () => {
    const [open, setOpen] = useRecoilState(taskSearchOpen);
    const navigate = useSafeRedirect();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const debounceRef = useRef(null);
    const requestRef = useRef(0);

    // Ctrl+K / Cmd+K opens the palette from anywhere
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setOpen]);

    const close = useCallback(() => {
        setOpen(false);
        setQuery('');
        setResults([]);
        setSearched(false);
        setActiveIdx(-1);
    }, [setOpen]);

    const runSearch = useCallback(async (q) => {
        const reqId = ++requestRef.current;
        setLoading(true);
        try {
            const { taskno, search } = parseToken(q);
            const data = await TaskSearchApi({ taskno, search });
            if (reqId === requestRef.current) {
                setResults(Array.isArray(data?.rd) ? data.rd : (Array.isArray(data) ? data : []));
                setSearched(true);
            }
        } finally {
            if (reqId === requestRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        const q = query.trim();
        if (!open || q.length < 2) {
            setResults([]);
            setSearched(false);
            setLoading(false);
            return;
        }
        setLoading(true); // pending state while typing — immediate feedback
        debounceRef.current = setTimeout(() => runSearch(q), 350);
        return () => clearTimeout(debounceRef.current);
    }, [query, open, runSearch]);

    const openTask = useCallback((row) => {
        if (!row?.taskid) return;
        close();
        // Same module-tab redirect as Home/today grid — opens the ROOT module
        // as a tab, seeds this subtask's name into the tab search.
        openTaskModuleTab(navigate, {
            taskid: row.taskid,
            taskname: row.taskname,
            rootTaskid: row.RootTaskId || row.taskid,
            rootTaskname: row.rootModuleName || row.taskname,
            projectid: row.rootProjectid || row.projectid,
            project: labelFor(masters.project, row?.rootProjectid || row?.projectid, ''),
            maingroupids: row.maingroupids,
            maintaskid: row.maintaskid,
            istaskno: row.istaskno,
        });
    }, [close, navigate]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            openTask(results[activeIdx >= 0 ? activeIdx : 0]);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-container': { alignItems: 'flex-start', pt: '14vh' } }}
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(15,15,35,0.18)',
                }
            }}
        >
            {/* Search input row */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                <TextField
                    fullWidth
                    autoFocus
                    variant="standard"
                    placeholder="Search tasks — MM-1081, TT-55 or name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color="#7d7f85" />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {loading && <CircularProgress size={15} />}
                                {query && !loading && (
                                    <IconButton size="small" onClick={() => setQuery('')}>
                                        <X size={15} />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        ),
                        sx: { fontSize: '15px', py: 1.25 },
                    }}
                />
            </Box>
            <Divider />

            {/* Results */}
            {results.length > 0 && (
                <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: '#9a9ab0', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: '10.5px' }}>
                    {results.length} result{results.length === 1 ? '' : 's'}
                </Typography>
            )}
            <Box sx={{ maxHeight: '55vh', overflowY: 'auto', px: 1.5, py: 0.5 }}>
                {query.trim().length < 2 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, fontSize: '13px' }}>
                        Type a task number (MM1081, TT55) or at least 2 letters of a task name
                    </Typography>
                )}
                {searched && !loading && results.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, fontSize: '13px' }}>
                        No tasks found for "{query.trim()}"
                    </Typography>
                )}
                {results.map((row, idx) => (
                    <Box
                        key={row?.taskid}
                        onClick={() => openTask(row)}
                        sx={{
                            px: 1.75, py: 1.4, mb: 1, borderRadius: '10px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
                            backgroundColor: '#f8f8fb',
                            border: '1px solid #ecedf2',
                            transition: 'background-color .15s ease, border-color .15s ease, box-shadow .15s ease',
                            ...(idx === activeIdx && {
                                backgroundColor: '#fff',
                                borderColor: '#d9d3ff',
                                boxShadow: '0 3px 10px rgba(115,103,240,0.10)',
                            }),
                            '&:hover': {
                                backgroundColor: '#fff',
                                borderColor: '#d9d3ff',
                                boxShadow: '0 3px 10px rgba(115,103,240,0.10)',
                            },
                            '&:last-of-type': { mb: 0.25 },
                        }}
                    >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {(row?.taskno || row?.maintenanceno) && (
                                    <Box component="span" sx={{
                                        px: 0.75, py: '1px', borderRadius: '5px',
                                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
                                        color: '#7367f0', backgroundColor: 'rgba(115,103,240,0.10)',
                                        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
                                        flexShrink: 0,
                                    }}>
                                        {row.taskno || row.maintenanceno}
                                    </Box>
                                )}
                                <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 600, color: '#2b2c40', fontSize: '13px' }}>
                                    {row?.taskname}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.4, flexWrap: 'wrap' }}>
                                {labelFor(masters.project, row?.projectid, '') ? (
                                    <Typography variant="caption" sx={{ color: '#9a9ab0', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                                        <FolderOpen size={11} /> {labelFor(masters.project, row?.projectid, '')}
                                    </Typography>
                                ) : null}
                                <Typography variant="caption" sx={{ color: '#9a9ab0', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                                    <CalendarDays size={11} /> Due {formatDate2(cleanDate(row?.DeadLineDate)) || '—'}
                                </Typography>
                                {(row?.priorityid || row?.priority) && <Badge label={labelFor(masters.priority, row?.priorityid, row?.priority)} map={priorityColors} />}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
                            <Badge label={labelFor(masters.status, row?.statusid, row?.status)} map={statusColors} />
                            {(row?.secstatusid || row?.secStatus) && (
                                <Badge label={labelFor(masters.secStatus, row?.secstatusid, row?.secStatus)} map={statusColors} />
                            )}
                            {idx === activeIdx && <CornerDownLeft size={13} color="#9a9ab0" />}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Footer hints */}
            <Divider />
            <Box sx={{ px: 2, py: 0.75, display: 'flex', gap: 2.5, backgroundColor: '#fafafb', alignItems: 'center' }}>
                {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close'], ['ctrl K', 'palette']].map(([k, h]) => (
                    <Box key={k} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                        <Box component="kbd" sx={{
                            px: 0.6, py: '1px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                            color: '#6d6b77', backgroundColor: '#fff',
                            border: '1px solid #e3e3e8', boxShadow: '0 1px 0 #e3e3e8',
                            fontFamily: 'inherit',
                        }}>{k}</Box>
                        <Typography variant="caption" sx={{ color: '#9a9ab0', fontSize: '11px' }}>{h}</Typography>
                    </Box>
                ))}
            </Box>
        </Dialog>
    );
};

export default TaskSearchDialog;
