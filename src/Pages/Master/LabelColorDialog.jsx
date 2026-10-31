import React, { useEffect, useMemo, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Tooltip } from '@mui/material';
import { Check as CheckIcon, Plus } from 'lucide-react';
import { getColorOptions, colorMaster } from '../../Utils/globalfun';

// Two-pane label color editor: left lists every label with a live badge preview,
// right holds the swatch grid. All picks stay local (pending) until Apply — one
// submit saves every changed label, so bulk recoloring needs a single confirm.
const LabelColorDialog = ({ open, onClose, items = [], masterTitle = '', initialId, onApply }) => {
    const colorOptions = useMemo(() => getColorOptions(), []);
    const [activeId, setActiveId] = useState(null);
    const [pending, setPending] = useState({}); // {rowId: colorKey}

    useEffect(() => {
        if (open) {
            setActiveId(initialId ?? items?.[0]?.id ?? null);
            setPending({});
        }
    }, [open, items, initialId]);

    const active = items.find((i) => i.id === activeId) || items[0] || null;
    const activeKey = pending[active?.id] ?? active?.colorkey ?? '';
    const changed = Object.keys(pending).length;

    const badgeOf = (key, labelname) => {
        const c = colorMaster[key] || (key?.startsWith?.('#')
            ? (key.includes(';')
                ? { light: key.split(';')[1] || key.split(';')[0] + '22', dark: key.split(';')[0] }
                : { light: key + '22', dark: key })
            : null);
        return (
            <Box sx={{
                px: 1.25, py: 0.4, borderRadius: '6px',
                backgroundColor: c?.light || '#f5f5f5',
                color: c?.dark || '#7d7f85',
                border: `1px solid ${(c?.dark || '#d0d0d0')}44`,
                fontWeight: 600, fontSize: '0.78rem', textTransform: 'capitalize',
                maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {labelname}
            </Box>
        );
    };

    const pick = (key) => {
        if (!active) return;
        setPending((prev) => ({ ...prev, [active.id]: key }));
    };

    const clearActive = () => active && setPending((prev) => ({ ...prev, [active.id]: '' }));

    const handleApply = () => {
        const changes = Object.entries(pending).map(([id, colorkey]) => ({
            row: items.find((i) => String(i.id) === String(id)),
            colorKey: colorkey,
        })).filter((c) => c.row);
        onApply?.(changes);
        onClose?.();
    };

    return (
        <Dialog
            open={Boolean(open)}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '14px',
                    height: 'min(560px, 85vh)', // fixed height — never cut off, lists scroll internally
                    maxHeight: '85vh',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle sx={{ py: 1.5, px: 2.5, borderBottom: '1px solid #ececf1', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography component="span" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    Label Colors
                </Typography>
                {masterTitle && (
                    <Typography component="span" variant="caption" sx={{ color: '#8a8a96' }}>
                        {masterTitle}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', minHeight: 0, flex: 1 }}>
                {/* left — every label with its live badge; pending picks show an accent dot */}
                <Box sx={{
                    flex: '0 0 34%', borderRight: '1px solid #ececf1',
                    overflowY: 'auto', py: 1, px: 0.75,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}>
                    {items.map((row) => {
                        const key = pending[row.id] ?? row.colorkey ?? '';
                        const isActive = row.id === active?.id;
                        const isPending = row.id in pending && pending[row.id] !== (row.colorkey ?? '');
                        return (
                            <Box
                                key={row.id}
                                onClick={() => setActiveId(row.id)}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    px: 1.5, py: 1, cursor: 'pointer',
                                    borderRadius: '8px',
                                    background: isActive ? '#f3f2ff' : 'transparent',
                                    outline: `1px solid ${isActive ? '#d9d4ff' : 'transparent'}`,
                                    '&:hover': { background: isActive ? '#f3f2ff' : '#f7f7f9' },
                                }}
                            >
                                {badgeOf(key, row.labelname)}
                                {isPending && (
                                    <Box sx={{
                                        ml: 'auto', px: 0.75, py: '1px', borderRadius: '4px',
                                        background: '#eceafe', color: '#7367f0',
                                        fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
                                    }}>
                                        NEW
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                {/* right — big preview + swatch grid for the active label */}
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Box sx={{
                        m: 2, p: 1.5, borderRadius: '10px', background: '#f8f9fb',
                        border: '1px solid #ececf1', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 0.75, minHeight: 76, justifyContent: 'center',
                    }}>
                        {active ? (
                            <>
                                {badgeOf(activeKey, active.labelname)}
                                <Typography variant="caption" sx={{ color: '#8a8a96', fontSize: '0.72rem' }}>
                                    {colorOptions.find((c) => c.key === activeKey)?.name
                                        || (activeKey?.startsWith?.('#') ? `Custom ${activeKey}` : 'No color picked')}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="caption" sx={{ color: '#9a9aa6' }}>Select a label</Typography>
                        )}
                    </Box>

                    <Box sx={{
                        px: 2, pb: 2, pt:'5px', overflowY: 'auto', flex: 1,
                        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '10px', alignContent: 'start',
                    }}>
                        {colorOptions.map((color) => {
                            const isSel = activeKey === color.key;
                            return (
                                <Tooltip key={color.key} title={color.name} arrow placement="top">
                                    <Box
                                        role="button"
                                        aria-label={color.name}
                                        onClick={() => pick(color.key)}
                                        sx={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            backgroundColor: color.light,
                                            border: `2px solid ${color.dark}`,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'box-shadow 0.15s ease',
                                            boxShadow: isSel ? `0 0 0 2px #fff, 0 0 0 4px ${color.dark}` : 'none',
                                            '&:hover': { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color.dark}66` },
                                        }}
                                    >
                                        {isSel && <CheckIcon sx={{ fontSize: 15, color: color.dark }} />}
                                    </Box>
                                </Tooltip>
                            );
                        })}
                        {/* custom color — native picker, stored as a #hex colorkey */}
                        <Tooltip title="Custom color" arrow placement="top">
                            <Box
                                component="label"
                                role="button"
                                aria-label="Custom color"
                                sx={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    border: '2px dashed #b8b8c4', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'box-shadow 0.15s ease',
                                    '&:hover': { boxShadow: '0 0 0 2px #fff, 0 0 0 4px #b8b8c466' },
                                }}
                            >
                                <Plus size={15} color="#7d7f85" />
                                <input
                                    type="color"
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    onChange={(e) => pick(e.target.value)}
                                />
                            </Box>
                        </Tooltip>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #ececf1', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button variant="text" size="small" onClick={clearActive} disabled={!active}
                    sx={{ textTransform: 'none', color: '#6D6B77' }}>
                    Clear
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button variant="text" size="small" onClick={onClose}
                    sx={{ textTransform: 'none', color: '#6D6B77' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained" size="small" onClick={handleApply}
                    disabled={changed === 0}
                    sx={{
                        textTransform: 'none', borderRadius: '8px',
                        background: '#7367f0 !important', px: 2.5,
                        '&:hover': { background: '#5e50ee !important' },
                    }}
                >
                    Apply {changed > 0 ? `(${changed})` : ''}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LabelColorDialog;
