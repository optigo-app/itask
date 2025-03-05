import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box } from "@mui/material";
import { fetchTaskDataApi } from "../../Api/TaskApi/TaskDataApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchlistApiCall, filterDrawer, filterDrawer1, masterDataValue, selectedRowData, taskActionMode, TaskData } from "../../Recoil/atom";
import { fetchMasterGlFunc, formatDate, formatDate2 } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import {motion, AnimatePresence } from "framer-motion";
import TaskJson from "../../Data/taskData.json"


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));

const Task = () => {
  const location = useLocation();
  const callFetchTaskApi = useRecoilValue(fetchlistApiCall);
  const selectedRow = useRecoilValue(selectedRowData);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(null);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();
  const [activeButton, setActiveButton] = useState("table");
  const [filters, setFilters] = useState({});

  // Sample data for tasks
  const [tasks, setTasks] = useRecoilState(TaskData);

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  // master data fetching and setting
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
        retrieveAndSetData('taskCategoryData', setTaskCategory);
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

  const assigneeJosn = [
    {
      "id": 1,
      "name": "Shivam",
      "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/5.png",
      "designation": "Software Engineer"
    },
    {
      "id": 2,
      "name": "Shyam",
      "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/6.png",
      "designation": "Project Manager"
    },
    {
      "id": 3,
      "name": "Ram",
      "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/7.png",
      "designation": "UX Designer"
    },
    {
      "id": 4,
      "name": "Shiv",
      "avatar": "https://example.com/avatars/shiv.jpg",
      "designation": "Backend Developer"
    },
    {
      "id": 5,
      "name": "Jeet",
      "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/3.png",
      "designation": "Frontend Developer"
    },
  ]


  const fetchTaskData = async () => {
    if (tasks?.length == 0) {
      setIsTaskLoading(true);
    }
    try {
      if (!priorityData || !statusData || !taskProject || !taskDepartment) {
        setIsTaskLoading(false);
        return;
      }

      const taskData = await fetchTaskDataApi(selectedRow ?? {},);
      const labeledTasks = mapTaskLabels(taskData);
      const finalTaskData = [...labeledTasks,  ...TaskJson]
      console.log('finalTaskData: ', finalTaskData);

      const enhanceTask = (task) => {
        const priority = priorityData?.find(item => item?.id == task?.priorityid);
        const status = statusData?.find(item => item?.id == task?.statusid);
        const project = taskProject?.find(item => item?.id == task?.projectid);
        const department = taskDepartment?.find(item => item?.id == task?.departmentid);
        const category = taskCategory?.find(item => item?.id == task?.workcategoryid);
        const assignee = assigneeJosn;
        const estimate = ['20', '30', '40']
        const isburning = 1;

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
          assignee: assignee,
          category: category?.labelname,
          estimate: estimate,
          isburning: isburning,
          subtaskflag: 0,
          isUpdated: false,
        };
      };

      const enhancedTasks = finalTaskData?.map(task => enhanceTask(task));

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
      setIsTaskLoading(false);
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

  // master api call
  useEffect(() => {
    const init = sessionStorage.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
  }, []);

  // task api call
  useEffect(() => {
    setTimeout(() => {
      if (priorityData && statusData && taskProject && taskDepartment) {
        if (callFetchTaskApi) {
          fetchTaskData(selectedRow);
        }
      }
    }, 200);
  }, [location?.pathname, priorityData, statusData, taskProject, taskDepartment, callFetchTaskApi]);

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

  const handleClearFilter = (filterKey) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: ''
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  // filter functions
  const filteredData = tasks?.filter((task) => {
    const { status, priority, assignee, searchTerm, dueDate, department, project, category } = filters;

    const normalizedSearchTerm = searchTerm?.toLowerCase();

    const resetInvalidFilters = () => {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value === "Select Department" || value === "Select Status" || value === "Select Priority" || value === "Select Assignee" || value === "Select Project") {
          filters[key] = "";
        }
      });
    };
    // Reset filters before applying them
    resetInvalidFilters();

    const matchesFilters = (task) => {
      const matches =
        (category ? (task?.category)?.toLocaleLowerCase() === (category)?.toLocaleLowerCase() : true) &&
        (status ? (task?.status)?.toLocaleLowerCase() === (status)?.toLocaleLowerCase() : true) &&
        (priority ? (task?.priority)?.toLocaleLowerCase() === (priority)?.toLocaleLowerCase() : true) &&
        (department ? (task?.taskDpt)?.toLocaleLowerCase() === (department)?.toLocaleLowerCase() : true) &&
        (project ? (task?.taskPr)?.toLocaleLowerCase() === (project)?.toLocaleLowerCase() : true) &&
        (dueDate ? formatDate2(task?.DeadLineDate) === formatDate2(dueDate) : true) &&
        (assignee
          ? Array.isArray(task?.assignee)
            ? task.assignee.some((a) => a.toLocaleLowerCase() === assignee.toLocaleLowerCase())
            : task?.assignee?.toLocaleLowerCase() === assignee.toLocaleLowerCase()
          : true) &&
        (!searchTerm ||
          task?.taskname?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.status?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.priority?.toLowerCase().includes(normalizedSearchTerm) ||
          (Array.isArray(task?.assignee)
            ? task.assignee.some((a) => a.toLowerCase().includes(normalizedSearchTerm))
            : task?.assignee?.toLowerCase().includes(normalizedSearchTerm)) ||
          task?.description?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.DeadLineDate?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskPr?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskDpt?.toLowerCase().includes(normalizedSearchTerm)) &&
        (dueDate ? formatDate(task?.DeadLineDate) === formatDate(dueDate) : true);

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

  const handleTabBtnClick = (button) => {
    setActiveButton(button);
    localStorage?.setItem('activeTaskTab', button);
  }

  useEffect(() => {
    const activeTab = localStorage?.getItem('activeTaskTab');
    if (activeTab) {
      setActiveButton(activeTab);
    }
  }, []);

  const handleTaskFavorite = (taskToUpdate) => {
    const updateTasksRecursively = (tasks) => {
      return tasks?.map((task) => {
        if (task.taskid === taskToUpdate.taskid) {
          return {
            ...task,
            isFav: !task.isFav,
          };
        }

        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: updateTasksRecursively(task.subtasks),
          };
        }

        return task;
      });
    };

    setTasks((prevTasks) => updateTasksRecursively(prevTasks));
  };


  const [drawerOpen1, setDrawerOpen1] = useRecoilState(filterDrawer1);

  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "30px 20px",
        borderRadius: "8px",
        overflow: "hidden !important",
      }}
    >
      {/* Header Buttons */}
      <HeaderButtons
        activeButton={activeButton}
        onButtonClick={handleTabBtnClick}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={taskProject}
        statusData={statusData}
        taskCategory={taskCategory}
        taskDepartment={taskDepartment}
      />

      {/* Divider */}
      <AnimatePresence>
        {drawerOpen1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div
              style={{
                margin: "20px 0",
                border: "1px dashed #7d7f85",
                opacity: 0.3,
              }}
            />

            {/* Filters */}
            <Filters
              {...filters}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
              masterData={masterData}
              priorityData={priorityData}
              statusData={statusData}
              assigneeData={assigneeData}
              taskDepartment={taskDepartment}
              taskProject={taskProject}
              taskCategory={taskCategory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <FiltersDrawer {...filters}
        filters={filters}
        setFilters={setFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAllFilters}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        statusData={statusData}
        assigneeData={assigneeData}
        taskDepartment={taskDepartment}
        taskProject={taskProject}
        taskCategory={taskCategory}
      />


      {/* Divider */}
      <div
        style={{
          margin: "20px 0",
          border: "1px dashed #7d7f85",
          opacity: 0.3,
        }}
      />
      <FilterChips
        filters={filters}
        onClearFilter={handleClearFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* View Components */}
      <Suspense fallback={<></>}>
        {activeButton === "table" && (
          <TaskTable
            data={filteredData ?? null}
            isLoading={isTaskLoading}
            masterData={masterData}
            handleTaskFavorite={handleTaskFavorite}
          />
        )}

        {activeButton === "kanban" &&
          <KanbanView
            taskdata={filteredData ?? null}
            isLoading={isTaskLoading}
            masterData={masterData}
            statusData={statusData}
            handleTaskFavorite={handleTaskFavorite}
          />
        }

        {activeButton === "card" &&
          <CardView
            isLoading={isTaskLoading}
            masterData={masterData}
            handleTaskFavorite={handleTaskFavorite}
          />
        }
      </Suspense>
    </Box>
  );
};

export default Task;
