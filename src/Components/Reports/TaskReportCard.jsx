import React, { useState } from 'react';
import { Card, Box, Typography, Grid, Avatar, Chip } from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

import './TaskReportCard.scss';
import { background, getPerformanceStatus, getStatusColor, ImageUrl } from '../../Utils/globalfun';
import TaskDetailsModal from './TaskDetailsModal';

const ProjectOverviewCard = ({ data, viewMode }) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedTaskRow, setSelectedTaskRow] = useState(null);

    const handleRowClick = (row) => {
        setSelectedTaskRow(row);
        setOpenModal(true);
    };

    const getCategoryCount = (categoryKey) => {
        if (!Array.isArray(data?.CategorySummary)) return 0;
        const item = data.CategorySummary.find(
            (c) => c.categoryname?.toLowerCase() === categoryKey.toLowerCase()
        );
        return item?.count || 0;
    };

    const getProgress = () => {
        const progressStr = data?.Progress || "0%";
        const numericValue = parseFloat(progressStr.replace("%", ""));
        let barColor = getStatusColor(numericValue);
        const textColor = numericValue > 0 ? "#fff" : "inherit";

        return (
            <Box className="category-item" sx={{ background: `${barColor} !important`, color: `${textColor} !important` }}>
                <TrendingUpIcon className="category-icon progress-icon" />
                <Typography variant="body1" sx={{ color: `${textColor} !important` }}>Progress</Typography>
                <Typography variant="body1" sx={{ color: `${textColor} !important` }} className="category-count">{progressStr}</Typography>
            </Box>
        );
    }

    const getPerformance = () => {
        const progressStr = data?.Progress || "0%";
        const numericValue = parseFloat(progressStr.replace("%", ""));
        const { meaning, color, bgColor } = getPerformanceStatus(numericValue);

        return (
            <Box className="category-item" sx={{ background: `${bgColor} !important`, color: `${color} !important` }}>
                <PermIdentityIcon className="category-icon performance-icon" />
                <Typography variant="body1" sx={{ color: `${color} !important` }}>Performance</Typography>
                <Typography variant="body1" sx={{ color: `${color} !important` }} className="category-count">{data?.Performance || 0}</Typography>
            </Box>
        );
    }


    const getName = () => {
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
                        <Typography sx={{ fontSize: "16px !important", fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {data?.firstname} {data?.lastname}
                        </Typography>
                    </Box>
                );
            }
            return "Unknown Employee";
        }
        return <Typography sx={{ fontSize: "16px !important", fontWeight: 'bold', textTransform: 'capitalize' }}>
            {data?.modulename || "Unknown Project"}
        </Typography>;
    };

    /** Format hours */
    const formatHours = (value) => {
        const num = parseFloat(value || 0);
        return `${num.toFixed(2)}h`;
    };

    return (
        <>
            <Card className="project-overview-card" onClick={() => handleRowClick(data)}>
                {/* Header */}
                <Box className="card-header">
                    {viewMode !== "EmployeeWiseData" &&
                        <Box className="header-icon-wrapper">
                            <FolderOpenOutlinedIcon className="header-icon" />
                        </Box>
                    }
                    <Box>
                        {getName()}
                    </Box>
                </Box>

                {/* Summary Stats */}
                <Box className="summary-stats">
                    <div className="stat-item total-tasks">
                        <Typography variant="h4" className="stat-number">{data?.TotalTasks || 0}</Typography>
                        <Typography variant="body2" className="stat-label">Total Tasks</Typography>
                    </div>
                    <div className="stat-item completed-tasks">
                        <Typography variant="h4" className="stat-number">{data?.Completed || 0}</Typography>
                        <Typography variant="body2" className="stat-label">Completed</Typography>
                    </div>
                    <div className="stat-item in-progress-tasks">
                        <Typography variant="h4" className="stat-number">{data?.InProgress || 0}</Typography>
                        <Typography variant="body2" className="stat-label">In Progress</Typography>
                    </div>
                </Box>

                {/* Task Categories */}
                <Typography variant="subtitle1" className="section-title">TASK CATEGORIES</Typography>
                <Grid container spacing={2} className="task-categories">
                    <Grid item xs={6}>
                        {getProgress()}
                    </Grid>
                    <Grid item xs={6}>
                        {getPerformance()}
                    </Grid>
                    <Grid item xs={6}>
                        <Box className="category-item">
                            <DateRangeIcon className="category-icon meetings-icon" />
                            <Typography variant="body1">Meetings</Typography>
                            <Typography variant="body1" className="category-count">{getCategoryCount('Meetings')}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box className="category-item">
                            <ErrorOutlineIcon className="category-icon challenges-icon" />
                            <Typography variant="body1">Challenges</Typography>
                            <Typography variant="body1" className="category-count">{getCategoryCount('Challenges')}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box className="category-item">
                            <AccessTimeIcon className="category-icon onhold-icon" />
                            <Typography variant="body1">OnHold</Typography>
                            <Typography variant="body1" className="category-count">{getCategoryCount('OnHold')}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Hours Tracking */}
                <Typography variant="subtitle1" className="section-title">HOURS TRACKING</Typography>
                <Box className="hours-tracking">
                    <Box className="hours-row">
                        <Typography variant="body1">Estimated Hours</Typography>
                        <Typography variant="body1">{formatHours(data?.TotalEstimate)}</Typography>
                    </Box>
                    <Box className="hours-row">
                        <Typography variant="body1">Actual Hours</Typography>
                        <Typography variant="body1">{formatHours(data?.TotalActual)}</Typography>
                    </Box>
                    <Box className="hours-row difference">
                        <Typography variant="body1">Difference</Typography>
                        <Typography variant="body1" className={`difference-value ${data?.TotalDiff < 0 ? 'negative' : 'positive'}`}>
                            {formatHours(data?.TotalDiff)}
                        </Typography>
                    </Box>
                </Box>
            </Card>
            <TaskDetailsModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                employee={selectedTaskRow}
            />
        </>
    );
};

export default ProjectOverviewCard;
