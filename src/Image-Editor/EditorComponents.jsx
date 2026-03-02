import React from 'react';
import {
    Box,
    Button,
    IconButton,
    Typography,
    Slider,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import {
    ArrowBack,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatStrikethrough,
    Abc,
    Brush,
    TextFields,
    Check,
    Rectangle,
    Circle,
    ChangeHistory,
    Star,
    Add,
    Remove,
} from '@mui/icons-material';

export const SectionHead = ({ label }) => (
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6d6b77', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
    </Typography>
);

export const SliderRow = ({ label, value, unit = 'px', min, max, step = 1, k, update, pushHistory }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d', flex: 1 }}>{label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#7367f0', mr: 0.3 }}>{value}</Typography>
            <Typography sx={{ fontSize: 11, color: '#6d6b77' }}>{unit}</Typography>
        </Box>
        <Slider
            value={value}
            onChange={(_, v) => update(k, v)}
            onChangeCommitted={() => pushHistory(label)}
            min={min}
            max={max}
            step={step}
            size="small"
            sx={{
                py: 1,
                '& .MuiSlider-thumb': { width: 14, height: 14, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' },
                '& .MuiSlider-rail': { height: 4, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
            }}
        />
    </Box>
);

export const TextProperties = ({ selected, onUpdate, onDone, pushHistory }) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    
    if (!selected) return null;
    const s = selected.style;
    const update = (k, v) => onUpdate({ ...selected, style: { ...s, [k]: v } });

    // Preset text styles
    const presets = [
        { name: 'Title', size: 48, bold: true, color: '#2f2b3d' },
        { name: 'Heading', size: 32, bold: true, color: '#2f2b3d' },
        { name: 'Subtitle', size: 24, bold: false, color: '#6d6b77' },
        { name: 'Body', size: 16, bold: false, color: '#2f2b3d' },
        { name: 'Caption', size: 12, bold: false, color: '#a5a3ae' },
    ];

    const applyPreset = (preset) => {
        onUpdate({
            ...selected,
            style: {
                ...s,
                size: preset.size,
                bold: preset.bold,
                color: preset.color,
                italic: false,
                underline: false,
                strike: false,
            }
        });
        pushHistory(`Apply ${preset.name} Style`);
    };

    // Color swatches
    const colorSwatches = [
        '#000000', '#2f2b3d', '#6d6b77', '#ffffff',
        '#f05353', '#f0a753', '#f0de53', '#28c76f',
        '#00cfe8', '#7367f0', '#ce9ffc', '#f08cce'
    ];

    // Shadow presets
    const shadowPresets = [
        { name: 'None', blur: 0, x: 0, y: 0, color: '#000000' },
        { name: 'Soft', blur: 10, x: 2, y: 2, color: 'rgba(0,0,0,0.3)' },
        { name: 'Hard', blur: 0, x: 4, y: 4, color: 'rgba(0,0,0,0.5)' },
        { name: 'Glow', blur: 20, x: 0, y: 0, color: '#7367f0' },
    ];

    const applyShadowPreset = (preset) => {
        onUpdate({
            ...selected,
            style: {
                ...s,
                shadowBlur: preset.blur,
                shadowX: preset.x,
                shadowY: preset.y,
                shadowColor: preset.color,
            }
        });
        pushHistory(`Apply ${preset.name} Shadow`);
    };

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fff', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(47, 43, 61, 0.1)', borderRadius: 10 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onDone} size="small" sx={{ color: '#6d6b77', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)' } }}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                    </IconButton>
                    <TextFields sx={{ fontSize: 18, color: '#7367f0' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Text Properties</Typography>
                </Box>
                <Button
                    onClick={onDone}
                    size="small"
                    variant="contained"
                    startIcon={<Check sx={{ fontSize: '14px !important' }} />}
                    sx={{ height: 28, fontSize: 11.5, px: 2, backgroundColor: 'rgba(115,103,240,0.08)', color: '#7367f0', borderRadius: '6px', border: '1px solid rgba(115,103,240,0.2)', boxShadow: 'none', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(115,103,240,0.15)', boxShadow: 'none' } }}
                >
                    Done
                </Button>
            </Box>

            {/* Quick Presets */}
            <SectionHead label="Quick Styles" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {presets.map(preset => (
                    <Button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        size="small"
                        sx={{
                            flex: '1 1 auto',
                            minWidth: 'fit-content',
                            height: 36,
                            borderRadius: '8px',
                            backgroundColor: '#f8f7fa',
                            color: '#2f2b3d',
                            border: '1px solid rgba(47, 43, 61, 0.12)',
                            textTransform: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'rgba(115,103,240,0.08)',
                                borderColor: '#7367f0',
                                color: '#7367f0'
                            }
                        }}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Box>

            {/* Font Size - Prominent */}
            <SectionHead label="Font Size" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <IconButton
                        onClick={() => { update('size', Math.max(8, s.size - 2)); pushHistory('Font Size'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Remove sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Box sx={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        py: 1.5, 
                        backgroundColor: '#f8f7fa', 
                        borderRadius: '8px',
                        border: '1px solid rgba(47, 43, 61, 0.12)'
                    }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#7367f0' }}>
                            {s.size}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#6d6b77', textTransform: 'uppercase', letterSpacing: 1 }}>
                            pixels
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => { update('size', Math.min(200, s.size + 2)); pushHistory('Font Size'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Add sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <Slider
                    value={s.size}
                    onChange={(_, v) => update('size', v)}
                    onChangeCommitted={() => pushHistory('Font Size')}
                    min={8}
                    max={200}
                    size="small"
                    sx={{
                        '& .MuiSlider-thumb': { width: 16, height: 16, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                        '& .MuiSlider-track': { height: 6, backgroundColor: '#7367f0' },
                        '& .MuiSlider-rail': { height: 6, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
                    }}
                />
            </Box>

            {/* Text Style Toggles */}
            <SectionHead label="Text Style" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[
                    { k: 'bold', icon: <FormatBold sx={{ fontSize: 20 }} />, label: 'Bold' },
                    { k: 'italic', icon: <FormatItalic sx={{ fontSize: 20 }} />, label: 'Italic' },
                    { k: 'underline', icon: <FormatUnderlined sx={{ fontSize: 20 }} />, label: 'Underline' },
                    { k: 'strike', icon: <FormatStrikethrough sx={{ fontSize: 20 }} />, label: 'Strike' },
                ].map(it => (
                    <IconButton
                        key={it.k}
                        onClick={() => { update(it.k, !s[it.k]); pushHistory(`Style: ${it.label}`); }}
                        title={it.label}
                        sx={{
                            flex: 1,
                            height: 44,
                            borderRadius: '8px',
                            backgroundColor: s[it.k] ? '#7367f0' : '#f8f7fa',
                            color: s[it.k] ? '#fff' : '#6d6b77',
                            border: '1px solid',
                            borderColor: s[it.k] ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                            boxShadow: s[it.k] ? '0 2px 4px rgba(115,103,240,0.3)' : 'none',
                            '&:hover': { backgroundColor: s[it.k] ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {it.icon}
                    </IconButton>
                ))}
            </Box>

            {/* Alignment */}
            <SectionHead label="Alignment" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[
                    { v: 'left', icon: <FormatAlignLeft sx={{ fontSize: 18 }} />, label: 'Left' },
                    { v: 'center', icon: <FormatAlignCenter sx={{ fontSize: 18 }} />, label: 'Center' },
                    { v: 'right', icon: <FormatAlignRight sx={{ fontSize: 18 }} />, label: 'Right' },
                ].map(it => (
                    <IconButton
                        key={it.v}
                        onClick={() => { update('align', it.v); pushHistory(`Align: ${it.label}`); }}
                        title={it.label}
                        sx={{
                            flex: 1,
                            height: 44,
                            borderRadius: '8px',
                            backgroundColor: s.align === it.v ? '#7367f0' : '#f8f7fa',
                            color: s.align === it.v ? '#fff' : '#6d6b77',
                            border: '1px solid',
                            borderColor: s.align === it.v ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                            boxShadow: s.align === it.v ? '0 2px 4px rgba(115,103,240,0.3)' : 'none',
                            '&:hover': { backgroundColor: s.align === it.v ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {it.icon}
                    </IconButton>
                ))}
            </Box>

            {/* Text Color with Swatches */}
            <SectionHead label="Text Color" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
                    {colorSwatches.map(color => (
                        <Box
                            key={color}
                            onClick={() => { update('color', color); pushHistory('Text Color'); }}
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: s.color === color ? '3px solid #7367f0' : '1px solid rgba(47, 43, 61, 0.12)',
                                boxShadow: s.color === color ? '0 0 10px rgba(115,103,240,0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': { transform: 'scale(1.1)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }
                            }}
                        />
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77' }}>Custom</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.color, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.color} onChange={(e) => update('color', e.target.value)} onBlur={() => pushHistory('Text Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.color.toUpperCase()}</Typography>
                </Box>
            </Box>

            {/* Shadow Presets */}
            <SectionHead label="Shadow" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {shadowPresets.map(preset => (
                    <Button
                        key={preset.name}
                        onClick={() => applyShadowPreset(preset)}
                        size="small"
                        sx={{
                            flex: '1 1 auto',
                            minWidth: 'fit-content',
                            height: 36,
                            borderRadius: '8px',
                            backgroundColor: '#f8f7fa',
                            color: '#2f2b3d',
                            border: '1px solid rgba(47, 43, 61, 0.12)',
                            textTransform: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'rgba(115,103,240,0.08)',
                                borderColor: '#7367f0',
                                color: '#7367f0'
                            }
                        }}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Box>

            {/* Advanced Settings Toggle */}
            <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                fullWidth
                sx={{
                    mb: 2,
                    textTransform: 'none',
                    color: '#6d6b77',
                    fontSize: 13,
                    fontWeight: 600,
                    justifyContent: 'space-between',
                    '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.04)' }
                }}
                endIcon={
                    <Box sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                    </Box>
                }
            >
                Advanced Settings
            </Button>

            {/* Advanced Settings - Collapsible */}
            {showAdvanced && (
                <Box sx={{ 
                    backgroundColor: '#f8f7fa', 
                    borderRadius: '12px', 
                    p: 2, 
                    border: '1px solid rgba(47, 43, 61, 0.08)',
                    animation: 'slideDown 0.2s ease-out',
                    '@keyframes slideDown': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    <SectionHead label="Font Family" />
                    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                        <Select
                            value={s.font}
                            onChange={(e) => { update('font', e.target.value); pushHistory('Font Family'); }}
                            sx={{
                                height: 40,
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                color: '#2f2b3d',
                                fontSize: 13,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(47, 43, 61, 0.12)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7367f0' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #7367f0' }
                            }}
                        >
                            {['DM Sans', 'Roboto', 'Inter', 'Outfit', 'Georgia', 'Arial', 'Courier New', 'Times New Roman'].map(f => (
                                <MenuItem key={f} value={f} sx={{ fontSize: 13 }}>{f}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <SectionHead label="Spacing" />
                    <SliderRow label="Letter Spacing" value={s.letterSpacing} min={-5} max={50} k="letterSpacing" unit="px" update={update} pushHistory={pushHistory} />
                    <SliderRow label="Line Height" value={s.lineH} min={0.8} max={3} step={0.1} k="lineH" unit="x" update={update} pushHistory={pushHistory} />

                    <SectionHead label="Text Transform" />
                    <Box sx={{ mb: 3 }}>
                        <IconButton
                            onClick={() => { update('upper', !s.upper); pushHistory('Uppercase'); }}
                            sx={{
                                width: '100%',
                                height: 40,
                                borderRadius: '8px',
                                backgroundColor: s.upper ? '#7367f0' : '#fff',
                                color: s.upper ? '#fff' : '#6d6b77',
                                border: '1px solid',
                                borderColor: s.upper ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                                '&:hover': { backgroundColor: s.upper ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                            }}
                        >
                            <Abc sx={{ fontSize: 26, mr: 1 }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>UPPERCASE</Typography>
                        </IconButton>
                    </Box>

                    <SectionHead label="Stroke (Outline)" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)', mb: 1.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Color</Typography>
                        <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.strokeColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            <input type="color" value={s.strokeColor} onChange={(e) => update('strokeColor', e.target.value)} onBlur={() => pushHistory('Stroke Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.strokeColor.toUpperCase()}</Typography>
                    </Box>
                    <SliderRow label="Stroke Width" value={s.strokeW} min={0} max={20} k="strokeW" unit="px" update={update} pushHistory={pushHistory} />

                    <SectionHead label="Custom Shadow" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)', mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Color</Typography>
                        <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.shadowColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            <input type="color" value={s.shadowColor} onChange={(e) => update('shadowColor', e.target.value)} onBlur={() => pushHistory('Shadow Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.shadowColor.toUpperCase()}</Typography>
                    </Box>
                    <SliderRow label="Blur" value={s.shadowBlur} min={0} max={50} k="shadowBlur" unit="px" update={update} pushHistory={pushHistory} />
                    <SliderRow label="Offset X" value={s.shadowX} min={-50} max={50} k="shadowX" unit="px" update={update} pushHistory={pushHistory} />
                    <SliderRow label="Offset Y" value={s.shadowY} min={-50} max={50} k="shadowY" unit="px" update={update} pushHistory={pushHistory} />
                </Box>
            )}
        </Box>
    );
};

export const BrushProperties = ({ color, size, opacity, onUpdate, onDone, pushHistory }) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    // Brush presets
    const brushPresets = [
        { name: 'Thin', size: 2, opacity: 1 },
        { name: 'Normal', size: 12, opacity: 1 },
        { name: 'Thick', size: 30, opacity: 1 },
        { name: 'Marker', size: 20, opacity: 0.7 },
        { name: 'Highlighter', size: 40, opacity: 0.3 },
    ];

    const applyBrushPreset = (preset) => {
        onUpdate('size', preset.size);
        onUpdate('opacity', preset.opacity);
        pushHistory(`Apply ${preset.name} Brush`);
    };

    // Color swatches - expanded
    const colorSwatches = [
        '#000000', '#ffffff', '#f05353', '#f0a753',
        '#f0de53', '#28c76f', '#00cfe8', '#7367f0',
        '#ce9ffc', '#f08cce', '#ea5455', '#ff9f43'
    ];

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fff', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(47, 43, 61, 0.1)', borderRadius: 10 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onDone} size="small" sx={{ color: '#6d6b77', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)' } }}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Brush sx={{ fontSize: 18, color: '#7367f0' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Brush Properties</Typography>
                </Box>
                <Button
                    onClick={onDone}
                    size="small"
                    variant="contained"
                    startIcon={<Check sx={{ fontSize: '14px !important' }} />}
                    sx={{ height: 28, fontSize: 11.5, px: 2, backgroundColor: 'rgba(115,103,240,0.08)', color: '#7367f0', borderRadius: '6px', border: '1px solid rgba(115,103,240,0.2)', boxShadow: 'none', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(115,103,240,0.15)', boxShadow: 'none' } }}
                >
                    Done
                </Button>
            </Box>

            {/* Quick Presets */}
            <SectionHead label="Quick Brushes" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {brushPresets.map(preset => (
                    <Button
                        key={preset.name}
                        onClick={() => applyBrushPreset(preset)}
                        size="small"
                        sx={{
                            flex: '1 1 auto',
                            minWidth: 'fit-content',
                            height: 36,
                            borderRadius: '8px',
                            backgroundColor: '#f8f7fa',
                            color: '#2f2b3d',
                            border: '1px solid rgba(47, 43, 61, 0.12)',
                            textTransform: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'rgba(115,103,240,0.08)',
                                borderColor: '#7367f0',
                                color: '#7367f0'
                            }
                        }}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Box>

            {/* Brush Size - Prominent */}
            <SectionHead label="Brush Size" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <IconButton
                        onClick={() => { onUpdate('size', Math.max(1, size - 2)); pushHistory('Brush Size'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Remove sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Box sx={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        py: 1.5, 
                        backgroundColor: '#f8f7fa', 
                        borderRadius: '8px',
                        border: '1px solid rgba(47, 43, 61, 0.12)'
                    }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#7367f0' }}>
                            {size}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#6d6b77', textTransform: 'uppercase', letterSpacing: 1 }}>
                            pixels
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => { onUpdate('size', Math.min(100, size + 2)); pushHistory('Brush Size'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Add sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <Slider
                    value={size}
                    onChange={(_, v) => onUpdate('size', v)}
                    onChangeCommitted={() => pushHistory('Brush Size')}
                    min={1}
                    max={100}
                    size="small"
                    sx={{
                        '& .MuiSlider-thumb': { width: 16, height: 16, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                        '& .MuiSlider-track': { height: 6, backgroundColor: '#7367f0' },
                        '& .MuiSlider-rail': { height: 6, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
                    }}
                />
            </Box>

            {/* Color Swatches */}
            <SectionHead label="Brush Color" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
                    {colorSwatches.map(c => (
                        <Box
                            key={c}
                            onClick={() => { onUpdate('color', c); pushHistory('Brush Color'); }}
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                backgroundColor: c,
                                cursor: 'pointer',
                                border: color === c ? '3px solid #7367f0' : '1px solid rgba(47, 43, 61, 0.12)',
                                boxShadow: color === c ? '0 0 10px rgba(115,103,240,0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': { transform: 'scale(1.1)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }
                            }}
                        />
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77' }}>Custom</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: color, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={color} onChange={(e) => onUpdate('color', e.target.value)} onBlur={() => pushHistory('Brush Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{color.toUpperCase()}</Typography>
                </Box>
            </Box>

            {/* Advanced Settings Toggle */}
            <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                fullWidth
                sx={{
                    mb: 2,
                    textTransform: 'none',
                    color: '#6d6b77',
                    fontSize: 13,
                    fontWeight: 600,
                    justifyContent: 'space-between',
                    '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.04)' }
                }}
                endIcon={
                    <Box sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                    </Box>
                }
            >
                Advanced Settings
            </Button>

            {/* Advanced Settings - Collapsible */}
            {showAdvanced && (
                <Box sx={{ 
                    backgroundColor: '#f8f7fa', 
                    borderRadius: '12px', 
                    p: 2, 
                    border: '1px solid rgba(47, 43, 61, 0.08)',
                    animation: 'slideDown 0.2s ease-out',
                    '@keyframes slideDown': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    <SectionHead label="Opacity" />
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d', flex: 1 }}>Transparency</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#7367f0', mr: 0.3 }}>{Math.round(opacity * 100)}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#6d6b77' }}>%</Typography>
                        </Box>
                        <Slider
                            value={opacity}
                            onChange={(_, v) => onUpdate('opacity', v)}
                            onChangeCommitted={() => pushHistory('Brush Opacity')}
                            min={0.01}
                            max={1}
                            step={0.01}
                            size="small"
                            sx={{
                                py: 1,
                                '& .MuiSlider-thumb': { width: 14, height: 14, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                                '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' },
                                '& .MuiSlider-rail': { height: 4, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export const ShapeProperties = ({ selected, onUpdate, onDone, pushHistory }) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    
    if (!selected) return null;
    const s = selected.style;
    const update = (k, v) => onUpdate({ ...selected, style: { ...s, [k]: v } });

    // Shape presets
    const shapePresets = [
        { name: 'Small Square', type: 'rectangle', fill: '#7367f0', stroke: '#7367f0', strokeW: 0, borderRadius: 0 },
        { name: 'Rounded Box', type: 'rectangle', fill: '#28c76f', stroke: '#28c76f', strokeW: 0, borderRadius: 20 },
        { name: 'Circle', type: 'circle', fill: '#00cfe8', stroke: '#00cfe8', strokeW: 0 },
        { name: 'Outline', type: 'rectangle', fill: 'transparent', stroke: '#2f2b3d', strokeW: 3, borderRadius: 0 },
        { name: 'Star', type: 'star', fill: '#f0a753', stroke: '#f0a753', strokeW: 0 },
    ];

    const applyShapePreset = (preset) => {
        onUpdate({
            ...selected,
            style: {
                ...s,
                type: preset.type,
                fill: preset.fill,
                stroke: preset.stroke,
                strokeW: preset.strokeW,
                ...(preset.borderRadius !== undefined && { borderRadius: preset.borderRadius })
            }
        });
        pushHistory(`Apply ${preset.name} Shape`);
    };

    // Color swatches
    const colorSwatches = [
        '#000000', '#ffffff', '#f05353', '#f0a753',
        '#f0de53', '#28c76f', '#00cfe8', '#7367f0',
        '#ce9ffc', '#f08cce', '#ea5455', '#ff9f43'
    ];

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#fff', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(47, 43, 61, 0.1)', borderRadius: 10 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onDone} size="small" sx={{ color: '#6d6b77', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.08)' } }}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Rectangle sx={{ fontSize: 18, color: '#7367f0' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2f2b3d' }}>Shape Properties</Typography>
                </Box>
                <Button
                    onClick={onDone}
                    size="small"
                    variant="contained"
                    startIcon={<Check sx={{ fontSize: '14px !important' }} />}
                    sx={{ height: 28, fontSize: 11.5, px: 2, backgroundColor: 'rgba(115,103,240,0.08)', color: '#7367f0', borderRadius: '6px', border: '1px solid rgba(115,103,240,0.2)', boxShadow: 'none', textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(115,103,240,0.15)', boxShadow: 'none' } }}
                >
                    Done
                </Button>
            </Box>

            {/* Quick Presets */}
            <SectionHead label="Quick Shapes" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {shapePresets.map(preset => (
                    <Button
                        key={preset.name}
                        onClick={() => applyShapePreset(preset)}
                        size="small"
                        sx={{
                            flex: '1 1 auto',
                            minWidth: 'fit-content',
                            height: 36,
                            borderRadius: '8px',
                            backgroundColor: '#f8f7fa',
                            color: '#2f2b3d',
                            border: '1px solid rgba(47, 43, 61, 0.12)',
                            textTransform: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: 'rgba(115,103,240,0.08)',
                                borderColor: '#7367f0',
                                color: '#7367f0'
                            }
                        }}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Box>

            {/* Shape Type */}
            <SectionHead label="Shape Type" />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[
                    { t: 'rectangle', i: <Rectangle sx={{ fontSize: 20 }} />, label: 'Rectangle' },
                    { t: 'circle', i: <Circle sx={{ fontSize: 20 }} />, label: 'Circle' },
                    { t: 'triangle', i: <ChangeHistory sx={{ fontSize: 20 }} />, label: 'Triangle' },
                    { t: 'star', i: <Star sx={{ fontSize: 20 }} />, label: 'Star' }
                ].map(it => (
                    <IconButton
                        key={it.t}
                        onClick={() => { update('type', it.t); pushHistory(`Shape Type: ${it.label}`); }}
                        title={it.label}
                        sx={{
                            flex: 1,
                            height: 44,
                            borderRadius: '8px',
                            backgroundColor: s.type === it.t ? '#7367f0' : '#f8f7fa',
                            color: s.type === it.t ? '#fff' : '#6d6b77',
                            border: '1px solid',
                            borderColor: s.type === it.t ? '#7367f0' : 'rgba(47, 43, 61, 0.12)',
                            boxShadow: s.type === it.t ? '0 2px 4px rgba(115,103,240,0.3)' : 'none',
                            '&:hover': { backgroundColor: s.type === it.t ? '#6459d8' : 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {it.i}
                    </IconButton>
                ))}
            </Box>

            {/* Stroke Width - Prominent */}
            <SectionHead label="Stroke Width" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <IconButton
                        onClick={() => { update('strokeW', Math.max(0, s.strokeW - 1)); pushHistory('Stroke Width'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Remove sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Box sx={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        py: 1.5, 
                        backgroundColor: '#f8f7fa', 
                        borderRadius: '8px',
                        border: '1px solid rgba(47, 43, 61, 0.12)'
                    }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#7367f0' }}>
                            {s.strokeW}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#6d6b77', textTransform: 'uppercase', letterSpacing: 1 }}>
                            pixels
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => { update('strokeW', Math.min(50, s.strokeW + 1)); pushHistory('Stroke Width'); }}
                        size="small"
                        sx={{ backgroundColor: '#f8f7fa', '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' } }}
                    >
                        <Add sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <Slider
                    value={s.strokeW}
                    onChange={(_, v) => update('strokeW', v)}
                    onChangeCommitted={() => pushHistory('Stroke Width')}
                    min={0}
                    max={50}
                    size="small"
                    sx={{
                        '& .MuiSlider-thumb': { width: 16, height: 16, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                        '& .MuiSlider-track': { height: 6, backgroundColor: '#7367f0' },
                        '& .MuiSlider-rail': { height: 6, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
                    }}
                />
            </Box>

            {/* Fill Color with Swatches */}
            <SectionHead label="Fill Color" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
                    {colorSwatches.map(color => (
                        <Box
                            key={color}
                            onClick={() => { update('fill', color); pushHistory('Fill Color'); }}
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: s.fill === color ? '3px solid #7367f0' : '1px solid rgba(47, 43, 61, 0.12)',
                                boxShadow: s.fill === color ? '0 0 10px rgba(115,103,240,0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': { transform: 'scale(1.1)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }
                            }}
                        />
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77' }}>Custom</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.fill === 'transparent' ? '#ffffff' : s.fill, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.fill === 'transparent' ? '#ffffff' : s.fill} onChange={(e) => update('fill', e.target.value)} onBlur={() => pushHistory('Fill Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Button 
                        size="small" 
                        onClick={() => { update('fill', s.fill === 'transparent' ? '#7367f0' : 'transparent'); pushHistory('Toggle Fill'); }} 
                        sx={{ 
                            fontSize: 11, 
                            textTransform: 'none', 
                            color: s.fill === 'transparent' ? '#7367f0' : '#ea5455',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: 'rgba(115,103,240,0.08)' }
                        }}
                    >
                        {s.fill === 'transparent' ? 'Add Fill' : 'No Fill'}
                    </Button>
                </Box>
            </Box>

            {/* Stroke Color with Swatches */}
            <SectionHead label="Stroke Color" />
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
                    {colorSwatches.map(color => (
                        <Box
                            key={color}
                            onClick={() => { update('stroke', color); pushHistory('Stroke Color'); }}
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: s.stroke === color ? '3px solid #7367f0' : '1px solid rgba(47, 43, 61, 0.12)',
                                boxShadow: s.stroke === color ? '0 0 10px rgba(115,103,240,0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': { transform: 'scale(1.1)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }
                            }}
                        />
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#f8f7fa', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77' }}>Custom</Typography>
                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.stroke, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        <input type="color" value={s.stroke} onChange={(e) => update('stroke', e.target.value)} onBlur={() => pushHistory('Stroke Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.stroke.toUpperCase()}</Typography>
                </Box>
            </Box>

            {/* Advanced Settings Toggle */}
            <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                fullWidth
                sx={{
                    mb: 2,
                    textTransform: 'none',
                    color: '#6d6b77',
                    fontSize: 13,
                    fontWeight: 600,
                    justifyContent: 'space-between',
                    '&:hover': { backgroundColor: 'rgba(47, 43, 61, 0.04)' }
                }}
                endIcon={
                    <Box sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                    </Box>
                }
            >
                Advanced Settings
            </Button>

            {/* Advanced Settings - Collapsible */}
            {showAdvanced && (
                <Box sx={{ 
                    backgroundColor: '#f8f7fa', 
                    borderRadius: '12px', 
                    p: 2, 
                    border: '1px solid rgba(47, 43, 61, 0.08)',
                    animation: 'slideDown 0.2s ease-out',
                    '@keyframes slideDown': {
                        from: { opacity: 0, transform: 'translateY(-10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    {s.type === 'rectangle' && (
                        <>
                            <SectionHead label="Corner Radius" />
                            <SliderRow label="Roundness" value={s.borderRadius} min={0} max={100} k="borderRadius" unit="px" update={update} pushHistory={pushHistory} />
                        </>
                    )}

                    <SectionHead label="Opacity" />
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2f2b3d', flex: 1 }}>Transparency</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#7367f0', mr: 0.3 }}>{Math.round(s.opacity * 100)}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#6d6b77' }}>%</Typography>
                        </Box>
                        <Slider
                            value={s.opacity}
                            onChange={(_, v) => update('opacity', v)}
                            onChangeCommitted={() => pushHistory('Shape Opacity')}
                            min={0.01}
                            max={1}
                            step={0.01}
                            size="small"
                            sx={{
                                py: 1,
                                '& .MuiSlider-thumb': { width: 14, height: 14, backgroundColor: '#7367f0', boxShadow: '0 0 0 4px rgba(115,103,240,0.1)' },
                                '& .MuiSlider-track': { height: 4, backgroundColor: '#7367f0' },
                                '& .MuiSlider-rail': { height: 4, backgroundColor: 'rgba(47, 43, 61, 0.1)' },
                            }}
                        />
                    </Box>

                    <SectionHead label="Shadow" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(47, 43, 61, 0.12)', mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#6d6b77', minWidth: 40 }}>Color</Typography>
                        <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '6px', backgroundColor: s.shadowColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            <input type="color" value={s.shadowColor} onChange={(e) => update('shadowColor', e.target.value)} onBlur={() => pushHistory('Shadow Color')} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2f2b3d', flex: 1 }}>{s.shadowColor.toUpperCase()}</Typography>
                    </Box>
                    <SliderRow label="Blur" value={s.shadowBlur} min={0} max={50} k="shadowBlur" unit="px" update={update} pushHistory={pushHistory} />
                    <SliderRow label="Offset X" value={s.shadowX} min={-50} max={50} k="shadowX" unit="px" update={update} pushHistory={pushHistory} />
                    <SliderRow label="Offset Y" value={s.shadowY} min={-50} max={50} k="shadowY" unit="px" update={update} pushHistory={pushHistory} />
                </Box>
            )}
        </Box>
    );
};
