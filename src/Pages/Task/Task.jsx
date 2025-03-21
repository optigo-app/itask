import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box } from "@mui/material";
import { fetchTaskDataApi } from "../../Api/TaskApi/TaskDataApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, filterDrawer, filterDrawer1, masterDataValue, selectedCategoryAtom, selectedRowData, taskActionMode, TaskData } from "../../Recoil/atom";
import { fetchMasterGlFunc, formatDate, formatDate2 } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { motion, AnimatePresence } from "framer-motion";
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
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const [filters, setFilters] = useState({});

  // Sample data for tasks
  const [tasks, setTasks] = useRecoilState(TaskData);

  // Helper function to get data from session storage and set state
  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  // Master data fetching and real-time updating
  const fetchMasterData = async () => {
    setIsLoading(true);
    try {
      let storedStructuredData = sessionStorage.getItem('structuredMasterData');
      let structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
      if (!structuredData) {
        await fetchMasterGlFunc();
        storedStructuredData = sessionStorage.getItem('structuredMasterData');
        structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
      }
      if (structuredData) {
        setMasterData(structuredData);
        retrieveAndSetData('taskAssigneeData', setAssigneeData);
        retrieveAndSetData('taskstatusData', setStatusData);
        retrieveAndSetData('taskpriorityData', setPriorityData);
        retrieveAndSetData('taskdepartmentData', setTaskDepartment);
        retrieveAndSetData('taskprojectData', setTaskProject);
        retrieveAndSetData('taskworkcategoryData', setTaskCategory);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    debugger
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
      // const finalTaskData = [...labeledTasks, ...TaskJson]
      const finalTaskData = [...labeledTasks]

      const enhanceTask = (task) => {
        const priority = priorityData?.find(item => item?.id == task?.priorityid);
        const status = statusData?.find(item => item?.id == task?.statusid);
        const project = taskProject?.find(item => item?.id == task?.projectid);
        const department = taskDepartment?.find(item => item?.id == task?.departmentid);
        const category = taskCategory?.find(item => item?.id == task?.workcategoryid);
        const assignee = assigneeJosn;
        const estimate = ['20', '30', '40']
        const isburning = 1;
        const isFreezed = 0;
        const isFav = false;

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
          isFav: isFav,
          isFreezed: isFreezed,
          isUpdated: false,
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
    const init = sessionStorage?.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
  }, []);

  // task api call
  useEffect(() => {
    debugger
    setTimeout(() => {
      if (priorityData && statusData && taskProject && taskDepartment) {
        if (callFetchTaskApi) {
          fetchTaskData(selectedRow);
        }
      } else {
        fetchMasterData();
      }
    }, 100);
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
    setSelectedCategory('');
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSelectedCategory('');
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
            ? task.assignee.some((a) => a?.name?.toLowerCase()?.includes(normalizedSearchTerm))
            : task?.assignee?.toLowerCase()?.includes(normalizedSearchTerm)) ||
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
            isFav: !task.isFav, // Toggle isFav
          };
        }

        if (task.subtasks?.length > 0) {
          const updatedSubtasks = updateTasksRecursively(task.subtasks);
          if (updatedSubtasks !== task.subtasks) {
            return {
              ...task,
              subtasks: updatedSubtasks,
            };
          }
        }

        return task;
      });
    };

    setTasks((prevTasks) => updateTasksRecursively(prevTasks));
  };


  const handleFreezeTask = (taskToUpdate) => {
    const updateTasksRecursively = (tasks) => {
      return tasks?.map((task) => {
        if (task.taskid === taskToUpdate.taskid) {
          return {
            ...task,
            isFreezed: !task.isFreezed,
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
  }

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
      <AnimatePresence mode="wait">
        {drawerOpen1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div
              style={{
                margin: "20px 0",
                border: "1px dashed #7d7f85",
                opacity: 0.3,
              }}
            />

            {/* Filters Component */}
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
      <AnimatePresence mode="wait">
        {activeButton && (
          <motion.div
            key={activeButton}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: drawerOpen1 ? 0 : 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Suspense fallback={<></>}>
              {activeButton === "table" && (
                <TaskTable
                  data={filteredData ?? null}
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                />
              )}

              {activeButton === "kanban" && (
                <KanbanView
                  taskdata={filteredData ?? null}
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  statusData={statusData}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                />
              )}

              {activeButton === "card" && (
                <CardView
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                />
              )}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

    </Box>
  );
};

export default Task;
