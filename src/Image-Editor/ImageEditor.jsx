import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Slider,
    Icon
} from '@mui/material';
import {
    RotateRight,
    Crop,
    ContentCut,
    Flip,
    Brush,
    TextFields,
    RestartAlt,
    Undo,
    Redo,
    Close as CloseIcon,
    Save,
    Category,
    AddPhotoAlternate,
    Add,
    Remove,
} from '@mui/icons-material';

import { useImageEditor } from './useImageEditor';
import { TextProperties, BrushProperties, ShapeProperties } from './EditorComponents';

const ImageEditorModal = ({ open, onClose, initialImage }) => {
    const {
        canvasRef, txtEditorRef, cwRef, isImageReady, tab, setTab, drawMode, setDrawMode, textMode, setTextMode, cropMode, setCropMode,
        adj, setAdj, activeFx, setActiveFx, brushColor, setBrushColor, brushSize, setBrushSize, brushOpacity, setBrushOpacity,
        rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
        crop, setCrop, texts, setTexts, selTxt, setSelTxt, editTxt, setEditTxt, history, histIdx, setHistIdx, setDrawings,
        shapeMode, setShapeMode, shapes, setShapes, selShape, setSelShape,
        cutMode, setCutMode, cut, setCut, cuts, setCuts, selCut, setSelCut, updateHoles,
        canvasW, canvasH, canvasResizing, zoom,
        handleMouseDown, handleMouseMove, handleMouseUp, handleApplyCrop, handleApplyCut, handleAddText, handleAddShape, handleTextDblClick, handleRotate, handleFlipH, handleFlipV, handleFileFunc,
        handleApplyFilter, undo, redo, pushHistory, fitCanvas, getTextBB, getShapeBB, getCutBB, removeImage, handleZoom
    } = useImageEditor(initialImage, open);

    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrag = (e, val) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(val);
    };

    const handleDropLocal = (e) => {
        handleDrag(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFileFunc(file);
    };

    const ToolBtn = ({ active, onClick, icon, label, minWidth = 80 }) => (
        <Button
            onClick={onClick}
            variant="outlined"
            sx={{
                height: 34, borderRadius: '8px', borderColor: active ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                color: active ? '#fff' : '#2f2b3d',
                backgroundColor: active ? '#7367f0' : '#fff',
                '&:hover': { borderColor: '#7367f0', backgroundColor: active ? '#7367f0' : 'rgba(115,103,240,0.08)' },
                textTransform: 'none', fontSize: 12, fontWeight: 600, gap: 1, boxShadow: active ? '0 2px 4px rgba(115,103,240,0.4)' : 'none',
                minWidth: minWidth, px: 1.5
            }}
            startIcon={icon ? React.cloneElement(icon, { sx: { fontSize: '18px !important' } }) : null}
        >
            {label}
        </Button>
    );

    return (
        <Dialog
            open={open} onClose={onClose} maxWidth={false} fullWidth
            sx={{
                '& .MuiDialog-paper': { m: 0, width: '97vw', height: '95vh', maxWidth: '97vw', maxHeight: '95vh', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' },
                '& .MuiBackdrop-root': { backgroundColor: 'rgba(47, 43, 61, 0.4)', backdropFilter: 'blur(4px)' },
            }}
        >
            <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.25, borderBottom: '1px solid rgba(47, 43, 61, 0.12)', flexShrink: 0, backgroundColor: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7367f0', boxShadow: '0 0 10px rgba(115,103,240,0.35)' }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Image Editor</Typography>
                        <Button
                            onClick={() => handleApplyFilter('grayscale')}
                            variant="outlined"
                            sx={{ ml: 1, height: 26, borderRadius: '4px', borderColor: 'rgba(115,103,240,0.3)', backgroundColor: 'transparent', color: '#7367f0', textTransform: 'none', fontSize: 12, px: 1.5, '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)', borderColor: '#7367f0' } }}
                        >
                            Sketch
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(47, 43, 61, 0.05)', borderRadius: '6px', px: 1, py: 0.5, mr: 1 }}>
                            <IconButton size="small" onClick={() => handleZoom('out')} sx={{ p: 0.5 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 45, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
                            <IconButton size="small" onClick={() => handleZoom('in')} sx={{ p: 0.5 }}><Add sx={{ fontSize: 16 }} /></IconButton>
                            <IconButton size="small" onClick={() => handleZoom('reset')} sx={{ p: 0.5, ml: 0.5 }}><RestartAlt sx={{ fontSize: 16 }} /></IconButton>
                        </Box>
                        <Button variant="text" size="small" startIcon={<RotateRight />} onClick={handleRotate} color="secondary" sx={{ textTransform: 'none', color: '#6d6b77', fontWeight: 500 }}>Reset</Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Button
                            onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null); setTexts([]); setDrawings([]); setSelTxt(null); setEditTxt(null); fitCanvas(); }}
                            sx={{ textTransform: 'none', color: '#6d6b77', fontSize: 13, borderRadius: '6px', px: 1.5, '&:hover': { color: '#ea5455', backgroundColor: 'rgba(234,84,85,0.08)' } }}
                            startIcon={<RestartAlt sx={{ fontSize: 18 }} />}
                        >
                            Reset
                        </Button>
                        {isImageReady && (
                            <Button
                                onClick={removeImage}
                                sx={{ textTransform: 'none', color: '#ea5455', fontSize: 13, borderRadius: '6px', px: 1.5, '&:hover': { backgroundColor: 'rgba(234,84,85,0.08)' } }}
                                startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
                            >
                                Remove
                            </Button>
                        )}
                        <IconButton onClick={undo} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Undo"><Undo sx={{ fontSize: 20 }} /></IconButton>
                        <IconButton onClick={redo} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Redo"><Redo sx={{ fontSize: 20 }} /></IconButton>
                        <IconButton component="label" size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Add Image">
                            <AddPhotoAlternate sx={{ fontSize: 22 }} />
                            <input hidden type="file" accept="image/*" onChange={e => handleFileFunc(e.target.files?.[0])} />
                        </IconButton>
                        <IconButton onClick={onClose} size="small" sx={{ color: '#6d6b77', '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)', color: '#2f2b3d' } }} title="Close"><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
                    </Box>
                </Box>

                {/* Body Area */}
                <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                    {/* Canvas Side */}
                    <Box
                        id="carea"
                        onDragOver={e => handleDrag(e, true)}
                        onDragEnter={e => handleDrag(e, true)}
                        onDragLeave={e => handleDrag(e, false)}
                        onDrop={handleDropLocal}
                        sx={{
                            flex: 1, minWidth: 0, position: 'relative', display: 'flex',
                            alignItems: 'flex-start', justifyContent: 'flex-start',
                            backgroundColor: '#ebebeb', // Editor Gray
                            overflow: 'auto', p: 0,
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(47, 43, 61, 0.28) transparent',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                                height: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(47, 43, 61, 0.28)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: 'rgba(47, 43, 61, 0.38)',
                            },
                        }}
                    >
                        {/* No background grid to match MS Paint feel or keeping it subtle */}
                        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(47, 43, 61,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(47, 43, 61,.03) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                        {isDragging && !isImageReady && (
                            <Box sx={{ position: 'absolute', inset: 16, zIndex: 60, borderRadius: '16px', border: '3px dashed #7367f0', backgroundColor: 'rgba(115,103,240,0.08)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite ease-in-out', '@keyframes pulse': { '0%': { opacity: 0.6, transform: 'scale(1)' }, '50%': { opacity: 1, transform: 'scale(0.99)' }, '100%': { opacity: 0.6, transform: 'scale(1)' } } }}>
                                <Typography sx={{ color: '#7367f0', fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>DROP TO IMPORT</Typography>
                            </Box>
                        )}

                        {!isImageReady ? (
                            <Box sx={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, zIndex: 50,
                                width: 480, p: 6, borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 50px rgba(47, 43, 61, 0.08)'
                            }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box sx={{ width: 100, height: 100, borderRadius: '30px', backgroundColor: 'rgba(115,103,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7367f0', transform: 'rotate(-5deg)', transition: 'transform 0.3s ease', '&:hover': { transform: 'rotate(0deg) scale(1.05)' } }}>
                                        <Save sx={{ fontSize: 44 }} />
                                    </Box>
                                    <Box sx={{ position: 'absolute', bottom: -8, right: -8, width: 44, height: 44, borderRadius: '14px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#7367f0' }}>
                                        <Brush sx={{ fontSize: 22 }} />
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#2f2b3d', letterSpacing: '-0.5px' }}>Drop image here</Typography>
                                    <Typography sx={{ fontSize: 14, color: '#6d6b77', mt: 1, fontWeight: 500 }}>Support for PNG · JPG · WEBP · GIF</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <Box sx={{ height: 1, width: 24, backgroundColor: 'rgba(47, 43, 61, 0.1)' }} />
                                        <Typography sx={{ fontSize: 12, color: '#a5a3ae', fontWeight: 600, textTransform: 'uppercase' }}>or</Typography>
                                        <Box sx={{ height: 1, width: 24, backgroundColor: 'rgba(47, 43, 61, 0.1)' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                                    <Button component="label" variant="contained" sx={{ borderRadius: '12px', py: 1.75, textTransform: 'none', fontWeight: 700, fontSize: 15, backgroundColor: '#7367f0', '&:hover': { backgroundColor: '#6459d8', transform: 'translateY(-2px)' }, transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(115,103,240,0.3)' }}>
                                        Browse Files
                                        <input hidden type="file" accept="image/*" onChange={e => handleFileFunc(e.target.files?.[0])} />
                                    </Button>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#6d6b77' }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Pro Tip:</Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 500, backgroundColor: 'rgba(47, 43, 61, 0.05)', px: 1, py: 0.25, borderRadius: '4px' }}>Ctrl + V</Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>to paste from clipboard</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : null}

                        <Box
                            ref={cwRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onDoubleClick={handleTextDblClick}
                            onDragStart={e => e.preventDefault()}
                            sx={{
                                position: 'relative',
                                lineHeight: 0,
                                borderRadius: '4px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                cursor: drawMode ? 'crosshair' : textMode ? 'text' : 'default',
                                border: '1px solid rgba(47, 43, 61, 0.08)',
                                display: isImageReady ? 'block' : 'none',
                                // Workspace stays static at committed size during drag
                                width: canvasW * zoom,
                                height: canvasH * zoom,
                                backgroundColor: '#fff',
                                flexShrink: 0,
                                overflow: 'visible', // Allow dashed guide to grow outside if expanding
                                outline: canvasResizing ? '2px solid rgba(115,103,240,0.3)' : 'none',
                                outlineOffset: '2px',
                                transition: canvasResizing ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out',
                                position: 'relative'
                            }}
                        >
                            {/* Dash Preview during Resize (Matches MS Paint behavior) */}
                            {canvasResizing && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: canvasResizing.curW * zoom,
                                        height: canvasResizing.curH * zoom,
                                        border: '1.5px dashed #7367f0',
                                        zIndex: 90,
                                        pointerEvents: 'none',
                                        backgroundColor: 'rgba(115,103,240,0.02)'
                                    }}
                                />
                            )}
                            <canvas
                                ref={canvasRef}
                                style={{
                                    borderRadius: '4px',
                                    position: 'relative',
                                    zIndex: 1,
                                    backgroundColor: '#fff',
                                    display: 'block',
                                    // FIXED dimensions for canvas element avoids stretching during resize
                                    width: canvasW * zoom,
                                    height: canvasH * zoom
                                }}
                            />
                            <div
                                ref={txtEditorRef}
                                contentEditable
                                spellCheck={false}
                                onInput={e => setTexts(prev => prev.map(t => t.id === editTxt ? { ...t, text: e.target.innerText } : t))}
                                onBlur={() => { setEditTxt(null); pushHistory('Edit Text'); }}
                                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.target.blur(); } }}
                                style={{
                                    position: 'absolute', display: editTxt ? 'inline-block' : 'none', zIndex: 20,
                                    outline: 'none', background: 'transparent',
                                    border: '1px dashed #7367f0', borderRadius: '2px',
                                    whiteSpace: 'pre', padding: '0', margin: '0',
                                    overflow: 'hidden', cursor: 'text', minWidth: '1px', transformOrigin: '0 0'
                                }}
                            />
                            {selTxt && !editTxt && (() => {
                                const t = texts.find(tx => tx.id === selTxt);
                                if (!t) return null;
                                const bb = getTextBB(t);
                                const r = canvasRef.current.getBoundingClientRect();
                                const scale = r.width / canvasRef.current.width;
                                return (
                                    <Box
                                        sx={{
                                            position: 'absolute', zIndex: 10, pointerEvents: 'none',
                                            border: '1px dashed #7367f0', borderRadius: '2px',
                                            left: bb.x * scale, top: bb.y * scale,
                                            width: bb.w * scale, height: bb.h * scale,
                                            transform: `rotate(${t.rotation}deg)`,
                                            transformOrigin: `${(t.x - bb.x) * scale}px ${(t.y - bb.y) * scale}px`
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', width: '1px', height: 26, backgroundColor: '#7367f0', left: '50%', top: -26, transform: 'translateX(-50%)' }} />
                                        <Box
                                            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'rot'); }}
                                            sx={{
                                                position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                cursor: 'crosshair', left: '50%', top: -26, transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                            <Box
                                                key={dir}
                                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                                sx={{
                                                    position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                    border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                    cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                            dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                                dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                    dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                    left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                    top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                );
                            })()}
                            {selShape && (() => {
                                const s = shapes.find(sh => sh.id === selShape);
                                if (!s) return null;
                                const bb = getShapeBB(s);
                                const r = canvasRef.current.getBoundingClientRect();
                                const scale = r.width / canvasRef.current.width;
                                return (
                                    <Box
                                        sx={{
                                            position: 'absolute', zIndex: 10, pointerEvents: 'none',
                                            border: '1px dashed #7367f0', borderRadius: '4px',
                                            left: bb.x * scale, top: bb.y * scale,
                                            width: bb.w * scale, height: bb.h * scale,
                                            transform: `rotate(${s.rotation}deg)`,
                                            transformOrigin: 'center'
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', width: '1px', height: 26, backgroundColor: '#7367f0', left: '50%', top: -26, transform: 'translateX(-50%)' }} />
                                        <Box
                                            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'rot'); }}
                                            sx={{
                                                position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                cursor: 'crosshair', left: '50%', top: -26, transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                            <Box
                                                key={dir}
                                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                                sx={{
                                                    position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                    border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                    cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                            dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                                dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                    dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                    left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                    top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                );
                            })()}
                            {selCut && (() => {
                                const c = cuts.find(cu => cu.id === selCut);
                                if (!c) return null;
                                const bb = getCutBB(c);
                                const r = canvasRef.current.getBoundingClientRect();
                                const scale = r.width / canvasRef.current.width;
                                return (
                                    <Box
                                        sx={{
                                            position: 'absolute', zIndex: 10, pointerEvents: 'none',
                                            border: '1px dashed #7367f0', borderRadius: '4px',
                                            left: bb.x * scale, top: bb.y * scale,
                                            width: bb.w * scale, height: bb.h * scale,
                                            transformOrigin: 'center'
                                        }}
                                    >
                                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                            <Box
                                                key={dir}
                                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                                sx={{
                                                    position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                    border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                    cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                            dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                                dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                    dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                    left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                    top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                );
                            })()}

                            {/* Canvas Resize Handles (Paint Style) attached to preview or main */}
                            {isImageReady && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: (canvasResizing ? canvasResizing.curW : canvasW) * zoom,
                                        height: (canvasResizing ? canvasResizing.curH : canvasH) * zoom,
                                        pointerEvents: 'none',
                                        zIndex: 100
                                    }}
                                >
                                    <Box
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e, 'canvas-e'); }}
                                        sx={{
                                            position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                            border: '1px solid #7367f0', right: -5, top: '50%', transform: 'translateY(-50%)',
                                            cursor: 'ew-resize', pointerEvents: 'auto',
                                            '&::after': { content: '""', position: 'absolute', inset: -10 }
                                        }}
                                    />
                                    <Box
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e, 'canvas-s'); }}
                                        sx={{
                                            position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                            border: '1px solid #7367f0', bottom: -5, left: '50%', transform: 'translateX(-50%)',
                                            cursor: 'ns-resize', pointerEvents: 'auto',
                                            '&::after': { content: '""', position: 'absolute', inset: -10 }
                                        }}
                                    />
                                    <Box
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e, 'canvas-se'); }}
                                        sx={{
                                            position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                            border: '1px solid #7367f0', right: -5, bottom: -5,
                                            cursor: 'nwse-resize', pointerEvents: 'auto',
                                            '&::after': { content: '""', position: 'absolute', inset: -10 }
                                        }}
                                    />
                                </Box>
                            )}

                            {cropMode && (
                                <Box
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        left: crop.w > 0 ? crop.x : crop.x + crop.w, top: crop.h > 0 ? crop.y : crop.y + crop.h,
                                        width: Math.abs(crop.w), height: Math.abs(crop.h),
                                        border: '2px solid #7367f0', backgroundColor: 'rgba(115,103,240,0.1)',
                                        boxShadow: '0 0 0 4000px rgba(0,0,0,0.3)', pointerEvents: 'auto', cursor: 'move'
                                    }}
                                >
                                    <Button onClick={handleApplyCrop} variant="contained" size="small" sx={{ backgroundColor: '#7367f0', pointerEvents: 'auto', fontSize: 10, height: 24, minWidth: 60, zIndex: 35 }}>Apply</Button>
                                    {crop.w !== 0 && crop.h !== 0 && ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(dir => (
                                        <Box
                                            key={dir}
                                            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, dir); }}
                                            sx={{
                                                position: 'absolute', width: 10, height: 10, backgroundColor: '#fff',
                                                border: '2px solid #7367f0', borderRadius: '50%', pointerEvents: 'auto',
                                                cursor: dir.includes('w') && dir.includes('n') ? 'nwse-resize' :
                                                    dir.includes('e') && dir.includes('s') ? 'nwse-resize' :
                                                        dir.includes('e') && dir.includes('n') ? 'nesw-resize' :
                                                            dir.includes('w') && dir.includes('s') ? 'nesw-resize' :
                                                                dir.includes('n') || dir.includes('s') ? 'ns-resize' : 'ew-resize',
                                                left: dir.includes('e') ? '100%' : dir.includes('w') ? '0' : '50%',
                                                top: dir.includes('s') ? '100%' : dir.includes('n') ? '0' : '50%',
                                                transform: 'translate(-50%, -50%)', zIndex: 40
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                            {cutMode && (
                                <Box
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 30,
                                        left: cut.w > 0 ? cut.x : cut.x + cut.w, top: cut.h > 0 ? cut.y : cut.y + cut.h,
                                        width: Math.abs(cut.w), height: Math.abs(cut.h),
                                        border: '2px dashed #7367f0', backgroundColor: 'rgba(115,103,240,0.1)',
                                        pointerEvents: 'auto', cursor: 'move'
                                    }}
                                />
                            )}
                            {cuts.map(c => (
                                <Box
                                    key={c.id}
                                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                                    sx={{
                                        position: 'absolute', zIndex: 25,
                                        left: c.x, top: c.y, width: c.w, height: c.h,
                                        border: selCut === c.id ? '2px solid #7367f0' : 'none',
                                        pointerEvents: 'auto', cursor: 'move'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Panel Side */}
                    <Box sx={{ width: 350, flexShrink: 0, borderLeft: '1px solid rgba(47, 43, 61, 0.12)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <Tabs
                            value={tab} onChange={(_, v) => setTab(v)}
                            sx={{
                                borderBottom: '1px solid rgba(47, 43, 61, 0.12)', minHeight: 46,
                                '& .MuiTab-root': { minHeight: 46, textTransform: 'none', fontSize: 13, color: '#6d6b77', fontWeight: 600 },
                                '& .Mui-selected': { color: '#7367f0 !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#7367f0', height: 2 }
                            }}
                        >
                            <Tab value="ctrl" label="Editor Controls" /><Tab value="hist" label="Session History" />
                        </Tabs>

                        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            {tab === 'ctrl' ? (
                                <>
                                    {selShape ? (
                                        <ShapeProperties selected={shapes.find(s => s.id === selShape)} onUpdate={newS => setShapes(prev => prev.map(s => s.id === selShape ? newS : s))} onDone={() => setSelShape(null)} pushHistory={pushHistory} />
                                    ) : selTxt ? (
                                        <TextProperties selected={texts.find(t => t.id === selTxt)} onUpdate={newTxt => setTexts(prev => prev.map(t => t.id === selTxt ? newTxt : t))} onDone={() => setSelTxt(null)} pushHistory={pushHistory} lightMode={true} />
                                    ) : drawMode ? (
                                        <BrushProperties color={brushColor} size={brushSize} opacity={brushOpacity} onUpdate={(k, v) => { if (k === 'color') setBrushColor(v); else if (k === 'size') setBrushSize(v); else if (k === 'opacity') setBrushOpacity(v); }} onDone={() => setDrawMode(false)} pushHistory={pushHistory} lightMode={true} />
                                    ) : (
                                        <>
                                            <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Canvas Tools</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                                    <ToolBtn label="Rotate" icon={<RotateRight />} onClick={handleRotate} />
                                                    <ToolBtn label="Crop" icon={<Crop />} active={cropMode} onClick={() => { setCropMode(!cropMode); setCutMode(false); setDrawMode(false); setTextMode(false); }} />
                                                    <ToolBtn label="Cut" icon={<ContentCut />} active={cutMode} onClick={() => { setCutMode(!cutMode); setCropMode(false); setDrawMode(false); setTextMode(false); }} />
                                                    <ToolBtn label="Flip H" icon={<Flip />} onClick={handleFlipH} />
                                                    <ToolBtn label="Flip V" icon={<Flip sx={{ transform: 'rotate(90deg)' }} />} onClick={handleFlipV} />
                                                    <ToolBtn label="Draw" icon={<Brush />} active={drawMode} onClick={() => { setDrawMode(!drawMode); setTextMode(false); setCropMode(false); setCutMode(false); }} />
                                                    <ToolBtn label="Text" icon={<TextFields />} active={textMode} onClick={() => { setTextMode(!textMode); setDrawMode(false); setCropMode(false); setCutMode(false); }} />
                                                    <ToolBtn label="Shape" icon={<Category />} active={shapeMode} onClick={() => { setShapeMode(!shapeMode); setDrawMode(false); setTextMode(false); setCropMode(false); setCutMode(false); }} />
                                                    <ToolBtn label="Import" icon={<AddPhotoAlternate />} component="label">
                                                        <input hidden type="file" accept="image/*" onChange={e => handleFileFunc(e.target.files?.[0])} />
                                                    </ToolBtn>
                                                </Box>
                                            </Box>

                                            <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Adjustments</Typography>
                                                {[{ k: 'br', label: 'Brightness' }, { k: 'co', label: 'Contrast' }, { k: 'sa', label: 'Saturation' }, { k: 'sh', label: 'Sharpness' }].map(it => (
                                                    <Box key={it.k} sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d' }}>{it.label}</Typography>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7367f0' }}>{adj[it.k]}</Typography>
                                                        </Box>
                                                        <Slider
                                                            value={adj[it.k]} size="small"
                                                            onChange={(_, v) => setAdj(prev => ({ ...prev, [it.k]: v }))}
                                                            onChangeCommitted={() => pushHistory(`Adj: ${it.label}`)}
                                                            min={-100} max={100}
                                                            sx={{ py: 1, '& .MuiSlider-thumb': { width: 12, height: 12, backgroundColor: '#7367f0' }, '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' }, '& .MuiSlider-rail': { height: 4 } }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>

                                            <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid rgba(47, 43, 61, 0.08)' }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a5a3ae', mb: 2 }}>Quick Filters</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                                    {[{ id: 'grayscale', label: 'Grayscale' }, { id: 'sepia', label: 'Sepia' }, { id: 'invert', label: 'Invert' }, { id: 'warm', label: 'Warm' }, { id: 'cool', label: 'Cool' }, { id: 'vintage', label: 'Vintage' }].map(fx => (
                                                        <ToolBtn key={fx.id} label={fx.label} active={activeFx === fx.id} onClick={() => handleApplyFilter(fx.id)} />
                                                    ))}
                                                </Box>
                                            </Box>

                                            <Box sx={{ px: 2, py: 3, mt: 'auto' }}>
                                                <Button
                                                    onClick={() => { if (!canvasRef.current) return; const link = document.createElement('a'); link.download = 'edited_image.png'; link.href = canvasRef.current.toDataURL('image/png'); link.click(); }}
                                                    fullWidth variant="contained" startIcon={<Save />}
                                                    sx={{ height: 48, borderRadius: '12px', backgroundColor: '#7367f0', boxShadow: '0 8px 16px rgba(115,103,240,0.3)', textTransform: 'none', fontWeight: 700, fontSize: 15, '&:hover': { backgroundColor: '#6459d8', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}
                                                >
                                                    Save Export
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fcfcfd' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                        {history.map((item, idx) => (
                                            <Box
                                                key={idx}
                                                onClick={() => {
                                                    const h = history[idx];
                                                    setDrawings(h.drawings);
                                                    setTexts(h.texts);
                                                    setShapes(h.shapes || []);
                                                    setAdj(h.adj);
                                                    setRotation(h.rotation);
                                                    setFlipH(h.flipH);
                                                    setFlipV(h.flipV);
                                                    setActiveFx(h.activeFx);
                                                    setCuts(h.cuts || []);
                                                    updateHoles(h.holes || []);
                                                    setHistIdx(idx);
                                                }}
                                                sx={{
                                                    p: 1.5, borderRadius: '12px', backgroundColor: '#fff', border: '1px solid',
                                                    borderColor: idx === histIdx ? '#7367f0' : 'rgba(47, 43, 61, 0.08)',
                                                    cursor: 'pointer', transition: 'all .2s ease', display: 'flex', alignItems: 'center', gap: 2,
                                                    boxShadow: idx === histIdx ? '0 4px 12px rgba(115,103,240,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                                                    '&:hover': { borderColor: '#7367f0', transform: 'translateX(4px)' }
                                                }}
                                            >
                                                <Box sx={{ width: 44, height: 44, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f7fa', border: '1px solid rgba(47, 43, 61, 0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.thumb ? <img src={item.thumb} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Save sx={{ fontSize: 18, color: '#a5a3ae' }} />}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: '#a5a3ae' }}>{item.time} {idx === histIdx ? ' · Current' : ''}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ImageEditorModal;
