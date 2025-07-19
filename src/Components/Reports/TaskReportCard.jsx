import React from 'react';
import { Card, Box, Typography, Chip, Grid, Divider, Avatar } from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

import './TaskReportCard.scss';
import { background, ImageUrl } from '../../Utils/globalfun';

const ProjectOverviewCard = ({ data, viewMode }) => {

    const getName = (data, viewMode) => {
        if (viewMode === "EmployeeWiseData") {
            if (data && typeof data === "object") {
                return (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                            src={ImageUrl(data)}
                            alt={data?.firstname}
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: background(data?.firstname),
                                fontSize: 14,
                            }}
                        />
                        <Typography sx={{ textTransform: 'capitalize' }}>
                            {data?.firstname} {data?.lastname}
                        </Typography>
                    </Box>
                );
            }
            return "Unknown Employee";
        }
    }
    return (
        <Card className="project-overview-card">
            <Box className="card-header">
                {viewMode != "EmployeeWiseData" &&
                    <Box className="header-icon-wrapper">
                        <FolderOpenOutlinedIcon className="header-icon" />
                    </Box>
                }
                <Box>
                    {getName(data, viewMode)}
                </Box>
            </Box>

            <Box className="summary-stats">
                <div className="stat-item total-tasks">
                    <Typography variant="h4" className="stat-number">{data?.TotalTasks}</Typography>
                    <Typography variant="body2" className="stat-label">Total Tasks</Typography>
                </div>
                <div className="stat-item completed-tasks">
                    <Typography variant="h4" className="stat-number">{data?.Completed}</Typography>
                    <Typography variant="body2" className="stat-label">Completed</Typography>
                </div>
                <div className="stat-item in-progress-tasks">
                    <Typography variant="h4" className="stat-number">17</Typography>
                    <Typography variant="body2" className="stat-label">In Progress</Typography>
                </div>
            </Box>


            <Typography variant="subtitle1" className="section-title">TASK CATEGORIES</Typography>
            <Grid container spacing={2} className="task-categories">
                <Grid item xs={6}>
                    <Box className="category-item">
                        <TrendingUpIcon className="category-icon progress-icon" />
                        <Typography variant="body1">Progress</Typography>
                        <Typography variant="body1" className="category-count">15</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="category-item">
                        <PermIdentityIcon className="category-icon performance-icon" />
                        <Typography variant="body1">Performance</Typography>
                        <Typography variant="body1" className="category-count">8</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="category-item">
                        <DateRangeIcon className="category-icon meetings-icon" />
                        <Typography variant="body1">Meetings</Typography>
                        <Typography variant="body1" className="category-count">7</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="category-item">
                        <ErrorOutlineIcon className="category-icon challenges-icon" />
                        <Typography variant="body1">Challenges</Typography>
                        <Typography variant="body1" className="category-count">9</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="category-item">
                        <AccessTimeIcon className="category-icon onhold-icon" />
                        <Typography variant="body1">OnHold</Typography>
                        <Typography variant="body1" className="category-count">6</Typography>
                    </Box>
                </Grid>
            </Grid>

            <Typography variant="subtitle1" className="section-title">HOURS TRACKING</Typography>
            <Box className="hours-tracking">
                <Box className="hours-row">
                    <Typography variant="body1">Estimated Hours</Typography>
                    <Typography variant="body1">280h</Typography>
                </Box>
                <Box className="hours-row">
                    <Typography variant="body1">Actual Hours</Typography>
                    <Typography variant="body1">265h</Typography>
                </Box>
                <Box className="hours-row difference">
                    <Typography variant="body1">Difference</Typography>
                    <Typography variant="body1" className="difference-value negative">-15h</Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default ProjectOverviewCard;