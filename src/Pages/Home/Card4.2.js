import React from "react";
import { Avatar, Box, Card, CardContent, Grid, Typography } from "@mui/material";

const Card4_2 = ({ team }) => {
    return (
        <Card className="HomePageCom">
            <CardContent sx={{padding:'0', paddingBottom:'0 !important'}}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Team List
                </Typography>
                <Box className="muiCardTeam">
                <Grid container spacing={2}>
                    {team.map((member) => (
                        <Grid item xs={6} sm={6} md={6} key={member.userId}>
                            <Card
                                className="HomePageCom"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CardContent className="muiCardTeam">
                                    <Avatar
                                        src={member.photo}
                                        alt={member.name}
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            fontSize: "24px",
                                            backgroundColor: "#1976d2",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        {!member.photo && member.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h6" style={{ marginBottom: "5px" }}>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {member.role}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default Card4_2;
