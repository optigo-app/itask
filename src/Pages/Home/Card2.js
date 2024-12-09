import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Avatar } from '@mui/material';

const Card2 = ({ projects }) => {
    return (
        <Card className="HomePageCom">
            <CardContent sx={{padding:'0', paddingBottom:'0 !important'}}>
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

                                <TableCell >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px' }}>
                                        {project?.team?.map((teamMember, teamIdx) => (
                                            <Avatar
                                                key={teamIdx}
                                                alt={teamMember.name}
                                                src={teamMember.avatar}
                                                sx={{ width: 30, height: 30 }}

                                            >
                                                {!teamMember.avatar && teamMember.name.charAt(0)}
                                            </Avatar>
                                        ))}
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
