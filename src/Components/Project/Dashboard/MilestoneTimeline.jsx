import React from "react";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";
import { Card, Typography, LinearProgress, Box } from "@mui/material";
import { formatDate2 } from "../../../Utils/globalfun";
import "./Styles/MilestoneTimeline.scss";

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

const MilestoneTimeline = ({ milestoneData }) => {

    const sortedMilestones = milestoneData?.sort((a, b) => {
        if (a.progress_per === 100) return -1;
        if (b.progress_per === 100) return 1;
        if (a.progress_per === 0) return 1;
        if (b.progress_per === 0) return -1;
        return b.progress_per - a.progress_per;
    });
    return (
        <Box className="milestone-container">
            <Timeline position="alternate">
                {sortedMilestones?.map((milestone, index) => (
                    <TimelineItem key={index}>
                        <TimelineSeparator>
                            <TimelineDot className={`dot-${getProgressColor(milestone?.progress_per)}`} />
                            {index !== milestone?.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            <Card className="milestone-card">
                                <Typography variant="subtitle1" className="milestone-name"><strong>{milestone?.taskname}</strong></Typography>
                                <Typography variant="body2" className="milestone-department">Department: {milestone?.taskDpt}</Typography>
                                <Typography variant="body2" className="milestone-dates">
                                    Start: {formatDate2(milestone?.StartDate)} | End: {formatDate2(milestone?.DeadLineDate)}
                                </Typography>
                                <Box className="progress-container">
                                    <LinearProgress
                                        variant="determinate"
                                        value={milestone?.progress_per}
                                        className={`progress-bar ${getProgressColor(milestone?.progress_per)}`}
                                    />
                                    <Typography variant="caption" className={`progress-text text-${getProgressColor(milestone?.progress_per)}`}>{milestone?.progress_per}% Completed</Typography>
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
