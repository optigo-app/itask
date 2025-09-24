import React, { useState } from 'react';
import {
    Card, CardContent, Typography, Table, TableBody,
    TableCell, TableRow, Button, Box
} from '@mui/material';
import { Plus, SquareChartGantt } from 'lucide-react';
import { useSetRecoilState } from 'recoil';
import { assigneeId } from '../../Recoil/atom';
import { Link } from 'react-router-dom';
import { renderAssigneeAvatars } from '../../Utils/globalfun';

const Projects = ({ projects, navigate, isLoding }) => {
    const setAssigneeId = useSetRecoilState(assigneeId);
    const [showAll, setShowAll] = useState(false);

    const handleAddProject = () => navigate('/projects');

    const handleAvatarClick = (id) => setAssigneeId(id);

    const filteredProjects = projects?.filter(item => item.parentid == 0) || [];

    const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, 5);

    if (isLoding && projects == null) {
        return <Box>
            <Typography>Loading...</Typography>
        </Box>
    }

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Projects
                </Typography>
                {filteredProjects?.length > 0 ? (
                    <>
                        <Table>
                            <TableBody>
                                {visibleProjects?.map((project, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell colSpan={2}>
                                            <Link className='prNameUrl' to={`/projects?filter=${project?.taskname}`}>
                                                {project?.taskname}
                                            </Link>
                                        </TableCell>
                                        <TableCell colSpan={1}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0px'
                                            }}>
                                                {renderAssigneeAvatars(project?.assignee, handleAvatarClick)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filteredProjects.length > 5 && (
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
