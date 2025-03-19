import React, { useState, useEffect, useRef } from "react";
import { Modal, Box, Typography, Button, Chip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";

const TaskTimeTracking = ({ isOpen, onClose, taskData, taskRunning, setTaskRunning }) => {
    const [taskTimers, setTaskTimers] = useState({});
  
    const intervalsRef = useRef({});
    const notificationsRef = useRef({});

    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach(clearInterval);
        };
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const checkAndNotify = (taskId, currentSeconds) => {
        if (!taskData?.estimate_hrs) return;

        // const estimateSeconds = taskData.estimate_hrs * 3600;
        const estimateSeconds = .05 * 3600;
        const remainingSeconds = estimateSeconds - currentSeconds;
        const notifications = [600, 300, 60]; // 10 minutes, 5 minutes, 1 minute in seconds

        notifications.forEach((notificationTime) => {
            if (
                remainingSeconds <= notificationTime &&
                remainingSeconds > notificationTime - 60 &&
                !notificationsRef.current[`${taskId}_${notificationTime}`]
            ) {
                const minutes = Math?.round(notificationTime / 60);
                toast.info(`${minutes} minute${minutes > 1 ? 's' : ''} left for this "${taskData?.taskname}"`);
                notificationsRef.current[`${taskId}_${notificationTime}`] = true;
            }
        });
    };

    const handleStartStop = (taskId) => {
        if (!taskId) return;

        setTaskRunning((prev) => {
            const isRunning = !prev[taskId];

            if (isRunning) {
                intervalsRef.current[taskId] = setInterval(() => {
                    setTaskTimers((prevTimers) => {
                        const newTime = (prevTimers[taskId] || 0) + 1;
                        checkAndNotify(taskId, newTime);
                        return { ...prevTimers, [taskId]: newTime };
                    });
                }, 1000);
            } else {
                clearInterval(intervalsRef.current[taskId]);
                delete intervalsRef.current[taskId];
            }

            return { ...prev, [taskId]: isRunning };
        });
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        {taskData?.taskname}
                    </Typography>
                    <Chip
                        icon={<AccessTimeIcon />}
                        label={
                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                Est: {taskData?.estimate_hrs} hrs
                            </Typography>
                        }
                        sx={{
                            backgroundColor: "#e0e0e0",
                            "& .MuiChip-icon": {
                                color: "#7367f0",
                            },
                            "& .MuiChip-label p": {
                                color: "#7367f0",
                                fontWeight: "bold",
                            },
                            height: "28px",
                            borderRadius: "14px",
                        }}
                    />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" component="div" sx={{fontSize:'30px'}}>
                        {formatTime(taskTimers[taskData?.taskid] || 0)}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        onClick={() => handleStartStop(taskData?.taskid)}
                        startIcon={taskRunning[taskData?.taskid] ? <StopIcon /> : <PlayArrowIcon />}
                        sx={{
                            backgroundColor: taskRunning[taskData?.taskid] ? "#f44336" : "#4caf50",
                            color: "white",
                            "&:hover": {
                                backgroundColor: taskRunning[taskData?.taskid] ? "#d32f2f" : "#45a049",
                            },
                            borderRadius: "20px",
                            padding: "8px 24px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "none",
                        }}
                    >
                        {taskRunning[taskData?.taskid] ? "Stop" : "Start"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default TaskTimeTracking;
