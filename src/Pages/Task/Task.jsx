import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, Typography } from "@mui/material";
import { fetchTaskDataApi } from "../../Api/TaskApi/TaskDataApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, filterDrawer, masterDataValue, selectedCategoryAtom, selectedRowData, TaskData, taskLength } from "../../Recoil/atom";
import { fetchMasterGlFunc, formatDate, formatDate2 } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { motion, AnimatePresence } from "framer-motion";
import { AddTaskDataApi } from "../../Api/TaskApi/AddTaskApi";
import { toast } from "react-toastify";


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));

const Task = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [callFetchTaskApi, setCallFetchTaskApi] = useRecoilState(fetchlistApiCall);
  console.log('ddddcallFetchTaskApi: ', callFetchTaskApi);
  const [selectedRow, setSelectedRow] = useRecoilState(selectedRowData);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(null);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();
  const [taskAssigneeData, setTaskAssigneeData] = useState();
  const [activeButton, setActiveButton] = useState("table");
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const [filters, setFilters] = useState({});
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const [tasks, setTasks] = useRecoilState(TaskData);
  console.log('tasks: ', tasks);
  const setTaskDataLength = useSetRecoilState(taskLength)
  const encodedData = searchParams.get("data");

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

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
        retrieveAndSetData('taskAssigneeData', setTaskAssigneeData);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log('ddddselectedRow: ', selectedRow);

  const fetchTaskData = async (parsedData) => {
    debugger
    if (tasks?.length == 0) {
      setIsTaskLoading(true);
    }
    try {
      if (!priorityData || !statusData || !taskProject || !taskDepartment) {
        setIsTaskLoading(false);
        return;
      }
      let data = selectedRow?.parentid ? selectedRow : parsedData;
      const taskData = await fetchTaskDataApi(data ?? {});
      const labeledTasks = mapTaskLabels(taskData);
      console.log('labeledTasks: ', labeledTasks);
      let finalTaskData = [...labeledTasks]
      setSelectedRow({})
      if (parsedData?.taskid) {
        const matchedTask = finalTaskData?.find(task => task.taskid === parsedData.taskid);

        if (matchedTask) {
          finalTaskData = finalTaskData?.filter(task => task.taskid !== parsedData.taskid)
            ?.concat((matchedTask.subtasks ?? [])?.map(sub => ({ ...sub })));
        }
      }

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
      setTaskDataLength(enhancedTasks.length);

      if (data?.taskid === parsedData?.taskid) {
        setTasks(enhancedTasks);
      } else {

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
      }

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

  useEffect(() => {
    const init = sessionStorage?.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
    setCallFetchTaskApi(true);
  }, []);

  // task api call
  useEffect(() => {
    debugger
    let parsedData = null;
    if (encodedData) {
      try {
        const decodedString = decodeURIComponent(encodedData);
        const jsonString = atob(decodedString);
        parsedData = JSON.parse(jsonString);
      } catch (error) {
        console.error("Error decoding or parsing encodedData:", error);
        parsedData = null;
      }
    }
    setTimeout(() => {
      if (priorityData && statusData && taskProject && taskDepartment) {
        if (callFetchTaskApi) {
          fetchTaskData(parsedData);
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
    console.log('assignee: ', assignee);

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
        (category ? (task?.category)?.toLowerCase() === category.toLowerCase() : true) &&
        (status ? (task?.status)?.toLowerCase() === status.toLowerCase() : true) &&
        (priority ? (task?.priority)?.toLowerCase() === priority.toLowerCase() : true) &&
        (department ? (task?.taskDpt)?.toLowerCase() === department.toLowerCase() : true) &&
        (project ? (task?.taskPr)?.toLowerCase() === project.toLowerCase() : true) &&
        (dueDate ? formatDate2(task?.DeadLineDate) === formatDate2(dueDate) : true) &&
        (assignee ?
          task.assignee?.some((a) => {
            const fullName = `${a?.firstname} ${a?.lastname}`.toLowerCase();
            return fullName.includes(assignee.toLowerCase());
          })
          : true) &&
        (!searchTerm ||
          task?.taskname?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.status?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.priority?.toLowerCase().includes(normalizedSearchTerm) ||
          (Array.isArray(task?.assignee)
            ? task.assignee.some((a) => `${a?.firstname} ${a?.lastname}`.toLowerCase().includes(normalizedSearchTerm))
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

  const handleTaskFavorite = (taskToUpdates) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskToUpdates.taskid) {
            const updatedTask = {
              ...task,
              isfavourite: task.isfavourite ? 0 : 1,
            };
            handleAddApicall(updatedTask);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
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

  const handleStatusChange = (taskId, status) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            const updatedTask = {
              ...task,
              statusid: status?.id,
              status: status?.labelname
            };
            handleAddApicall(updatedTask);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  };

  const handleAssigneeShortcutSubmit = (updatedRowData) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === updatedRowData.taskid) {
            const updatedTask = {
              ...task,
              departmentid: updatedRowData?.departmentid,
              assigneids: updatedRowData?.assigneids,
              assignee: updatedRowData?.assignee
            };
            handleAddApicall(updatedRowData);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  }

  const handleAddApicall = async (updatedTasks) => {
    let rootSubrootflagval = { "Task": "root" }
    const addTaskApi = await AddTaskDataApi(updatedTasks, rootSubrootflagval ?? {});
    if (addTaskApi?.rd[0]?.stat == 1) {
      toast.success(addTaskApi?.rd[0]?.stat_msg);
    }
  }


  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "20px",
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
        taskAssigneeData={taskAssigneeData}
      />

      {/* Divider */}
      <AnimatePresence mode="wait">
        {showAdvancedFil && (
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


      {/* <FiltersDrawer {...filters}
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
      /> */}


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
            animate={{ opacity: 1, y: showAdvancedFil ? 0 : 0 }}
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
                  handleStatusChange={handleStatusChange}
                  handleAssigneeShortcutSubmit={handleAssigneeShortcutSubmit}
                />
              )}

              {activeButton === "kanban" && (
                // <KanbanView
                //   taskdata={filteredData ?? null}
                //   isLoading={isTaskLoading}
                //   masterData={masterData}
                //   statusData={statusData}
                //   handleTaskFavorite={handleTaskFavorite}
                //   handleFreezeTask={handleFreezeTask}
                // />
                <Typography>Comming soon...</Typography>
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
