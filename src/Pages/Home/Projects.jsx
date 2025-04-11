import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Avatar, AvatarGroup, Tooltip, Button, Box } from '@mui/material';
import { getRandomAvatarColor } from '../../Utils/globalfun';
import { Plus, SquareChartGantt } from 'lucide-react';

const Projects = ({ projects, navigate }) => {

    const background = (teamName) => {
        const avatarBackgroundColor = projects?.avatar
            ? "transparent"
            : getRandomAvatarColor(teamName?.name);
        return avatarBackgroundColor;
    };
    const handleAddProject = () => {
        navigate('/projects')
    }

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Projects
                </Typography>
                {projects?.length > 0 ? (
                    <Table>
                        <TableBody>
                            {projects?.map((project, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        {project.projectName}
                                    </TableCell>

                                    <TableCell>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0px'
                                        }}>
                                            <AvatarGroup max={5}
                                                sx={{
                                                    '& .MuiAvatar-root': {
                                                        width: 30,
                                                        height: 30,
                                                        cursor: 'pointer',
                                                        border: 'none',
                                                        transition: 'transform 0.3s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.2)',
                                                            zIndex: 10
                                                        }
                                                    }
                                                }}
                                            >
                                                {project?.team?.map((teamMember, teamIdx) => (
                                                    <Tooltip
                                                        placement="top"
                                                        key={teamMember.name}
                                                        title={teamMember.name}
                                                        arrow
                                                        classes={{ tooltip: 'custom-tooltip' }}
                                                    >
                                                        <Avatar
                                                            key={teamIdx}
                                                            alt={teamMember.name}
                                                            src={teamMember.avatar}
                                                            sx={{
                                                                backgroundColor: background(teamMember),
                                                            }}
                                                        >
                                                            {!teamMember.avatar && teamMember.name.charAt(0)}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </AvatarGroup>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) :
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

                }
            </CardContent>
        </Card>
    );
};

export default Projects;
