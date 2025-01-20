import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, CircularProgress } from "@mui/material";
import { fetchTaskDataApi } from "../../Api/TaskApi/TaskDataApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchlistApiCall, masterDataValue, rootSubrootflag, selectedRowData } from "../../Recoil/atom";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { format } from 'date-fns';
import { fetchMasterGlFunc } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));

const Task = () => {
  const location = useLocation();
  const callFetchTaskApi = useRecoilValue(fetchlistApiCall);
  const selectedRow = useRecoilValue(selectedRowData);
  const [isLoading, setIsLoading] = useState(false);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [activeButton, setActiveButton] = useState("Table");
  const [filters, setFilters] = useState({
    statusFilter: "",
    priorityFilter: "",
    assigneeFilter: "",
    searchTerm: "",
  });

  // Sample data for tasks
  const [tasks, setTasks] = useState();

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  const fetchMasterData = async () => {
    setIsLoading(true);
    try {
      const masterData = sessionStorage.getItem('masterData');
      const result = JSON.parse(masterData);
      if (!result) {
        fetchMasterGlFunc();
      } else {
        setMasterData(result);
        retrieveAndSetData('taskAssigneeData', setAssigneeData);
        retrieveAndSetData('taskStatusData', setStatusData);
        retrieveAndSetData('taskPriorityData', setPriorityData);
        retrieveAndSetData('taskDepartmentData', setTaskDepartment);
        retrieveAndSetData('taskProjectData', setTaskProject);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchTaskData = async (selectedRow) => {
  //   setIsLoading(true);
  //   try {
  //     if (!priorityData || !statusData || !taskProject || !taskDepartment) {
  //       console.log("Master data not yet loaded");
  //       setIsLoading(false);
  //       return;
  //     }

  //     const taskData = await fetchTaskDataApi(selectedRow ?? {});

  //     const labeledTasks = mapTaskLabels(taskData);
  //     const enhancedTasks = labeledTasks?.map(task => {
  //       // Task
  //       const priority = priorityData?.find(item => item?.id == task?.priorityid);
  //       const status = statusData?.find(item => item?.id == task?.statusid);
  //       const project = taskProject?.find(item => item?.id == task?.projectid);
  //       const department = taskDepartment?.find(item => item?.id == task?.departmentid);

  //       // Map subtasks if present
  //       const enhancedSubtasks = task?.subtasks?.map(subtask => {
  //         const subPriority = priorityData?.find(item => item?.id == subtask?.priorityid);
  //         const subStatus = statusData?.find(item => item?.id == subtask?.statusid);
  //         const subProject = taskProject?.find(item => item?.id == subtask?.projectid);
  //         const subDepartment = taskDepartment?.find(item => item?.id == subtask?.departmentid);

  //         return {
  //           ...subtask,
  //           priority: subPriority ? subPriority?.labelname : '',
  //           status: subStatus ? subStatus?.labelname : '',
  //           taskPr: subProject ? subProject?.labelname : '',
  //           taskDpt: subDepartment ? subDepartment?.labelname : '',
  //           subtaskflag: 1,
  //         };
  //       });

  //       return {
  //         ...task,
  //         priority: priority ? priority?.labelname : '',
  //         status: status ? status?.labelname : '',
  //         taskPr: project ? project?.labelname : '',
  //         taskDpt: department ? department?.labelname : '',
  //         subtasks: enhancedSubtasks || [],
  //         subtaskflag: 0,
  //       };
  //     });

  //     setTasks((prevTasks) => {
  //       if (!Array.isArray(prevTasks)) return [...enhancedTasks];

  //       const updateSubtasks = (subtasks, visited = new Set()) => {
  //         if (!Array.isArray(subtasks) || subtasks.length === 0) return subtasks;

  //         return subtasks.map((subtask) => {
  //           if (visited.has(subtask.taskid)) return subtask;

  //           visited.add(subtask.taskid);

  //           const matchingSubtask = enhancedTasks.find(
  //             (newTask) => newTask?.taskid === subtask?.taskid
  //           );

  //           if (matchingSubtask) {
  //             return {
  //               ...subtask,
  //               ...matchingSubtask,
  //               subtasks: updateSubtasks(
  //                 matchingSubtask.subtasks || subtask.subtasks,
  //                 visited
  //               ),
  //             };
  //           }
  //           return {
  //             ...subtask,
  //             subtasks: updateSubtasks(subtask.subtasks, visited),
  //           };
  //         });
  //       };

  //       return prevTasks.map((task) => ({
  //         ...task,
  //         subtasks: updateSubtasks(task?.subtasks),
  //       }));
  //     });

  //     console.log('enhancedTasks: ', enhancedTasks);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchTaskData = async (selectedRow) => {
    debugger
    if (!tasks) {
      setIsLoading(true);
    }
    try {
      if (!priorityData || !statusData || !taskProject || !taskDepartment) {
        setIsLoading(false);
        return;
      }

      const taskData = await fetchTaskDataApi(selectedRow ?? {});
      const labeledTasks = mapTaskLabels(taskData);

      const enhanceTask = (task) => {
        const priority = priorityData?.find(item => item?.id == task?.priorityid);
        const status = statusData?.find(item => item?.id == task?.statusid);
        const project = taskProject?.find(item => item?.id == task?.projectid);
        const department = taskDepartment?.find(item => item?.id == task?.departmentid);

        const enhancedSubtasks = task?.subtasks?.map((subtask) => ({
          ...enhanceTask(subtask),
          subtaskflag: 1, // Flag for subtask
          isUpdated: false, // Track if subtask is updated
        }));

        return {
          ...task,
          priority: priority ? priority?.labelname : '',
          status: status ? status?.labelname : '',
          taskPr: project ? project?.labelname : '',
          taskDpt: department ? department?.labelname : '',
          subtasks: enhancedSubtasks || [],
          subtaskflag: 0,
          isUpdated: false,
        };
      };

      const enhancedTasks = labeledTasks?.map(task => enhanceTask(task));

      setTasks((prevTasks) => {
        const taskMap = new Map();

        // Map the enhanced tasks by their task IDs
        enhancedTasks.forEach((task) => {
          taskMap.set(task.taskid, task);
        });

        const mergeTasks = (tasks = []) => {
          return tasks.map((task) => {
            const updatedTask = taskMap.get(task.taskid);
            const existingSubtasks = task.subtasks || [];
            const updatedSubtasks = updatedTask?.subtasks || [];

            // Avoid recursion if there are no subtasks to merge
            if (!Array.isArray(existingSubtasks) || existingSubtasks.length === 0) {
              return {
                ...task,
                ...(updatedTask || {}), // Apply updated task data if available
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
        // If the previous state is empty, just use the new tasks directly
        if (!Array.isArray(prevTasks) || prevTasks.length === 0) {
          return [...enhancedTasks];
        }

        return newTasks;
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    const init = localStorage.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
  }, []);

  useEffect(() => {
   setTimeout(() => {
    if (priorityData && statusData && taskProject && taskDepartment) {
      if (callFetchTaskApi) {
        fetchTaskData(selectedRow);
      }
    }
   }, 100);
  }, [location,priorityData, statusData, taskProject, taskDepartment, callFetchTaskApi]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    if (key === 'clearFilter' && value == null) {
      setFilters([]);
      return;
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredData = tasks?.filter((task) => {
    const { status, priority, assignee, searchTerm, dueDate } = filters;

    const normalizedSearchTerm = searchTerm?.toLowerCase();

    const matchesFilters = (task) => {
      const matches =
        (status ? task?.status?.toLocaleLowerCase() === status?.toLocaleLowerCase() : true) &&
        (priority ? task?.priority?.toLocaleLowerCase() === priority?.toLocaleLowerCase() : true) &&
        (assignee ? task?.assignee?.toLocaleLowerCase() === assignee?.toLocaleLowerCase() : true) &&
        (!searchTerm ||
          task?.taskname?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.status?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.priority?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.assignee?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.description?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.DeadLineDate?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskPr?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskDpt?.toLowerCase().includes(normalizedSearchTerm)) &&
        (dueDate
          ? format(new Date(task?.DeadLineDate), 'yyyy-MM-dd') === format(new Date(dueDate), 'yyyy-MM-dd')
          : true);

      if (matches) {
        return true;
      }

      if (task?.subtasks?.length > 0) {
        return task.subtasks.some(matchesFilters);
      }

      return false;
    };

    return matchesFilters(task);
  });

  // const handleAddSubtask = (parentTask) => {
  //   if (!parentTask) {
  //     const newTask = {
  //       name: `New Task ${tasks.length + 1}`,
  //       status: "Not Started",
  //       assignee: "",
  //       due: "",
  //       priority: "Low",
  //       summary: "",
  //       subtasks: [],
  //     };
  //     setTasks([...tasks, newTask]);
  //   } else {
  //     const updatedTasks = addSubtask(tasks, parentTask);
  //     setTasks(updatedTasks);
  //   }
  // };


  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "30px 20px",
        borderRadius: "5px",
      }}
    >
      {/* Header Buttons */}
      <HeaderButtons
        activeButton={activeButton}
        onButtonClick={setActiveButton}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={taskProject}
        statusData={statusData}
      />

      {/* Divider */}
      <div
        style={{
          margin: "20px 0",
          border: "1px dashed #7d7f85",
          opacity: 0.3,
        }}
      />

      {/* Filters */}
      <Filters {...filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        statusData={statusData}
        assigneeData={assigneeData}
        taskDepartment={taskDepartment}
        taskProject={taskProject}
      />

      {/* Divider */}
      <div
        style={{
          margin: "20px 0",
          border: "1px dashed #7d7f85",
          opacity: 0.3,
        }}
      />

      {/* View Components */}
      <Suspense fallback={<></>}>
        {activeButton === "Table" && (
          <TaskTable
            data={filteredData}
            isLoading={isLoading}
            masterData={masterData} />
        )}
        {activeButton === "Kanban" && <KanbanView
          isLoading={isLoading}
          masterData={masterData} />}
        {activeButton === "Card" && <CardView
          isLoading={isLoading}
          masterData={masterData} />}
      </Suspense>
    </Box>
  );
};

export default Task;
