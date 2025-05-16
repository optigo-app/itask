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
export function getTimeLeft(dateString) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const futureDate = new Date(dateString);
    const target = new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate());

    const diffMs = target - today;

    const formatDateTime = (date) =>
        date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

    if (diffMs < 0) return "Overdue";
    if (diffMs === 0) return formatDateTime(futureDate);

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(diffDays / 365);

    if (years > 0) return `in ${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) return `in ${months} month${months > 1 ? "s" : ""}`;
    if (weeks > 0) return `in ${weeks} week${weeks > 1 ? "s" : ""}`;
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;

    return "Soon";
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

export const statusColors = {
    "approved": {
        color: "#2e7d32", // Green - success
        backgroundColor: "#c8e6c9",
    },
    "closed": {
        color: "#d32f2f", // Red - closed/final
        backgroundColor: "#ffcdd2",
    },
    "completed": {
        color: "#388e3c", // Green - task done
        backgroundColor: "#dcedc8",
    },
    "feedback pending": {
        color: "#ef6c00", // Orange - waiting
        backgroundColor: "#ffe0b2",
    },
    "feedback received": {
        color: "#3949ab", // Indigo - info received
        backgroundColor: "#c5cae9",
    },
    "in development": {
        color: "#1976d2", // Blue - active
        backgroundColor: "#bbdefb",
    },
    "in observation": {
        color: "#00796b", // Teal - under watch
        backgroundColor: "#b2dfdb",
    },
    "in planning": {
        color: "#6a1b9a", // Purple - strategy
        backgroundColor: "#e1bee7",
    },
    "in testing": {
        color: "#f57c00", // Orange - QA phase
        backgroundColor: "#ffe0b2",
    },
    "in-progress": {
        color: "#0288d1", // Blue - ongoing
        backgroundColor: "#b3e5fc",
    },
    "in-review": {
        color: "#8e24aa", // Purple - being checked
        backgroundColor: "#f3e5f5",
    },
    "new": {
        color: "#1e88e5", // Blue - just added
        backgroundColor: "#bbdefb",
    },
    "pending": {
        color: "#ffa000", // Amber - waiting
        backgroundColor: "#ffecb3",
    },
    "pending close": {
        color: "#ff7043", // Coral - about to close
        backgroundColor: "#ffe0b2",
    },
    "pending customer input": {
        color: "#ef6c00", // Orange - needs action
        backgroundColor: "#ffe0b2",
    },
    "pending maintenance": {
        color: "#6d4c41", // Brown - backend
        backgroundColor: "#d7ccc8",
    },
    "running": {
        color: "#0277bd", // Blue - active
        backgroundColor: "#b3e5fc",
    },
    "solved": {
        color: "#43a047", // Green - resolved
        backgroundColor: "#c8e6c9",
    },
    "solved-upcoming": {
        color: "#8bc34a", // Lime - will be solved
        backgroundColor: "#dcedc8",
    },
    "training pending": {
        color: "#fbc02d", // Yellow - needs attention
        backgroundColor: "#fff9c4",
    },
    "upcoming release": {
        color: "#009688", // Teal - info
        backgroundColor: "#b2dfdb",
    },
    "upload pending": {
        color: "#e53935", // Red - blocking task
        backgroundColor: "#ffcdd2",
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
        const uniqueDepartments = new Set();
        let UserProfileData
        if (!AssigneeMasterData) {
            const assigneeRes = await AssigneeMaster();
            UserProfileData = assigneeRes?.rd?.find(item => item?.userid == AuthUrlData?.uid);
            localStorage.setItem('UserProfileData', JSON?.stringify(UserProfileData));
            assigneeRes?.rd?.forEach(item => {
                if (item.department) {
                    uniqueDepartments.add(item.department);
                }
            });
        } else {
            UserProfileData = AssigneeMasterData?.find(item => item?.userid == AuthUrlData?.uid) ?? {};
            localStorage.setItem('UserProfileData', JSON?.stringify(UserProfileData));
            AssigneeMasterData?.forEach(item => {
                if (item.department) {
                    uniqueDepartments.add(item.department);
                }
            });
        }
        const departmentArray = Array.from(uniqueDepartments).map((department, index) => ({
            id: index + 1,
            labelname: department
        }));
        sessionStorage.setItem('taskDepartments', JSON?.stringify(departmentArray));
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
        return UserProfileData
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

export function mapKeyValuePair(data) {
    const labels = data?.rd[0];
    const tasks = data?.rd1;
    const labelMap = {};
    Object.keys(labels).forEach((key, index) => {
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
        return taskObj;
    }
    let taskData = tasks?.map((task) => convertTask(task));
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
export function transformAttachments(data) {
    const mimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        jfif: "image/jfif",
        avif: "image/avif",
        svg: "image/svg+xml"
    };

    const result = {
        attachment: {},
        url: {}
    };

    data?.forEach(({ foldername, DocumentName, DocumentUrl }) => {
        const folder = foldername;
        const docUrls = (DocumentName || "").split(",").filter(Boolean);
        const urlLinks = (DocumentUrl || "").split(",").filter(Boolean);

        // Process attachments
        if (!result.attachment[folder]) result.attachment[folder] = [];
        docUrls.forEach(url => {
            const fileName = url.substring(url.lastIndexOf("/") + 1);
            const ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
            result.attachment[folder].push({
                url,
                extention: ext,
                fileName,
                fileType: mimeTypes[ext] || "application/octet-stream"
            });
        });

        // Process additional URLs
        if (urlLinks.length) {
            result.url[folder] = urlLinks;
        }
    });

    return result;
}

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


export function showNotification({ title, body, icon, actions, url }) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                        registration.showNotification(title || 'Itask', {
                            body: body || 'This is a default notification message!',
                            icon: icon || '/logo.webp',
                            actions: actions || [
                                { action: 'open', title: 'Open Page' },
                                { action: 'dismiss', title: 'Dismiss' }
                            ],
                            data: { url: url || 'https://your-link-here.com' }
                        });
                    }
                });
            }
        });
    }
}

