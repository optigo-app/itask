import { useSetRecoilState } from "recoil";
import { fetchTodayTaskApi } from "../../Api/TaskApi/fetchTodayTaskApi";
import { TaskData } from "../../Recoil/atom";
import { fetchMasterGlFunc } from "../globalfun";

const TaskAPiCallWithFormat = () => {
    const setTasks = useSetRecoilState(TaskData);

    const fetchMasterData = async () => {
        try {
            let storedStructuredData = localStorage.getItem('structuredMasterData');
            let structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
            if (!structuredData) {
                await fetchMasterGlFunc();
                storedStructuredData = localStorage.getItem('structuredMasterData');
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
            const d = new Date();
            const fmt = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            const today = fmt(d);
            const weekEnd = fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6));
            const [startRes, dueRes] = await Promise.all([
                fetchTodayTaskApi('order by StartDate asc', '500', '1', { startdatefrom: today, startdateto: today }),
                fetchTodayTaskApi('order by DeadLineDate asc', '500', '1', { dueDateFrom: '2000-01-01', dueDateTo: weekEnd }),
            ]);
            const seen = new Set();
            const finalTaskData = [...(startRes?.rd || []), ...(dueRes?.rd || [])].filter((row) => {
                if (seen.has(row?.taskid)) return false;
                seen.add(row?.taskid);
                return true;
            });

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
                    const mergedIds = new Set(newTasks.map((t) => t.taskid));
                    const added = enhancedTasks.filter((t) => !mergedIds.has(t.taskid));
                    return [...newTasks, ...added];
                });

        } catch (error) {
            console.error(error);
        }
    };
    return { fetchTaskData}
}

export default TaskAPiCallWithFormat