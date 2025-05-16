import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    Drawer,
    Button,
    Box,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Card,
    CardContent,
    TextField,
    LinearProgress,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CircleX, GitMerge, Play } from "lucide-react";
import './TimeTracker.scss';
import { formatDate2, formatDate3 } from "../../../Utils/globalfun";
import taskJson from "../../../Data/taskData.json";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import timerImg from "../../../Assests/no-timesheet.svg"
import { useRecoilState, useRecoilValue } from "recoil";
import { TaskData, timerCompOpen } from "../../../Recoil/atom";

const TaskTimeTrackerComp = () => {
    const [drawerOpen, setDrawerOpen] = useRecoilState(timerCompOpen);
    const [anchorEl, setAnchorEl] = useState(null);
    const task = useRecoilValue(TaskData)
    const [selectedTask, setSelectedTask] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [timer, setTimer] = useState(0);
    const [history, setHistory] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const intervalRef = useRef(null);

    // Load history and total time from localStorage on mount
    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem("taskHistory")) || [];
        const savedTotalTime = JSON.parse(localStorage.getItem("totalTime")) || 0;
        setHistory(savedHistory);
        setTotalTime(savedTotalTime);
    }, []);

    // Flatten task structure & remove `subtasks` key
    const flattenTasks = (tasks, level = 0) => {
        return tasks?.reduce((flatList, task) => {
            const { subtasks, ...taskWithoutSubtasks } = task;
            flatList?.push({ ...taskWithoutSubtasks, level });

            if (subtasks?.length > 0) {
                flatList = flatList?.concat(flattenTasks(subtasks, level + 1));
            }
            return flatList;
        }, []);
    };

    const flatTasks = flattenTasks(task);

    // Toggle Drawer
    const toggleDrawer = useCallback((open) => () => {
        setDrawerOpen(open);
    }, []);

    // Open/Close Task Selection Menu
    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    // Select Task
    const handleSelectTask = (task) => {
        setSelectedTask(task);
        handleCloseMenu();
    };

    // Start/Stop Timer
    const handleStartStop = () => {
        if (!selectedTask) {
            alert("Please select a task first!");
            return;
        }

        if (isRunning) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);

            const newEntry = {
                task: selectedTask.taskname,
                duration: timer,
                timestamp: new Date().toISOString(),
            };
            setHistory((prevHistory) => {
                const updatedHistory = [...prevHistory, newEntry];
                localStorage.setItem("taskHistory", JSON.stringify(updatedHistory));
                return updatedHistory;
            });
            setTotalTime((prevTotal) => {
                const updatedTotal = prevTotal + timer;
                localStorage.setItem("totalTime", JSON.stringify(updatedTotal));
                return updatedTotal;
            });
            setTimer(0);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const getColorByPercentage = (percentage) => {
        if (percentage < 25) return '#ff4d4d';
        if (percentage < 50) return '#ffa500';
        if (percentage < 75) return '#ffff00';
        return '#4caf50';
    };

    const percentage = Math.round((totalTime / (8 * 3600)) * 100);
    const progressColor = getColorByPercentage(percentage);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    return (
        <div className="MainTimeDiv">
            {/* Right-Side Drawer */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box className="timeTrackerDrawerBox">
                    <Box className="drawer-header">
                        <Typography variant="h6" className="drawer-title">
                            Task Time Tracker
                        </Typography>
                        <IconButton className="cal_closeBtn" onClick={toggleDrawer(false)}>
                            <CircleX />
                        </IconButton>
                    </Box>
                    <Box sx={{ width: '100%', margin: "10px 0" }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                        height: 8,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            backgroundColor: progressColor,
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Total Time Summary */}
                    <Typography variant="h6" className="drawer-title" sx={{ textAlign: 'right' }}>
                        {formatTime(totalTime)} / 8h
                    </Typography>

                    {/* Timer Section */}
                    <Box className="drawer-content">
                        <Box className="taskContainer">
                            <Box className="taskTimer">
                                <Typography variant="h6" className="drawer-title">
                                    {new Date(timer * 1000).toISOString()?.substr(11, 8)}
                                </Typography>
                                <IconButton
                                    onClick={handleStartStop}
                                    className={`button ${isRunning ? "pauseIconBtn" : "playIconBtn"}`}
                                >
                                    {isRunning ? (
                                        <PauseIcon sx={{ fontSize: 20 }} />
                                    ) : (
                                        <PlayArrowIcon sx={{ fontSize: 20 }} />
                                    )}
                                </IconButton>
                            </Box>

                            {/* Task Selection Dropdown */}
                            <Box className="taskListBox">
                                <Button className="taskListButton" onClick={handleOpenMenu} endIcon={<KeyboardArrowDownIcon sx={{ color: '#7367f0' }} />}>
                                    <Typography className="selectedtypo">{selectedTask ? selectedTask.taskname : "Select Task"}</Typography>
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleCloseMenu}
                                    className="taskMenuList"
                                    disableAutoFocusItem
                                >
                                    {/* Search Box */}
                                    <Box className="searchTaskList">
                                        <TextField
                                            placeholder="Search task..."
                                            size="small"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="textfieldsClass"
                                            sx={{
                                                minWidth: '410px'
                                            }}
                                            autoFocus
                                        />
                                    </Box>

                                    {/* Render Flattened Task List */}
                                    <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
                                        {flatTasks && flatTasks
                                            ?.filter(task => task?.taskname?.toLowerCase().includes(searchTerm.toLowerCase()))
                                            ?.map((task) => (
                                                <MenuItem
                                                    key={task.taskid}
                                                    onClick={() => handleSelectTask(task)}
                                                    className="taskMenuList"
                                                    sx={{
                                                        pl: 2 * task.level,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        py: 1,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        {task.level > 0 && (
                                                            <Box sx={{ flexShrink: 0, mr: 1 }}>
                                                                <GitMerge size={15} color="#808080" />
                                                            </Box>
                                                        )}
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                flexGrow: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                color: task.level === 1 ? "#808080" : (task.taskid === selectedTask?.taskid ? "#7367f0" : "inherit"),
                                                                fontWeight: task.taskid === selectedTask?.taskid ? "bold" : "normal",
                                                            }}
                                                        >
                                                            {task.taskname}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        }

                                        {/* Show "No results found" if no matches */}
                                        {flatTasks.filter(task => task?.taskname?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                            <MenuItem disabled sx={{ display: 'flex', justifyContent: 'center' }}>No results found</MenuItem>
                                        )}
                                    </Box>
                                </Menu>
                            </Box>
                        </Box>
                    </Box>

                    {/* Task History Section */}
                    <Box className="taskHistoryMain">
                        <Typography variant="h6" className="drawer-title">
                            {formatDate2(new Date().toLocaleDateString())}
                        </Typography>
                        {history.length > 0 ? (
                            history.map((entry, index) => (
                                <Card key={index} sx={{ marginBottom: 1 }} className="taskHisCard">
                                    <CardContent className="taskHistoryCardContent">
                                        <Box className='taskHisBox'>
                                            <Typography variant="h6" className="taskhisTitle">
                                                {entry.task}
                                            </Typography>
                                            <Box className='iconBtnBox'>
                                                <IconButton
                                                    className="playIconBtn"
                                                    onClick={() => {
                                                        if (intervalRef.current) clearInterval(intervalRef.current);
                                                        setSelectedTask({ taskname: entry.task });
                                                        setTimer(entry.duration);
                                                        setIsRunning(true);
                                                        intervalRef.current = setInterval(() => {
                                                            setTimer((prev) => prev + 1);
                                                        }, 1000);
                                                    }}
                                                >
                                                    <Play size={15} />
                                                </IconButton>

                                                <IconButton color="error" onClick={() => {
                                                    setHistory(history.filter((_, i) => i !== index));
                                                    setTotalTime((prevTotal) => prevTotal - entry.duration);
                                                }}>
                                                    <DeleteIcon fontSize='15px' />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" className="task_desc">
                                            {formatDate3 ? formatDate3(entry.timestamp) : entry.timestamp} - Duration: {new Date(entry.duration * 1000).toISOString().substr(11, 8)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Box className="noHistoryBox">
                                <img src={timerImg} alt="empty" className="emptyImg" />
                                <Typography>You haven't tracked any time yet!</Typography>
                                <Typography>Start making the most of your time by starting a timer or entering your time manually</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </div>
    );
};

export default TaskTimeTrackerComp;
