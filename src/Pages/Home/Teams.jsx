import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Avatar } from '@mui/material';
import { getRandomAvatarColor } from '../../Utils/globalfun';

const Card4_2 = ({ teamData }) => {

    const background = (team) => {
        const avatarBackgroundColor = team?.avatar
            ? "transparent"
            : getRandomAvatarColor(team?.name);
        return avatarBackgroundColor;
    }

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Teams
                </Typography>
                {/* <div className="itask_separator" /> */}
                <Table>
                    <TableBody>
                        {teamData?.map((team, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: '5px' }}>
                                        <Avatar
                                            key={idx}
                                            alt={team.name}
                                            src={team.avatar}
                                            sx={{
                                                width: 35,
                                                height: 35,
                                                cursor: 'pointer',
                                                background: background(team),
                                                transition: 'transform 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                }
                                            }}
                                        >
                                            {!team.avatar && team.name.charAt(0)}
                                        </Avatar>
                                        {team.name}
                                    </div>

                                </TableCell>

                                <TableCell >
                                    {team?.role}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default Card4_2;
