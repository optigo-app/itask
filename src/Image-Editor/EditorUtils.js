export const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

export const defStyle = () => ({
    font: 'DM Sans',
    size: 32,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    upper: false,
    align: 'center',
    color: '#000000',
    strokeColor: '#000000',
    strokeW: 0,
    shadowColor: '#000000',
    shadowBlur: 0,
    shadowX: 0,
    shadowY: 0,
    letterSpacing: 0,
    lineH: 1.2,
    opacity: 1,
    wrapW: 0,
});

export const defShapeStyle = () => ({
    type: 'rectangle', // rectangle, circle, triangle, star
    fill: '#7367f0',
    stroke: '#000000',
    strokeW: 0,
    opacity: 1,
    shadowColor: '#000000',
    shadowBlur: 0,
    shadowX: 0,
    shadowY: 0,
    borderRadius: 0, // for rectangles
});
