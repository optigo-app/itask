import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Avatar, AvatarGroup } from '@mui/material';
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
                                        <AvatarGroup max={2}
                                            sx={{
                                                '& .MuiAvatar-root': {
                                                    width: 30,
                                                    height: 30,
                                                    cursor:'pointer',
                                                    transition: 'transform 0.3s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                    }
                                                }
                                            }}
                                        >
                                            {project?.team?.map((teamMember, teamIdx) => (
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
