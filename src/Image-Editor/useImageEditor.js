import { useState, useRef, useCallback, useEffect } from 'react';
import { clamp, defStyle, defShapeStyle } from './EditorUtils';

export const useImageEditor = (initialImage, open) => {
    // Refs
    const canvasRef = useRef();
    const baseCanvasRef = useRef(null); // Cached processed image
    const txtEditorRef = useRef();
    const cwRef = useRef();
    const ctx = useRef(null);
    const hIdxRef = useRef(-1);
    const loadedSrcRef = useRef(null);

    // State
    const [currentImage, setCurrentImage] = useState(initialImage || '');
    const [isImageReady, setIsImageReady] = useState(false);
    const [tab, setTab] = useState('ctrl');
    const [drawMode, setDrawMode] = useState(false);
    const [textMode, setTextMode] = useState(false);
    const [cropMode, setCropMode] = useState(false);
    const [adj, setAdj] = useState({ br: 0, co: 0, sa: 0, sh: 0 });
    const [activeFx, setActiveFx] = useState(null);
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(12);
    const [brushOpacity, setBrushOpacity] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [texts, setTexts] = useState([]);
    const [selTxt, setSelTxt] = useState(null);
    const [editTxt, setEditTxt] = useState(null);
    const [shapeMode, setShapeMode] = useState(false);
    const [shapes, setShapes] = useState([]);
    const [selShape, setSelShape] = useState(null);
    const [shapeDrag, setShapeDrag] = useState(null);
    const [shapeCreateDrag, setShapeCreateDrag] = useState(null);
    const [history, setHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);
    const [drawings, setDrawings] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [cropDrag, setCropDrag] = useState(null);
    const [txtDrag, setTxtDrag] = useState(null);
    const [resizeDrag, setResizeDrag] = useState(null);
    const [rotDrag, setRotDrag] = useState(null);
    const [nextId, setNextId] = useState(1);
    const [cutMode, setCutMode] = useState(false);
    const [cut, setCut] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [cuts, setCuts] = useState([]);
    const [selCut, setSelCut] = useState(null);
    const [cutDrag, setCutDrag] = useState(null);
    const [holes, setHoles] = useState([]);
    const [clipboard, setClipboard] = useState(null);
    const [canvasW, setCanvasW] = useState(800);
    const [canvasH, setCanvasH] = useState(600);
    const [canvasResizing, setCanvasResizing] = useState(null);
    const [zoom, setZoom] = useState(1);
    const rafRef = useRef(null);

    const removeImage = useCallback(() => {
        setIsImageReady(false);
        setHistory([]);
        setHistIdx(-1);
        hIdxRef.current = -1;
        loadedSrcRef.current = null;
        setCurrentImage('');
        setDrawings([]);
        setTexts([]);
        setAdj({ br: 0, co: 0, sa: 0, sh: 0 });
        setActiveFx(null);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setCuts([]);
        setHoles([]);
        setCanvasW(800);
        setCanvasH(600);
        if (ctx.current && canvasRef.current) {
            ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [setCurrentImage]);

    const canvasXY = useCallback((e) => {
        const target = cwRef.current || canvasRef.current;
        if (!target) return { x: 0, y: 0 };
        const r = target.getBoundingClientRect();
        // Use true workspace units for scaling
        const scaleX = canvasW / r.width;
        const scaleY = canvasH / r.height;
        return {
            x: (e.clientX - r.left) * scaleX,
            y: (e.clientY - r.top) * scaleY,
        };
    }, [canvasW, canvasH]);

    const wrapText = useCallback((t) => {
        if (!ctx.current) return [t.text];
        const { text, style } = t;
        if (style.wrapW <= 0) return text.split('\n');

        const words = text.split(/(\s+)/);
        const lines = [];
        let curLine = '';

        ctx.current.save();
        ctx.current.font = `${style.bold ? 'bold ' : ''}${style.italic ? 'italic ' : ''}${style.size}px ${style.font}`;

        words.forEach(word => {
            if (word === '\n') {
                lines.push(curLine);
                curLine = '';
                return;
            }
            const testLine = curLine + word;
            let w = 0;
            if (style.letterSpacing !== 0) {
                testLine.split('').forEach(c => { w += ctx.current.measureText(c).width + style.letterSpacing; });
            } else {
                w = ctx.current.measureText(testLine).width;
            }

            if (w > style.wrapW && curLine !== '') {
                lines.push(curLine);
                curLine = word.trimStart();
            } else {
                curLine = testLine;
            }
        });
        lines.push(curLine);
        ctx.current.restore();
        return lines.filter((l, i) => l !== '' || i === 0 || text[text.indexOf(lines[i - 1]) + lines[i - 1].length] === '\n');
    }, []);

    const getTextBB = useCallback((t) => {
        if (!ctx.current) return { x: t.x, y: t.y, w: 0, h: 0 };
        ctx.current.save();
        ctx.current.font = `${t.style.bold ? 'bold ' : ''}${t.style.italic ? 'italic ' : ''}${t.style.size}px ${t.style.font}`;
        const lines = wrapText(t).map(l => t.style.upper ? l.toUpperCase() : l);
        const lh = t.style.size * t.style.lineH;
        let maxW = 0;
        lines.forEach(line => {
            let w = 0;
            if (t.style.letterSpacing !== 0) {
                line.split('').forEach(c => { w += ctx.current.measureText(c).width + t.style.letterSpacing; });
            } else {
                w = ctx.current.measureText(line).width;
            }
            if (w > maxW) maxW = w;
        });
        ctx.current.restore();
        let bx = t.x;
        const actualW = t.style.wrapW > 0 ? t.style.wrapW : Math.max(0, maxW - t.style.letterSpacing);
        if (t.style.align === 'center') bx -= actualW / 2;
        else if (t.style.align === 'right') bx -= actualW;
        return { x: bx, y: t.y - t.style.size * 0.7, w: actualW, h: lh * lines.length };
    }, [wrapText]);

    const getShapeBB = useCallback((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }), []);
    const getCutBB = useCallback((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }), []);


    const mkThumb = useCallback(() => {
        if (!canvasRef.current) return '';
        const t = document.createElement('canvas');
        t.width = 44;
        t.height = 36;
        const tctx = t.getContext('2d');
        tctx.drawImage(canvasRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height, 0, 0, 44, 36);
        return t.toDataURL('image/jpeg', 0.75);
    }, []);

    const pushHistory = useCallback((label = 'Action', overrides = {}) => {
        const thumb = mkThumb();
        const nextIdx = hIdxRef.current + 1;
        hIdxRef.current = nextIdx;

        const snapshot = {
            label,
            thumb,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            drawings: JSON.parse(JSON.stringify(overrides.drawings || drawings)),
            texts: JSON.parse(JSON.stringify(overrides.texts || texts)),
            shapes: JSON.parse(JSON.stringify(overrides.shapes || shapes)),
            adj: { ...(overrides.adj || adj) },
            rotation: overrides.rotation !== undefined ? overrides.rotation : rotation,
            flipH: overrides.flipH !== undefined ? overrides.flipH : flipH,
            flipV: overrides.flipV !== undefined ? overrides.flipV : flipV,
            activeFx: overrides.activeFx !== undefined ? overrides.activeFx : activeFx,
            canvasW: overrides.canvasW !== undefined ? overrides.canvasW : canvasW,
            canvasH: overrides.canvasH !== undefined ? overrides.canvasH : canvasH,
            cuts: (overrides.cuts || cuts).map(c => ({ ...c })),
            holes: JSON.parse(JSON.stringify(overrides.holes || holes)),
            isImageReady,
            bgData: baseCanvasRef.current ? baseCanvasRef.current.toDataURL() : null
        };
        setHistory(prev => {
            const newHist = prev.slice(0, nextIdx);
            newHist.push(snapshot);
            if (newHist.length > 50) { newHist.shift(); hIdxRef.current--; }
            return newHist;
        });
        setHistIdx(hIdxRef.current);
    }, [drawings, texts, shapes, rotation, flipH, flipV, isImageReady, mkThumb, adj, activeFx, cuts, holes, canvasW, canvasH]);





    const applyFx = useCallback((d) => {
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];
            if (activeFx === 'grayscale') { const g2 = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = g2; }
            else if (activeFx === 'sepia') { const tr = r * .393 + g * .769 + b * .189, tg = r * .349 + g * .686 + b * .168, tb = r * .272 + g * .534 + b * .131; r = tr; g = tg; b = tb; }
            else if (activeFx === 'invert') { r = 255 - r; g = 255 - g; b = 255 - b; }
            else if (activeFx === 'warm') { r = clamp(r * 1.1); b = clamp(b * .88); }
            else if (activeFx === 'cool') { r = clamp(r * .88); b = clamp(b * 1.12); }
            else if (activeFx === 'vintage') { const g2 = (r + g + b) / 3; r = clamp(g2 * 1.1 + 30); g = clamp(g2 * .95 + 10); b = clamp(g2 * .8); }
            d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
        }
    }, [activeFx]);

    const applyAdj = useCallback(() => {
        if (!ctx.current || !canvasRef.current) return;
        const id = ctx.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const d = id.data;
        const len = d.length;
        const br = adj.br * 2.55;
        const ct = (100 + adj.co) / 100;
        const sat = (adj.sa + 100) / 100;
        for (let i = 0; i < len; i += 4) {
            let r = d[i], g = d[i + 1], b = d[i + 2];
            r += br; g += br; b += br;
            r = (r - 128) * ct + 128; g = (g - 128) * ct + 128; b = (b - 128) * ct + 128;
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat;
            d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
        }
        if (adj.sh !== 0) {
            const src = new Uint8ClampedArray(d);
            const W = canvasRef.current.width, H = canvasRef.current.height;
            const a = Math.abs(adj.sh) / 100;
            if (adj.sh > 0) {
                for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
                    const i = (y * W + x) * 4;
                    for (let c = 0; c < 3; c++) {
                        const v = 5 * src[i + c] - src[i - 4 + c] - src[i + 4 + c] - src[(y - 1) * W * 4 + x * 4 + c] - src[(y + 1) * W * 4 + x * 4 + c];
                        d[i + c] = clamp(src[i + c] * (1 - a) + v * a);
                    }
                }
            } else {
                const rv = Math.max(1, Math.round(a * 4));
                for (let y = rv; y < H - rv; y++) for (let x = rv; x < W - rv; x++) {
                    const i = (y * W + x) * 4; let sr = 0, sg = 0, sb = 0, cnt = 0;
                    for (let dy = -rv; dy <= rv; dy++) for (let dx = -rv; dx <= rv; dx++) {
                        const j = ((y + dy) * W + (x + dx)) * 4; sr += src[j]; sg += src[j + 1]; sb += src[j + 2]; cnt++;
                    }
                    d[i] = sr / cnt; d[i + 1] = sg / cnt; d[i + 2] = sb / cnt;
                }
            }
        }
        if (activeFx) applyFx(d);
        ctx.current.putImageData(id, 0, 0);
    }, [adj, activeFx, applyFx]);

    const drawOverlaysToCtx = useCallback((targetCtx, wrapTextFunc) => {
        if (!targetCtx) return;

        // 1. Shapes (Bottom layer of overlays)
        shapes.forEach(s => {
            targetCtx.save();
            targetCtx.translate(s.x + s.w / 2, s.y + s.h / 2);
            targetCtx.rotate((s.rotation * Math.PI) / 180);
            targetCtx.translate(-(s.x + s.w / 2), -(s.y + s.h / 2));
            targetCtx.globalAlpha = s.style.opacity;
            if (s.style.shadowBlur > 0) {
                targetCtx.shadowColor = s.style.shadowColor;
                targetCtx.shadowBlur = s.style.shadowBlur;
                targetCtx.shadowOffsetX = s.style.shadowX;
                targetCtx.shadowOffsetY = s.style.shadowY;
            }
            targetCtx.fillStyle = s.style.fill;
            targetCtx.strokeStyle = s.style.stroke;
            targetCtx.lineWidth = s.style.strokeW;
            targetCtx.beginPath();
            if (s.style.type === 'rectangle') {
                if (s.style.borderRadius > 0) targetCtx.roundRect(s.x, s.y, s.w, s.h, s.style.borderRadius);
                else targetCtx.rect(s.x, s.y, s.w, s.h);
            } else if (s.style.type === 'circle') {
                targetCtx.ellipse(s.x + s.w / 2, s.y + s.h / 2, Math.abs(s.w / 2), Math.abs(s.h / 2), 0, 0, Math.PI * 2);
            } else if (s.style.type === 'triangle') {
                targetCtx.moveTo(s.x + s.w / 2, s.y); targetCtx.lineTo(s.x + s.w, s.y + s.h); targetCtx.lineTo(s.x, s.y + s.h); targetCtx.closePath();
            } else if (s.style.type === 'star') {
                const spikes = 5, outer = Math.min(Math.abs(s.w), Math.abs(s.h)) / 2, inner = outer / 2.5;
                const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
                let rot = Math.PI / 2 * 3, step = Math.PI / spikes;
                targetCtx.moveTo(cx, cy - outer);
                for (let i = 0; i < spikes; i++) {
                    targetCtx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer); rot += step;
                    targetCtx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner); rot += step;
                }
                targetCtx.closePath();
            }
            if (s.style.fill !== 'transparent') targetCtx.fill();
            if (s.style.strokeW > 0) targetCtx.stroke();
            targetCtx.restore();
        });

        // 2. Drawings (Middle layer)
        drawings.forEach(d => {
            if (d.pts.length < 2) return;
            targetCtx.save();
            targetCtx.lineJoin = 'round'; targetCtx.lineCap = 'round';
            targetCtx.strokeStyle = d.color; targetCtx.lineWidth = d.size;
            targetCtx.globalAlpha = d.opacity;
            targetCtx.beginPath();
            targetCtx.moveTo(d.pts[0].x, d.pts[0].y);
            for (let i = 1; i < d.pts.length; i++) targetCtx.lineTo(d.pts[i].x, d.pts[i].y);
            targetCtx.stroke();
            targetCtx.restore();
        });

        // 3. Texts (Top layer)
        texts.forEach(t => {
            if (t.id === editTxt) return;
            targetCtx.save();
            targetCtx.translate(t.x, t.y);
            targetCtx.rotate((t.rotation * Math.PI) / 180);
            targetCtx.font = `${t.style.bold ? 'bold ' : ''}${t.style.italic ? 'italic ' : ''}${t.style.size}px ${t.style.font}`;

            if (t.style.shadowBlur > 0 || t.style.shadowX !== 0 || t.style.shadowY !== 0) {
                targetCtx.shadowColor = t.style.shadowColor;
                targetCtx.shadowBlur = t.style.shadowBlur;
                targetCtx.shadowOffsetX = t.style.shadowX;
                targetCtx.shadowOffsetY = t.style.shadowY;
            }

            targetCtx.fillStyle = t.style.color;
            targetCtx.strokeStyle = t.style.strokeColor;
            targetCtx.lineWidth = t.style.strokeW;
            targetCtx.textAlign = t.style.align;
            targetCtx.globalAlpha = t.style.opacity;

            const lines = wrapTextFunc(t).map(l => t.style.upper ? l.toUpperCase() : l);
            const lh = t.style.size * t.style.lineH;

            lines.forEach((line, i) => {
                const yp = i * lh;
                let lineW = 0;
                let curX = 0;

                const chars = line.split('');
                const charWidths = chars.map(c => targetCtx.measureText(c).width);
                lineW = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * t.style.letterSpacing;

                if (t.style.align === 'center') curX = -lineW / 2;
                else if (t.style.align === 'right') curX = -lineW;

                if (t.style.letterSpacing !== 0) {
                    targetCtx.save();
                    targetCtx.textAlign = 'left'; // Critical: Manual spacing needs left alignment
                    chars.forEach((ch, ci) => {
                        if (t.style.strokeW > 0) targetCtx.strokeText(ch, curX, yp);
                        targetCtx.fillText(ch, curX, yp);
                        curX += charWidths[ci] + t.style.letterSpacing;
                    });
                    targetCtx.restore();
                } else {
                    if (t.style.strokeW > 0) targetCtx.strokeText(line, 0, yp);
                    targetCtx.fillText(line, 0, yp);
                }

                if (t.style.underline || t.style.strike) {
                    targetCtx.save();
                    targetCtx.shadowBlur = 0;
                    targetCtx.shadowOffsetX = 0;
                    targetCtx.shadowOffsetY = 0;
                    targetCtx.beginPath();
                    targetCtx.strokeStyle = t.style.color;
                    targetCtx.lineWidth = Math.max(1, t.style.size / 15);

                    let lineStartX = 0;
                    if (t.style.align === 'center') lineStartX = -lineW / 2;
                    else if (t.style.align === 'right') lineStartX = -lineW;

                    if (t.style.underline) {
                        const uy = yp + t.style.size * 0.15;
                        targetCtx.moveTo(lineStartX, uy);
                        targetCtx.lineTo(lineStartX + lineW, uy);
                    }
                    if (t.style.strike) {
                        const sy = yp - t.style.size * 0.3;
                        targetCtx.moveTo(lineStartX, sy);
                        targetCtx.lineTo(lineStartX + lineW, sy);
                    }
                    targetCtx.stroke();
                    targetCtx.restore();
                }
            });
            targetCtx.restore();
        });
    }, [drawings, texts, shapes, editTxt]);

    const getCompositeCanvas = useCallback(() => {
        const c = document.createElement('canvas');
        c.width = canvasW; c.height = canvasH;
        const sctx = c.getContext('2d');
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, c.width, c.height);

        // Draw permanent base (main image + any burned-in holes) first
        if (baseCanvasRef.current) sctx.drawImage(baseCanvasRef.current, 0, 0);

        // Draw floating cuts on top
        cuts.forEach(cy => { if (cy.img) sctx.drawImage(cy.img, cy.x, cy.y, cy.w, cy.h); });
        drawOverlaysToCtx(sctx, wrapText);
        return c;
    }, [canvasW, canvasH, cuts, drawOverlaysToCtx, wrapText]);

    const drawOverlays = useCallback(() => {
        drawOverlaysToCtx(ctx.current, wrapText);
    }, [drawOverlaysToCtx, wrapText]);

    const processBaseImage = useCallback(() => {
        if (!ctx.current || !canvasRef.current || !baseCanvasRef.current) return;
        const bctx = baseCanvasRef.current.getContext('2d');
        if (!bctx) return;

        // Fill base with white (Workspace background)
        bctx.fillStyle = '#ffffff';
        bctx.fillRect(0, 0, baseCanvasRef.current.width, baseCanvasRef.current.height);

        applyAdj();
    }, [applyAdj]);

    const renderAll = useCallback(() => {
        if (!ctx.current || !canvasRef.current || !baseCanvasRef.current) return;

        const displayW = canvasRef.current.width;
        const displayH = canvasRef.current.height;

        ctx.current.clearRect(0, 0, displayW, displayH);

        // 1. Draw permanent base (main image + any burned-in holes)
        ctx.current.drawImage(baseCanvasRef.current, 0, 0);

        // 2. Draw floating cut layers on top (always visible above everything)
        cuts.forEach(c => { if (c.img) ctx.current.drawImage(c.img, c.x, c.y, c.w, c.h); });

        applyAdj();
        drawOverlays();
    }, [drawOverlays, cuts, applyAdj]);

    const bgDataRef = useRef(null); // Stores the baked base image DataURL for restoration

    const drawImageToCanvas = useCallback((imgArg, rotArg, forceW, forceH) => {
        if (!canvasRef.current) return;

        const w = forceW !== undefined ? forceW : canvasW;
        const h = forceH !== undefined ? forceH : canvasH;

        if (!baseCanvasRef.current) baseCanvasRef.current = document.createElement('canvas');

        if (baseCanvasRef.current.width !== w || baseCanvasRef.current.height !== h) {
            // Save current base content before resizing
            const savedData = baseCanvasRef.current.width > 0 && baseCanvasRef.current.height > 0
                ? baseCanvasRef.current.toDataURL()
                : null;
            baseCanvasRef.current.width = w;
            baseCanvasRef.current.height = h;
            const bctx = baseCanvasRef.current.getContext('2d');
            bctx.fillStyle = '#ffffff';
            bctx.fillRect(0, 0, w, h);
            // Restore the saved content if available (preserves baked image)
            if (savedData || bgDataRef.current) {
                const src = savedData || bgDataRef.current;
                const tempImg = new Image();
                tempImg.onload = () => {
                    bctx.drawImage(tempImg, 0, 0, w, h);
                    renderAll();
                };
                tempImg.src = src;
                return;
            }
        }

        if (canvasRef.current.width !== w || canvasRef.current.height !== h) {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            ctx.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
        }
        renderAll();
    }, [canvasW, canvasH, renderAll]);


    const fitCanvas = useCallback(() => { drawImageToCanvas(); }, [drawImageToCanvas]);

    const bakeCut = useCallback((id) => {
        const target = cuts.find(cu => cu.id === id);
        if (!target || !baseCanvasRef.current) return;
        const bctx = baseCanvasRef.current.getContext('2d');
        if (target.img) bctx.drawImage(target.img, target.x, target.y, target.w, target.h);
        const next = cuts.filter(cu => cu.id !== id);
        setCuts(next);
        setSelCut(null);
        pushHistory('Bake Layer', { cuts: next });
        renderAll();
    }, [cuts, pushHistory, renderAll]);

    const handleAddShape = useCallback((type = 'rectangle') => {
        const newShape = { id: Date.now().toString(), x: 50, y: 50, w: 100, h: 100, rotation: 0, style: { ...defShapeStyle(), type } };
        const next = [...shapes, newShape];
        setShapes(next); setSelShape(newShape.id); setTab('ctrl');
        pushHistory(`Add ${type}`, { shapes: next });
    }, [shapes, pushHistory]);

    const redo = useCallback(() => {
        if (histIdx >= history.length - 1) return;
        const next = history[histIdx + 1];
        setDrawings(next.drawings); setTexts(next.texts); setShapes(next.shapes || []); setAdj(next.adj);
        setRotation(next.rotation); setFlipH(next.flipH); setFlipV(next.flipV);
        setActiveFx(next.activeFx); setCuts(next.cuts || []);
        if (next.canvasW) setCanvasW(next.canvasW);
        if (next.canvasH) setCanvasH(next.canvasH);
        setHoles(next.holes || []);
        if (next.bgData && baseCanvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.clearRect(0, 0, baseCanvasRef.current.width, baseCanvasRef.current.height);
                bctx.drawImage(img, 0, 0);
                renderAll();
            };
            img.src = next.bgData;
        }
        setHistIdx(histIdx + 1);
        hIdxRef.current = histIdx + 1;
    }, [histIdx, history, renderAll]);

    const undo = useCallback(() => {
        if (histIdx <= 0) return;
        const prev = history[histIdx - 1];
        setDrawings(prev.drawings); setTexts(prev.texts); setShapes(prev.shapes || []); setAdj(prev.adj);
        setRotation(prev.rotation); setFlipH(prev.flipH); setFlipV(prev.flipV);
        setActiveFx(prev.activeFx); setCuts(prev.cuts || []);
        if (prev.canvasW) setCanvasW(prev.canvasW);
        if (prev.canvasH) setCanvasH(prev.canvasH);
        setHoles(prev.holes || []);
        if (prev.bgData && baseCanvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.clearRect(0, 0, baseCanvasRef.current.width, baseCanvasRef.current.height);
                bctx.drawImage(img, 0, 0);
                renderAll();
            };
            img.src = prev.bgData;
        }
        setHistIdx(histIdx - 1);
        hIdxRef.current = histIdx - 1;
    }, [histIdx, history, renderAll]);

    const handleZoom = useCallback((direction) => {
        setZoom(prev => {
            if (direction === 'in') return Math.min(prev + 0.1, 5);
            if (direction === 'out') return Math.max(prev - 0.1, 0.1);
            if (direction === 'reset') return 1;
            return prev;
        });
    }, []);

    useEffect(() => {
        if (selCut && (drawMode || textMode || cropMode)) {
            bakeCut(selCut);
        }
    }, [drawMode, textMode, cropMode, selCut, bakeCut]);

    const loadFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Auto-bake existing selection before importing new one
        if (selCut) bakeCut(selCut);

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            if (isImageReady) {
                // Add as new layer
                const newId = Date.now().toString();
                const newCut = { id: newId, img, x: 50, y: 50, w: img.naturalWidth, h: img.naturalHeight };
                const next = [...cuts, newCut];
                setCuts(next);
                setSelCut(newId);
                pushHistory('Import Image', { cuts: next });
            } else {
                // Initial load — bake image into permanent base canvas
                setRotation(0); setFlipH(false); setFlipV(false);
                setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
                setTexts([]); setSelTxt(null); setEditTxt(null); setDrawings([]); setCuts([]); setHoles([]);

                const nw = img.naturalWidth, nh = img.naturalHeight;
                setCanvasW(nw); setCanvasH(nh);

                // Bake image directly into base canvas (no floating 'root' layer)
                if (!baseCanvasRef.current) baseCanvasRef.current = document.createElement('canvas');
                baseCanvasRef.current.width = nw;
                baseCanvasRef.current.height = nh;
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.fillStyle = '#ffffff';
                bctx.fillRect(0, 0, nw, nh);
                bctx.drawImage(img, 0, 0, nw, nh);

                const initialHistory = {
                    label: 'Image Loaded', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    drawings: [], texts: [], adj: { br: 0, co: 0, sa: 0, sh: 0 }, rotation: 0, flipH: false, flipV: false, activeFx: null, isImageReady: true,
                    cuts: [], holes: [], canvasW: nw, canvasH: nh,
                    bgData: baseCanvasRef.current.toDataURL()
                };
                setHistory([initialHistory]);
                setHistIdx(0);
                hIdxRef.current = 0;

                setIsImageReady(true);
            }
        };
        img.onerror = () => { URL.revokeObjectURL(url); console.error('Failed to load image'); };
        img.src = url;
    }, [isImageReady, cuts, pushHistory]);

    const handleMouseDown = (e, dir = null) => {
        if (!canvasRef.current) return;
        const { x, y } = canvasXY(e);

        if (selCut && !dir) {
            const tc = cuts.find(cu => cu.id === selCut);
            if (tc) {
                const isInside = x >= tc.x && x <= tc.x + tc.w && y >= tc.y && y <= tc.y + tc.h;
                if (!isInside) {
                    bakeCut(selCut);
                    // We continue so we might select something else
                }
            }
        }

        if (dir === 'canvas-e' || dir === 'canvas-s' || dir === 'canvas-se') {
            setCanvasResizing({
                dir,
                startX: e.clientX,
                startY: e.clientY,
                initialW: canvasW,
                initialH: canvasH,
                curW: canvasW,
                curH: canvasH
            });
            return;
        }
        if (dir && selTxt) {
            const t = texts.find(tx => tx.id === selTxt);
            if (t) {
                if (dir === 'rot') {
                    setRotDrag({ id: t.id, startX: x, startY: y, initialRotation: t.rotation });
                } else {
                    setResizeDrag({ dir, startX: x, startY: y, initialSize: t.style.size, initialWrapW: t.style.wrapW, id: t.id, initialBB: getTextBB(t) });
                }
                return;
            }
        }
        if (dir && selShape) {
            const s = shapes.find(sh => sh.id === selShape);
            if (s) {
                if (dir === 'rot') setRotDrag({ id: s.id, startX: x, startY: y, initialRotation: s.rotation, isShape: true });
                else setResizeDrag({ dir, startX: x, startY: y, initialW: s.w, initialH: s.h, id: s.id, initialBB: getShapeBB(s), isShape: true });
                return;
            }
        }
        if (dir && selCut) {
            const c = cuts.find(cu => cu.id === selCut);
            if (c) {
                setResizeDrag({ dir, startX: x, startY: y, initialW: c.w, initialH: c.h, id: c.id, initialBB: getCutBB(c), isCut: true });
                return;
            }
        }
        if (cropMode) {
            if (dir) {
                setCropDrag({ dir, startX: x, startY: y, initialCrop: { ...crop } });
                return;
            }
            const isInside = x >= Math.min(crop.x, crop.x + crop.w) && x <= Math.max(crop.x, crop.x + crop.w) &&
                y >= Math.min(crop.y, crop.y + crop.h) && y <= Math.max(crop.y, crop.y + crop.h);
            if (isInside && crop.w !== 0 && crop.h !== 0) {
                setCropDrag({ dir: 'move', startX: x, startY: y, initialCrop: { ...crop } });
                return;
            }
            setCropDrag({ startX: x, startY: y }); setCrop({ x, y, w: 0, h: 0 }); return;
        }
        if (drawMode) {
            setIsDrawing(true);
            setCurrentPath({ pts: [{ x, y }], color: brushColor, size: brushSize, opacity: brushOpacity });
            return;
        }
        if (!drawMode && !cropMode && !cutMode) {
            const clickedTxt = [...texts].reverse().find(t => {
                const bb = getTextBB(t);
                return x >= bb.x - 10 && x <= bb.x + bb.w + 10 && y >= bb.y - 10 && y <= bb.y + bb.h + 10;
            });
            if (clickedTxt) {
                setSelTxt(clickedTxt.id);
                setTxtDrag({ id: clickedTxt.id, startX: x, startY: y, initialX: clickedTxt.x, initialY: clickedTxt.y });
                setTextMode(true); setSelShape(null);
                return;
            } else { setSelTxt(null); }

            const clickedShape = [...shapes].reverse().find(s => {
                const bb = getShapeBB(s);
                return x >= bb.x && x <= bb.x + bb.w && y >= bb.y && y <= bb.y + bb.h;
            });
            if (clickedShape) {
                setSelShape(clickedShape.id);
                setShapeDrag({ id: clickedShape.id, startX: x, startY: y, initialX: clickedShape.x, initialY: clickedShape.y });
                return;
            } else { setSelShape(null); }

            if (shapeMode) {
                const newId = Date.now().toString();
                const newShape = { id: newId, x, y, w: 10, h: 10, rotation: 0, style: { ...defShapeStyle(), type: 'rectangle' } };
                const next = [...shapes, newShape];
                setShapes(next);
                setSelShape(newId);
                setShapeCreateDrag({ id: newId, startX: x, startY: y });
                return;
            }
        }
        if (!drawMode && !cropMode && !cutMode) {
            const clickedCut = [...cuts].reverse().find(c => {
                return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
            });
            if (clickedCut) {
                setSelCut(clickedCut.id);
                setCutDrag({ id: clickedCut.id, startX: x, startY: y, initialX: clickedCut.x, initialY: clickedCut.y });
                return;
            } else { setSelCut(null); }
        }
        if (cutMode) {
            const isInside = x >= Math.min(cut.x, cut.x + cut.w) && x <= Math.max(cut.x, cut.x + cut.w) &&
                y >= Math.min(cut.y, cut.y + cut.h) && y <= Math.max(cut.y, cut.y + cut.h);

            if (isInside && cut.w !== 0 && cut.h !== 0) {
                // Paint-style "Lift" content
                const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
                const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

                const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
                const tctx = tempCanvas.getContext('2d'); tctx.drawImage(canvasRef.current, nx, ny, nw, nh, 0, 0, nw, nh);

                const cutImg = new Image();
                cutImg.onload = () => {
                    const newId = Date.now().toString();
                    const newCut = { id: newId, img: cutImg, x: nx, y: ny, w: nw, h: nh };
                    const newCuts = [...cuts, newCut];
                    const newHoles = [...holes, { x: nx, y: ny, w: nw, h: nh }];

                    setCuts(newCuts);
                    setHoles(newHoles);
                    setSelCut(newId);
                    setCutDrag({ id: newId, startX: x, startY: y, initialX: nx, initialY: ny, isInitialLift: true });
                    pushHistory('Select & Move', { cuts: newCuts, holes: newHoles });
                };
                cutImg.src = tempCanvas.toDataURL();
                return;
            }
            setCutDrag({ startX: x, startY: y }); setCut({ x, y, w: 0, h: 0 }); return;
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (!isImageReady || (!canvasResizing && !isDrawing && !txtDrag && !shapeDrag && !shapeCreateDrag && !resizeDrag && !rotDrag && !cropDrag && !cutDrag)) return;

        // Extract values from event BEFORE RequestAnimationFrame (Avoid React Event Pooling issues)
        const clientX = e.clientX;
        const clientY = e.clientY;
        const { x, y } = canvasXY(e);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (canvasResizing) {
                const dx = clientX - canvasResizing.startX, dy = clientY - canvasResizing.startY;
                let nw = canvasResizing.initialW, nh = canvasResizing.initialH;
                if (canvasResizing.dir.includes('e')) nw = canvasResizing.initialW + dx;
                if (canvasResizing.dir.includes('s')) nh = canvasResizing.initialH + dy;

                setCanvasResizing(prev => prev ? ({ ...prev, curW: Math.max(50, nw), curH: Math.max(50, nh) }) : null);
                return;
            }
            if (rotDrag) {
                const target = rotDrag.isShape ? shapes.find(s => s.id === rotDrag.id) : texts.find(t => t.id === rotDrag.id);
                if (target) {
                    const bb = rotDrag.isShape ? getShapeBB(target) : getTextBB(target);
                    const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
                    const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
                    const nr = Math.round(angle + 90);
                    if (rotDrag.isShape) setShapes(prev => prev.map(s => s.id === rotDrag.id ? { ...s, rotation: nr } : s));
                    else setTexts(prev => prev.map(tx => tx.id === rotDrag.id ? { ...tx, rotation: nr } : tx));
                }
                return;
            }
            if (resizeDrag) {
                const dx = x - resizeDrag.startX, dy = y - resizeDrag.startY;
                if (resizeDrag.isShape) {
                    setShapes(prev => prev.map(s => {
                        if (s.id !== resizeDrag.id) return s;
                        let nw = s.w, nh = s.h, nx = s.x, ny = s.y;
                        const { dir } = resizeDrag;
                        if (dir.includes('e')) nw = resizeDrag.initialW + dx;
                        if (dir.includes('w')) { nw = resizeDrag.initialW - dx; nx = resizeDrag.initialBB.x + dx; }
                        if (dir.includes('s')) nh = resizeDrag.initialH + dy;
                        if (dir.includes('n')) { nh = resizeDrag.initialH - dy; ny = resizeDrag.initialBB.y + dy; }
                        return { ...s, x: nx, y: ny, w: Math.max(10, nw), h: Math.max(10, nh) };
                    }));
                } else if (resizeDrag.isCut) {
                    setCuts(prev => prev.map(c => {
                        if (c.id !== resizeDrag.id) return c;
                        let nw = c.w, nh = c.h, nx = c.x, ny = c.y;
                        const { dir } = resizeDrag;
                        if (dir.includes('e')) nw = resizeDrag.initialW + dx;
                        if (dir.includes('w')) { nw = resizeDrag.initialW - dx; nx = resizeDrag.initialBB.x + dx; }
                        if (dir.includes('s')) nh = resizeDrag.initialH + dy;
                        if (dir.includes('n')) { nh = resizeDrag.initialH - dy; ny = resizeDrag.initialBB.y + dy; }
                        return { ...c, x: nx, y: ny, w: Math.max(5, nw), h: Math.max(5, nh) };
                    }));
                } else {
                    setTexts(prev => prev.map(t => {
                        if (t.id !== resizeDrag.id) return t;
                        const ns = { ...t.style };
                        const ibb = resizeDrag.initialBB;
                        if (resizeDrag.dir.length === 2) { // Corner -> Proportional scale font
                            const sideFactor = resizeDrag.dir.includes('e') ? 1 : -1;
                            const initialW = resizeDrag.initialBB.w;
                            const deltaW = dx * sideFactor;
                            const scale = (initialW + deltaW) / initialW;
                            ns.size = Math.max(8, Math.round(resizeDrag.initialSize * scale));
                        } else { // Side -> Adjust wrapW
                            const sideFactor = resizeDrag.dir === 'e' ? 1 : resizeDrag.dir === 'w' ? -1 : 0;
                            const initialW = resizeDrag.initialWrapW > 0 ? resizeDrag.initialWrapW : ibb.w;
                            let deltaW = dx * sideFactor;
                            if (t.style.align === 'center') deltaW *= 2;
                            ns.wrapW = Math.max(20, initialW + deltaW);
                        }
                        return { ...t, style: ns };
                    }));
                }
                return;
            }
            if (cropDrag) {
                const dx = x - cropDrag.startX, dy = y - cropDrag.startY;
                if (cropDrag.dir === 'move') {
                    setCrop({ ...cropDrag.initialCrop, x: cropDrag.initialCrop.x + dx, y: cropDrag.initialCrop.y + dy });
                } else if (cropDrag.dir) {
                    setCrop(prev => {
                        let { x: cx, y: cy, w: cw, h: ch } = cropDrag.initialCrop;
                        if (cropDrag.dir.includes('e')) cw += dx;
                        if (cropDrag.dir.includes('w')) { cx += dx; cw -= dx; }
                        if (cropDrag.dir.includes('s')) ch += dy;
                        if (cropDrag.dir.includes('n')) { cy += dy; ch -= dy; }
                        return { x: cx, y: cy, w: cw, h: ch };
                    });
                } else {
                    setCrop(prev => ({ ...prev, w: x - cropDrag.startX, h: y - cropDrag.startY }));
                }
                return;
            }
            if (isDrawing && currentPath) {
                const newPath = { ...currentPath, pts: [...currentPath.pts, { x, y }] };
                setCurrentPath(newPath);
                if (ctx.current) {
                    ctx.current.save();
                    ctx.current.lineJoin = 'round'; ctx.current.lineCap = 'round';
                    ctx.current.strokeStyle = newPath.color; ctx.current.lineWidth = newPath.size;
                    ctx.current.globalAlpha = newPath.opacity;
                    ctx.current.beginPath();
                    ctx.current.moveTo(newPath.pts[newPath.pts.length - 2].x, newPath.pts[newPath.pts.length - 2].y);
                    ctx.current.lineTo(x, y); ctx.current.stroke(); ctx.current.restore();
                }
                return;
            }
            if (txtDrag) {
                const dx = x - txtDrag.startX, dy = y - txtDrag.startY;
                setTexts(prev => prev.map(t => t.id === txtDrag.id ? { ...t, x: txtDrag.initialX + dx, y: txtDrag.initialY + dy } : t));
            }
            if (shapeCreateDrag) {
                const sx = shapeCreateDrag.startX;
                const sy = shapeCreateDrag.startY;
                const nx = Math.min(sx, x);
                const ny = Math.min(sy, y);
                const nw = Math.max(10, Math.abs(x - sx));
                const nh = Math.max(10, Math.abs(y - sy));
                setShapes(prev => prev.map(s => s.id === shapeCreateDrag.id ? { ...s, x: nx, y: ny, w: nw, h: nh } : s));
                return;
            }
            if (shapeDrag) {
                const dx = x - shapeDrag.startX, dy = y - shapeDrag.startY;
                setShapes(prev => prev.map(s => s.id === shapeDrag.id ? { ...s, x: shapeDrag.initialX + dx, y: shapeDrag.initialY + dy } : s));
            }
            if (cutDrag && !cutMode) {
                const dx = x - cutDrag.startX, dy = y - cutDrag.startY;
                setCuts(prev => prev.map(c => c.id === cutDrag.id ? { ...c, x: cutDrag.initialX + dx, y: cutDrag.initialY + dy } : c));
            }
            if (cutDrag && cutMode) {
                if (cutDrag.id) { // Dragging a lifted cut
                    const dx = x - cutDrag.startX, dy = y - cutDrag.startY;
                    const nx = cutDrag.initialX + dx, ny = cutDrag.initialY + dy;
                    setCuts(prev => prev.map(c => c.id === cutDrag.id ? { ...c, x: nx, y: ny } : c));
                    setCut(prev => ({ ...prev, x: nx, y: ny }));
                } else { // Drawing a new selection
                    setCut(prev => ({ ...prev, w: x - cutDrag.startX, h: y - cutDrag.startY }));
                }
            }
        });
    }, [isImageReady, canvasResizing, rotDrag, shapes, texts, getShapeBB, getTextBB, resizeDrag, cuts, cropDrag, isDrawing, currentPath, canvasXY, txtDrag, shapeDrag, shapeCreateDrag, cutDrag, cutMode]);

    const handleMouseUp = useCallback(() => {
        if (canvasResizing) {
            const finalW = canvasResizing.curW;
            const finalH = canvasResizing.curH;
            setCanvasW(finalW);
            setCanvasH(finalH);
            pushHistory('Resize Canvas', { canvasW: finalW, canvasH: finalH });
            setCanvasResizing(null);
        }
        if (isDrawing && currentPath) {
            const newDrawings = [...drawings, currentPath];
            setDrawings(newDrawings);
            setIsDrawing(false);
            setCurrentPath(null);
            pushHistory('Draw', { drawings: newDrawings });
        }
        if (txtDrag) pushHistory('Move Text', { texts });
        if (resizeDrag) pushHistory(resizeDrag.isShape ? 'Resize Shape' : 'Resize Text', resizeDrag.isShape ? { shapes } : { texts });
        if (rotDrag) pushHistory(rotDrag.isShape ? 'Rotate Shape' : 'Rotate Text', rotDrag.isShape ? { shapes } : { texts });
        if (shapeCreateDrag) pushHistory('Add Shape', { shapes });
        if (shapeDrag) pushHistory('Move Shape', { shapes });
        if (cutDrag && !cutMode) pushHistory('Move Cut', { cuts });
        setTxtDrag(null); setShapeDrag(null); setShapeCreateDrag(null); setCropDrag(null); setResizeDrag(null); setRotDrag(null); setCutDrag(null);
    }, [canvasResizing, canvasW, canvasH, pushHistory, isDrawing, currentPath, drawings, txtDrag, texts, resizeDrag, rotDrag, shapes, shapeDrag, shapeCreateDrag, cutDrag, cutMode]);

    const handleApplyCut = useCallback(() => {
        if (cut.w === 0 || cut.h === 0) return;
        const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
        const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

        const comp = getCompositeCanvas();
        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(comp, nx, ny, nw, nh, 0, 0, nw, nh);

        const cutImg = new Image();
        cutImg.onload = () => {
            // Burn the white hole directly into the permanent base canvas
            if (baseCanvasRef.current) {
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.fillStyle = '#ffffff';
                bctx.fillRect(nx, ny, nw, nh);
                bgDataRef.current = baseCanvasRef.current.toDataURL(); // Update stored reference
            }
            const newCut = { id: Date.now().toString(), img: cutImg, x: nx, y: ny, w: nw, h: nh };
            const newCuts = [...cuts, newCut];
            setCuts(newCuts);
            setSelCut(newCut.id);
            setCut({ x: 0, y: 0, w: 0, h: 0 }); setCutMode(false);
            // Pass current holes for history (not adding a new one)
            pushHistory('Cut Image', { cuts: newCuts, holes, bgData: bgDataRef.current });
        };
        cutImg.src = tempCanvas.toDataURL();
    }, [cut, cuts, holes, getCompositeCanvas, pushHistory]);

    const handleKeyCut = useCallback(() => {
        if (!cutMode || cut.w === 0 || cut.h === 0) return;
        const nx = cut.w > 0 ? cut.x : cut.x + cut.w, ny = cut.h > 0 ? cut.y : cut.y + cut.h;
        const nw = Math.abs(cut.w), nh = Math.abs(cut.h);

        const comp = getCompositeCanvas();
        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(comp, nx, ny, nw, nh, 0, 0, nw, nh);

        const cutImg = new Image();
        cutImg.onload = () => {
            // Burn hole into base canvas
            if (baseCanvasRef.current) {
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.fillStyle = '#ffffff';
                bctx.fillRect(nx, ny, nw, nh);
                bgDataRef.current = baseCanvasRef.current.toDataURL();
            }
            setClipboard({ img: cutImg, w: nw, h: nh });
            setCut({ x: 0, y: 0, w: 0, h: 0 }); setCutMode(false);
            pushHistory('Cut (Ctrl+X)', { holes, bgData: bgDataRef.current });
            renderAll();
        };
        cutImg.src = tempCanvas.toDataURL();
    }, [cut, cutMode, holes, getCompositeCanvas, pushHistory, renderAll]);

    const handleKeyPaste = useCallback(() => {
        if (!clipboard) return;
        const newCut = { id: Date.now().toString(), img: clipboard.img, x: 50, y: 50, w: clipboard.w, h: clipboard.h };
        const newCuts = [...cuts, newCut];
        setCuts(newCuts);
        setSelCut(newCut.id);
        pushHistory('Paste (Ctrl+V)', { cuts: newCuts });
    }, [clipboard, cuts, pushHistory]);

    const handleApplyCrop = useCallback(() => {
        if (crop.w === 0 || crop.h === 0) return;
        const nx = crop.w > 0 ? crop.x : crop.x + crop.w, ny = crop.h > 0 ? crop.y : crop.y + crop.h;
        const nw = Math.abs(crop.w), nh = Math.abs(crop.h);

        const comp = getCompositeCanvas();
        const tempCanvas = document.createElement('canvas'); tempCanvas.width = nw; tempCanvas.height = nh;
        const tctx = tempCanvas.getContext('2d'); tctx.drawImage(comp, nx, ny, nw, nh, 0, 0, nw, nh);

        const newImg = new Image();
        newImg.onload = () => {
            setRotation(0); setFlipH(false); setFlipV(false);
            setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
            setDrawings([]); setTexts([]); setShapes([]); setHoles([]);
            setCanvasW(nw); setCanvasH(nh);
            setCrop({ x: 0, y: 0, w: 0, h: 0 }); setCropMode(false);

            const firstLayer = { id: 'root', img: newImg, x: 0, y: 0, w: nw, h: nh };
            setCuts([firstLayer]);

            pushHistory('Crop', {
                drawings: [], texts: [], shapes: [], rotation: 0, flipH: false, flipV: false,
                adj: { br: 0, co: 0, sa: 0, sh: 0 }, activeFx: null, cuts: [firstLayer], holes: [],
                canvasW: nw, canvasH: nh
            });
            setTimeout(() => { drawImageToCanvas(null, 0, nw, nh); }, 50);
        };
        newImg.src = tempCanvas.toDataURL();
    }, [crop, getCompositeCanvas, pushHistory, drawImageToCanvas]);

    const syncEditor = useCallback((t) => {
        if (!txtEditorRef.current || !canvasRef.current) return;
        const editor = txtEditorRef.current;
        const r = canvasRef.current.getBoundingClientRect();
        const scale = r.width / canvasW;
        const s = t.style;
        const baselineShift = s.size * 0.77; // Refined for DM Sans/Standard fonts
        editor.innerText = t.text;
        editor.style.left = `${t.x * scale}px`;
        editor.style.top = `${(t.y - baselineShift) * scale}px`;
        editor.style.fontSize = `${s.size * scale}px`;
        editor.style.fontFamily = s.font;
        editor.style.fontWeight = s.bold ? 'bold' : 'normal';
        editor.style.fontStyle = s.italic ? 'italic' : 'normal';
        editor.style.textAlign = s.align;
        editor.style.letterSpacing = `${s.letterSpacing * scale}px`;
        editor.style.lineHeight = s.lineH;
        editor.style.whiteSpace = s.wrapW > 0 ? 'pre-wrap' : 'pre';
        editor.style.width = s.wrapW > 0 ? `${s.wrapW * scale}px` : 'auto';
        editor.style.transform = `rotate(${t.rotation}deg) ${s.align === 'center' ? 'translateX(-50%)' : s.align === 'right' ? 'translateX(-100%)' : ''}`;
        editor.style.color = s.color;
        editor.style.textShadow = s.shadowBlur > 0 ? `${s.shadowX * scale}px ${s.shadowY * scale}px ${s.shadowBlur * scale}px ${s.shadowColor}` : 'none';
        editor.style.caretColor = s.color;

        setTimeout(() => {
            editor.focus();
            const range = document.createRange(), sel = window.getSelection();
            if (editor.childNodes.length > 0) {
                range.selectNodeContents(editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }, 0);
    }, [canvasW]);

    const handleAddText = (pos) => {
        const nextIdVal = nextId;
        const x = typeof pos?.x === 'number' ? pos.x : canvasW / 2;
        const y = typeof pos?.y === 'number' ? pos.y : canvasH / 2;
        const newText = { id: nextIdVal, text: 'New Text', x, y, rotation: 0, style: defStyle() };
        const updatedTexts = [...texts, newText];
        setTexts(updatedTexts);
        setSelTxt(newText.id);
        setEditTxt(newText.id);
        setNextId(nextId + 1);
        setTextMode(true);
        pushHistory('Add Text', { texts: updatedTexts });
        setTimeout(() => syncEditor(newText), 50);
    };

    const handleTextDblClick = (e) => {
        const { x, y } = canvasXY(e);
        const clickedTxt = [...texts].reverse().find(t => {
            const bb = getTextBB(t);
            return x >= bb.x && x <= bb.x + bb.w && y >= bb.y && y <= bb.y + bb.h;
        });

        if (clickedTxt) {
            setEditTxt(clickedTxt.id);
            syncEditor(clickedTxt);
            return;
        }

        if (textMode) {
            handleAddText({ x, y });
        }
    };

    const handleRotate = useCallback(() => {
        if (!isImageReady) return;
        const nr = (rotation + 90) % 360;
        setRotation(nr);
        pushHistory('Rotate', { rotation: nr });
    }, [isImageReady, pushHistory, rotation]);

    const handleFlipH = useCallback(() => {
        if (!isImageReady) return;
        const nf = !flipH;
        setFlipH(nf);
        pushHistory('Flip H', { flipH: nf });
    }, [isImageReady, pushHistory, flipH]);

    const handleFlipV = useCallback(() => {
        if (!isImageReady) return;
        const nf = !flipV;
        setFlipV(nf);
        pushHistory('Flip V', { flipV: nf });
    }, [isImageReady, pushHistory, flipV]);

    const handleFileFunc = useCallback((file) => { if (file?.type?.startsWith('image/')) loadFile(file); }, [loadFile]);

    const handleApplyFilter = useCallback((fxId) => {
        if (!isImageReady) return;
        const nextFx = activeFx === fxId ? null : fxId;
        setActiveFx(nextFx);
        pushHistory(nextFx ? `Filter: ${nextFx}` : 'Clear Filter', { activeFx: nextFx });
    }, [isImageReady, activeFx, pushHistory]);

    // 1. Context initialization
    useEffect(() => {
        if (canvasRef.current) {
            ctx.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
            // Initial render if we're already ready
            if (isImageReady) renderAll();
        }
    }, [isImageReady, renderAll]);

    // 2. Reactive Rendering Trigger
    useEffect(() => {
        if (isImageReady && canvasRef.current && ctx.current) {
            drawImageToCanvas();
        }
    }, [isImageReady, cuts, holes, drawings, texts, shapes, adj, activeFx, rotation, flipH, flipV, canvasW, canvasH, drawImageToCanvas]);

    // 3. Initial Image Load
    useEffect(() => {
        if (open && currentImage && loadedSrcRef.current !== currentImage) {
            loadedSrcRef.current = currentImage;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const nw = img.naturalWidth, nh = img.naturalHeight;
                setCanvasW(nw); setCanvasH(nh);
                setRotation(0); setFlipH(false); setFlipV(false);
                setAdj({ br: 0, co: 0, sa: 0, sh: 0 }); setActiveFx(null);
                setDrawings([]); setTexts([]); setSelTxt(null); setEditTxt(null); setHoles([]);
                setCuts([]); // No floating layers—image baked into baseCanvasRef

                // Bake the main image directly into the permanent base canvas
                if (!baseCanvasRef.current) baseCanvasRef.current = document.createElement('canvas');
                baseCanvasRef.current.width = nw;
                baseCanvasRef.current.height = nh;
                const bctx = baseCanvasRef.current.getContext('2d');
                bctx.fillStyle = '#ffffff';
                bctx.fillRect(0, 0, nw, nh);
                bctx.drawImage(img, 0, 0, nw, nh);
                bgDataRef.current = baseCanvasRef.current.toDataURL(); // Save for restoration

                const initialHistory = {
                    label: 'Image Loaded', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    drawings: [], texts: [], adj: { br: 0, co: 0, sa: 0, sh: 0 }, rotation: 0, flipH: false, flipV: false, activeFx: null, isImageReady: true,
                    cuts: [], holes: [], canvasW: nw, canvasH: nh,
                    bgData: baseCanvasRef.current.toDataURL()
                };
                setHistory([initialHistory]);
                setHistIdx(0); hIdxRef.current = 0;
                setIsImageReady(true);
            };
            img.src = currentImage;
        }
    }, [open, currentImage]);
    useEffect(() => {
        const isDragging = canvasResizing || resizeDrag || rotDrag || shapeDrag || shapeCreateDrag || txtDrag || cropDrag || cutDrag || isDrawing;
        if (!isDragging) return;

        const onMove = (e) => { e.preventDefault(); handleMouseMove(e); };
        const onUp = (e) => { e.preventDefault(); handleMouseUp(); };

        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        return () => {
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [canvasResizing, resizeDrag, rotDrag, shapeDrag, shapeCreateDrag, txtDrag, cropDrag, cutDrag, isDrawing, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); undo(); }
                else if (e.key === 'y' || (e.key === 'Z' && e.shiftKey)) { e.preventDefault(); redo(); }
                else if (e.key === 'x') { e.preventDefault(); handleKeyCut(); }
                else if (e.key === 'v' && isImageReady) { e.preventDefault(); handleKeyPaste(); }
            }
            if (e.key === 'Enter') {
                if (cropMode && crop.w !== 0 && crop.h !== 0) { e.preventDefault(); handleApplyCrop(); }
                else if (cutMode && cut.w !== 0 && cut.h !== 0) { e.preventDefault(); handleApplyCut(); }
            }
            if (e.key === 'Escape' && (cropMode || cutMode)) {
                setCropMode(false);
                setCutMode(false);
                setCrop({ x: 0, y: 0, w: 0, h: 0 });
                setCut({ x: 0, y: 0, w: 0, h: 0 });
            }
        };

        const handlePasteRaw = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    loadFile(blob);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePasteRaw);

        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) handleZoom('in');
                else handleZoom('out');
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePasteRaw);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [undo, redo, cropMode, crop, cutMode, cut, handleApplyCrop, handleApplyCut, handleKeyCut, handleKeyPaste, isImageReady, loadFile, handleZoom]);

    return {
        canvasRef, txtEditorRef, cwRef, currentImage, isImageReady, tab, setTab, drawMode, setDrawMode, textMode, setTextMode, cropMode, setCropMode,
        adj, setAdj, activeFx, setActiveFx, brushColor, setBrushColor, brushSize, setBrushSize, brushOpacity, setBrushOpacity,
        rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
        crop, setCrop, texts, setTexts, selTxt, setSelTxt, editTxt, setEditTxt, history, setHistory, histIdx, setHistIdx, drawings, setDrawings,
        shapeMode, setShapeMode, shapes, setShapes, selShape, setSelShape,
        cutMode, setCutMode, cut, setCut, cuts, setCuts, selCut, setSelCut, updateHoles: setHoles,
        canvasW, canvasH, zoom,
        handleMouseDown, handleMouseMove, handleMouseUp, handleApplyCrop, handleApplyCut, handleAddText, handleAddShape, handleTextDblClick, handleRotate, handleFlipH, handleFlipV, handleFileFunc,
        handleApplyFilter, undo, redo, pushHistory, fitCanvas, getTextBB, getShapeBB, getCutBB, removeImage, handleZoom
    };
};
