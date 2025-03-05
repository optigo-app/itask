import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { getRandomAvatarColor } from '../../Utils/globalfun';

const Card2 = ({ projects }) => {

    const background = (teamName) => {
        const avatarBackgroundColor = projects?.avatar
            ? "transparent"
            : getRandomAvatarColor(teamName?.name);
        return avatarBackgroundColor;
    };

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Projects
                </Typography>
                {/* <div className="itask_separator" /> */}
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
            </CardContent>
        </Card>
    );
};

export default Card2;
