import React, { useState } from 'react';
import {
    Card, CardContent, Typography, LinearProgress, Button, Box
} from '@mui/material';
import RowSkeleton from './RowSkeleton';
import { Plus, SquareChartGantt, ArrowRight } from 'lucide-react';
import { useSetRecoilState } from 'recoil';
import { assigneeId } from '../../Recoil/atom';
import { Link } from 'react-router-dom';
import { renderAssigneeAvatars } from '../../Utils/globalfun';

const getProgress = (project) => {
    const estimate = Number(project?.estimate_hrs) || 0;
    const working = Number(project?.working_hr) || 0;
    if (!estimate || !working) return null;
    return Math.min(100, Math.round((working / estimate) * 100));
};

const Projects = ({ projects, navigate, isLoding }) => {
    const setAssigneeId = useSetRecoilState(assigneeId);
    const [showAll, setShowAll] = useState(false);

    const handleAddProject = () => navigate('/projects');

    const handleAvatarClick = (assignees, id) => setAssigneeId(id);

    const filteredProjects = projects?.filter(item => item.parentid == 0) || [];

    const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, 8);

    if (isLoding && projects == null) {
        return (
            <Card className="HomePageCom">
                <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                    <Box className='cardHeader'>
                        <Typography className='cardTitle' component="div" variant="h5">
                            Projects
                        </Typography>
                    </Box>
                    <RowSkeleton rows={3} chips={1} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Box className='cardHeader'>
                    <Typography className='cardTitle' component="div" variant="h5">
                        Projects
                    </Typography>
                    {filteredProjects?.length > 0 && (
                        <Typography className='viewAllLink' onClick={handleAddProject}>
                            View all <ArrowRight size={14} />
                        </Typography>
                    )}
                </Box>
                {filteredProjects?.length > 0 ? (
                    <>
                        <Box className='listBox'>
                            {visibleProjects?.map((project, idx) => {
                                const pct = getProgress(project);
                                return (
                                    <Box className='listRow' key={idx}>
                                        <Box className='rowMain'>
                                            <Link className='prNameUrl rowTitle' to={`/projects?filter=${project?.taskname}`}>
                                                {project?.taskname}
                                            </Link>
                                            {pct != null && (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={pct}
                                                    className='projProgress'
                                                />
                                            )}
                                        </Box>
                                        <Box className='rowRight'>
                                            {pct != null && (
                                                <Typography className='pctText'>{pct}%</Typography>
                                            )}
                                            {renderAssigneeAvatars(project?.assignee, handleAvatarClick)}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {filteredProjects.length > 8 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                                <Button
                                    onClick={() => setShowAll(!showAll)}
                                    variant="text"
                                    className="seeMoreBtn"
                                    size="small"
                                >
                                    {showAll ? 'See Less' : 'See More'}
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
                        <SquareChartGantt size={34} color="#7d7f85" />
                        <Typography variant="body" sx={{ mt: 1, mb: 0.5, color: '#6D6B77' }}>
                            No projects found
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7d7f85', mb: 1 }}>
                            There are no active projects at the moment.
                        </Typography>
                        <Button
                            variant="contained"
                            className="buttonClassname"
                            size="small"
                            onClick={handleAddProject}
                            startIcon={<Plus size={18} />}
                        >
                            Add Project
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default Projects;
