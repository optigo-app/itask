import React, { useState } from 'react'
import { Box, Button, Card, CardContent, LinearProgress, Tooltip, Typography } from '@mui/material'
import { FolderKanban, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import RowSkeleton from './RowSkeleton'

// Health state: red when work is overdue, amber when progress is behind,
// green otherwise — drives the dot, bar and chip colors as one unit.
const getHealth = (p) => {
    if (p.overdue > 0) return { key: 'critical', label: 'At Risk', color: '#ea5455', bg: 'rgba(234,84,85,0.12)' };
    if (p.pct < 50) return { key: 'warning', label: 'Behind', color: '#ff9f43', bg: 'rgba(255,159,67,0.14)' };
    return { key: 'healthy', label: 'On Track', color: '#28c76f', bg: 'rgba(40,199,111,0.12)' };
};

const ProjectHealth = ({ projects, navigate, isLoding }) => {
    const handleViewAll = () => navigate('/projects')
    const [showAll, setShowAll] = useState(false);
    const visibleProjects = showAll ? projects : projects?.slice(0, 8);

    return (
        <Card className='HomePageCom'>
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Project Health
                    </Typography>
                    {projects?.length > 0 && (
                        <Typography className='viewAllLink' onClick={handleViewAll}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {!isLoding && projects != null ? (
                    <>
                        {projects?.length > 0 ? (
                            <>
                            <Box className='listBox'>
                                {visibleProjects?.map((p) => {
                                    const health = getHealth(p);
                                    return (
                                        <Box className='listRow' key={p.projectid} sx={{ cursor: 'default' }}>
                                            <Tooltip title={health.label} arrow>
                                                <Box className='statusDot' sx={{ backgroundColor: health.color, boxShadow: `0 0 0 3px ${health.bg}` }} />
                                            </Tooltip>
                                            {/* name + overdue flag — fixed share so the bar column starts aligned */}
                                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Link className='prNameUrl rowTitle' to={`/projects?filter=${p?.name}`}>
                                                    {p?.name}
                                                </Link>
                                                {p.overdue > 0 && (
                                                    <Box className='statusChip' sx={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
                                                        {p.overdue} overdue
                                                    </Box>
                                                )}
                                            </Box>
                                            {/* progress + pct — same fixed share on every row */}
                                            <Box sx={{ flex: 0.5, minWidth: 80, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={p.pct}
                                                    className='projProgress'
                                                    sx={{
                                                        flex: 1,
                                                        maxWidth: 'none',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: `linear-gradient(90deg, ${health.color}, ${health.color}cc)`,
                                                        },
                                                    }}
                                                />
                                                <Typography className='pctText' sx={{ color: health.color }}>{p.pct}%</Typography>
                                            </Box>
                                            {/* health label + count — fixed widths → one clean column line */}
                                            <Box
                                                className='statusChip'
                                                sx={{ color: health.color, backgroundColor: health.bg, width: 72, textAlign: 'center' }}
                                            >
                                                {health.label}
                                            </Box>
                                            <Tooltip title={`${p.done} completed of ${p.total} tasks`} arrow>
                                                <Typography variant='caption' sx={{ color: '#7d7f85', minWidth: 48, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                                    {p.done}/{p.total}
                                                </Typography>
                                            </Tooltip>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {projects?.length > 8 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                    <Button onClick={() => setShowAll(!showAll)} variant="text" className="seeMoreBtn" size="small">
                                        {showAll ? 'See Less' : `See More (${projects.length - 8})`}
                                    </Button>
                                </Box>
                            )}
                            </>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    mb: 2,
                                }}
                            >
                                <FolderKanban size={34} color="#7d7f85" />
                                <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                                    No project data
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                                    Project health appears once tasks exist.
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <RowSkeleton rows={3} chips={1} />
                )}
            </CardContent>
        </Card>
    )
}

export default ProjectHealth
