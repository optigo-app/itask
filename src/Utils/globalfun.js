import { AssigneeMaster } from "../Api/MasterApi/AssigneeMaster";
import { fetchMaster } from "../Api/MasterApi/MasterApi";
import { fetchIndidualApiMaster } from "../Api/MasterApi/masterIndividualyApi";

// output like 01/01/2023
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
// output like 01 Jan 2023
export function formatDate2(dateStr) {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
}

// output like January 29, 2024 at 06:30:00 PM
export const formatDate3 = (date) => {
    if (!date) return '';

    const formattedDate = new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return formattedDate;
};
// "1 day left" or "1 day 2 hr",
export function getTimeLeft(dateString) {
    const now = new Date();
    const future = new Date(dateString);
    const diffMs = future - now;

    if (diffMs <= 0) return "Overdue";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // approx
    const years = Math.floor(days / 365); // approx

    if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0 || minutes > 0) {
        const hr = hours % 24;
        const min = minutes % 60;
        return `${hr > 0 ? hr + " hr " : ""}${min > 0 ? min + " min" : ""}`.trim();
    }

    return "Less than a minute";
}

export function toISTDateTime(isoDate) {
    const istDate = new Date(isoDate).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return istDate;
}
// output like 01 Jan 1990 return ""
export function cleanDate(dateStr) {
    const defaultDates = [
        "1900-01-01T00:00:00",
        "1900-01-01T00:00:00.000Z"
    ];

    return defaultDates.includes(dateStr) ? "" : dateStr;
}

export const ImageUrl = (data) => {
    const init = JSON.parse(sessionStorage.getItem('taskInit'));
    if (data && init) {
        const url = `${init.url_path}/${init.ukey}/${data.empphoto}`;
        return url;
    }
    return null;
};

// priority color
export const priorityColors = {
    Low: {
        color: "#4caf50",
        backgroundColor: "#e8f5e9",
    },
    Medium: {
        color: "#ff9800",
        backgroundColor: "#fff3e0",
    },
    High: {
        color: "#f44336",
        backgroundColor: "#ffebee",
    },
    Urgent: {
        color: "#d32f2f",
        backgroundColor: "#ffcccb",
    },
    Critical: {
        color: "#ffffff",
        backgroundColor: "#b71c1c",
    },
};

// progress color
export const getStatusColor = (value) => {
    if (value >= 0 && value < 10) {
        return "#e0e0e0"; // Grey for not started
    } else if (value >= 10 && value < 50) {
        return "#ff9800"; // Orange for in-progress
    } else if (value >= 50 && value < 70) {
        return "#2196f3"; // Blue for almost complete
    } else if (value >= 70 && value <= 100) {
        return "#4caf50"; // Green for completed
    } else {
        return "#9e9e9e"; // Default grey for out-of-range values
    }
};

// Task Status color
export const statusColors = {
    "pending": {
        color: "#ff9800", // Orange text color
        backgroundColor: "#fff3e0", // Light orange background
    },
    "just started": {
        color: "#4caf50", // Green text color
        backgroundColor: "#e8f5e9", // Light green background
    },
    "running": {
        color: "#2196f3", // Blue text color
        backgroundColor: "#e3f2fd", // Light blue background
    },
    "on hold": {
        color: "#ff5722", // Red-orange text color
        backgroundColor: "#ffccbc", // Light red-orange background
    },
    "on hold with challenge": {
        color: "#f44336", // Red text color
        backgroundColor: "#ffebee", // Light red background
    },
    "challenge running": {
        color: "#d32f2f", // Dark red text color
        backgroundColor: "#ffcccb", // Light dark red background
    },
    "doc started": {
        color: "#8e24aa", // Purple text color
        backgroundColor: "#f3e5f5", // Light purple background
    },
    "doc completed": {
        color: "#9c27b0", // Purple text color
        backgroundColor: "#fce4ec", // Light purple background
    },
    "code started": {
        color: "#3f51b5", // Indigo text color
        backgroundColor: "#e8eaf6", // Light indigo background
    },
    "code completed": {
        color: "#3949ab", // Dark indigo text color
        backgroundColor: "#c5cae9", // Light dark indigo background
    },
    "test started": {
        color: "#f44336", // Red text color
        backgroundColor: "#ffebee", // Light red background
    },
    "test completed": {
        color: "#8bc34a", // Light green text color
        backgroundColor: "#c8e6c9", // Light green background
    },
    "completed": {
        color: "#4caf50", // Green text color
        backgroundColor: "#e8f5e9", // Light green background
    },
    "delivered": {
        color: "#3f51b5", // Indigo text color
        backgroundColor: "#e8eaf6", // Light indigo background
    },
    "in testing": {
        color: "#ff9800", // Orange text color
        backgroundColor: "#fff3e0", // Light orange background
    },
};

// colors.js (Global colors)
export const colors = [
    "#FF5722", "#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4",
    "#FF9800", "#9E9E9E", "#795548", "#607D8B", "#8BC34A", "#FFEB3B", "#FF4081", "#673AB7",
    "#ff7f50", "#F44336", "#3F51B5", "#CDDC39", "#03A9F4", "#9C27B0", "#FF1744", "#00E5FF",
    "#9E9E9E", "#4CAF50", "#00BCD4", "#8B4513", "#6A5ACD", "#F08080", "#32CD32", "#FF6347"
];

export const getRandomAvatarColor = (name) => {
    const charSum = name
        ?.split("")
        ?.reduce((sum, char) => sum + char?.charCodeAt(0), 0);
    return colors[charSum % colors.length];
};

// make structure master data function
export const fetchMasterGlFunc = async () => {
    try {
        const AssigneeMasterData = JSON?.parse(sessionStorage.getItem('taskAssigneeData'));
        const AuthUrlData = JSON?.parse(localStorage.getItem('AuthqueryParams'));
        if (!AssigneeMasterData) {
            const assigneeRes = await AssigneeMaster();
            const UserProfileData = assigneeRes?.rd?.find(item => item?.userid == AuthUrlData?.uid);
            localStorage.setItem('UserProfileData', JSON?.stringify(UserProfileData));
        } else {
            const UserProfileData = AssigneeMasterData?.find(item => item?.userid == AuthUrlData?.uid);
            localStorage.setItem('UserProfileData', JSON?.stringify(UserProfileData));
        }
        let masterData = JSON?.parse(sessionStorage.getItem('structuredMasterData'));
        if (!masterData || masterData?.length == 0) {
            masterData = await fetchMaster();
            sessionStorage.setItem('masterData', JSON?.stringify(masterData));
        }
        if (masterData?.rd && Array?.isArray(masterData?.rd)) {
            const structuredData = [];
            for (const item of masterData?.rd) {
                const { id, mode } = item;
                if (mode) {
                    const apiResponse = await fetchIndidualApiMaster({ mode });
                    let filteredData = apiResponse?.rd?.filter(row => row?.isdelete != 1) || [];
                    filteredData.sort((a, b) => a?.labelname.localeCompare(b?.labelname));
                    structuredData.push({
                        ...item,
                        rowdata: filteredData || []
                    });
                    sessionStorage.setItem(`${mode}Data`, JSON?.stringify(filteredData || []));
                }
            }
            sessionStorage.setItem('structuredMasterData', JSON?.stringify(structuredData));
        }
    } catch (error) {
        console.error("Error fetching master data:", error);
    }
};

// task parentid when add suntask and delete
export const findParentTask = (tasks, selectedTaskId, parentTask = null) => {
    for (let task of tasks) {
        if (task.taskid === selectedTaskId) {
            return parentTask;
        }
        if (task.subtasks) {
            const foundParent = findParentTask(task.subtasks, selectedTaskId, task);
            if (foundParent !== null) {
                return foundParent;
            }
        }
    }
    return null;
};

// map key value in api
export function mapTaskLabels(data) {
    const labels = data?.rd[0];
    const tasks = data?.rd1;
    const labelMap = {};
    Object?.keys(labels)?.forEach((key, index) => {
        labelMap[index + 1] = key;
    });
    function convertTask(task) {
        let taskObj = {};
        for (let key in task) {
            if (task.hasOwnProperty(key)) {
                const label = labelMap[key];
                if (label) {
                    taskObj[label] = task[key];
                }
            }
        }
        if (task.subtasks) {
            try {
                const parsedSubtasks = JSON?.parse(task.subtasks);
                taskObj.subtasks = parsedSubtasks?.map(subtask => {
                    let subtaskObj = {};
                    for (let key in subtask) {
                        if (subtask?.hasOwnProperty(key)) {
                            const label = labelMap[key];
                            if (label) {
                                subtaskObj[label] = subtask[key];
                            }
                        }
                    }
                    return subtaskObj;
                });
            } catch (error) {
                console.error("Error parsing subtasks:", error);
            }
        }

        return taskObj;
    }
    let taskData = tasks?.map(task => convertTask(task))

    return taskData;
}

export const flattenTasks = (tasks, level = 0) => {
    return tasks?.reduce((flatList, task) => {
        const { subtasks, ...taskWithoutSubtasks } = task;

        flatList.push({ ...taskWithoutSubtasks, level });

        if (subtasks?.length > 0) {
            flatList = flatList.concat(flattenTasks(subtasks, level + 1));
        }

        return flatList;
    }, []);
};


//Selectmenu custom styles
export const commonSelectProps = {
    select: true,
    fullWidth: true,
    size: "small",
    sx: {
        minWidth: 180,
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "& fieldset": {
                borderRadius: "8px",
            },
        },
    },
    SelectProps: {
        MenuProps: {
            PaperProps: {
                sx: {
                    borderRadius: "8px",
                    "& .MuiMenuItem-root": {
                        fontFamily: '"Public Sans", sans-serif',
                        color: "#444050",
                        margin: "5px 10px",
                        "&:hover": {
                            borderRadius: "8px",
                            backgroundColor: "#7367f0",
                            color: "#fff",
                        },
                        "&.Mui-selected": {
                            backgroundColor: "#80808033",
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: "#7367f0",
                                color: "#fff",
                            },
                        },
                    },
                },
            },
        },
    },
};

// DatePicker custom styles
export const customDatePickerProps = {
    slotProps: {
        popper: {
            sx: {
                "& .MuiDateCalendar-root": {
                    borderRadius: "8px",
                    fontFamily: '"Public Sans", sans-serif',
                },
                "& .MuiButtonBase-root, .MuiPickersCalendarHeader-label, .MuiPickersYear-yearButton": {
                    color: "#444050",
                    fontFamily: '"Public Sans", sans-serif',
                },
                "& .MuiPickersDay-root, .MuiPickersYear-yearButton": {
                    "&:hover": {
                        backgroundColor: "#7367f0",
                        color: "#fff",
                    },
                },
                "& .MuiPickersDay-root.Mui-selected, .Mui-selected ": {
                    backgroundColor: "#7367f0",
                    color: "#fff",
                },
                "& .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton:hover": {
                    backgroundColor: "#7367f0",
                    color: "#fff",
                },
            },
        },
    },
};

// TimePicker custom styles
export const customTimePickerProps = {
    slotProps: {
        popper: {
            sx: {
                "& .MuiClockPicker-root": {
                    fontFamily: '"Public Sans", sans-serif',
                },
                "& .MuiClockPicker-pin": {
                    backgroundColor: "#7367f0",
                },
                "& .MuiClockPicker-arrowSwitcher-button": {
                    color: "#444050",
                    "&:hover": {
                        backgroundColor: "#e6e6e6",
                    },
                },
                "& .MuiMultiSectionDigitalClock-root": {
                    backgroundColor: "#f9f9f9",
                },
                "& .MuiMultiSectionDigitalClockSection-item": {
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    fontSize: "13px",
                    "&:hover": {
                        backgroundColor: "#7367f0",
                        color: "#fff",
                    },
                },
                "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
                    backgroundColor: "#7367f0",
                    color: "#fff",
                },
            },
        },
    },
};

// sticky DatePicker custom styles use calendar page
export const customDatePickerStyles = {
    '& .MuiPickersLayout-root': {
        minWidth: '300px',
        width: '300px',
        margin: '0 auto',
    },
    '& .MuiDatePickerToolbar-root': {
        padding: '10px !important',
    },
    '& .MuiPickersToolbar-content': {
        '& .MuiTypography-root': {
            fontSize: '24px'
        },
    },
    '& .MuiDateCalendar-root': {
        borderRadius: '8px',
        fontFamily: '"Public Sans", sans-serif',
        color: '#444050',
    },
    '& .MuiPickersYear-root': {
        '& .MuiPickersYear-yearButton': {
            fontFamily: '"Public Sans", sans-serif',
            color: '#444050',
            '&:hover': {
                backgroundColor: '#7367f0',
                color: '#fff',
                borderRadius: '50px',
            },
        },
    },
    '& .css-6mw38q-MuiTypography-root': {
        display: 'none',
    },
    '& .MuiPickersCalendarHeader-label': {
        fontFamily: '"Public Sans", sans-serif',
        color: "#444050",
    },
    '& .MuiPickersDay-root': {
        fontFamily: '"Public Sans", sans-serif',
        color: '#444050',
        '&:hover': {
            backgroundColor: '#7367f0',
            color: '#fff',
        },
    },
    '& .MuiPickersDay-root.Mui-selected': {
        backgroundColor: '#7367f0 !important',
        color: '#fff !important',
    },
    '& .MuiPickersDay-root.Mui-selected:hover': {
        backgroundColor: '#7367f0',
        color: '#fff',
    },
    '& .MuiPickersYear-yearButton.Mui-selected': {
        backgroundColor: '#7367f0 !important',
        color: '#fff !important',
    },
};

// Common TextField style properties
export const commonTextFieldProps = {
    fullWidth: true,
    size: "small",
    className: "textfieldsClass",
};


// Optimized conversion functions
const charMap = {
    "&": "ane",
    "%": "percent",
};

// Reverse the mapping for words to special characters
const wordMap = Object.fromEntries(
    Object.entries(charMap).map(([key, value]) => [value, key])
);

// Function to convert special characters to words (for API)
export function convertSpecialCharsToWords(str) {
    return str?.replace(/[&<>"'%$#!?=+\-*/\\^~]/g, (match) => charMap[match] || match);
}

// Function to convert words back to special characters (for UI)
export function convertWordsToSpecialChars(str) {
    return str?.replace(/\b(ane)\b/g, (match) => wordMap[match] || match);
}