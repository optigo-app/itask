import { fetchMaster } from "../Api/MasterApi/MasterApi";

export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

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


// colors.js (Global colors)
export const colors = [
    "#FF5722", "#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4",
    "#FF9800", "#9E9E9E", "#795548", "#607D8B", "#8BC34A", "#FFEB3B", "#FF4081", "#673AB7",
    "#009688", "#F44336", "#3F51B5", "#CDDC39", "#03A9F4", "#9C27B0", "#FF1744", "#00E5FF",
    "#9E9E9E", "#4CAF50", "#00BCD4", "#8B4513", "#6A5ACD", "#F08080", "#32CD32", "#FF6347"
];

export const getRandomAvatarColor = (name) => {
    const charSum = name
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
};



export const fetchMasterGlFunc = async () => {
    // setIsLoading(true);
    try {
        const masterData = sessionStorage.getItem('masterData');
        const result = JSON.parse(masterData);
        if (!result) {
            const masterData = await fetchMaster();
            const result = Object.keys(masterData)
                .filter((key) => key.startsWith("rd") && key !== "rd")
                .map((key) => {
                    const rdIndex = parseInt(key.replace("rd", ""), 10);
                    const rdItem = masterData.rd.find((item) => item.id === rdIndex);
                    return {
                        id: rdItem?.id,
                        table_name: rdItem?.table_name,
                        Table_Title: rdItem?.title,
                        rows: masterData[key].map((item) => ({
                            ...item,
                            table_id: rdItem?.id,
                        })),
                    };
                });

            sessionStorage?.setItem('masterData', JSON.stringify(result));
        } else {

            const taskAssigneeData = result?.find((item) => item.id === 1);
            if (taskAssigneeData) {
                sessionStorage.setItem('taskAssigneeData', JSON.stringify(taskAssigneeData?.rows?.filter((row) => row?.isdelete === 0)));
            }

            const taskStatusData = result?.find((item) => item.id === 2);
            if (taskStatusData) {
                sessionStorage.setItem('taskStatusData', JSON.stringify(taskStatusData?.rows?.filter((row) => row?.isdelete === 0)));
            }

            const taskPriorityData = result?.find((item) => item.id === 3);
            if (taskPriorityData) {
                sessionStorage.setItem('taskPriorityData', JSON.stringify(taskPriorityData?.rows?.filter((row) => row?.isdelete === 0)));
            }

            const taskDepartmentData = result?.find((item) => item.id === 4);
            if (taskDepartmentData) {
                sessionStorage.setItem('taskDepartmentData', JSON.stringify(taskDepartmentData?.rows?.filter((row) => row?.isdelete === 0)));
            }

            const taskProjectData = result?.find((item) => item.id === 5);
            if (taskProjectData) {
                sessionStorage.setItem('taskProjectData', JSON.stringify(taskProjectData?.rows?.filter((row) => row?.isdelete === 0)));
            }
            const workspaceData = result?.find((item) => item.id === 6);
            if (workspaceData) {
                sessionStorage.setItem('workspaceData', JSON.stringify(workspaceData?.rows?.filter((row) => row?.isdelete === 0)));
            }
        }
    } catch (error) {
        console.error(error);
    }
};
