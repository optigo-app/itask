import { useRecoilState } from "recoil";
import { fetchTaskDataApi } from "../../Api/TaskApi/TaskDataApi";
import { TaskData } from "../../Recoil/atom";
import { fetchMasterGlFunc } from "../globalfun";

const TaskAPiCallWithFormat = () => {
    const [tasks, setTasks] = useRecoilState(TaskData);

    const fetchMasterData = async () => {
        try {
            let storedStructuredData = sessionStorage.getItem('structuredMasterData');
            let structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
            if (!structuredData) {
                await fetchMasterGlFunc();
                storedStructuredData = sessionStorage.getItem('structuredMasterData');
                structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
            }
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };

    const fetchTaskData = async () => {
        const priorityData = JSON?.parse(sessionStorage.getItem("taskpriorityData") || "[]");
        const statusData = JSON?.parse(sessionStorage.getItem("taskstatusData") || "[]");
        const taskProject = JSON?.parse(sessionStorage.getItem("taskprojectData") || "[]");
        const taskDepartment = JSON?.parse(sessionStorage.getItem("taskdepartmentData") || "[]");
        const taskCategory = JSON?.parse(sessionStorage.getItem("taskworkcategoryData") || "[]");
        const taskAssigneeData = JSON?.parse(sessionStorage.getItem("taskAssigneeData") || "[]");
        try {
            if (!priorityData || !statusData || !taskProject || !taskDepartment) {
                fetchMasterData();
                return;
            }
            const taskData = await fetchTaskDataApi({});
            const labeledTasks = mapTaskLabels(taskData);
            let finalTaskData = [...labeledTasks]

            const enhanceTask = (task) => {
                const priority = priorityData?.find(item => item?.id == task?.priorityid);
                const status = statusData?.find(item => item?.id == task?.statusid);
                const project = taskProject?.find(item => item?.id == task?.projectid);
                const department = taskDepartment?.find(item => item?.id == task?.departmentid);
                const category = taskCategory?.find(item => item?.id == task?.workcategoryid);
                const assigneeIdArray = task?.assigneids?.split(',')?.map(id => Number(id));
                const matchedAssignees = taskAssigneeData?.filter(user => assigneeIdArray?.includes(user.id));

                const enhancedSubtasks = task?.subtasks?.map((subtask) => ({
                    ...enhanceTask(subtask),
                    subtaskflag: 1,
                    isUpdated: false,
                }));

                return {
                    ...task,
                    priority: priority ? priority?.labelname : '',
                    status: status ? status?.labelname : '',
                    taskPr: project ? project?.labelname : '',
                    taskDpt: department ? department?.labelname : '',
                    subtasks: enhancedSubtasks || [],
                    assignee: matchedAssignees ?? [],
                    category: category?.labelname,
                };
            };

            const enhancedTasks = finalTaskData?.map(task => enhanceTask(task));
                setTasks((prevTasks) => {
                    const taskMap = new Map();
                    enhancedTasks.forEach((task) => {
                        taskMap.set(task.taskid, task);
                    });
                    const mergeTasks = (tasks = []) => {
                        return tasks.map((task) => {
                            const updatedTask = taskMap.get(task.taskid);
                            const existingSubtasks = task.subtasks || [];
                            const updatedSubtasks = updatedTask?.subtasks || [];

                            if (!Array.isArray(existingSubtasks) || existingSubtasks.length === 0) {
                                return {
                                    ...task,
                                    ...(updatedTask || {}),
                                };
                            }

                            return {
                                ...task,
                                ...(updatedTask || {}),
                                subtasks: mergeTasks(updatedSubtasks.length > 0 ? updatedSubtasks : existingSubtasks),
                            };
                        });
                    };
                    const newTasks = mergeTasks(prevTasks);
                    if (!Array.isArray(prevTasks) || prevTasks.length === 0) {
                        return [...enhancedTasks];
                    }
                    return newTasks;
                });

        } catch (error) {
            console.error(error);
        }
    };
    function mapTaskLabels(data) {
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
            if (task.subtasks) {
                try {
                    const parsedSubtasks = JSON.parse(task.subtasks);
                    taskObj.subtasks = parsedSubtasks.map(subtask => {
                        let subtaskObj = {};
                        for (let key in subtask) {
                            if (subtask.hasOwnProperty(key)) {
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
    return { fetchTaskData}
}

export default TaskAPiCallWithFormat