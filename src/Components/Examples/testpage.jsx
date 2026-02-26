import { useState, useRef, useEffect, useCallback } from "react";
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Download, Eye, Rocket, Plus,
  Layers, LayoutTemplate, Grip, Trash2, Copy, ChevronUp, ChevronDown,
  ChevronRight, ChevronDown as ChevDown, Search, X, Check, Star, MapPin,
  Phone, Mail, Clock, Globe, Shield, FileText, HelpCircle, Lock, Users,
  Zap, BarChart2, Settings, Image, AlignLeft, Columns, Minus, Square,
  Navigation, Megaphone, Video, MessageSquare, DollarSign, Tag, Layout,
  ArrowRight, Facebook, Twitter, Linkedin, Github, Instagram, Youtube,
  Menu, SlidersHorizontal, Type, Palette, Move, AlertCircle, Info,
  BookOpen, Scale, Cookie, Bell, Award, Heart, TrendingUp, Building2,
  Send, ExternalLink, MousePointer2, Sparkles, Code, Database, RefreshCw,
  ChevronsRight
} from "lucide-react";

// ─── TOKENS ─────────────────────────────────────────────────────────────────
const T = {
  bg: "#07070C",
  surface: "#0D0D16",
  surface2: "#121220",
  hover: "#181828",
  border: "#1C1C2E",
  border2: "#262638",
  accent: "#7B68EE",
  accentHover: "#9585FF",
  accentDim: "rgba(123,104,238,0.12)",
  accentGlow: "rgba(123,104,238,0.22)",
  text: "#E0E0EE",
  muted: "#58587A",
  muted2: "#32324A",
  green: "#22D3A3",
  red: "#F05070",
  yellow: "#FBBF24",
  orange: "#FB923C",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:${T.bg};color:${T.text};overflow:hidden}
button,select,input,textarea{font-family:inherit}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${T.border2};border-radius:9px}
::-webkit-scrollbar-thumb:hover{background:${T.accent}}

/* LAYOUT */
.shell{display:flex;flex-direction:column;height:100vh;width:100vw;overflow:hidden}
.body{display:flex;flex:1;overflow:hidden;padding-top:52px}

/* TOPBAR */
.topbar{
  position:fixed;top:0;left:0;right:0;height:52px;z-index:300;
  background:rgba(7,7,12,0.97);backdrop-filter:blur(20px);
  border-bottom:1px solid ${T.border};
  display:flex;align-items:center;padding:0 12px;gap:6px
}
.logo{
  font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
  background:linear-gradient(135deg,#9585FF,${T.green});
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  letter-spacing:-0.4px;margin-right:6px;white-space:nowrap
}
.tsep{width:1px;height:20px;background:${T.border};margin:0 3px;flex-shrink:0}
.tbtn{
  height:30px;padding:0 10px;border-radius:7px;border:1px solid ${T.border};
  background:transparent;color:${T.muted};cursor:pointer;font-size:12px;font-weight:500;
  display:flex;align-items:center;gap:5px;transition:all 0.15s;white-space:nowrap;flex-shrink:0
}
.tbtn:hover{background:${T.hover};color:${T.text};border-color:${T.border2}}
.tbtn.prim{background:${T.accent};color:#fff;border-color:${T.accent};font-weight:600}
.tbtn.prim:hover{background:${T.accentHover};border-color:${T.accentHover}}
.tbtn.ghost{background:${T.accentDim};color:${T.accentHover};border-color:${T.accent}55}
.tbtn:disabled{opacity:0.35;cursor:not-allowed}
.tsp{flex:1}

.devgroup{display:flex;background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:2px;gap:1px}
.devbtn{height:24px;width:26px;background:transparent;border:none;cursor:pointer;border-radius:5px;color:${T.muted};display:flex;align-items:center;justify-content:center;transition:all 0.12s}
.devbtn.on{background:${T.accent};color:#fff}
.devbtn:hover:not(.on){background:${T.hover};color:${T.text}}

.ptabs{display:flex;align-items:center;gap:2px;background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:2px;max-width:340px;overflow:hidden}
.ptab{padding:3px 9px;border-radius:5px;font-size:11px;font-weight:500;cursor:pointer;color:${T.muted};transition:all 0.13s;white-space:nowrap}
.ptab.on{background:${T.accent};color:#fff}
.ptab:hover:not(.on){background:${T.hover};color:${T.text}}
.ptabadd{padding:3px 7px;border-radius:5px;font-size:11px;cursor:pointer;color:${T.muted};transition:all 0.13s;flex-shrink:0}
.ptabadd:hover{background:${T.hover};color:${T.green}}

/* LEFT PANEL */
.lpanel{
  width:252px;flex-shrink:0;background:${T.surface};border-right:1px solid ${T.border};
  display:flex;flex-direction:column;overflow:hidden
}
.ltabs{display:flex;border-bottom:1px solid ${T.border};flex-shrink:0}
.ltab{flex:1;padding:9px 2px;text-align:center;font-size:10px;font-weight:600;color:${T.muted};cursor:pointer;border-bottom:2px solid transparent;text-transform:uppercase;letter-spacing:0.7px;transition:all 0.13s}
.ltab.on{color:${T.accentHover};border-bottom-color:${T.accent}}
.ltab:hover:not(.on){color:${T.text}}
.lbody{flex:1;overflow-y:auto;padding:10px}

.sinput-wrap{position:relative;margin-bottom:10px}
.sinput{width:100%;padding:6px 10px 6px 30px;background:${T.bg};border:1px solid ${T.border};border-radius:7px;color:${T.text};font-size:12px;outline:none;transition:border-color 0.15s}
.sinput:focus{border-color:${T.accent}}
.sicon{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:${T.muted};pointer-events:none}

.catlabel{font-size:9px;font-weight:700;color:${T.muted2};text-transform:uppercase;letter-spacing:1.2px;padding:8px 4px 5px}
.wgrid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px}
.wcard{
  background:${T.bg};border:1px solid ${T.border};border-radius:8px;
  padding:9px 6px 8px;cursor:grab;transition:all 0.15s;
  display:flex;flex-direction:column;align-items:center;gap:4px;user-select:none
}
.wcard:hover{border-color:${T.accent};background:${T.accentDim};transform:translateY(-1px);box-shadow:0 4px 14px ${T.accentGlow}}
.wcard:active{cursor:grabbing;transform:scale(0.96)}
.wlabel{font-size:10px;color:${T.muted};text-align:center;font-weight:500}

.tplcard{background:${T.bg};border:1px solid ${T.border};border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.18s;margin-bottom:8px}
.tplcard:hover{border-color:${T.accent}55;transform:translateY(-2px);box-shadow:0 8px 24px ${T.accentGlow}}
.tplthumb{width:100%;height:88px;overflow:hidden}
.tplfoot{padding:8px 10px 10px}
.tplname{font-size:12px;font-weight:600;color:${T.text};margin-bottom:2px}
.tplcat{font-size:10px;color:${T.muted};margin-bottom:7px}
.tplbtn{display:block;width:100%;padding:5px;background:${T.accent};color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;transition:background 0.13s}
.tplbtn:hover{background:${T.accentHover}}

.layitem{
  display:flex;align-items:center;gap:7px;padding:6px 8px;border:1px solid ${T.border};border-radius:7px;
  margin-bottom:4px;cursor:pointer;transition:all 0.13s;background:${T.bg}
}
.layitem:hover{border-color:${T.border2};background:${T.hover}}
.layitem.on{border-color:${T.accent};background:${T.accentDim}}
.laytxt{font-size:11px;font-weight:500;color:${T.text};flex:1;text-transform:capitalize}
.laynum{font-size:10px;color:${T.muted}}

/* CANVAS */
.canvas-area{
  flex:1;overflow:auto;position:relative;
  background-image:radial-gradient(circle,${T.border} 1px,transparent 1px);
  background-size:22px 22px;background-color:#050508;
  display:flex;justify-content:center;align-items:flex-start;padding:28px 20px 100px
}
.cframe{background:#fff;position:relative;min-height:600px;transition:width 0.3s cubic-bezier(.4,0,.2,1);box-shadow:0 0 0 1px rgba(255,255,255,0.07),0 40px 100px rgba(0,0,0,0.65)}
.cframe.desktop{width:100%;max-width:1240px}
.cframe.tablet{width:768px}
.cframe.mobile{width:390px}

.empty-cv{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:80px 32px;min-height:480px}
.empty-icon{opacity:0.12}
.empty-txt{font-size:13px;color:${T.muted};text-align:center;line-height:1.7;opacity:0.6}
.empty-cta{padding:9px 22px;background:${T.accent};color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s}
.empty-cta:hover{background:${T.accentHover}}

/* Section wrapper */
.swrap{position:relative;width:100%}
.swrap:hover .stbar{opacity:1}
.swrap.sel{outline:2px solid ${T.accent};outline-offset:-2px}
.swrap:hover:not(.sel){outline:2px dashed ${T.accent}44;outline-offset:-2px}

.stbar{
  position:absolute;top:-36px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:2px;opacity:0;transition:opacity 0.15s;
  background:${T.surface};border:1px solid ${T.border};border-radius:8px;
  padding:3px 5px;z-index:60;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:all
}
.swrap.sel .stbar{opacity:1}
.stbtn{width:26px;height:26px;background:transparent;border:none;border-radius:5px;cursor:pointer;color:${T.muted};display:flex;align-items:center;justify-content:center;transition:all 0.12s}
.stbtn:hover{background:${T.hover};color:${T.text}}
.stbtn.del:hover{background:${T.red}22;color:${T.red}}
.stbtn.dup:hover{background:${T.green}22;color:${T.green}}
.stsep{width:1px;height:14px;background:${T.border};margin:0 2px}
.stname{font-size:10px;color:${T.muted};padding:0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}

.dropzone{height:0;overflow:hidden;transition:height 0.15s;margin:0 16px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600}
.dropzone.over{height:44px;background:${T.accentDim};border:2px dashed ${T.accent};color:${T.accent}}
.bdrop{min-height:40px}

/* RIGHT PANEL */
.rpanel{
  width:276px;flex-shrink:0;background:${T.surface};border-left:1px solid ${T.border};
  display:flex;flex-direction:column;overflow:hidden
}
.rphd{padding:11px 14px;border-bottom:1px solid ${T.border};flex-shrink:0;display:flex;align-items:center;gap:8px}
.rptitle{font-size:13px;font-weight:700;color:${T.text};font-family:'Syne',sans-serif}
.rpsub{font-size:10px;color:${T.muted};margin-top:1px}
.rpbody{flex:1;overflow-y:auto}

.pg{border-bottom:1px solid ${T.border}}
.pghd{padding:9px 14px;font-size:10px;font-weight:700;color:${T.muted};text-transform:uppercase;letter-spacing:0.8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:color 0.12s}
.pghd:hover{color:${T.text}}
.pgbd{padding:6px 14px 12px}
.pr{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.pr:last-child{margin-bottom:0}
.pl{font-size:11px;color:${T.muted};min-width:70px;flex-shrink:0}
.pinput{flex:1;padding:5px 8px;background:${T.bg};border:1px solid ${T.border};border-radius:6px;color:${T.text};font-size:12px;outline:none;transition:border-color 0.13s}
.pinput:focus{border-color:${T.accent}}
.pinput[type=color]{padding:2px 3px;height:28px;cursor:pointer}
.pinput[type=range]{padding:0;background:none;border:none;accent-color:${T.accent};cursor:pointer}
.psel{flex:1;padding:5px 8px;background:${T.bg};border:1px solid ${T.border};border-radius:6px;color:${T.text};font-size:12px;outline:none;cursor:pointer}
.pta{flex:1;padding:5px 8px;background:${T.bg};border:1px solid ${T.border};border-radius:6px;color:${T.text};font-size:12px;outline:none;resize:vertical;min-height:56px;transition:border-color 0.13s}
.pta:focus{border-color:${T.accent}}
.pval{font-size:10px;color:${T.muted};min-width:24px;text-align:right}
.pfull{width:100%;margin-bottom:7px}

.swatches{display:flex;gap:4px;flex-wrap:wrap}
.sw{width:20px;height:20px;border-radius:5px;cursor:pointer;transition:transform 0.1s;border:2px solid transparent;flex-shrink:0}
.sw:hover{transform:scale(1.25)}
.sw.on{border-color:#fff;box-shadow:0 0 0 1px ${T.accent}}

.togrow{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.toglbl{font-size:11px;color:${T.muted}}
.tog{width:32px;height:17px;border-radius:99px;border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
.tog::after{content:'';width:13px;height:13px;border-radius:50%;background:#fff;position:absolute;top:2px;transition:left 0.2s}
.tog.on{background:${T.accent}}
.tog.on::after{left:17px}
.tog.off{background:${T.muted2}}
.tog.off::after{left:2px}

.addibtn{width:100%;padding:6px;border:1px dashed ${T.border2};border-radius:6px;background:transparent;color:${T.muted};font-size:11px;cursor:pointer;transition:all 0.13s;display:flex;align-items:center;justify-content:center;gap:4px;margin-top:6px}
.addibtn:hover{border-color:${T.accent};color:${T.accentHover};background:${T.accentDim}}
.ited{background:${T.bg};border:1px solid ${T.border};border-radius:7px;padding:8px;margin-bottom:6px;position:relative}
.idel{position:absolute;top:5px;right:5px;width:18px;height:18px;background:${T.red}22;border:none;border-radius:4px;color:${T.red};font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center}

.nosel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px 14px}
.nosel-txt{font-size:12px;color:${T.muted};text-align:center;line-height:1.6}

/* MODAL */
.ovl{position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:500;display:flex;align-items:center;justify-content:center;animation:fi 0.2s}
@keyframes fi{from{opacity:0}}
.modal{background:${T.surface};border:1px solid ${T.border};border-radius:16px;width:940px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column;animation:su 0.22s ease;overflow:hidden}
@keyframes su{from{opacity:0;transform:translateY(18px)}}
.modal-hd{padding:18px 22px;border-bottom:1px solid ${T.border};display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0}
.modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:${T.text}}
.modal-sub{font-size:12px;color:${T.muted};margin-top:3px}
.modal-close{width:30px;height:30px;border-radius:8px;border:1px solid ${T.border};background:transparent;color:${T.muted};cursor:pointer;display:flex;align-items:center;justify-content:center}
.modal-close:hover{background:${T.hover};color:${T.text}}
.modal-body{flex:1;overflow-y:auto;padding:20px 22px}
.modal-ft{padding:14px 22px;border-top:1px solid ${T.border};display:flex;justify-content:flex-end;gap:8px;flex-shrink:0}
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.tcard{border:2px solid ${T.border};border-radius:12px;overflow:hidden;cursor:pointer;transition:all 0.18s}
.tcard:hover{border-color:${T.accent}55;transform:translateY(-2px)}
.tcard.on{border-color:${T.accent}}
.tthumb{height:140px;overflow:hidden}
.tinfo{padding:10px 12px}
.tname{font-size:13px;font-weight:600;color:${T.text}}
.tdesc{font-size:11px;color:${T.muted};margin-top:2px}

/* TOAST */
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:${T.surface};border:1px solid ${T.accent}44;color:${T.text};padding:9px 18px;border-radius:9px;font-size:13px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:tin 0.25s ease;white-space:nowrap}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(8px)}}

/* INLINE EDITABLE */
[contenteditable]{outline:none;cursor:text}
[contenteditable]:focus{box-shadow:0 0 0 2px ${T.accent};border-radius:3px}
[contenteditable]:hover:not(:focus){box-shadow:0 0 0 1.5px ${T.accent}55;border-radius:3px}

/* ────── SECTION CANVAS STYLES ────── */
/* shared */
.s-tag{display:inline-block;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px}
.s-h1{font-size:56px;font-weight:800;line-height:1.08;letter-spacing:-1.5px;margin-bottom:16px}
.s-h2{font-size:36px;font-weight:800;line-height:1.15;letter-spacing:-0.5px;margin-bottom:12px}
.s-p{font-size:16px;line-height:1.7;max-width:540px;margin:0 auto 30px}
.s-center{text-align:center}
.s-hd{text-align:center;margin-bottom:48px}
.s-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.s-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.s-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.s-card{padding:24px;border-radius:14px;border:1px solid}
.s-px{padding-left:48px;padding-right:48px}
.s-py{padding-top:72px;padding-bottom:72px}
.s-sec{padding:72px 48px}
.s-btn{padding:13px 28px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:8px}
.s-btnout{padding:12px 26px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;background:transparent;border:2px solid;display:inline-flex;align-items:center;gap:8px}
`;

// ─── LUCIDE ICON MAP ─────────────────────────────────────────────────────────
const ICONS = {
  navbar: Navigation, banner: Megaphone, hero: Sparkles, video: Video,
  features: Zap, stats: BarChart2, richtext: AlignLeft, gallery: Image,
  testimonials: MessageSquare, logos: Tag, team: Users, faq: HelpCircle,
  pricing: DollarSign, cta: Rocket, contact: Mail, map: MapPin,
  divider: Minus, spacer: Square, footer: Layout,
  // static pages
  "privacy-page": Lock, "terms-page": Scale, "faq-page": HelpCircle,
  "about-page": Building2, "blog-page": BookOpen, "404-page": AlertCircle,
  "cookie-page": Cookie, "changelog-page": RefreshCw,
};

const WIcon = ({ type, size = 16, color }) => {
  const C = ICONS[type] || FileText;
  return <C size={size} color={color} strokeWidth={1.8} />;
};

// ─── WIDGET CATALOG ──────────────────────────────────────────────────────────
const WIDGETS = {
  Navigation: [
    { id: "navbar", label: "Navbar" },
    { id: "banner", label: "Announce" },
  ],
  Hero: [
    { id: "hero", label: "Hero" },
    { id: "video", label: "Video" },
  ],
  Content: [
    { id: "features", label: "Features" },
    { id: "stats", label: "Stats" },
    { id: "richtext", label: "Rich Text" },
    { id: "gallery", label: "Gallery" },
    { id: "logos", label: "Logo Cloud" },
  ],
  Social: [
    { id: "testimonials", label: "Testimonials" },
    { id: "team", label: "Team" },
    { id: "faq", label: "FAQ" },
  ],
  Commerce: [
    { id: "pricing", label: "Pricing" },
    { id: "cta", label: "CTA" },
  ],
  Contact: [
    { id: "contact", label: "Contact" },
    { id: "map", label: "Map" },
  ],
  Utilities: [
    { id: "divider", label: "Divider" },
    { id: "spacer", label: "Spacer" },
    { id: "footer", label: "Footer" },
  ],
};

// Static pages palette
const STATIC_PAGES_CATALOG = [
  { id: "faq-page", label: "FAQ Page" },
  { id: "privacy-page", label: "Privacy" },
  { id: "terms-page", label: "Terms" },
  { id: "about-page", label: "About Us" },
  { id: "404-page", label: "404 Page" },
  { id: "cookie-page", label: "Cookies" },
  { id: "changelog-page", label: "Changelog" },
  { id: "blog-page", label: "Blog Index" },
];

// ─── TEMPLATES ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "saas-dark", name: "SaaS Dark", cat: "SaaS", desc: "Modern dark theme for software products",
    theme: { bg: "#0A0A14", text: "#E8E8F2", muted: "#6868A0", accent: "#6C5CE7", card: "#12122A", border: "#1E1E38", radius: "14px" },
    sections: ["navbar", "hero", "logos", "features", "stats", "pricing", "testimonials", "faq", "cta", "footer"],
  },
  {
    id: "saas-light", name: "SaaS Light", cat: "SaaS", desc: "Clean B2B light theme",
    theme: { bg: "#FFFFFF", text: "#1E1E3F", muted: "#888899", accent: "#7C3AED", card: "#F8F7FF", border: "#E5E4F2", radius: "12px" },
    sections: ["navbar", "hero", "logos", "features", "pricing", "faq", "cta", "footer"],
  },
  {
    id: "startup", name: "Startup", cat: "Startup", desc: "Bold and energetic startup landing",
    theme: { bg: "#FFFFFF", text: "#0F172A", muted: "#64748B", accent: "#0EA5E9", card: "#F1F5F9", border: "#E2E8F0", radius: "12px" },
    sections: ["navbar", "hero", "logos", "features", "stats", "cta", "footer"],
  },
  {
    id: "agency", name: "Agency", cat: "Creative", desc: "Bold agency / studio page",
    theme: { bg: "#FFF8F0", text: "#1A0800", muted: "#9A7060", accent: "#FF4500", card: "#FFE8D6", border: "#FFCFB0", radius: "8px" },
    sections: ["navbar", "hero", "gallery", "features", "team", "testimonials", "cta", "footer"],
  },
  {
    id: "portfolio", name: "Portfolio", cat: "Portfolio", desc: "Elegant personal showcase",
    theme: { bg: "#0D0D12", text: "#F5F5F5", muted: "#6B6B8A", accent: "#FFBA00", card: "#18181F", border: "#252530", radius: "12px" },
    sections: ["navbar", "hero", "gallery", "stats", "testimonials", "contact", "footer"],
  },
  {
    id: "ecommerce", name: "E-Commerce", cat: "Commerce", desc: "Conversion-focused store page",
    theme: { bg: "#FAFAFA", text: "#111827", muted: "#6B7280", accent: "#059669", card: "#F3F4F6", border: "#E5E7EB", radius: "10px" },
    sections: ["navbar", "banner", "hero", "logos", "features", "stats", "pricing", "testimonials", "cta", "footer"],
  },
];

// ─── CONTENT DEFAULTS ────────────────────────────────────────────────────────
function dflt(type) {
  const D = {
    navbar: { logo: "ACME", links: ["Product", "Features", "Pricing", "Docs"], cta: "Get started", ctaSecondary: "Sign in", showSecondary: true },
    banner: { text: "🎉 We just raised our Series A — read the announcement", cta: "Read more →" },
    hero: { badge: "✦ Now in public beta", title: "Build anything.\nLaunch faster.", subtitle: "The modern platform for teams who move fast. Design, build, and ship products your users will love.", cta1: "Start for free", cta2: "See demo →", showImage: true, imagePlaceholder: "🖥️" },
    video: { tag: "Product Tour", title: "See how it works", subtitle: "Watch a 3-minute overview of the platform", thumbnail: "🎬" },
    features: { tag: "Features", title: "Everything you need", subtitle: "Powerful tools that simplify your workflow and supercharge your team's output.", cols: 3, items: [
      { icon: "⚡", title: "Blazing Fast", desc: "Optimized from the ground up with sub-100ms response times globally." },
      { icon: "🔒", title: "Secure by Default", desc: "SOC 2 Type II, GDPR compliant with zero-trust architecture built in." },
      { icon: "🎨", title: "Fully Customizable", desc: "Tweak every aspect to match your brand without touching a line of code." },
      { icon: "🔗", title: "100+ Integrations", desc: "Connect to all your favorite tools with one-click integrations." },
      { icon: "📈", title: "Advanced Analytics", desc: "Real-time insights with beautiful charts and exportable reports." },
      { icon: "🤝", title: "Team Collaboration", desc: "Work together in real-time with shared workspaces and roles." },
    ]},
    stats: { tag: "By the numbers", title: "Trusted at scale", items: [
      { number: "150K+", label: "Active Users", desc: "Across 180+ countries" },
      { number: "4.9★", label: "Avg Rating", desc: "On G2 and Capterra" },
      { number: "99.9%", label: "Uptime SLA", desc: "Enterprise guaranteed" },
      { number: "$2.4B", label: "Value Created", desc: "For our customers" },
    ]},
    cta: { tag: "Get started today", title: "Ready to transform\nyour workflow?", subtitle: "Join 150,000+ teams. No credit card required.", cta1: "Start free trial", cta2: "Schedule demo", note: "Free plan available · Setup in 5 min · Cancel anytime" },
    testimonials: { tag: "Testimonials", title: "Loved by teams worldwide", items: [
      { text: "This completely changed how our team works. We ship 3× faster and quality has never been higher.", name: "Sarah Kim", role: "CTO at LayerLab", avatar: "SK", stars: 5 },
      { text: "The interface is so intuitive our team was up and running in minutes. No training needed.", name: "Marcus Torres", role: "Design Lead at Novo", avatar: "MT", stars: 5 },
      { text: "Best ROI we've seen from any tool. Within 2 months we 5× our investment back.", name: "Priya Nair", role: "Head of Growth at Kova", avatar: "PN", stars: 5 },
    ]},
    pricing: { tag: "Pricing", title: "Simple, honest pricing", subtitle: "One price. No hidden fees. No surprises.", plans: [
      { name: "Starter", price: "$0", period: "free forever", badge: "", features: ["5 projects", "2 teammates", "5GB storage", "Basic analytics", "Community support"], cta: "Get started free", featured: false },
      { name: "Pro", price: "$29", period: "per month", badge: "Most popular", features: ["Unlimited projects", "10 teammates", "50GB storage", "Advanced analytics", "Priority support", "Custom domains"], cta: "Start free trial", featured: true },
      { name: "Enterprise", price: "Custom", period: "contact us", badge: "", features: ["Everything in Pro", "Unlimited seats", "SSO & SAML", "SLA guarantee", "Dedicated CSM"], cta: "Contact sales", featured: false },
    ]},
    logos: { tag: "Trusted by companies of all sizes", logos: ["Stripe", "Notion", "Linear", "Vercel", "Figma", "GitHub", "Slack", "Loom"] },
    team: { tag: "Team", title: "Meet the people behind the magic", cols: 4, members: [
      { name: "Alex Chen", role: "Co-Founder & CEO", avatar: "AC", bio: "Previously at Google. 10+ years building products people love." },
      { name: "Jamie Park", role: "Co-Founder & CTO", avatar: "JP", bio: "Ex-Meta engineer. Loves distributed systems and elegant UX." },
      { name: "Riley Walsh", role: "Head of Design", avatar: "RW", bio: "Award-winning designer with a passion for accessibility." },
      { name: "Jordan Lee", role: "Head of Growth", avatar: "JL", bio: "Helped scale 3 startups from 0 to 1M+ users." },
    ]},
    faq: { tag: "FAQ", title: "Frequently asked questions", items: [
      { q: "Is there a free plan?", a: "Yes! Our Starter plan is free forever with 5 projects, 2 teammates, and full core features. No credit card required.", open: false },
      { q: "How does billing work?", a: "We charge monthly or annually. Annual saves 20%. You can upgrade, downgrade, or cancel anytime from settings.", open: false },
      { q: "Can I import my existing data?", a: "Yes. We support CSV, JSON, and direct integrations with Notion, Airtable, Google Sheets, and 100+ more tools.", open: false },
      { q: "Do you offer enterprise pricing?", a: "Contact our sales team for custom pricing, SLA guarantees, dedicated support, and volume discounts.", open: false },
      { q: "Is my data secure?", a: "Security is our top priority. SOC 2 Type II certified, all data encrypted in transit and at rest.", open: false },
    ]},
    gallery: { tag: "Gallery", title: "See it in action", cols: 3, items: [
      { emoji: "🎨", label: "Design System", bg: "#E8D5FF" },
      { emoji: "📊", label: "Analytics Dashboard", bg: "#D5E8FF" },
      { emoji: "🚀", label: "Launch Center", bg: "#D5FFE8" },
      { emoji: "🔗", label: "Integrations Hub", bg: "#FFE8D5" },
      { emoji: "👥", label: "Team Workspace", bg: "#FFD5E8" },
      { emoji: "⚙️", label: "Settings & Config", bg: "#E8FFD5" },
    ]},
    contact: {
      tag: "Contact", title: "Get in touch", subtitle: "Have a question? Our team typically responds within 24 hours.",
      formTitle: "Send us a message",
      fields: [
        { label: "Full Name", type: "text", placeholder: "John Doe", required: true },
        { label: "Email Address", type: "email", placeholder: "john@example.com", required: true },
        { label: "Subject", type: "text", placeholder: "How can we help?", required: false },
        { label: "Message", type: "textarea", placeholder: "Tell us more...", required: true },
      ],
      submitText: "Send message",
      infoItems: [
        { icon: "mail", title: "Email", value: "hello@acme.com" },
        { icon: "phone", title: "Phone", value: "+1 (555) 000-0000" },
        { icon: "mappin", title: "Office", value: "123 Main Street\nSan Francisco, CA 94102" },
        { icon: "clock", title: "Hours", value: "Mon–Fri, 9am–6pm PST" },
      ],
    },
    map: {
      title: "Find us here", address: "123 Main Street, San Francisco, CA 94102",
      lat: 37.7749, lng: -122.4194, height: 380, zoom: 14,
      apiKey: "",
    },
    richtext: { content: "<h2>About Our Company</h2><p>We're a team of passionate builders dedicated to creating software that makes people's lives easier. Founded in 2020, we've grown from a two-person startup to a team of 50+ across three continents.</p><blockquote>\"Our mission is to democratize powerful tools and make them accessible to everyone.\"</blockquote><p>We believe that the best products come from deeply understanding user needs, shipping fast, and iterating based on real feedback.</p>" },
    divider: { style: "solid", thickness: 1, margins: 48 },
    spacer: { height: 64 },
    footer: {
      brand: "ACME", tagline: "Building the future, one product at a time.",
      cols: [
        { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "Documentation"] },
        { title: "Company", links: ["About", "Blog", "Careers", "Press", "Partners"] },
        { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Licenses"] },
      ],
      socials: ["twitter", "github", "linkedin"],
      copyright: "© 2024 ACME Inc. All rights reserved.",
      footnote: "Made with ❤️ in San Francisco",
    },
    // ── STATIC PAGES ──
    "faq-page": {
      pageTitle: "Frequently Asked Questions",
      pageSubtitle: "Everything you need to know about our product and billing.",
      categories: [
        { name: "Getting Started", items: [
          { q: "How do I create an account?", a: "Click 'Get started' on our homepage, enter your email, and follow the setup wizard. It takes less than 2 minutes." },
          { q: "Is there a free trial?", a: "Yes! All paid plans come with a 14-day free trial. No credit card required." },
          { q: "How do I invite my team?", a: "Go to Settings → Team → Invite Members. Enter email addresses and choose roles." },
        ]},
        { name: "Billing & Plans", items: [
          { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, AmEx), PayPal, and wire transfers for Enterprise plans." },
          { q: "Can I change my plan anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
          { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee on all paid plans." },
        ]},
        { name: "Technical", items: [
          { q: "What integrations do you support?", a: "We support 100+ integrations including Slack, Notion, GitHub, Jira, Google Workspace, and many more." },
          { q: "Is there an API?", a: "Yes! Our REST API is available on Pro and Enterprise plans with comprehensive documentation." },
          { q: "What's your uptime SLA?", a: "We guarantee 99.9% uptime on Pro plans and 99.99% on Enterprise plans." },
        ]},
      ],
    },
    "privacy-page": {
      pageTitle: "Privacy Policy", lastUpdated: "January 1, 2024",
      intro: "At ACME, we take your privacy seriously. This policy describes what data we collect, how we use it, and your rights.",
      sections: [
        { title: "1. Information We Collect", content: "We collect information you provide directly (name, email, payment info), information generated through product use (usage data, preferences), and technical data (IP address, device info, cookies)." },
        { title: "2. How We Use Your Information", content: "We use collected information to provide and improve our services, send product updates and marketing (with consent), process payments, provide customer support, and comply with legal obligations." },
        { title: "3. Data Sharing", content: "We do not sell your personal data. We share data only with service providers who help us operate our platform, when required by law, or with your explicit consent." },
        { title: "4. Data Security", content: "We use industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest. We conduct regular security audits and penetration testing." },
        { title: "5. Your Rights", content: "You have the right to access, correct, export, or delete your data at any time. For GDPR users in the EU/EEA, additional rights apply including the right to object to processing." },
        { title: "6. Cookies", content: "We use essential cookies for authentication and security, analytical cookies (with consent) to improve our product, and marketing cookies (with consent) for targeted advertising." },
        { title: "7. Contact Us", content: "For privacy-related questions, contact our Data Protection Officer at privacy@acme.com or write to us at 123 Main Street, San Francisco, CA 94102." },
      ],
    },
    "terms-page": {
      pageTitle: "Terms of Service", lastUpdated: "January 1, 2024",
      intro: "These Terms govern your use of ACME's services. By using our platform, you agree to these terms.",
      sections: [
        { title: "1. Acceptance of Terms", content: "By accessing or using ACME's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use our services." },
        { title: "2. Account Terms", content: "You must be 18 years or older to use this service. You are responsible for maintaining the security of your account and all activities that occur under it." },
        { title: "3. Payment Terms", content: "Paid plans are billed in advance on a monthly or annual basis. Refunds are available within 30 days of purchase. Prices may change with 30 days' notice." },
        { title: "4. Intellectual Property", content: "ACME retains all rights to our platform and services. You retain ownership of your data and content. You grant us a limited license to host and process your content to provide our services." },
        { title: "5. Prohibited Uses", content: "You may not use ACME for illegal purposes, to harm others, to send spam, to reverse engineer our software, or to exceed reasonable usage limits. Violations may result in account termination." },
        { title: "6. Limitation of Liability", content: "ACME's liability is limited to the amount you paid us in the 12 months preceding any claim. We are not liable for indirect, incidental, or consequential damages." },
        { title: "7. Governing Law", content: "These Terms are governed by the laws of the State of California without regard to conflict of law provisions. Disputes will be resolved in San Francisco, CA." },
      ],
    },
    "about-page": {
      pageTitle: "About Us",
      heroTitle: "We're building the future\nof work", heroSubtitle: "ACME was founded in 2020 with one mission: make powerful tools accessible to every team, no matter their size.",
      stats: [{ number: "150K+", label: "Users" }, { number: "50+", label: "Team members" }, { number: "180", label: "Countries" }, { number: "2020", label: "Founded" }],
      story: "It started with a simple observation: the most powerful tools were only available to large enterprises with big budgets. We set out to change that.\n\nToday, ACME helps teams of every size move faster, collaborate better, and build products their users love. From two founders in a garage to a team of 50+ across three continents, we've never lost sight of that original mission.\n\nWe're backed by the world's leading investors and trusted by teams at companies ranging from two-person startups to Fortune 500 enterprises.",
      values: [
        { icon: "🚀", title: "Move fast", desc: "We ship quickly, learn from feedback, and iterate constantly. Speed is a feature." },
        { icon: "🤝", title: "Customer obsessed", desc: "Every decision starts with the customer. We build what people actually need, not what we think they want." },
        { icon: "🌍", title: "Inclusive by design", desc: "Great products work for everyone. We build with accessibility and global users in mind from day one." },
        { icon: "🔒", title: "Security first", desc: "Your data is sacred. We take security seriously and never compromise on protecting what you've entrusted to us." },
      ],
      teamTitle: "Leadership",
    },
    "404-page": {
      title: "Page not found", subtitle: "Sorry, we couldn't find the page you're looking for.", ctaText: "Go back home", ctaSecondary: "Contact support", illustration: "404",
    },
    "cookie-page": {
      pageTitle: "Cookie Policy", lastUpdated: "January 1, 2024",
      intro: "This Cookie Policy explains how ACME uses cookies and similar tracking technologies on our website.",
      cookieTypes: [
        { name: "Essential Cookies", required: true, desc: "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions you take such as logging in or filling in forms.", examples: "Session cookies, Authentication tokens, CSRF tokens" },
        { name: "Analytics Cookies", required: false, desc: "These help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve the user experience.", examples: "Google Analytics, Mixpanel, Amplitude" },
        { name: "Marketing Cookies", required: false, desc: "These cookies are used to track visitors across websites to display relevant and engaging advertisements. They may be set by us or by third-party advertising partners.", examples: "Facebook Pixel, Google Ads, LinkedIn Insight Tag" },
        { name: "Preference Cookies", required: false, desc: "These allow the website to remember information that changes the way it behaves or looks, such as your preferred language or region.", examples: "Language preference, Theme (dark/light), Region settings" },
      ],
    },
    "changelog-page": {
      pageTitle: "Changelog", pageSubtitle: "Stay up to date with everything new in ACME.",
      entries: [
        { version: "v2.4.0", date: "December 2024", badge: "Latest", items: [
          { type: "new", text: "AI-powered analytics with natural language queries" },
          { type: "new", text: "New dashboard widget library with 40+ components" },
          { type: "improved", text: "Reduced page load time by 40% with edge caching" },
          { type: "fixed", text: "Fixed CSV export encoding issue for non-ASCII characters" },
        ]},
        { version: "v2.3.0", date: "November 2024", badge: "", items: [
          { type: "new", text: "Real-time collaboration with live cursors" },
          { type: "new", text: "Slack and Microsoft Teams integration" },
          { type: "improved", text: "Redesigned onboarding flow — 30% higher completion" },
        ]},
        { version: "v2.2.0", date: "October 2024", badge: "", items: [
          { type: "new", text: "Custom domain support for all Pro plans" },
          { type: "improved", text: "Mobile app performance improvements" },
          { type: "fixed", text: "Fixed timezone issues in scheduled reports" },
          { type: "fixed", text: "Fixed drag-and-drop in Firefox" },
        ]},
      ],
    },
    "blog-page": {
      pageTitle: "Blog", pageSubtitle: "Insights, updates, and stories from the ACME team.",
      categories: ["All", "Product", "Engineering", "Design", "Company"],
      posts: [
        { title: "How We Reduced Load Time by 40% Using Edge Caching", cat: "Engineering", date: "Dec 18, 2024", read: "8 min read", emoji: "⚡", excerpt: "A deep dive into our edge caching strategy and the performance gains we achieved." },
        { title: "Designing for Accessibility: Lessons Learned at Scale", cat: "Design", date: "Dec 10, 2024", read: "6 min read", emoji: "🎨", excerpt: "How accessibility became a core pillar of our design system, not an afterthought." },
        { title: "Why We Bet on Real-time Collaboration", cat: "Product", date: "Dec 3, 2024", read: "5 min read", emoji: "🤝", excerpt: "The story behind our decision to rebuild our collaboration architecture from scratch." },
        { title: "ACME Raises $50M Series A to Scale Global Operations", cat: "Company", date: "Nov 28, 2024", read: "3 min read", emoji: "🚀", excerpt: "We're thrilled to announce our Series A funding to accelerate global growth." },
        { title: "Building a Culture of Feedback at 50+ People", cat: "Company", date: "Nov 20, 2024", read: "7 min read", emoji: "💬", excerpt: "How we maintained our culture of honest, direct feedback as we scaled." },
        { title: "The Architecture Behind Our 99.9% Uptime SLA", cat: "Engineering", date: "Nov 15, 2024", read: "10 min read", emoji: "🏗️", excerpt: "A technical breakdown of the infrastructure choices that enable our reliability commitments." },
      ],
    },
  };
  return JSON.parse(JSON.stringify(D[type] || { title: type }));
}

// ─── GOOGLE MAPS COMPONENT ───────────────────────────────────────────────────
function GoogleMapEmbed({ lat, lng, zoom, height, address, apiKey, accent }) {
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Light map style
  const lightStyle = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  ];

  useEffect(() => {
    if (!apiKey) { setError(true); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = () => {
      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: lat || 37.7749, lng: lng || -122.4194 },
        zoom: zoom || 14,
        styles: lightStyle,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      new window.google.maps.Marker({
        position: { lat: lat || 37.7749, lng: lng || -122.4194 },
        map,
        title: address || "Our Office",
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: accent || "#7C3AED", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
      });
      setLoaded(true);
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
    return () => { delete window.initMap; };
  }, [apiKey, lat, lng, zoom]);

  if (!apiKey || error) {
    // Beautiful placeholder when no API key
    return (
      <div style={{
        width: "100%", height: height || 380,
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 14, position: "relative", overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Decorative map grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Roads */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="6"/>
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#cbd5e1" strokeWidth="4"/>
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#e2e8f0" strokeWidth="3"/>
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#e2e8f0" strokeWidth="2"/>
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#e2e8f0" strokeWidth="2"/>
          {/* Blocks */}
          <rect x="12%" y="12%" width="16%" height="15%" rx="3" fill="#dde6ef" opacity="0.7"/>
          <rect x="35%" y="12%" width="12%" height="15%" rx="3" fill="#dde6ef" opacity="0.7"/>
          <rect x="55%" y="12%" width="18%" height="15%" rx="3" fill="#dde6ef" opacity="0.7"/>
          <rect x="12%" y="35%" width="10%" height="28%" rx="3" fill="#dde6ef" opacity="0.5"/>
          <rect x="50%" y="56%" width="22%" height="18%" rx="3" fill="#dde6ef" opacity="0.7"/>
          <rect x="78%" y="35%" width="10%" height="22%" rx="3" fill="#dde6ef" opacity="0.5"/>
        </svg>
        {/* Pin */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50% 50% 50% 0", background: accent || "#7C3AED", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${(accent || "#7C3AED") + "44"}` }}>
            <MapPin size={22} color="#fff" style={{ transform: "rotate(45deg)" }} />
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{address || "Our Office"}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Add a Google Maps API key to show the real map</div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "San Francisco, CA")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: accent || "#7C3AED", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
          >
            <ExternalLink size={13} /> Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: "100%", height: height || 380 }} />;
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function ContactForm({ fields, submitText, accent, text, muted, card, border }) {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", background: card, borderRadius: 14, border: `1px solid ${border}` }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#22D3A322", border: `2px solid #22D3A3`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={24} color="#22D3A3" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: text, marginBottom: 8 }}>Message sent!</div>
        <div style={{ fontSize: 14, color: muted }}>We'll get back to you within 24 hours.</div>
        <button onClick={() => { setSubmitted(false); setValues({}); }} style={{ marginTop: 20, padding: "8px 20px", background: accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Send another</button>
      </div>
    );
  }

  return (
    <div style={{ background: card, borderRadius: 14, padding: "28px 24px", border: `1px solid ${border}` }}>
      {(fields || []).map((f, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: text, marginBottom: 6 }}>
            {f.label}{f.required && <span style={{ color: accent, marginLeft: 3 }}>*</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              placeholder={f.placeholder}
              value={values[i] || ""}
              onChange={e => setValues(v => ({ ...v, [i]: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1.5px solid ${border}`, background: "#fff", color: "#1e293b", fontSize: 14, minHeight: 100, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = border}
            />
          ) : (
            <input
              type={f.type} placeholder={f.placeholder}
              value={values[i] || ""}
              onChange={e => setValues(v => ({ ...v, [i]: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1.5px solid ${border}`, background: "#fff", color: "#1e293b", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = border}
            />
          )}
        </div>
      ))}
      <button
        onClick={() => setSubmitted(true)}
        style={{ width: "100%", padding: 13, background: accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
        onMouseOver={e => e.currentTarget.style.background = (accent + "DD")}
        onMouseOut={e => e.currentTarget.style.background = accent}
      >
        <Send size={16} /> {submitText || "Send message"}
      </button>
    </div>
  );
}

// ─── INFO ICON RESOLVER ──────────────────────────────────────────────────────
function CIcon({ name, ...props }) {
  const map = { mail: Mail, phone: Phone, mappin: MapPin, clock: Clock, globe: Globe };
  const C = map[name] || Mail;
  return <C {...props} />;
}

// ─── EDITABLE SPAN ──────────────────────────────────────────────────────────
function E({ children, onUpdate, tag: Tag = "span", multiline, style, className }) {
  const ref = useRef();
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={() => onUpdate && onUpdate(ref.current.innerText)}
      onKeyDown={e => { if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current.blur(); } }}
      style={{ outline: "none", cursor: "text", ...style }}
      className={className}
    >{children}</Tag>
  );
}

// ─── SECTION RENDERER ────────────────────────────────────────────────────────
function Sec({ section, theme: th, isSel, onClick, onUpdate, onDelete, onDup, onUp, onDown, canUp, canDown }) {
  const c = section.content;
  const a = th.accent, tx = th.text, mt = th.muted, bg = th.bg, ca = th.card || "#F8F8F8", bo = th.border || "#E5E5EA", r = th.radius || "12px";
  const [faqOpen, setFaqOpen] = useState({});

  const upd = (path, val) => onUpdate(section.id, path, val);

  const Wrap = ({ children }) => (
    <div className={`swrap${isSel ? " sel" : ""}`} onClick={onClick}>
      <div className="stbar" onClick={e => e.stopPropagation()}>
        <span className="stname"><WIcon type={section.type} size={11} color={T.muted} /> {section.type}</span>
        <div className="stsep" />
        {canUp && <button className="stbtn" onClick={onUp} title="Up"><ChevronUp size={13}/></button>}
        {canDown && <button className="stbtn" onClick={onDown} title="Down"><ChevronDown size={13}/></button>}
        <div className="stsep" />
        <button className="stbtn dup" onClick={onDup} title="Duplicate"><Copy size={13}/></button>
        <button className="stbtn del" onClick={onDelete} title="Delete"><Trash2 size={13}/></button>
      </div>
      {children}
    </div>
  );

  // ── NAVBAR ──
  if (section.type === "navbar") return (
    <Wrap><nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 48px",borderBottom:`1px solid ${bo}`,background:bg }}>
      <div style={{ fontSize:20,fontWeight:800,color:a }}><E onUpdate={v=>upd("logo",v)}>{c.logo}</E></div>
      <div style={{ display:"flex",gap:28 }}>{(c.links||[]).map((l,i)=><span key={i} style={{ fontSize:14,fontWeight:500,color:mt }}><E onUpdate={v=>{const ll=[...(c.links||[])];ll[i]=v;upd("links",ll)}}>{l}</E></span>)}</div>
      <div style={{ display:"flex",gap:10,alignItems:"center" }}>
        {c.showSecondary && <button style={{ padding:"7px 16px",borderRadius:8,border:`1.5px solid ${bo}`,background:"transparent",color:tx,fontSize:13,fontWeight:600,cursor:"pointer" }}><E onUpdate={v=>upd("ctaSecondary",v)}>{c.ctaSecondary}</E></button>}
        <button style={{ padding:"8px 18px",borderRadius:8,border:"none",background:a,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}><E onUpdate={v=>upd("cta",v)}>{c.cta}</E></button>
      </div>
    </nav></Wrap>
  );

  // ── BANNER ──
  if (section.type === "banner") return (
    <Wrap><div style={{ padding:"10px 48px",background:`${a}15`,borderBottom:`1px solid ${a}30`,display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap" }}>
      <span style={{ fontSize:13,fontWeight:600,color:tx }}><E onUpdate={v=>upd("text",v)}>{c.text}</E></span>
      <span style={{ color:a,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}><E onUpdate={v=>upd("cta",v)}>{c.cta}</E> <ArrowRight size={13}/></span>
    </div></Wrap>
  );

  // ── HERO ──
  if (section.type === "hero") return (
    <Wrap><div style={{ display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"100px 48px 80px",background:bg }}>
      <div style={{ display:"inline-flex",padding:"5px 14px",borderRadius:100,background:`${a}18`,color:a,border:`1px solid ${a}30`,fontSize:12,fontWeight:600,marginBottom:22 }}><E onUpdate={v=>upd("badge",v)}>{c.badge}</E></div>
      <h1 style={{ fontSize:56,fontWeight:800,lineHeight:1.08,color:tx,marginBottom:18,letterSpacing:"-1.5px" }}>
        {(c.title||"").split("\n").map((l,i,arr)=><span key={i}><E onUpdate={v=>{const ls=(c.title||"").split("\n");ls[i]=v;upd("title",ls.join("\n"))}}>{l}</E>{i<arr.length-1&&<br/>}</span>)}
      </h1>
      <p style={{ fontSize:18,lineHeight:1.65,color:mt,maxWidth:560,marginBottom:36 }}><E multiline onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
        <button className="s-btn" style={{ background:a,color:"#fff" }}><E onUpdate={v=>upd("cta1",v)}>{c.cta1}</E> <ArrowRight size={16}/></button>
        <button className="s-btnout" style={{ color:tx,borderColor:bo }}><E onUpdate={v=>upd("cta2",v)}>{c.cta2}</E></button>
      </div>
      {c.showImage && <div style={{ width:"100%",maxWidth:800,marginTop:48,borderRadius:16,background:ca,border:`1px solid ${bo}`,minHeight:280,display:"flex",alignItems:"center",justifyContent:"center",fontSize:64 }}>{c.imagePlaceholder||"🖥️"}</div>}
    </div></Wrap>
  );

  // ── LOGOS ──
  if (section.type === "logos") return (
    <Wrap><div style={{ padding:"40px 48px",background:bg,textAlign:"center" }}>
      <p style={{ fontSize:12,color:mt,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:28 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></p>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:40,flexWrap:"wrap" }}>
        {(c.logos||[]).map((l,i)=><span key={i} style={{ fontSize:18,fontWeight:800,color:mt,opacity:.45 }}><E onUpdate={v=>{const ll=[...(c.logos||[])];ll[i]=v;upd("logos",ll)}}>{l}</E></span>)}
      </div>
    </div></Wrap>
  );

  // ── FEATURES ──
  if (section.type === "features") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:38,fontWeight:800,color:tx,marginBottom:14,letterSpacing:"-0.5px" }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
        <p style={{ fontSize:16,color:mt,maxWidth:520,margin:"0 auto",lineHeight:1.7 }}><E multiline onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${c.cols||3},1fr)`,gap:20 }}>
        {(c.items||[]).map((item,i)=>(
          <div key={i} style={{ padding:"26px 22px",borderRadius:r,background:ca,border:`1px solid ${bo}` }}>
            <div style={{ fontSize:26,marginBottom:14 }}><E onUpdate={v=>upd(`items.${i}.icon`,v)}>{item.icon}</E></div>
            <div style={{ fontSize:16,fontWeight:700,color:tx,marginBottom:8 }}><E onUpdate={v=>upd(`items.${i}.title`,v)}>{item.title}</E></div>
            <div style={{ fontSize:14,color:mt,lineHeight:1.65 }}><E multiline onUpdate={v=>upd(`items.${i}.desc`,v)}>{item.desc}</E></div>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── STATS ──
  if (section.type === "stats") return (
    <Wrap><div style={{ padding:"64px 48px",background:ca }}>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${(c.items||[]).length},1fr)`,gap:20 }}>
        {(c.items||[]).map((item,i)=>(
          <div key={i} style={{ padding:"28px 20px",borderRadius:r,background:bg,border:`1px solid ${bo}`,textAlign:"center" }}>
            <div style={{ fontSize:44,fontWeight:800,color:a,marginBottom:6,letterSpacing:"-1px" }}><E onUpdate={v=>upd(`items.${i}.number`,v)}>{item.number}</E></div>
            <div style={{ fontSize:14,fontWeight:600,color:tx,marginBottom:4 }}><E onUpdate={v=>upd(`items.${i}.label`,v)}>{item.label}</E></div>
            <div style={{ fontSize:12,color:mt }}><E onUpdate={v=>upd(`items.${i}.desc`,v)}>{item.desc}</E></div>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── CTA ──
  if (section.type === "cta") return (
    <Wrap><div style={{ padding:"90px 48px",textAlign:"center",background:`linear-gradient(135deg,${a}16,${a}06)`,borderTop:`1px solid ${a}22`,borderBottom:`1px solid ${a}22` }}>
      <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}20`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:18 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
      <h2 style={{ fontSize:46,fontWeight:800,color:tx,lineHeight:1.1,marginBottom:18,letterSpacing:"-1px" }}>
        {(c.title||"").split("\n").map((l,i,arr)=><span key={i}><E onUpdate={v=>{const ls=(c.title||"").split("\n");ls[i]=v;upd("title",ls.join("\n"))}}>{l}</E>{i<arr.length-1&&<br/>}</span>)}
      </h2>
      <p style={{ fontSize:17,color:mt,maxWidth:500,margin:"0 auto 36px",lineHeight:1.65 }}><E multiline onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
        <button className="s-btn" style={{ background:a,color:"#fff" }}><E onUpdate={v=>upd("cta1",v)}>{c.cta1}</E></button>
        <button className="s-btnout" style={{ color:tx,borderColor:bo }}><E onUpdate={v=>upd("cta2",v)}>{c.cta2}</E></button>
      </div>
      {c.note && <p style={{ fontSize:12,color:mt,marginTop:20 }}><E onUpdate={v=>upd("note",v)}>{c.note}</E></p>}
    </div></Wrap>
  );

  // ── TESTIMONIALS ──
  if (section.type === "testimonials") return (
    <Wrap><div style={{ padding:"72px 48px",background:ca }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${Math.min((c.items||[]).length,3)},1fr)`,gap:18 }}>
        {(c.items||[]).map((item,i)=>(
          <div key={i} style={{ padding:"26px",borderRadius:r,background:bg,border:`1px solid ${bo}` }}>
            <div style={{ color:a,marginBottom:14,display:"flex",gap:2 }}>{Array.from({length:item.stars||5},(_,j)=><Star key={j} size={14} fill={a} color={a}/>)}</div>
            <p style={{ fontSize:15,lineHeight:1.7,color:mt,marginBottom:20,fontStyle:"italic" }}>"<E multiline onUpdate={v=>upd(`items.${i}.text`,v)}>{item.text}</E>"</p>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:"50%",background:`${a}22`,color:a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700 }}><E onUpdate={v=>upd(`items.${i}.avatar`,v)}>{item.avatar}</E></div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:tx }}><E onUpdate={v=>upd(`items.${i}.name`,v)}>{item.name}</E></div>
                <div style={{ fontSize:11,color:mt }}><E onUpdate={v=>upd(`items.${i}.role`,v)}>{item.role}</E></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── PRICING ──
  if (section.type === "pricing") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx,marginBottom:12 }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
        <p style={{ fontSize:16,color:mt,maxWidth:500,margin:"0 auto" }}><E multiline onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${(c.plans||[]).length},1fr)`,gap:20,maxWidth:900,margin:"0 auto" }}>
        {(c.plans||[]).map((plan,i)=>(
          <div key={i} style={{ padding:"30px 24px",borderRadius:16,border:`2px solid ${plan.featured?a:bo}`,background:plan.featured?`${a}12`:ca,position:"relative" }}>
            {plan.badge&&<div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",borderRadius:100,background:a,color:"#fff",fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>{plan.badge}</div>}
            <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.2px",color:a,marginBottom:14 }}><E onUpdate={v=>upd(`plans.${i}.name`,v)}>{plan.name}</E></div>
            <div style={{ fontSize:46,fontWeight:800,color:tx,lineHeight:1,marginBottom:4,letterSpacing:"-1.5px" }}><E onUpdate={v=>upd(`plans.${i}.price`,v)}>{plan.price}</E></div>
            <div style={{ fontSize:13,color:mt,marginBottom:24 }}><E onUpdate={v=>upd(`plans.${i}.period`,v)}>{plan.period}</E></div>
            <ul style={{ listStyle:"none",marginBottom:28 }}>
              {(plan.features||[]).map((f,j)=><li key={j} style={{ fontSize:13,color:mt,padding:"6px 0",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${bo}80` }}><Check size={13} color={a}/><E onUpdate={v=>{const p=[...(c.plans||[])];p[i].features[j]=v;upd("plans",p)}}>{f}</E></li>)}
            </ul>
            <button style={{ width:"100%",padding:12,borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",background:plan.featured?a:"transparent",color:plan.featured?"#fff":tx,border:`2px solid ${plan.featured?a:bo}` }}><E onUpdate={v=>upd(`plans.${i}.cta`,v)}>{plan.cta}</E></button>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── TEAM ──
  if (section.type === "team") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${c.cols||4},1fr)`,gap:20 }}>
        {(c.members||[]).map((m,i)=>(
          <div key={i} style={{ borderRadius:r,background:ca,border:`1px solid ${bo}`,textAlign:"center",padding:"0 16px 24px" }}>
            <div style={{ width:72,height:72,borderRadius:"50%",background:`${a}22`,color:a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,margin:"22px auto 14px" }}><E onUpdate={v=>upd(`members.${i}.avatar`,v)}>{m.avatar}</E></div>
            <div style={{ fontSize:15,fontWeight:700,color:tx,marginBottom:4 }}><E onUpdate={v=>upd(`members.${i}.name`,v)}>{m.name}</E></div>
            <div style={{ fontSize:12,color:a,marginBottom:10,fontWeight:600 }}><E onUpdate={v=>upd(`members.${i}.role`,v)}>{m.role}</E></div>
            <div style={{ fontSize:13,color:mt,lineHeight:1.6 }}><E multiline onUpdate={v=>upd(`members.${i}.bio`,v)}>{m.bio}</E></div>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── FAQ ──
  if (section.type === "faq") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
      </div>
      <div style={{ maxWidth:720,margin:"0 auto" }}>
        {(c.items||[]).map((item,i)=>(
          <div key={i} style={{ borderBottom:`1px solid ${bo}` }}>
            <div style={{ padding:"18px 4px",fontSize:15,fontWeight:600,color:tx,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}
              onClick={e=>{e.stopPropagation();setFaqOpen(f=>({...f,[i]:!f[i]}))}}>
              <E onUpdate={v=>upd(`items.${i}.q`,v)} onClick={e=>e.stopPropagation()}>{item.q}</E>
              <span style={{ color:a,flexShrink:0 }}>{faqOpen[i]?<Minus size={18}/>:<Plus size={18}/>}</span>
            </div>
            {faqOpen[i]&&<div style={{ padding:"0 4px 18px",fontSize:14,lineHeight:1.75,color:mt }}><E multiline onUpdate={v=>upd(`items.${i}.a`,v)}>{item.a}</E></div>}
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── GALLERY ──
  if (section.type === "gallery") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${c.cols||3},1fr)`,gap:12 }}>
        {(c.items||[]).map((item,i)=>(
          <div key={i} style={{ borderRadius:r,background:item.bg||ca,minHeight:160,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10 }}>
            <span style={{ fontSize:36 }}>{item.emoji}</span>
            <span style={{ fontSize:13,fontWeight:600,color:"#333" }}><E onUpdate={v=>upd(`items.${i}.label`,v)}>{item.label}</E></span>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // ── VIDEO ──
  if (section.type === "video") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg,textAlign:"center" }}>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx,marginBottom:12 }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
        <p style={{ fontSize:16,color:mt }}><E onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      </div>
      <div style={{ borderRadius:16,background:ca,border:`1px solid ${bo}`,aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,cursor:"pointer",position:"relative",maxWidth:900,margin:"0 auto",overflow:"hidden" }}>
        {c.thumbnail||"🎬"}
        <div style={{ position:"absolute",width:64,height:64,background:"rgba(255,255,255,0.95)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}><div style={{ width:0,height:0,borderTop:"12px solid transparent",borderBottom:"12px solid transparent",borderLeft:`20px solid ${a}`,marginLeft:3 }}/></div>
      </div>
    </div></Wrap>
  );

  // ── CONTACT ──
  if (section.type === "contact") return (
    <Wrap><div style={{ padding:"72px 48px",background:bg }}>
      <div style={{ textAlign:"center",marginBottom:48 }}>
        <span style={{ display:"inline-block",padding:"4px 12px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12 }}><E onUpdate={v=>upd("tag",v)}>{c.tag}</E></span>
        <h2 style={{ fontSize:36,fontWeight:800,color:tx,marginBottom:12 }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h2>
        <p style={{ fontSize:16,color:mt,maxWidth:500,margin:"0 auto" }}><E multiline onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,maxWidth:900,margin:"0 auto" }}>
        <div>
          <div style={{ fontSize:18,fontWeight:700,color:tx,marginBottom:20 }}><E onUpdate={v=>upd("formTitle",v)}>{c.formTitle}</E></div>
          <ContactForm fields={c.fields} submitText={c.submitText} accent={a} text={tx} muted={mt} card={ca} border={bo}/>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:20,paddingTop:8 }}>
          {(c.infoItems||[]).map((item,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
              <div style={{ width:42,height:42,borderRadius:10,background:`${a}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <CIcon name={item.icon} size={18} color={a}/>
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:tx,marginBottom:3 }}><E onUpdate={v=>upd(`infoItems.${i}.title`,v)}>{item.title}</E></div>
                <div style={{ fontSize:13,color:mt,lineHeight:1.55 }}><E multiline onUpdate={v=>upd(`infoItems.${i}.value`,v)}>{item.value}</E></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div></Wrap>
  );

  // ── MAP ──
  if (section.type === "map") return (
    <Wrap><div style={{ background:ca,borderTop:`1px solid ${bo}`,borderBottom:`1px solid ${bo}` }}>
      <GoogleMapEmbed lat={c.lat} lng={c.lng} zoom={c.zoom} height={c.height} address={c.address} apiKey={c.apiKey} accent={a}/>
      {!c.apiKey && (
        <div style={{ padding:"12px 24px",background:`${a}10`,borderTop:`1px solid ${a}22`,display:"flex",alignItems:"center",gap:8,fontSize:12,color:a }}>
          <Info size={14}/> Add your Google Maps API key in the properties panel to show the real map.
        </div>
      )}
    </div></Wrap>
  );

  // ── RICHTEXT ──
  if (section.type === "richtext") return (
    <Wrap><div style={{ padding:"56px 48px",background:bg }}>
      <div style={{ maxWidth:720,margin:"0 auto",color:tx,fontSize:15,lineHeight:1.8 }} dangerouslySetInnerHTML={{ __html:c.content||"" }}/>
    </div></Wrap>
  );

  // ── DIVIDER ──
  if (section.type === "divider") return (
    <Wrap><div style={{ padding:`${c.margins||48}px 48px`,background:bg }}>
      <div style={{ borderTop:`${c.thickness||1}px ${c.style||"solid"} ${bo}` }}/>
    </div></Wrap>
  );

  // ── SPACER ──
  if (section.type === "spacer") return (
    <Wrap><div style={{ height:c.height||64,background:isSel?`${a}08`:"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>
      {isSel&&<span style={{ fontSize:11,color:mt,fontFamily:"monospace" }}>spacer · {c.height||64}px</span>}
    </div></Wrap>
  );

  // ── FOOTER ──
  if (section.type === "footer") return (
    <Wrap><footer style={{ padding:"60px 48px 28px",background:ca,borderTop:`1px solid ${bo}` }}>
      <div style={{ display:"grid",gridTemplateColumns:`2fr ${(c.cols||[]).map(()=>"1fr").join(" ")}`,gap:40,marginBottom:44 }}>
        <div>
          <div style={{ fontSize:20,fontWeight:800,color:a,marginBottom:10 }}><E onUpdate={v=>upd("brand",v)}>{c.brand}</E></div>
          <div style={{ fontSize:13,color:mt,lineHeight:1.7,maxWidth:200 }}><E multiline onUpdate={v=>upd("tagline",v)}>{c.tagline}</E></div>
          {c.socials&&<div style={{ display:"flex",gap:10,marginTop:18 }}>
            {(c.socials||[]).map((s,i)=>{
              const SM = {twitter:Twitter,github:Github,linkedin:Linkedin,instagram:Instagram,youtube:Youtube,facebook:Facebook};
              const SI = SM[s]||Globe;
              return <div key={i} style={{ width:34,height:34,borderRadius:8,background:`${a}18`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><SI size={16} color={a}/></div>;
            })}
          </div>}
        </div>
        {(c.cols||[]).map((col,ci)=>(
          <div key={ci}>
            <div style={{ fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",color:tx,marginBottom:14 }}><E onUpdate={v=>upd(`cols.${ci}.title`,v)}>{col.title}</E></div>
            {(col.links||[]).map((l,li)=><div key={li} style={{ display:"block",fontSize:13,color:mt,marginBottom:8,cursor:"pointer" }}><E onUpdate={v=>upd(`cols.${ci}.links.${li}`,v)}>{l}</E></div>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop:`1px solid ${bo}`,paddingTop:20,display:"flex",justifyContent:"space-between",fontSize:12,color:mt,flexWrap:"wrap",gap:8 }}>
        <E onUpdate={v=>upd("copyright",v)}>{c.copyright}</E>
        <E onUpdate={v=>upd("footnote",v)}>{c.footnote}</E>
      </div>
    </footer></Wrap>
  );

  // ── STATIC PAGES ────────────────────────────────────────────────────────────

  // FAQ PAGE
  if (section.type === "faq-page") return (
    <Wrap><div style={{ background:bg }}>
      <div style={{ padding:"72px 48px 48px",textAlign:"center",borderBottom:`1px solid ${bo}` }}>
        <h1 style={{ fontSize:46,fontWeight:800,color:tx,marginBottom:14,letterSpacing:"-1px" }}><E onUpdate={v=>upd("pageTitle",v)}>{c.pageTitle}</E></h1>
        <p style={{ fontSize:17,color:mt,maxWidth:500,margin:"0 auto" }}><E multiline onUpdate={v=>upd("pageSubtitle",v)}>{c.pageSubtitle}</E></p>
      </div>
      <div style={{ padding:"56px 48px",maxWidth:860,margin:"0 auto" }}>
        {(c.categories||[]).map((cat,ci)=>(
          <div key={ci} style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:22,fontWeight:700,color:tx,marginBottom:24,paddingBottom:12,borderBottom:`2px solid ${a}` }}>{cat.name}</h2>
            {(cat.items||[]).map((item,ii)=>(
              <details key={ii} style={{ marginBottom:2 }}>
                <summary style={{ padding:"16px 4px",fontSize:15,fontWeight:600,color:tx,cursor:"pointer",display:"flex",justifyContent:"space-between",listStyle:"none",alignItems:"center",gap:12,borderBottom:`1px solid ${bo}` }}>
                  <E onUpdate={v=>upd(`categories.${ci}.items.${ii}.q`,v)}>{item.q}</E>
                  <ChevronsRight size={16} color={a} style={{ flexShrink:0 }}/>
                </summary>
                <p style={{ padding:"14px 4px 20px",fontSize:14,lineHeight:1.75,color:mt }}><E multiline onUpdate={v=>upd(`categories.${ci}.items.${ii}.a`,v)}>{item.a}</E></p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // PRIVACY / TERMS / COOKIE
  if (section.type === "privacy-page" || section.type === "terms-page" || section.type === "cookie-page") {
    if (section.type === "cookie-page") return (
      <Wrap><div style={{ background:bg }}>
        <div style={{ padding:"72px 48px 48px",borderBottom:`1px solid ${bo}` }}>
          <div style={{ maxWidth:760,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
              <div style={{ width:48,height:48,borderRadius:12,background:`${a}18`,display:"flex",alignItems:"center",justifyContent:"center" }}><Cookie size={24} color={a}/></div>
              <div>
                <h1 style={{ fontSize:38,fontWeight:800,color:tx }}><E onUpdate={v=>upd("pageTitle",v)}>{c.pageTitle}</E></h1>
                <p style={{ fontSize:13,color:mt,marginTop:4 }}>Last updated: <E onUpdate={v=>upd("lastUpdated",v)}>{c.lastUpdated}</E></p>
              </div>
            </div>
            <p style={{ fontSize:15,lineHeight:1.8,color:mt }}><E multiline onUpdate={v=>upd("intro",v)}>{c.intro}</E></p>
          </div>
        </div>
        <div style={{ padding:"48px",maxWidth:760,margin:"0 auto" }}>
          {(c.cookieTypes||[]).map((ct,i)=>(
            <div key={i} style={{ marginBottom:28,padding:24,borderRadius:r,background:ca,border:`1px solid ${bo}` }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                <div style={{ fontSize:16,fontWeight:700,color:tx }}>{ct.name}</div>
                {ct.required ? <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:`${T.green}18`,color:T.green }}>Always Active</span>
                  : <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:`${a}18`,color:a }}>Optional</span>}
              </div>
              <p style={{ fontSize:14,color:mt,lineHeight:1.7,marginBottom:10 }}>{ct.desc}</p>
              <div style={{ fontSize:12,color:mt,fontStyle:"italic" }}>Examples: {ct.examples}</div>
            </div>
          ))}
        </div>
      </div></Wrap>
    );

    // Privacy / Terms generic
    const icon = section.type === "privacy-page" ? <Lock size={24} color={a}/> : <Scale size={24} color={a}/>;
    return (
      <Wrap><div style={{ background:bg }}>
        <div style={{ padding:"72px 48px 48px",borderBottom:`1px solid ${bo}` }}>
          <div style={{ maxWidth:760,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
              <div style={{ width:48,height:48,borderRadius:12,background:`${a}18`,display:"flex",alignItems:"center",justifyContent:"center" }}>{icon}</div>
              <div>
                <h1 style={{ fontSize:38,fontWeight:800,color:tx }}><E onUpdate={v=>upd("pageTitle",v)}>{c.pageTitle}</E></h1>
                <p style={{ fontSize:13,color:mt,marginTop:4 }}>Last updated: <E onUpdate={v=>upd("lastUpdated",v)}>{c.lastUpdated}</E></p>
              </div>
            </div>
            <p style={{ fontSize:15,lineHeight:1.8,color:mt }}><E multiline onUpdate={v=>upd("intro",v)}>{c.intro}</E></p>
          </div>
        </div>
        <div style={{ padding:"48px",maxWidth:760,margin:"0 auto" }}>
          {(c.sections||[]).map((sec,i)=>(
            <div key={i} style={{ marginBottom:36 }}>
              <h2 style={{ fontSize:18,fontWeight:700,color:tx,marginBottom:12 }}><E onUpdate={v=>upd(`sections.${i}.title`,v)}>{sec.title}</E></h2>
              <p style={{ fontSize:15,lineHeight:1.8,color:mt }}><E multiline onUpdate={v=>upd(`sections.${i}.content`,v)}>{sec.content}</E></p>
            </div>
          ))}
        </div>
      </div></Wrap>
    );
  }

  // ABOUT PAGE
  if (section.type === "about-page") return (
    <Wrap><div style={{ background:bg }}>
      <div style={{ padding:"90px 48px 72px",textAlign:"center",borderBottom:`1px solid ${bo}` }}>
        <h1 style={{ fontSize:52,fontWeight:800,color:tx,lineHeight:1.08,marginBottom:20,letterSpacing:"-1.5px" }}>
          {(c.heroTitle||"").split("\n").map((l,i,arr)=><span key={i}><E onUpdate={v=>{const ls=(c.heroTitle||"").split("\n");ls[i]=v;upd("heroTitle",ls.join("\n"))}}>{l}</E>{i<arr.length-1&&<br/>}</span>)}
        </h1>
        <p style={{ fontSize:18,color:mt,maxWidth:560,margin:"0 auto 40px" }}><E multiline onUpdate={v=>upd("heroSubtitle",v)}>{c.heroSubtitle}</E></p>
        <div style={{ display:"grid",gridTemplateColumns:`repeat(${(c.stats||[]).length},1fr)`,gap:20,maxWidth:700,margin:"0 auto" }}>
          {(c.stats||[]).map((s,i)=>(
            <div key={i} style={{ padding:"20px 16px",borderRadius:r,background:ca,border:`1px solid ${bo}` }}>
              <div style={{ fontSize:36,fontWeight:800,color:a,letterSpacing:"-1px" }}><E onUpdate={v=>upd(`stats.${i}.number`,v)}>{s.number}</E></div>
              <div style={{ fontSize:13,color:mt }}><E onUpdate={v=>upd(`stats.${i}.label`,v)}>{s.label}</E></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"64px 48px",maxWidth:760,margin:"0 auto" }}>
        <h2 style={{ fontSize:24,fontWeight:700,color:tx,marginBottom:20 }}>Our Story</h2>
        {(c.story||"").split("\n\n").map((p,i)=>(
          <p key={i} style={{ fontSize:15,lineHeight:1.85,color:mt,marginBottom:18 }}>{p}</p>
        ))}
      </div>
      <div style={{ padding:"32px 48px 72px",background:ca,borderTop:`1px solid ${bo}` }}>
        <h2 style={{ fontSize:28,fontWeight:800,color:tx,textAlign:"center",marginBottom:36 }}>Our Values</h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20,maxWidth:860,margin:"0 auto" }}>
          {(c.values||[]).map((v2,i)=>(
            <div key={i} style={{ padding:"24px",borderRadius:r,background:bg,border:`1px solid ${bo}`,display:"flex",gap:16 }}>
              <span style={{ fontSize:28,flexShrink:0 }}>{v2.icon}</span>
              <div>
                <div style={{ fontSize:16,fontWeight:700,color:tx,marginBottom:6 }}><E onUpdate={v=>upd(`values.${i}.title`,v)}>{v2.title}</E></div>
                <div style={{ fontSize:14,color:mt,lineHeight:1.65 }}><E multiline onUpdate={v=>upd(`values.${i}.desc`,v)}>{v2.desc}</E></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div></Wrap>
  );

  // 404 PAGE
  if (section.type === "404-page") return (
    <Wrap><div style={{ padding:"100px 48px",textAlign:"center",background:bg,minHeight:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
      <div style={{ fontSize:120,fontWeight:900,lineHeight:1,background:`linear-gradient(135deg,${a},${T.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:20,letterSpacing:"-4px" }}>
        <E onUpdate={v=>upd("illustration",v)}>{c.illustration||"404"}</E>
      </div>
      <h1 style={{ fontSize:28,fontWeight:800,color:tx,marginBottom:12 }}><E onUpdate={v=>upd("title",v)}>{c.title}</E></h1>
      <p style={{ fontSize:16,color:mt,marginBottom:36 }}><E onUpdate={v=>upd("subtitle",v)}>{c.subtitle}</E></p>
      <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
        <button className="s-btn" style={{ background:a,color:"#fff" }}><E onUpdate={v=>upd("ctaText",v)}>{c.ctaText}</E></button>
        <button className="s-btnout" style={{ color:tx,borderColor:bo }}><E onUpdate={v=>upd("ctaSecondary",v)}>{c.ctaSecondary}</E></button>
      </div>
    </div></Wrap>
  );

  // CHANGELOG
  if (section.type === "changelog-page") return (
    <Wrap><div style={{ background:bg }}>
      <div style={{ padding:"72px 48px 48px",textAlign:"center",borderBottom:`1px solid ${bo}` }}>
        <h1 style={{ fontSize:46,fontWeight:800,color:tx,marginBottom:12,letterSpacing:"-1px" }}><E onUpdate={v=>upd("pageTitle",v)}>{c.pageTitle}</E></h1>
        <p style={{ fontSize:16,color:mt }}><E onUpdate={v=>upd("pageSubtitle",v)}>{c.pageSubtitle}</E></p>
      </div>
      <div style={{ padding:"56px 48px",maxWidth:760,margin:"0 auto" }}>
        {(c.entries||[]).map((entry,ei)=>(
          <div key={ei} style={{ display:"grid",gridTemplateColumns:"160px 1fr",gap:32,marginBottom:48,paddingBottom:48,borderBottom:ei<c.entries.length-1?`1px solid ${bo}`:"none" }}>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:a,marginBottom:4 }}>{entry.version}</div>
              <div style={{ fontSize:13,color:mt,marginBottom:8 }}>{entry.date}</div>
              {entry.badge&&<span style={{ display:"inline-block",padding:"3px 10px",borderRadius:100,background:`${a}18`,color:a,fontSize:11,fontWeight:700 }}>{entry.badge}</span>}
            </div>
            <div>
              {(entry.items||[]).map((item,ii)=>(
                <div key={ii} style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                  <span style={{ display:"inline-block",padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,flexShrink:0,marginTop:2,
                    background:item.type==="new"?`${T.green}20`:item.type==="fixed"?`${T.yellow}20":`:`${a}18`,
                    color:item.type==="new"?T.green:item.type==="fixed"?T.yellow:a,
                    textTransform:"uppercase",letterSpacing:"0.5px"
                  }}>{item.type}</span>
                  <span style={{ fontSize:14,color:mt,lineHeight:1.55 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div></Wrap>
  );

  // BLOG PAGE
  if (section.type === "blog-page") return (
    <Wrap><div style={{ background:bg }}>
      <div style={{ padding:"72px 48px 40px",borderBottom:`1px solid ${bo}` }}>
        <h1 style={{ fontSize:46,fontWeight:800,color:tx,marginBottom:12,letterSpacing:"-1px" }}><E onUpdate={v=>upd("pageTitle",v)}>{c.pageTitle}</E></h1>
        <p style={{ fontSize:16,color:mt }}><E onUpdate={v=>upd("pageSubtitle",v)}>{c.pageSubtitle}</E></p>
      </div>
      <div style={{ padding:"20px 48px 0" }}>
        <div style={{ display:"flex",gap:8 }}>
          {(c.categories||[]).map((cat,i)=>(
            <span key={i} style={{ padding:"6px 14px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:i===0?a:"transparent",color:i===0?"#fff":mt,border:`1px solid ${i===0?a:bo}` }}>{cat}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:"32px 48px 72px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
          {(c.posts||[]).map((post,i)=>(
            <div key={i} style={{ border:`1px solid ${bo}`,borderRadius:r,overflow:"hidden",cursor:"pointer",transition:"all 0.15s" }}>
              <div style={{ height:140,background:ca,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48 }}>{post.emoji}</div>
              <div style={{ padding:"18px 20px 20px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:5,background:`${a}18`,color:a }}>{post.cat}</span>
                  <span style={{ fontSize:11,color:mt }}>{post.read}</span>
                </div>
                <h3 style={{ fontSize:15,fontWeight:700,color:tx,marginBottom:8,lineHeight:1.4 }}>{post.title}</h3>
                <p style={{ fontSize:13,color:mt,lineHeight:1.6,marginBottom:14 }}>{post.excerpt}</p>
                <span style={{ fontSize:12,color:mt }}>{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div></Wrap>
  );

  return <Wrap><div style={{ padding:40,textAlign:"center",color:mt,background:bg }}>Unknown section: {section.type}</div></Wrap>;
}

// ─── TEMPLATE THUMBNAIL ──────────────────────────────────────────────────────
function TplThumb({ tpl }) {
  const th = tpl.theme;
  return (
    <div style={{ width:"100%",height:"100%",background:th.bg,padding:10,display:"flex",flexDirection:"column",gap:5,overflow:"hidden" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:6,borderBottom:`1px solid ${th.border}` }}>
        <div style={{ width:32,height:7,background:th.accent,borderRadius:3 }}/>
        <div style={{ display:"flex",gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:16,height:4,background:th.muted+"55",borderRadius:2 }}/>)}</div>
      </div>
      <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
        <div style={{ width:48,height:5,background:th.accent+"50",borderRadius:3 }}/>
        <div style={{ width:100,height:10,background:th.text+"BB",borderRadius:3 }}/>
        <div style={{ width:70,height:4,background:th.muted+"70",borderRadius:2 }}/>
        <div style={{ width:46,height:9,background:th.accent,borderRadius:5 }}/>
      </div>
      <div style={{ display:"flex",gap:4 }}>
        {[0,1,2].map(i=><div key={i} style={{ flex:1,background:th.card,borderRadius:4,border:`1px solid ${th.border}`,padding:4 }}>
          <div style={{ width:10,height:6,background:th.accent+"66",borderRadius:2,marginBottom:2 }}/>
          <div style={{ width:"80%",height:3,background:th.text+"55",borderRadius:2 }}/>
        </div>)}
      </div>
    </div>
  );
}

// ─── PROPERTY PANEL ──────────────────────────────────────────────────────────
const SWATCH_COLORS = ["#6C5CE7","#0EA5E9","#10B981","#F59E0B","#EF4444","#FF5C00","#EC4899","#8B5CF6","#06B6D4","#22C55E"];

function PropPanel({ section, theme, onThemeChange, onContentChange }) {
  const [open, setOpen] = useState({ content: true, theme: false });
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }));
  const c = section?.content || {};
  const th = theme;
  const upd = (path, val) => onContentChange(path, val);

  const PG = ({ label, k, children }) => (
    <div className="pg">
      <div className="pghd" onClick={() => tog(k)}>
        <span>{label}</span>
        <span>{open[k] ? <ChevronUp size={12}/> : <ChevDown size={12}/>}</span>
      </div>
      {open[k] && <div className="pgbd">{children}</div>}
    </div>
  );

  const Row = ({ label, children }) => (
    <div className="pr"><span className="pl">{label}</span>{children}</div>
  );

  const ThemePanel = () => (
    <PG label="Page Colors" k="theme">
      <Row label="Accent"><div className="swatches">{SWATCH_COLORS.map(c2=><div key={c2} className={`sw${th.accent===c2?" on":""}`} style={{ background:c2 }} onClick={()=>onThemeChange("accent",c2)}/>)}</div></Row>
      <Row label="Background"><input type="color" className="pinput" value={th.bg} onChange={e=>onThemeChange("bg",e.target.value)}/></Row>
      <Row label="Text"><input type="color" className="pinput" value={th.text} onChange={e=>onThemeChange("text",e.target.value)}/></Row>
      <Row label="Muted"><input type="color" className="pinput" value={th.muted} onChange={e=>onThemeChange("muted",e.target.value)}/></Row>
      <Row label="Cards"><input type="color" className="pinput" value={th.card||"#F8F8F8"} onChange={e=>onThemeChange("card",e.target.value)}/></Row>
      <Row label="Border"><input type="color" className="pinput" value={th.border||"#E5E5EA"} onChange={e=>onThemeChange("border",e.target.value)}/></Row>
      <Row label="Radius">
        <select className="psel" value={th.radius||"12px"} onChange={e=>onThemeChange("radius",e.target.value)}>
          {["4px","6px","8px","10px","12px","14px","16px","20px","24px"].map(v=><option key={v}>{v}</option>)}
        </select>
      </Row>
    </PG>
  );

  if (!section) return (
    <div className="rpanel">
      <div className="rphd"><WIcon type="faq" size={18} color={T.muted}/><div><div className="rptitle">Properties</div><div className="rpsub">Click a section to edit</div></div></div>
      <div className="rpbody">
        <ThemePanel/>
        <div className="nosel">
          <MousePointer2 size={28} color={T.muted2}/>
          <div className="nosel-txt">Select any section on the canvas to edit its content and settings</div>
        </div>
      </div>
    </div>
  );

  const type = section.type;

  const ContentFields = () => {
    if (type === "navbar") return (<>
      <Row label="Logo"><input className="pinput" value={c.logo||""} onChange={e=>upd("logo",e.target.value)}/></Row>
      <Row label="CTA"><input className="pinput" value={c.cta||""} onChange={e=>upd("cta",e.target.value)}/></Row>
      <div className="togrow"><span className="toglbl">Show Sign In</span><button className={`tog ${c.showSecondary?"on":"off"}`} onClick={()=>upd("showSecondary",!c.showSecondary)}/></div>
      {c.showSecondary && <Row label="Sign in"><input className="pinput" value={c.ctaSecondary||""} onChange={e=>upd("ctaSecondary",e.target.value)}/></Row>}
      <div className="catlabel">Nav Links</div>
      {(c.links||[]).map((l,i)=>(<div key={i} className="pr"><input className="pinput" value={l} onChange={e=>{const ll=[...(c.links||[])];ll[i]=e.target.value;upd("links",ll)}}/><button className="idel" onClick={()=>{const ll=[...(c.links||[])];ll.splice(i,1);upd("links",ll)}}><X size={10}/></button></div>))}
      <button className="addibtn" onClick={()=>upd("links",[...(c.links||[]),"New Link"])}><Plus size={12}/>Add Link</button>
    </>);
    if (type === "hero") return (<>
      <Row label="Badge"><input className="pinput" value={c.badge||""} onChange={e=>upd("badge",e.target.value)}/></Row>
      <Row label="Title"><textarea className="pta" value={c.title||""} onChange={e=>upd("title",e.target.value)} rows={2}/></Row>
      <Row label="Subtitle"><textarea className="pta" value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)} rows={3}/></Row>
      <Row label="CTA 1"><input className="pinput" value={c.cta1||""} onChange={e=>upd("cta1",e.target.value)}/></Row>
      <Row label="CTA 2"><input className="pinput" value={c.cta2||""} onChange={e=>upd("cta2",e.target.value)}/></Row>
      <div className="togrow"><span className="toglbl">Show image</span><button className={`tog ${c.showImage?"on":"off"}`} onClick={()=>upd("showImage",!c.showImage)}/></div>
    </>);
    if (type === "features") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)} rows={2}/></Row>
      <Row label="Columns"><select className="psel" value={c.cols||3} onChange={e=>upd("cols",Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} cols</option>)}</select></Row>
      <div className="catlabel">Cards</div>
      {(c.items||[]).map((item,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const it=[...(c.items||[])];it.splice(i,1);upd("items",it)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Icon</span><input className="pinput" value={item.icon} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],icon:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Title</span><input className="pinput" value={item.title} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],title:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Desc</span><textarea className="pta" value={item.desc} rows={2} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],desc:e.target.value};upd("items",it)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("items",[...(c.items||[]),{icon:"⭐",title:"Feature",desc:"Describe this feature."}])}><Plus size={12}/>Add feature</button>
    </>);
    if (type === "stats") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      {(c.items||[]).map((item,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const it=[...(c.items||[])];it.splice(i,1);upd("items",it)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Number</span><input className="pinput" value={item.number} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],number:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Label</span><input className="pinput" value={item.label} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],label:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Desc</span><input className="pinput" value={item.desc||""} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],desc:e.target.value};upd("items",it)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("items",[...(c.items||[]),{number:"0",label:"Metric",desc:""}])}><Plus size={12}/>Add stat</button>
    </>);
    if (type === "cta") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><textarea className="pta" rows={2} value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)}/></Row>
      <Row label="CTA 1"><input className="pinput" value={c.cta1||""} onChange={e=>upd("cta1",e.target.value)}/></Row>
      <Row label="CTA 2"><input className="pinput" value={c.cta2||""} onChange={e=>upd("cta2",e.target.value)}/></Row>
      <Row label="Note"><input className="pinput" value={c.note||""} onChange={e=>upd("note",e.target.value)}/></Row>
    </>);
    if (type === "map") return (<>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Address"><textarea className="pta" rows={2} value={c.address||""} onChange={e=>upd("address",e.target.value)}/></Row>
      <Row label="Latitude"><input className="pinput" type="number" value={c.lat||37.7749} onChange={e=>upd("lat",Number(e.target.value))}/></Row>
      <Row label="Longitude"><input className="pinput" type="number" value={c.lng||-122.4194} onChange={e=>upd("lng",Number(e.target.value))}/></Row>
      <Row label="Zoom"><input type="range" className="pinput" min={8} max={18} value={c.zoom||14} onChange={e=>upd("zoom",Number(e.target.value))}/><span className="pval">{c.zoom||14}</span></Row>
      <Row label="Height"><input type="range" className="pinput" min={200} max={600} step={20} value={c.height||380} onChange={e=>upd("height",Number(e.target.value))}/><span className="pval">{c.height||380}</span></Row>
      <div className="catlabel">Google Maps API Key</div>
      <input className="pinput pfull" placeholder="AIza..." value={c.apiKey||""} onChange={e=>upd("apiKey",e.target.value)}/>
      <div style={{ fontSize:10,color:T.muted,lineHeight:1.5,marginBottom:4 }}>Get a free API key at <span style={{ color:T.accent }}>console.cloud.google.com</span> → Maps JavaScript API</div>
    </>);
    if (type === "contact") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)}/></Row>
      <Row label="Submit"><input className="pinput" value={c.submitText||""} onChange={e=>upd("submitText",e.target.value)}/></Row>
      <div className="catlabel">Form Fields</div>
      {(c.fields||[]).map((f,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const ff=[...(c.fields||[])];ff.splice(i,1);upd("fields",ff)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Label</span><input className="pinput" value={f.label} onChange={e=>{const ff=[...(c.fields||[])];ff[i]={...ff[i],label:e.target.value};upd("fields",ff)}}/></div>
        <div className="pr"><span className="pl">Type</span><select className="psel" value={f.type} onChange={e=>{const ff=[...(c.fields||[])];ff[i]={...ff[i],type:e.target.value};upd("fields",ff)}}><option value="text">Text</option><option value="email">Email</option><option value="tel">Phone</option><option value="textarea">Textarea</option></select></div>
        <div className="pr"><span className="pl">Placeholder</span><input className="pinput" value={f.placeholder||""} onChange={e=>{const ff=[...(c.fields||[])];ff[i]={...ff[i],placeholder:e.target.value};upd("fields",ff)}}/></div>
        <div className="togrow"><span className="toglbl">Required</span><button className={`tog ${f.required?"on":"off"}`} onClick={()=>{const ff=[...(c.fields||[])];ff[i]={...ff[i],required:!ff[i].required};upd("fields",ff)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("fields",[...(c.fields||[]),{label:"New Field",type:"text",placeholder:"",required:false}])}><Plus size={12}/>Add field</button>
    </>);
    if (type === "pricing") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)}/></Row>
      {(c.plans||[]).map((plan,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const p=[...(c.plans||[])];p.splice(i,1);upd("plans",p)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Name</span><input className="pinput" value={plan.name} onChange={e=>{const p=[...(c.plans||[])];p[i]={...p[i],name:e.target.value};upd("plans",p)}}/></div>
        <div className="pr"><span className="pl">Price</span><input className="pinput" value={plan.price} onChange={e=>{const p=[...(c.plans||[])];p[i]={...p[i],price:e.target.value};upd("plans",p)}}/></div>
        <div className="pr"><span className="pl">Period</span><input className="pinput" value={plan.period} onChange={e=>{const p=[...(c.plans||[])];p[i]={...p[i],period:e.target.value};upd("plans",p)}}/></div>
        <div className="pr"><span className="pl">Badge</span><input className="pinput" value={plan.badge||""} onChange={e=>{const p=[...(c.plans||[])];p[i]={...p[i],badge:e.target.value};upd("plans",p)}}/></div>
        <div className="togrow"><span className="toglbl">Featured</span><button className={`tog ${plan.featured?"on":"off"}`} onClick={()=>{const p=[...(c.plans||[])];p[i]={...p[i],featured:!p[i].featured};upd("plans",p)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("plans",[...(c.plans||[]),{name:"Plan",price:"$0",period:"free",badge:"",features:["Feature"],cta:"Get started",featured:false}])}><Plus size={12}/>Add plan</button>
    </>);
    if (type === "testimonials") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      {(c.items||[]).map((item,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const it=[...(c.items||[])];it.splice(i,1);upd("items",it)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Quote</span><textarea className="pta" rows={2} value={item.text} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],text:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Name</span><input className="pinput" value={item.name} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],name:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Role</span><input className="pinput" value={item.role} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],role:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Avatar</span><input className="pinput" value={item.avatar} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],avatar:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">Stars</span><select className="psel" value={item.stars||5} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],stars:Number(e.target.value)};upd("items",it)}}>{[3,4,5].map(n=><option key={n}>{n}</option>)}</select></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("items",[...(c.items||[]),{text:"Great product!",name:"Name",role:"Role",avatar:"NP",stars:5}])}><Plus size={12}/>Add testimonial</button>
    </>);
    if (type === "faq") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      {(c.items||[]).map((item,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const it=[...(c.items||[])];it.splice(i,1);upd("items",it)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Q</span><textarea className="pta" rows={2} value={item.q} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],q:e.target.value};upd("items",it)}}/></div>
        <div className="pr"><span className="pl">A</span><textarea className="pta" rows={3} value={item.a} onChange={e=>{const it=[...(c.items||[])];it[i]={...it[i],a:e.target.value};upd("items",it)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("items",[...(c.items||[]),{q:"New question?",a:"Answer here."}])}><Plus size={12}/>Add question</button>
    </>);
    if (type === "team") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Columns"><select className="psel" value={c.cols||4} onChange={e=>upd("cols",Number(e.target.value))}>{[2,3,4].map(n=><option key={n} value={n}>{n} cols</option>)}</select></Row>
      {(c.members||[]).map((m,i)=>(<div key={i} className="ited">
        <button className="idel" onClick={()=>{const mb=[...(c.members||[])];mb.splice(i,1);upd("members",mb)}}><X size={10}/></button>
        <div className="pr"><span className="pl">Name</span><input className="pinput" value={m.name} onChange={e=>{const mb=[...(c.members||[])];mb[i]={...mb[i],name:e.target.value};upd("members",mb)}}/></div>
        <div className="pr"><span className="pl">Role</span><input className="pinput" value={m.role} onChange={e=>{const mb=[...(c.members||[])];mb[i]={...mb[i],role:e.target.value};upd("members",mb)}}/></div>
        <div className="pr"><span className="pl">Avatar</span><input className="pinput" value={m.avatar} onChange={e=>{const mb=[...(c.members||[])];mb[i]={...mb[i],avatar:e.target.value};upd("members",mb)}}/></div>
        <div className="pr"><span className="pl">Bio</span><textarea className="pta" rows={2} value={m.bio} onChange={e=>{const mb=[...(c.members||[])];mb[i]={...mb[i],bio:e.target.value};upd("members",mb)}}/></div>
      </div>))}
      <button className="addibtn" onClick={()=>upd("members",[...(c.members||[]),{name:"Member",role:"Role",avatar:"NM",bio:"Bio here."}])}><Plus size={12}/>Add member</button>
    </>);
    if (type === "logos") return (<>
      <Row label="Label"><textarea className="pta" rows={2} value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      {(c.logos||[]).map((l,i)=>(<div key={i} className="pr"><input className="pinput" value={l} onChange={e=>{const ll=[...(c.logos||[])];ll[i]=e.target.value;upd("logos",ll)}}/><button className="idel" onClick={()=>{const ll=[...(c.logos||[])];ll.splice(i,1);upd("logos",ll)}}><X size={10}/></button></div>))}
      <button className="addibtn" onClick={()=>upd("logos",[...(c.logos||[]),"Brand"])}><Plus size={12}/>Add logo</button>
    </>);
    if (type === "gallery") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Columns"><select className="psel" value={c.cols||3} onChange={e=>upd("cols",Number(e.target.value))}>{[2,3,4].map(n=><option key={n} value={n}>{n} cols</option>)}</select></Row>
    </>);
    if (type === "video") return (<>
      <Row label="Tag"><input className="pinput" value={c.tag||""} onChange={e=>upd("tag",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)}/></Row>
      <Row label="Thumbnail"><input className="pinput" placeholder="Emoji or image URL" value={c.thumbnail||""} onChange={e=>upd("thumbnail",e.target.value)}/></Row>
    </>);
    if (type === "richtext") return (<div>
      <div style={{ fontSize:11,color:T.muted,marginBottom:6 }}>Edit raw HTML</div>
      <textarea className="pta pfull" style={{ minHeight:120 }} value={c.content||""} onChange={e=>upd("content",e.target.value)}/>
    </div>);
    if (type === "divider") return (<>
      <Row label="Style"><select className="psel" value={c.style||"solid"} onChange={e=>upd("style",e.target.value)}><option>solid</option><option>dashed</option><option>dotted</option></select></Row>
      <Row label="Thickness"><input type="range" className="pinput" min={1} max={4} value={c.thickness||1} onChange={e=>upd("thickness",Number(e.target.value))}/><span className="pval">{c.thickness||1}px</span></Row>
      <Row label="Margin"><input type="range" className="pinput" min={0} max={120} value={c.margins||48} onChange={e=>upd("margins",Number(e.target.value))}/><span className="pval">{c.margins||48}</span></Row>
    </>);
    if (type === "spacer") return (
      <Row label="Height"><input type="range" className="pinput" min={16} max={240} step={8} value={c.height||64} onChange={e=>upd("height",Number(e.target.value))}/><span className="pval">{c.height||64}px</span></Row>
    );
    if (type === "footer") return (<>
      <Row label="Brand"><input className="pinput" value={c.brand||""} onChange={e=>upd("brand",e.target.value)}/></Row>
      <Row label="Tagline"><textarea className="pta" rows={2} value={c.tagline||""} onChange={e=>upd("tagline",e.target.value)}/></Row>
      <Row label="Copyright"><input className="pinput" value={c.copyright||""} onChange={e=>upd("copyright",e.target.value)}/></Row>
      <Row label="Footnote"><input className="pinput" value={c.footnote||""} onChange={e=>upd("footnote",e.target.value)}/></Row>
    </>);
    if (type === "banner") return (<>
      <Row label="Text"><textarea className="pta" rows={2} value={c.text||""} onChange={e=>upd("text",e.target.value)}/></Row>
      <Row label="CTA"><input className="pinput" value={c.cta||""} onChange={e=>upd("cta",e.target.value)}/></Row>
    </>);
    // Static pages - simple fields
    if (type === "faq-page") return (<>
      <Row label="Title"><input className="pinput" value={c.pageTitle||""} onChange={e=>upd("pageTitle",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.pageSubtitle||""} onChange={e=>upd("pageSubtitle",e.target.value)}/></Row>
      <div style={{ fontSize:11,color:T.muted,marginTop:6 }}>Edit questions directly on the canvas</div>
    </>);
    if (type === "privacy-page" || type === "terms-page") return (<>
      <Row label="Title"><input className="pinput" value={c.pageTitle||""} onChange={e=>upd("pageTitle",e.target.value)}/></Row>
      <Row label="Updated"><input className="pinput" value={c.lastUpdated||""} onChange={e=>upd("lastUpdated",e.target.value)}/></Row>
      <Row label="Intro"><textarea className="pta" rows={3} value={c.intro||""} onChange={e=>upd("intro",e.target.value)}/></Row>
      <div style={{ fontSize:11,color:T.muted,marginTop:6 }}>Edit sections directly on the canvas</div>
    </>);
    if (type === "about-page") return (<>
      <Row label="Hero title"><textarea className="pta" rows={2} value={c.heroTitle||""} onChange={e=>upd("heroTitle",e.target.value)}/></Row>
      <Row label="Hero sub"><textarea className="pta" rows={2} value={c.heroSubtitle||""} onChange={e=>upd("heroSubtitle",e.target.value)}/></Row>
      <div style={{ fontSize:11,color:T.muted,marginTop:6 }}>Edit values and story on the canvas</div>
    </>);
    if (type === "404-page") return (<>
      <Row label="Number"><input className="pinput" value={c.illustration||""} onChange={e=>upd("illustration",e.target.value)}/></Row>
      <Row label="Title"><input className="pinput" value={c.title||""} onChange={e=>upd("title",e.target.value)}/></Row>
      <Row label="Subtitle"><input className="pinput" value={c.subtitle||""} onChange={e=>upd("subtitle",e.target.value)}/></Row>
      <Row label="CTA"><input className="pinput" value={c.ctaText||""} onChange={e=>upd("ctaText",e.target.value)}/></Row>
    </>);
    if (type === "changelog-page") return (<>
      <Row label="Title"><input className="pinput" value={c.pageTitle||""} onChange={e=>upd("pageTitle",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.pageSubtitle||""} onChange={e=>upd("pageSubtitle",e.target.value)}/></Row>
    </>);
    if (type === "blog-page") return (<>
      <Row label="Title"><input className="pinput" value={c.pageTitle||""} onChange={e=>upd("pageTitle",e.target.value)}/></Row>
      <Row label="Subtitle"><textarea className="pta" rows={2} value={c.pageSubtitle||""} onChange={e=>upd("pageSubtitle",e.target.value)}/></Row>
    </>);
    if (type === "cookie-page") return (<>
      <Row label="Title"><input className="pinput" value={c.pageTitle||""} onChange={e=>upd("pageTitle",e.target.value)}/></Row>
      <Row label="Updated"><input className="pinput" value={c.lastUpdated||""} onChange={e=>upd("lastUpdated",e.target.value)}/></Row>
    </>);
    return <div style={{ fontSize:12,color:T.muted,padding:"8px 0" }}>No extra properties.</div>;
  };

  return (
    <div className="rpanel">
      <div className="rphd">
        <WIcon type={type} size={17} color={T.muted}/>
        <div>
          <div className="rptitle" style={{ textTransform:"capitalize" }}>{type.replace(/-/g," ")}</div>
          <div className="rpsub">Click text to edit inline</div>
        </div>
      </div>
      <div className="rpbody">
        <PG label="Content" k="content"><ContentFields/></PG>
        <ThemePanel/>
      </div>
    </div>
  );
}

// ─── HTML EXPORT ─────────────────────────────────────────────────────────────
function buildHTML(sections, theme) {
  const { bg, text, muted, accent, card, border, radius } = theme;
  const secs = sections.map(s => {
    const c = s.content;
    if (s.type === "navbar") return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:14px 48px;border-bottom:1px solid ${border};background:${bg};"><div style="font-size:20px;font-weight:800;color:${accent};">${c.logo||"ACME"}</div><ul style="display:flex;gap:28px;list-style:none;">${(c.links||[]).map(l=>`<li style="font-size:14px;color:${muted};">${l}</li>`).join("")}</ul><div style="display:flex;gap:10px;">${c.showSecondary?`<button style="padding:7px 16px;border-radius:8px;border:1.5px solid ${border};background:transparent;color:${text};font-size:13px;font-weight:600;">${c.ctaSecondary||""}</button>`:""}<button style="padding:8px 18px;border-radius:8px;border:none;background:${accent};color:white;font-size:13px;font-weight:700;">${c.cta||""}</button></div></nav>`;
    if (s.type === "hero") return `<section style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:100px 48px 80px;background:${bg};"><div style="display:inline-flex;padding:5px 14px;border-radius:100px;background:${accent}18;color:${accent};border:1px solid ${accent}30;font-size:12px;font-weight:600;margin-bottom:22px;">${c.badge||""}</div><h1 style="font-size:56px;font-weight:800;color:${text};margin-bottom:18px;letter-spacing:-1.5px;line-height:1.08;">${(c.title||"").replace(/\n/g,"<br>")}</h1><p style="font-size:18px;color:${muted};max-width:560px;margin:0 auto 36px;line-height:1.65;">${c.subtitle||""}</p><div style="display:flex;gap:14px;justify-content:center;"><button style="padding:14px 30px;border-radius:10px;font-size:15px;font-weight:700;background:${accent};color:white;border:none;">${c.cta1||""}</button><button style="padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;background:transparent;color:${text};border:2px solid ${border};">${c.cta2||""}</button></div>${c.showImage?`<div style="width:100%;max-width:800px;margin-top:48px;border-radius:16px;background:${card};border:1px solid ${border};min-height:280px;display:flex;align-items:center;justify-content:center;font-size:64px;">${c.imagePlaceholder||"🖥️"}</div>`:""}</section>`;
    if (s.type === "features") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:38px;font-weight:800;color:${text};margin-bottom:14px;">${c.title||""}</h2><p style="font-size:16px;color:${muted};max-width:520px;margin:0 auto;line-height:1.7;">${c.subtitle||""}</p></div><div style="display:grid;grid-template-columns:repeat(${c.cols||3},1fr);gap:20px;">${(c.items||[]).map(i=>`<div style="padding:26px 22px;border-radius:${radius||"12px"};background:${card};border:1px solid ${border};"><div style="font-size:26px;margin-bottom:14px;">${i.icon}</div><div style="font-size:16px;font-weight:700;color:${text};margin-bottom:8px;">${i.title}</div><div style="font-size:14px;color:${muted};line-height:1.65;">${i.desc}</div></div>`).join("")}</div></section>`;
    if (s.type === "cta") return `<section style="padding:90px 48px;text-align:center;background:linear-gradient(135deg,${accent}16,${accent}06);border-top:1px solid ${accent}22;border-bottom:1px solid ${accent}22;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}20;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:18px;">${c.tag||""}</span><h2 style="font-size:46px;font-weight:800;color:${text};line-height:1.1;margin-bottom:18px;letter-spacing:-1px;">${(c.title||"").replace(/\n/g,"<br>")}</h2><p style="font-size:17px;color:${muted};max-width:500px;margin:0 auto 36px;line-height:1.65;">${c.subtitle||""}</p><div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;"><button style="padding:14px 30px;border-radius:10px;font-size:15px;font-weight:700;background:${accent};color:white;border:none;">${c.cta1||""}</button><button style="padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;background:transparent;color:${text};border:2px solid ${border};">${c.cta2||""}</button></div>${c.note?`<p style="font-size:12px;color:${muted};margin-top:20px;">${c.note}</p>`:""}</section>`;
    if (s.type === "footer") return `<footer style="padding:60px 48px 28px;background:${card};border-top:1px solid ${border};"><div style="display:grid;grid-template-columns:2fr ${(c.cols||[]).map(()=>"1fr").join(" ")};gap:40px;margin-bottom:44px;"><div><div style="font-size:20px;font-weight:800;color:${accent};margin-bottom:10px;">${c.brand||""}</div><div style="font-size:13px;color:${muted};line-height:1.7;max-width:200px;">${c.tagline||""}</div></div>${(c.cols||[]).map(col=>`<div><div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${text};margin-bottom:14px;">${col.title}</div>${(col.links||[]).map(l=>`<div style="font-size:13px;color:${muted};margin-bottom:8px;">${l}</div>`).join("")}</div>`).join("")}</div><div style="border-top:1px solid ${border};padding-top:20px;display:flex;justify-content:space-between;font-size:12px;color:${muted};flex-wrap:wrap;gap:8px;"><span>${c.copyright||""}</span><span>${c.footnote||""}</span></div></footer>`;
    if (s.type === "map") return `<div style="background:${card};"><div style="width:100%;min-height:${c.height||380}px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#f0f4f8;"><div style="font-size:48px;">📍</div><div style="font-size:14px;font-weight:700;color:#1e293b;">${c.title||""}</div><div style="font-size:13px;color:#64748b;">${c.address||""}</div><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address||"")}" target="_blank" style="padding:8px 18px;background:${accent};color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;margin-top:8px;">Open in Maps</a></div></div>`;
    if (s.type === "contact") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};margin-bottom:12px;">${c.title||""}</h2><p style="font-size:16px;color:${muted};max-width:500px;margin:0 auto;">${c.subtitle||""}</p></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:900px;margin:0 auto;"><form style="background:${card};border-radius:14px;padding:28px 24px;border:1px solid ${border};">${(c.fields||[]).map(f=>`<div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:${text};margin-bottom:6px;">${f.label}${f.required?`<span style="color:${accent};">*</span>`:""}</label>${f.type==="textarea"?`<textarea placeholder="${f.placeholder||""}" style="width:100%;padding:10px 14px;border-radius:9px;border:1.5px solid ${border};background:#fff;color:#1e293b;font-size:14px;min-height:100px;resize:vertical;" rows="4"></textarea>`:`<input type="${f.type||"text"}" placeholder="${f.placeholder||""}" style="width:100%;padding:10px 14px;border-radius:9px;border:1.5px solid ${border};background:#fff;color:#1e293b;font-size:14px;">`}</div>`).join("")}<button type="submit" style="width:100%;padding:13px;background:${accent};color:white;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">${c.submitText||"Send message"}</button></form><div>${(c.infoItems||[]).map(i=>`<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;"><div style="width:42px;height:42px;border-radius:10px;background:${accent}18;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📧</div><div><div style="font-size:13px;font-weight:700;color:${text};margin-bottom:3px;">${i.title}</div><div style="font-size:13px;color:${muted};line-height:1.55;">${i.value.replace(/\n/g,"<br>")}</div></div></div>`).join("")}</div></div></section>`;
    if (s.type === "stats") return `<section style="padding:64px 48px;background:${card};"><div style="text-align:center;margin-bottom:40px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};">${c.title||""}</h2></div><div style="display:grid;grid-template-columns:repeat(${(c.items||[]).length},1fr);gap:20px;">${(c.items||[]).map(i=>`<div style="padding:28px 20px;border-radius:${radius};background:${bg};border:1px solid ${border};text-align:center;"><div style="font-size:44px;font-weight:800;color:${accent};margin-bottom:6px;">${i.number}</div><div style="font-size:14px;font-weight:600;color:${text};margin-bottom:4px;">${i.label}</div><div style="font-size:12px;color:${muted};">${i.desc||""}</div></div>`).join("")}</div></section>`;
    if (s.type === "pricing") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};margin-bottom:12px;">${c.title||""}</h2><p style="font-size:16px;color:${muted};max-width:500px;margin:0 auto;">${c.subtitle||""}</p></div><div style="display:grid;grid-template-columns:repeat(${(c.plans||[]).length},1fr);gap:20px;max-width:900px;margin:0 auto;">${(c.plans||[]).map(p=>`<div style="padding:30px 24px;border-radius:16px;border:2px solid ${p.featured?accent:border};background:${p.featured?accent+"12":card};position:relative;">${p.badge?`<div style="position:absolute;top:-11px;left:50%;transform:translateX(-50%);padding:3px 14px;border-radius:100px;background:${accent};color:white;font-size:11px;font-weight:700;">${p.badge}</div>`:""}<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:${accent};margin-bottom:14px;">${p.name}</div><div style="font-size:46px;font-weight:800;color:${text};margin-bottom:4px;">${p.price}</div><div style="font-size:13px;color:${muted};margin-bottom:24px;">${p.period}</div><ul style="list-style:none;margin:0 0 28px;">${(p.features||[]).map(f=>`<li style="font-size:13px;color:${muted};padding:6px 0;display:flex;gap:8px;border-bottom:1px solid ${border}80;"><span style="color:${accent};">✓</span>${f}</li>`).join("")}</ul><button style="width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;background:${p.featured?accent:"transparent"};color:${p.featured?"white":text};border:2px solid ${p.featured?accent:border};">${p.cta}</button></div>`).join("")}</div></section>`;
    if (s.type === "faq-page") return `<div style="background:${bg};"><div style="padding:72px 48px 48px;text-align:center;border-bottom:1px solid ${border};"><h1 style="font-size:46px;font-weight:800;color:${text};margin-bottom:14px;">${c.pageTitle||""}</h1><p style="font-size:17px;color:${muted};max-width:500px;margin:0 auto;">${c.pageSubtitle||""}</p></div><div style="padding:56px 48px;max-width:860px;margin:0 auto;">${(c.categories||[]).map(cat=>`<div style="margin-bottom:48px;"><h2 style="font-size:22px;font-weight:700;color:${text};margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid ${accent};">${cat.name}</h2>${(cat.items||[]).map(item=>`<details style="margin-bottom:2px;"><summary style="padding:16px 4px;font-size:15px;font-weight:600;color:${text};cursor:pointer;display:flex;justify-content:space-between;list-style:none;border-bottom:1px solid ${border};">${item.q}</summary><p style="padding:14px 4px 20px;font-size:14px;line-height:1.75;color:${muted};">${item.a}</p></details>`).join("")}</div>`).join("")}</div></div>`;
    if (s.type === "privacy-page" || s.type === "terms-page") return `<div style="background:${bg};"><div style="padding:72px 48px 48px;border-bottom:1px solid ${border};"><div style="max-width:760px;margin:0 auto;"><h1 style="font-size:38px;font-weight:800;color:${text};margin-bottom:8px;">${c.pageTitle||""}</h1><p style="font-size:13px;color:${muted};margin-bottom:20px;">Last updated: ${c.lastUpdated||""}</p><p style="font-size:15px;line-height:1.8;color:${muted};">${c.intro||""}</p></div></div><div style="padding:48px;max-width:760px;margin:0 auto;">${(c.sections||[]).map(sec=>`<div style="margin-bottom:36px;"><h2 style="font-size:18px;font-weight:700;color:${text};margin-bottom:12px;">${sec.title}</h2><p style="font-size:15px;line-height:1.8;color:${muted};">${sec.content}</p></div>`).join("")}</div></div>`;
    if (s.type === "about-page") return `<div style="background:${bg};"><div style="padding:90px 48px 72px;text-align:center;border-bottom:1px solid ${border};"><h1 style="font-size:52px;font-weight:800;color:${text};line-height:1.08;margin-bottom:20px;">${(c.heroTitle||"").replace(/\n/g,"<br>")}</h1><p style="font-size:18px;color:${muted};max-width:560px;margin:0 auto 40px;">${c.heroSubtitle||""}</p><div style="display:grid;grid-template-columns:repeat(${(c.stats||[]).length},1fr);gap:20px;max-width:700px;margin:0 auto;">${(c.stats||[]).map(s2=>`<div style="padding:20px 16px;border-radius:${radius};background:${card};border:1px solid ${border};text-align:center;"><div style="font-size:36px;font-weight:800;color:${accent};">${s2.number}</div><div style="font-size:13px;color:${muted};">${s2.label}</div></div>`).join("")}</div></div><div style="padding:64px 48px;max-width:760px;margin:0 auto;">${(c.story||"").split("\n\n").map(p=>`<p style="font-size:15px;line-height:1.85;color:${muted};margin-bottom:18px;">${p}</p>`).join("")}</div></div>`;
    if (s.type === "404-page") return `<div style="padding:100px 48px;text-align:center;background:${bg};min-height:500px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:120px;font-weight:900;line-height:1;background:linear-gradient(135deg,${accent},#22D3A3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:20px;">${c.illustration||"404"}</div><h1 style="font-size:28px;font-weight:800;color:${text};margin-bottom:12px;">${c.title||""}</h1><p style="font-size:16px;color:${muted};margin-bottom:36px;">${c.subtitle||""}</p><div style="display:flex;gap:14px;justify-content:center;"><button style="padding:13px 28px;border-radius:10px;font-size:15px;font-weight:700;background:${accent};color:white;border:none;">${c.ctaText||""}</button><button style="padding:12px 26px;border-radius:10px;font-size:15px;font-weight:600;background:transparent;color:${text};border:2px solid ${border};">${c.ctaSecondary||""}</button></div></div>`;
    if (s.type === "spacer") return `<div style="height:${c.height||64}px;"></div>`;
    if (s.type === "divider") return `<div style="padding:${c.margins||48}px 48px;"><hr style="border:none;border-top:${c.thickness||1}px ${c.style||"solid"} ${border};"></div>`;
    if (s.type === "banner") return `<div style="padding:10px 48px;background:${accent}15;border-bottom:1px solid ${accent}30;display:flex;align-items:center;justify-content:center;gap:16px;font-size:14px;"><span style="font-weight:600;color:${text};">${c.text||""}</span><span style="color:${accent};font-weight:700;">${c.cta||""}</span></div>`;
    if (s.type === "logos") return `<div style="padding:40px 48px;background:${bg};text-align:center;"><p style="font-size:12px;color:${muted};font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:28px;">${c.tag||""}</p><div style="display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap;">${(c.logos||[]).map(l=>`<span style="font-size:18px;font-weight:800;color:${muted};opacity:.45;">${l}</span>`).join("")}</div></div>`;
    if (s.type === "testimonials") return `<section style="padding:72px 48px;background:${card};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};">${c.title||""}</h2></div><div style="display:grid;grid-template-columns:repeat(${Math.min((c.items||[]).length,3)},1fr);gap:18px;">${(c.items||[]).map(i=>`<div style="padding:26px;border-radius:${radius};background:${bg};border:1px solid ${border};"><div style="color:${accent};margin-bottom:14px;">${"★".repeat(i.stars||5)}</div><p style="font-size:15px;line-height:1.7;color:${muted};margin-bottom:20px;font-style:italic;">"${i.text}"</p><div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;border-radius:50%;background:${accent}22;color:${accent};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${i.avatar}</div><div><div style="font-size:13px;font-weight:700;color:${text};">${i.name}</div><div style="font-size:11px;color:${muted};">${i.role}</div></div></div></div>`).join("")}</div></section>`;
    if (s.type === "team") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};">${c.title||""}</h2></div><div style="display:grid;grid-template-columns:repeat(${c.cols||4},1fr);gap:20px;">${(c.members||[]).map(m=>`<div style="border-radius:${radius};background:${card};border:1px solid ${border};text-align:center;padding:0 16px 24px;"><div style="width:72px;height:72px;border-radius:50%;background:${accent}22;color:${accent};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin:22px auto 14px;">${m.avatar}</div><div style="font-size:15px;font-weight:700;color:${text};margin-bottom:4px;">${m.name}</div><div style="font-size:12px;color:${accent};margin-bottom:10px;">${m.role}</div><div style="font-size:13px;color:${muted};line-height:1.6;">${m.bio}</div></div>`).join("")}</div></section>`;
    if (s.type === "faq") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:48px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};">${c.title||""}</h2></div><div style="max-width:720px;margin:0 auto;">${(c.items||[]).map(i=>`<details style="border-bottom:1px solid ${border};"><summary style="padding:18px 4px;font-size:15px;font-weight:600;color:${text};cursor:pointer;list-style:none;">${i.q}</summary><p style="padding:0 4px 18px;font-size:14px;line-height:1.75;color:${muted};">${i.a}</p></details>`).join("")}</div></section>`;
    if (s.type === "gallery") return `<section style="padding:72px 48px;background:${bg};"><div style="text-align:center;margin-bottom:40px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};">${c.title||""}</h2></div><div style="display:grid;grid-template-columns:repeat(${c.cols||3},1fr);gap:12px;">${(c.items||[]).map(i=>`<div style="border-radius:${radius};background:${i.bg||card};min-height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;"><span style="font-size:36px;">${i.emoji}</span><span style="font-size:13px;font-weight:600;color:#333;">${i.label}</span></div>`).join("")}</div></section>`;
    if (s.type === "video") return `<section style="padding:72px 48px;text-align:center;background:${bg};"><div style="text-align:center;margin-bottom:40px;"><span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${accent}18;color:${accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">${c.tag||""}</span><h2 style="font-size:36px;font-weight:800;color:${text};margin-bottom:12px;">${c.title||""}</h2><p style="font-size:16px;color:${muted};">${c.subtitle||""}</p></div><div style="border-radius:16px;background:${card};border:1px solid ${border};aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;font-size:64px;max-width:900px;margin:0 auto;">${c.thumbnail||"🎬"}</div></section>`;
    if (s.type === "richtext") return `<section style="padding:56px 48px;background:${bg};"><div style="max-width:720px;margin:0 auto;color:${text};font-size:15px;line-height:1.8;">${c.content||""}</div></section>`;
    if (s.type === "cookie-page") return `<div style="background:${bg};"><div style="padding:72px 48px 48px;border-bottom:1px solid ${border};"><div style="max-width:760px;margin:0 auto;"><h1 style="font-size:38px;font-weight:800;color:${text};margin-bottom:8px;">${c.pageTitle||""}</h1><p style="font-size:13px;color:${muted};margin-bottom:20px;">Last updated: ${c.lastUpdated||""}</p><p style="font-size:15px;line-height:1.8;color:${muted};">${c.intro||""}</p></div></div><div style="padding:48px;max-width:760px;margin:0 auto;">${(c.cookieTypes||[]).map(ct=>`<div style="margin-bottom:28px;padding:24px;border-radius:${radius};background:${card};border:1px solid ${border};"><div style="display:flex;justify-content:space-between;margin-bottom:10px;"><div style="font-size:16px;font-weight:700;color:${text};">${ct.name}</div><span style="padding:3px 10px;border-radius:100px;background:${ct.required?"#22D3A320":""+accent+"18"};color:${ct.required?"#22D3A3":accent};font-size:11px;font-weight:700;">${ct.required?"Always Active":"Optional"}</span></div><p style="font-size:14px;color:${muted};line-height:1.7;">${ct.desc}</p></div>`).join("")}</div></div>`;
    if (s.type === "changelog-page") return `<div style="background:${bg};"><div style="padding:72px 48px 48px;text-align:center;border-bottom:1px solid ${border};"><h1 style="font-size:46px;font-weight:800;color:${text};margin-bottom:12px;">${c.pageTitle||""}</h1><p style="font-size:16px;color:${muted};">${c.pageSubtitle||""}</p></div><div style="padding:56px 48px;max-width:760px;margin:0 auto;">${(c.entries||[]).map(e=>`<div style="display:grid;grid-template-columns:160px 1fr;gap:32px;margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid ${border};"><div><div style="font-size:16px;font-weight:700;color:${accent};margin-bottom:4px;">${e.version}</div><div style="font-size:13px;color:${muted};">${e.date}</div></div><div>${(e.items||[]).map(i=>`<div style="display:flex;gap:10px;margin-bottom:10px;"><span style="padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700;text-transform:uppercase;background:${i.type==="new"?"#22D3A320":"#FBD220"};color:${i.type==="new"?"#22D3A3":"#92400E"};">${i.type}</span><span style="font-size:14px;color:${muted};">${i.text}</span></div>`).join("")}</div></div>`).join("")}</div></div>`;
    if (s.type === "blog-page") return `<div style="background:${bg};"><div style="padding:72px 48px 40px;border-bottom:1px solid ${border};"><h1 style="font-size:46px;font-weight:800;color:${text};margin-bottom:12px;">${c.pageTitle||""}</h1><p style="font-size:16px;color:${muted};">${c.pageSubtitle||""}</p></div><div style="padding:32px 48px 72px;"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">${(c.posts||[]).map(p=>`<div style="border:1px solid ${border};border-radius:${radius};overflow:hidden;"><div style="height:140px;background:${card};display:flex;align-items:center;justify-content:center;font-size:48px;">${p.emoji}</div><div style="padding:18px 20px 20px;"><div style="margin-bottom:10px;"><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;background:${accent}18;color:${accent};">${p.cat}</span></div><h3 style="font-size:15px;font-weight:700;color:${text};margin-bottom:8px;line-height:1.4;">${p.title}</h3><p style="font-size:13px;color:${muted};line-height:1.6;margin-bottom:14px;">${p.excerpt}</p><span style="font-size:12px;color:${muted};">${p.date}</span></div></div>`).join("")}</div></div></div>`;
    return `<div style="padding:40px;text-align:center;color:${muted};">${s.type}</div>`;
  }).join("\n");
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>PageCraft Export</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;background:${bg};color:${text}}button{font-family:inherit;cursor:pointer}details summary{cursor:pointer}details summary::-webkit-details-marker{display:none}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${border};border-radius:99px}img{max-width:100%}</style>\n</head>\n<body>\n${secs}\n</body>\n</html>`;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
let sid = 1000;

export default function TestPage() {
  const [ltab, setLtab] = useState("widgets");
  const [device, setDevice] = useState("desktop");
  const [showModal, setShowModal] = useState(false);
  const [selTpl, setSelTpl] = useState(null);
  const [selId, setSelId] = useState(null);
  const [pages, setPages] = useState(["Home", "FAQ", "Privacy", "About"]);
  const [activePage, setActivePage] = useState("Home");
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragSecIdx, setDragSecIdx] = useState(null);
  const [wSearch, setWSearch] = useState("");
  const [lSearch, setLSearch] = useState("");
  const [hist, setHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);

  const [theme, setTheme] = useState(TEMPLATES[0].theme);
  const [sections, setSections] = useState(() =>
    TEMPLATES[0].sections.map(type => ({ id: ++sid, type, content: dflt(type) }))
  );

  const toast$ = useCallback((msg, ms = 2500) => { setToast(msg); setTimeout(() => setToast(null), ms); }, []);

  const pushHist = useCallback((secs) => {
    setHist(h => [...h.slice(0, histIdx + 1), JSON.parse(JSON.stringify(secs))]);
    setHistIdx(h => h + 1);
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx > 0) { setHistIdx(h => h - 1); setSections(JSON.parse(JSON.stringify(hist[histIdx - 1]))); toast$("↩ Undone"); }
  }, [hist, histIdx]);

  const redo = useCallback(() => {
    if (histIdx < hist.length - 1) { setHistIdx(h => h + 1); setSections(JSON.parse(JSON.stringify(hist[histIdx + 1]))); toast$("↪ Redone"); }
  }, [hist, histIdx]);

  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Escape") setSelId(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selId) {
        const tag = document.activeElement.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && !document.activeElement.isContentEditable) {
          mutate(prev => prev.filter(s => s.id !== selId));
          setSelId(null); toast$("🗑️ Removed");
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [selId, undo, redo]);

  const mutate = useCallback((fn) => {
    setSections(prev => { const next = fn(prev); pushHist(next); return next; });
  }, [pushHist]);

  const addSec = useCallback((type, atIdx = null) => {
    const ns = { id: ++sid, type, content: dflt(type) };
    mutate(prev => {
      if (atIdx !== null) { const a = [...prev]; a.splice(atIdx, 0, ns); return a; }
      return [...prev, ns];
    });
    setSelId(ns.id);
    toast$(`✅ ${type} added`);
  }, [mutate]);

  const delSec = useCallback((id) => {
    mutate(prev => prev.filter(s => s.id !== id));
    if (selId === id) setSelId(null);
    toast$("🗑️ Removed");
  }, [mutate, selId]);

  const dupSec = useCallback((id) => {
    mutate(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const copy = { ...JSON.parse(JSON.stringify(prev[idx])), id: ++sid };
      const arr = [...prev]; arr.splice(idx + 1, 0, copy); return arr;
    });
    toast$("⎘ Duplicated");
  }, [mutate]);

  const moveSec = useCallback((id, dir) => {
    mutate(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      const arr = [...prev]; [arr[idx], arr[ni]] = [arr[ni], arr[idx]]; return arr;
    });
  }, [mutate]);

  const updContent = useCallback((id, path, val) => {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      const content = JSON.parse(JSON.stringify(s.content));
      const parts = path.split(".");
      let obj = content;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = isNaN(parts[i]) ? parts[i] : Number(parts[i]);
        if (obj[k] === undefined || obj[k] === null) obj[k] = isNaN(parts[i + 1]) ? {} : [];
        obj = obj[k];
      }
      const lk = isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : Number(parts[parts.length - 1]);
      obj[lk] = val;
      return { ...s, content };
    }));
  }, []);

  const applyTpl = (tpl) => {
    const newSecs = tpl.sections.map(type => ({ id: ++sid, type, content: dflt(type) }));
    setTheme({ ...tpl.theme });
    setSections(newSecs);
    pushHist(newSecs);
    setSelId(null);
    setShowModal(false);
    toast$(`✅ "${tpl.name}" applied`);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggingWidget) { addSec(draggingWidget, idx); setDraggingWidget(null); }
    else if (dragSecIdx !== null && dragSecIdx !== idx) {
      mutate(prev => {
        const arr = [...prev];
        const [rem] = arr.splice(dragSecIdx, 1);
        arr.splice(dragSecIdx < idx ? idx - 1 : idx, 0, rem);
        return arr;
      });
    }
    setDragOver(null); setDragSecIdx(null);
  };

  const exportHTML = () => {
    const html = buildHTML(sections, theme);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activePage.toLowerCase().replace(/\s+/g, "-")}.html`; a.click();
    URL.revokeObjectURL(url);
    toast$("📦 HTML exported!", 3000);
  };

  const selSec = sections.find(s => s.id === selId);
  const filtWidgets = wSearch
    ? Object.fromEntries(Object.entries(WIDGETS).map(([cat, items]) => [cat, items.filter(w => w.label.toLowerCase().includes(wSearch.toLowerCase()))]).filter(([, v]) => v.length))
    : WIDGETS;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* TOPBAR */}
        <div className="topbar">
          <span className="logo">PageCraft</span>
          <div className="tsep"/>
          <button className="tbtn" onClick={() => setShowModal(true)}><LayoutTemplate size={13}/>Templates</button>
          <div className="ptabs">
            {pages.map(p => <div key={p} className={`ptab${activePage===p?" on":""}`} onClick={() => setActivePage(p)}>{p}</div>)}
            <div className="ptabadd" onClick={() => {
              const n = `Page ${pages.length + 1}`;
              setPages(ps => [...ps, n]); setActivePage(n); setSections([]); toast$(`📄 "${n}" created`);
            }}><Plus size={12}/></div>
          </div>
          <div className="tsp"/>
          <button className="tbtn" onClick={undo} disabled={histIdx <= 0}><Undo2 size={13}/>Undo</button>
          <button className="tbtn" onClick={redo} disabled={histIdx >= hist.length - 1}><Redo2 size={13}/>Redo</button>
          <div className="tsep"/>
          <div className="devgroup">
            {[["desktop",Monitor,"Desktop"],["tablet",Tablet,"Tablet"],["mobile",Smartphone,"Mobile"]].map(([d,Icon,lbl]) => (
              <button key={d} className={`devbtn${device===d?" on":""}`} onClick={() => setDevice(d)} title={lbl}><Icon size={14}/></button>
            ))}
          </div>
          <div className="tsep"/>
          <button className="tbtn ghost" onClick={() => toast$("👁 Opening preview...")}><Eye size={13}/>Preview</button>
          <button className="tbtn" onClick={exportHTML}><Download size={13}/>Export HTML</button>
          <button className="tbtn prim" onClick={() => toast$("🚀 Published!")}><Rocket size={13}/>Publish</button>
        </div>

        <div className="body">
          {/* LEFT PANEL */}
          <div className="lpanel">
            <div className="ltabs">
              {[["widgets","Widgets"],["static","Pages"],["layers","Layers"]].map(([t,l]) => (
                <div key={t} className={`ltab${ltab===t?" on":""}`} onClick={() => setLtab(t)}>{l}</div>
              ))}
            </div>
            <div className="lbody">
              {ltab === "widgets" && (<>
                <div className="sinput-wrap">
                  <span className="sicon"><Search size={12}/></span>
                  <input className="sinput" placeholder="Search widgets..." value={wSearch} onChange={e => setWSearch(e.target.value)}/>
                </div>
                {Object.entries(filtWidgets).map(([cat, items]) => items.length > 0 && (
                  <div key={cat}>
                    <div className="catlabel">{cat}</div>
                    <div className="wgrid">
                      {items.map(w => (
                        <div key={w.id} className="wcard"
                          draggable onDragStart={e => { setDraggingWidget(w.id); e.dataTransfer.effectAllowed = "copy"; }}
                          onDragEnd={() => setDraggingWidget(null)}
                          onClick={() => addSec(w.id)}>
                          <WIcon type={w.id} size={17} color={T.accent}/>
                          <span className="wlabel">{w.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!wSearch && (
                  <div style={{ paddingTop:8,fontSize:11,color:T.muted,lineHeight:1.6,padding:"10px 4px 0" }}>
                    💡 Click to add · Drag onto canvas
                  </div>
                )}
              </>)}

              {ltab === "static" && (<>
                <div className="catlabel">Static Pages</div>
                <div className="wgrid">
                  {STATIC_PAGES_CATALOG.map(w => (
                    <div key={w.id} className="wcard"
                      draggable onDragStart={e => { setDraggingWidget(w.id); e.dataTransfer.effectAllowed = "copy"; }}
                      onDragEnd={() => setDraggingWidget(null)}
                      onClick={() => addSec(w.id)}>
                      <WIcon type={w.id} size={17} color={T.accent}/>
                      <span className="wlabel">{w.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11,color:T.muted,lineHeight:1.6,padding:"10px 4px 0" }}>
                  Full pre-built static pages. Add one and customize all text inline.
                </div>
                <div className="catlabel" style={{ marginTop:10 }}>Templates</div>
                {TEMPLATES.map(tpl => (
                  <div key={tpl.id} className="tplcard">
                    <div className="tplthumb"><TplThumb tpl={tpl}/></div>
                    <div className="tplfoot">
                      <div className="tplname">{tpl.name}</div>
                      <div className="tplcat">{tpl.cat} · {tpl.sections.length} sections</div>
                      <button className="tplbtn" onClick={() => applyTpl(tpl)}>Use template</button>
                    </div>
                  </div>
                ))}
              </>)}

              {ltab === "layers" && (<>
                <div className="sinput-wrap">
                  <span className="sicon"><Search size={12}/></span>
                  <input className="sinput" placeholder="Filter..." value={lSearch} onChange={e => setLSearch(e.target.value)}/>
                </div>
                {sections.filter(s => !lSearch || s.type.includes(lSearch.toLowerCase())).map((s, i) => (
                  <div key={s.id} className={`layitem${selId===s.id?" on":""}`} onClick={() => setSelId(id => id === s.id ? null : s.id)}>
                    <WIcon type={s.type} size={13} color={selId===s.id ? T.accent : T.muted}/>
                    <span className="laytxt">{s.type.replace(/-/g," ")}</span>
                    <span className="laynum">#{i+1}</span>
                  </div>
                ))}
                {sections.length === 0 && <div style={{ fontSize:12,color:T.muted,textAlign:"center",paddingTop:16 }}>No sections yet</div>}
                <div style={{ fontSize:11,color:T.muted,padding:"8px 4px 0" }}>{sections.length} section{sections.length !== 1 ? "s" : ""}</div>
              </>)}
            </div>
          </div>

          {/* CANVAS */}
          <div className="canvas-area" onClick={() => setSelId(null)}>
            <div style={{ width:"100%",display:"flex",justifyContent:"center" }}>
              <div className={`cframe ${device}`}>
                {sections.length === 0 && (
                  <div className="empty-cv">
                    <Layers size={48} className="empty-icon" color={T.muted}/>
                    <div className="empty-txt">Your canvas is empty.<br/>Drag widgets or pick a template.</div>
                    <button className="empty-cta" onClick={() => setShowModal(true)}>Browse Templates</button>
                  </div>
                )}

                {sections.map((section, i) => (
                  <div key={section.id}>
                    <div
                      className={`dropzone${dragOver===i?" over":""}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={e => handleDrop(e, i)}
                    >{dragOver===i && "Drop here"}</div>
                    <div
                      draggable
                      onDragStart={e => { setDragSecIdx(i); e.dataTransfer.effectAllowed = "move"; }}
                      onDragEnd={() => { setDragSecIdx(null); setDragOver(null); }}
                      onDragOver={e => { e.preventDefault(); setDragOver(i+1); }}
                      onDrop={e => handleDrop(e, i+1)}
                    >
                      <Sec
                        section={section} theme={theme}
                        isSel={selId === section.id}
                        onClick={e => { e.stopPropagation(); setSelId(id => id === section.id ? null : section.id); }}
                        onUpdate={updContent}
                        onDelete={() => delSec(section.id)}
                        onDup={() => dupSec(section.id)}
                        onUp={() => moveSec(section.id, -1)}
                        onDown={() => moveSec(section.id, 1)}
                        canUp={i > 0} canDown={i < sections.length - 1}
                      />
                    </div>
                  </div>
                ))}
                <div
                  className={`dropzone bdrop${dragOver===sections.length?" over":""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(sections.length); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, sections.length)}
                >{dragOver===sections.length && "Drop here"}</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <PropPanel
            section={selSec || null}
            theme={theme}
            onThemeChange={(k, v) => setTheme(p => ({ ...p, [k]: v }))}
            onContentChange={(path, val) => selId && updContent(selId, path, val)}
          />
        </div>
      </div>

      {/* TEMPLATE MODAL */}
      {showModal && (
        <div className="ovl" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div>
                <div className="modal-title">Choose a Template</div>
                <div className="modal-sub">Start with a professional layout, then customize everything inline</div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="tgrid">
                {TEMPLATES.map(tpl => (
                  <div key={tpl.id} className={`tcard${selTpl===tpl.id?" on":""}`} onClick={() => setSelTpl(tpl.id)}>
                    <div className="tthumb"><TplThumb tpl={tpl}/></div>
                    <div className="tinfo">
                      <div className="tname">{tpl.name}</div>
                      <div className="tdesc">{tpl.desc} · {tpl.sections.length} sections</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-ft">
              <button className="tbtn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="tbtn prim" onClick={() => applyTpl(TEMPLATES.find(t => t.id === selTpl) || TEMPLATES[0])}>
                Use template <ArrowRight size={13}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}