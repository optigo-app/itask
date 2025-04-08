import React from "react";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";
import { Card, Typography, LinearProgress, Box } from "@mui/material";
import { formatDate2 } from "../../../Utils/globalfun";
import "./Styles/MilestoneTimeline.scss";

const milestones = [
    { name: "Project Initiation", startDate: "2024-03-01", endDate: "2024-03-10", progress: 100, department: "Management" },
    { name: "Design Phase", startDate: "2024-03-11", endDate: "2024-04-01", progress: 70, department: "Design Team" },
    { name: "Development", startDate: "2024-04-02", endDate: "2024-06-30", progress: 40, department: "Engineering" },
    { name: "Testing & QA", startDate: "2024-07-01", endDate: "2024-08-15", progress: 10, department: "QA Team" },
];

const getProgressColor = (progress) => {
    if (progress === 100) {
        return "success";
    } else if (progress >= 60) {
        return "primary"; 
    } else if (progress >= 30) {
        return "warning";
    } else {
        return "error"; 
    }
};

const MilestoneTimeline = () => {
    return (
        <Box className="milestone-container">
            <Timeline position="alternate">
                {milestones.map((milestone, index) => (
                    <TimelineItem key={index}>
                        <TimelineSeparator>
                            <TimelineDot className={`dot-${getProgressColor(milestone.progress)}`} />
                            {index !== milestones.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            <Card className="milestone-card">
                                <Typography variant="subtitle1" className="milestone-name"><strong>{milestone.name}</strong></Typography>
                                <Typography variant="body2" className="milestone-department">Department: {milestone.department}</Typography>
                                <Typography variant="body2" className="milestone-dates">
                                    Start: {formatDate2(milestone.startDate)} | End: {formatDate2(milestone.endDate)}
                                </Typography>
                                <Box className="progress-container">
                                    <LinearProgress
                                        variant="determinate"
                                        value={milestone.progress}
                                        className={`progress-bar ${getProgressColor(milestone.progress)}`}
                                    />
                                    <Typography variant="caption" className={`progress-text text-${getProgressColor(milestone.progress)}`}>{milestone.progress}% Completed</Typography>
                                </Box>
                            </Card>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </Box>
    );
};

export default MilestoneTimeline;
