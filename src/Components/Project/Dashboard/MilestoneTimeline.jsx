import React from "react";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";
import { Card, Typography, LinearProgress, Box } from "@mui/material";
import { cleanDate, formatDate2 } from "../../../Utils/globalfun";
import "./Styles/MilestoneTimeline.scss";
import { Milestone } from "lucide-react";

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

const MilestoneTimeline = ({ milestoneData, decodedData }) => {
    console.log('decodedData: ', decodedData);
    const filteredMileStone = milestoneData[decodedData.projectid] ?? [];
    console.log('filteredMileStone: ', filteredMileStone);

    const sortedMilestones = filteredMileStone?.sort((a, b) => {
        if (a.progress_per === 100) return -1;
        if (b.progress_per === 100) return 1;
        if (a.progress_per === 0) return 1;
        if (b.progress_per === 0) return -1;
        return b.progress_per - a.progress_per;
    });
    console.log('sortedMilestones: ', sortedMilestones);
    return (
        <Box className="milestone-container">
            {sortedMilestones?.length <= 0 ? (
                <Box className="noHistoryBox">
                    <Milestone className="emptyImg" color="#6D6B77" />
                    <Typography>No milestone Found!</Typography>
                    <Typography></Typography>
                </Box>
            ) :
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
                                        Start: {milestone?.StartDate && cleanDate(milestone?.StartDate)
                                            ? formatDate2(cleanDate(milestone?.StartDate))
                                            : '-'} | End: {milestone?.DeadLineDate && cleanDate(milestone?.DeadLineDate)
                                                ? formatDate2(cleanDate(milestone?.DeadLineDate))
                                                : '-'}
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
            }
        </Box>
    );
};

export default MilestoneTimeline;
