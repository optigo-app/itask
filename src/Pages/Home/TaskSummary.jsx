import {
    Package, UserCheck, UserX, Clock, Settings, Layers, Star,
    TrendingUp, FlaskConical, Palette, FilePen, CalendarOff, Wrench,
    Shuffle, Target, BarChart3, GraduationCap, Users,
    CircleCheck, PauseCircle, Play,
    RotateCcw, SkipForward, CircleDot, Hourglass, ClipboardList,
    CircleX, CalendarClock,
} from 'lucide-react';
import {
    Card, CardContent, Box, Typography, Skeleton,
} from "@mui/material";
import { useEffect, useState } from 'react';
import { TaskSummaryApi } from '../../Api/TaskApi/TaskSummaryApi';

const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');

// Category-wise icons (keys normalized: lower, trimmed, spaces removed)
const categoryIconMapping = {
    "services": Package,
    "r&d": Layers,
    "rnd-tech": FlaskConical,
    "productive": TrendingUp,
    "creative": Palette,
    "sopcorrection": FilePen,
    "leave": CalendarOff,
    "maintenance": Wrench,
    "customerrequestmaintenance": Users,
    "unplanned": Shuffle,
    "challenges": Target,
    "reporting": BarChart3,
    "meeting": Users,
    "training": GraduationCap,
};

// Status-wise icons (keys normalized: lower, trimmed, spaces removed)
const statusIconMapping = {
    "pending": Clock,
    "shorttermpending": Clock,
    "longtermpending": Clock,
    "onhold": PauseCircle,
    "hold": PauseCircle,
    "hold-on-challenge": PauseCircle,
    "shorttermhold": PauseCircle,
    "longtermhold": PauseCircle,
    "completed": CircleCheck,
    "complete": CircleCheck,
    "inprogress": Play,
    "progress": Play,
    "running": Play,
    "started": Play,
    "dev": Wrench,
    "initialized": CircleDot,
    "testing": FlaskConical,
    "beta-runuat": FlaskConical,
    "prototype": FlaskConical,
    "review": ClipboardList,
    "inreview": ClipboardList,
    "feedback": ClipboardList,
    "srs": FilePen,
    "reopen": RotateCcw,
    "reschedule": CalendarClock,
    "deferred": SkipForward,
    "delayed": Hourglass,
    "approvalpending": Hourglass,
    "selected": UserCheck,
    "delivery": Package,
    "cancelled": CircleX,
    "meetings-srd": Users,
    "todo": CircleDot,
    "new": CircleDot,
};

const palette = [
    { color: "#3B82F6", bgColor: "#EFF6FF", borderColor: "#BEE3F8" }, // Blue
    { color: "#10B981", bgColor: "#ECFDF5", borderColor: "#D1FAE5" }, // Green
    { color: "#14B8A6", bgColor: "#F0FDFA", borderColor: "#C6F7E2" }, // Teal
    { color: "#8B5CF6", bgColor: "#F5F3FF", borderColor: "#EDE9FE" }, // Purple
    { color: "#F97316", bgColor: "#FFF7ED", borderColor: "#FED7AA" }, // Orange
    { color: "#EC4899", bgColor: "#FDF2F8", borderColor: "#FBCFE8" }, // Pink
    { color: "#0EA5E9", bgColor: "#F0F9FF", borderColor: "#BAE6FD" }, // Sky
    { color: "#84CC16", bgColor: "#F7FEE7", borderColor: "#D9F99D" }, // Lime
];

const VISIBLE_TOTAL = 7; // one row of cards before expand

export default function SummaryDashboard({ view = 'category', expanded = false, onMetaChange }) {
    const [summary, setSummary] = useState(null);
    const taskWorkCategoryData = JSON.parse(
        sessionStorage.getItem('taskworkcategoryData') || localStorage.getItem('taskworkcategoryData') || '[]'
    );
    const taskStatusData = JSON.parse(
        sessionStorage.getItem('taskstatusData') || localStorage.getItem('taskstatusData') || '[]'
    );

    useEffect(() => {
        let mounted = true;
        (async () => {
            const res = await TaskSummaryApi();
            if (mounted) setSummary(res);
        })();
        return () => { mounted = false; };
    }, []);

    const labelsReady = taskWorkCategoryData?.length > 0 && taskStatusData?.length > 0;
    const isLoading = summary === null || !labelsReady;

    const categoryCards = (summary?.rd || []).map((row, idx) => {
        const category = taskWorkCategoryData?.find((c) => c.id == row?.workcategoryid);
        const label = category?.labelname ?? `Category ${row?.workcategoryid ?? ''}`;
        const colors = palette[idx % palette.length];
        return {
            title: `${label} Tasks`,
            value: row?.Total ?? 0,
            newTasks: row?.TodayTask ?? 0,
            icon: categoryIconMapping[norm(label)] || Package,
            ...colors,
        };
    });

    const statusCards = (summary?.rd3 || []).map((row, idx) => {
        const status = taskStatusData?.find((s) => s.id == row?.statusid);
        const label = status?.labelname ?? `Status ${row?.statusid ?? ''}`;
        const colors = palette[idx % palette.length];
        return {
            title: label,
            value: row?.Total ?? 0,
            newTasks: row?.TodayTask ?? 0,
            icon: statusIconMapping[norm(label)] || CircleDot,
            ...colors,
        };
    });

    // Category view reserves 4 slots for fixed cards (Favorite, UpComming,
    // Unassigned, Due) — the rest of the row fills with categories. Status
    // view fills all 7 slots with statuses.
    const categorySlots = Math.max(0, VISIBLE_TOTAL - 4);
    const visibleCategoryCards = expanded ? categoryCards : categoryCards.slice(0, categorySlots);
    const visibleStatusCards = expanded ? statusCards : statusCards.slice(0, VISIBLE_TOTAL);
    const hiddenCount = Math.max(
        0,
        view === 'category'
            ? categoryCards.length - categorySlots
            : statusCards.length - VISIBLE_TOTAL
    );

    useEffect(() => {
        onMetaChange?.(hiddenCount);
    }, [hiddenCount, onMetaChange]);

    const metrics = [
        {
            title: "Favorite Tasks",
            value: 15,
            newTasks: 3,
            icon: Star,
            color: "#FFB900",
            bgColor: "#FFF9E6",
            borderColor: "#FFD700",
        },
        ...visibleCategoryCards,
        {
            title: "UpComming Tasks",
            value: summary?.rd2?.[0]?.Upcoming ?? 0,
            newTasks: summary?.rd2?.[0]?.TodayTask ?? 0,
            icon: UserCheck,
            color: "#F97316",
            bgColor: "#FFF7ED",
            borderColor: "#FED7AA",
        },
        {
            title: "Unassigned Tasks",
            value: 63,
            newTasks: 7,
            icon: UserX,
            color: "#EF4444",
            bgColor: "#FEF2F2",
            borderColor: "#FECACA",
        },
        {
            title: "Due Tasks",
            value: summary?.rd1?.[0]?.Overdue ?? 0,
            newTasks: summary?.rd1?.[0]?.DueToday ?? 0,
            icon: Clock,
            color: "#8B5CF6",
            bgColor: "#F5F3FF",
            borderColor: "#EDE9FE",
        },
    ];

    const renderCard = (metric, index) => {
        const Icon = metric?.icon;
        const countText = `${metric?.newTasks ?? ''}${metric?.newTasks != null ? '/' : ''}${metric?.value ?? ''}`;
        const countFontSize = countText.length > 9 ? '1.1rem' : countText.length > 6 ? '1.3rem' : '1.6rem';
        return (
            <Card
                key={index}
                sx={{
                    transition: "all 0.2s",
                    borderRadius: "12px",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 3,
                    },
                    position: 'relative',
                }}
                className='HomePageCom'
            >
                <CardContent sx={{ p: "14px 16px", pb: "12px !important" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                            <Box className="taskCountBox" sx={{ display: "flex", alignItems: "baseline", gap: .2, whiteSpace: "nowrap" }}>
                                {metric?.newTasks != null && (
                                    <>
                                        <Typography variant="h4" className='typoFirst' style={{ fontSize: countFontSize }}>
                                            {metric?.newTasks}
                                        </Typography>
                                        <Typography variant="h4" className='typoSecond' style={{ fontSize: countFontSize }}>/</Typography>
                                    </>
                                )}
                                <Typography variant="h4" className='typoSecond' style={{ fontSize: countFontSize }}>
                                    {metric.value}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "10px",
                                backgroundColor: metric.bgColor,
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={20} style={{ color: metric.color }} />
                        </Box>
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#7D7F85",
                            fontWeight: 500,
                            textTransform: "capitalize",
                            mt: 0.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {metric?.title}
                    </Typography>
                </CardContent>
            </Card>
        );
    };

    // 7 across on large screens, shrinking responsively on smaller ones
    const gridSx = {
        display: "grid",
        gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
            xl: "repeat(7, 1fr)",
        },
        gap: 2,
    };

    return (
        <Box>
            {isLoading ? (
                <Box sx={gridSx}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.05)' }} />
                    ))}
                </Box>
            ) : view === 'category' ? (
                <Box sx={gridSx}>
                    {metrics?.map((metric, index) => renderCard(metric, index))}
                </Box>
            ) : (
                <Box sx={gridSx}>
                    {visibleStatusCards?.map((metric, index) => renderCard(metric, index))}
                </Box>
            )}
        </Box>
    );
}
