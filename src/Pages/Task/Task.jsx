import React, { Suspense, useEffect, useState } from "react";
import "./Task.scss";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Advfilters, fetchlistApiCall, filterDrawer, masterDataValue, selectedCategoryAtom, selectedRowData, TaskData, taskLength } from "../../Recoil/atom";
import { formatDate2 } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { motion, AnimatePresence } from "framer-motion";
import { AddTaskDataApi } from "../../Api/TaskApi/AddTaskApi";
import { toast } from "react-toastify";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));

const Task = () => {
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const location = useLocation();
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("entrydate");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(14);
  const searchParams = new URLSearchParams(location.search);
  const [callFetchTaskApi, setCallFetchTaskApi] = useRecoilState(fetchlistApiCall);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [activeButton, setActiveButton] = useState("table");
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const [filters, setFilters] = useRecoilState(Advfilters);
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const [tasks, setTasks] = useRecoilState(TaskData);
  const setTaskDataLength = useSetRecoilState(taskLength)
  const selectedRow = useRecoilValue(selectedRowData);
  const encodedData = searchParams.get("data");
  const {
    iswhMLoading,
    iswhTLoading,
    taskFinalData,
    taskDepartment,
    taskProject,
    taskCategory,
    priorityData,
    statusData,
    taskAssigneeData } = useFullTaskFormatFile();

  useEffect(() => {
    if (!location?.pathname?.includes("/task")) {
      setTasks([]);
    }
  }, [location]);

  useEffect(() => {
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
    const matchedTask = taskFinalData?.TaskData?.find(
      (task) => task.taskid === parsedData?.taskid
    );

    if (matchedTask && matchedTask.subtasks?.length > 0) {
      setTasks(matchedTask.subtasks);
    }
    setTimeout(() => {
      if (!encodedData && taskFinalData) {
        setTasks(taskFinalData?.TaskData);
      }
    }, 10);

  }, [encodedData, taskFinalData, callFetchTaskApi, selectedRow]);

  useEffect(() => {
    const activeTab = localStorage?.getItem('activeTaskTab');
    if (activeTab) {
      setActiveButton(activeTab);
    }
  }, []);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    if (key === "clearFilter" && value == null) {
      setFilters({});
      return;
    }
    if (typeof value === "string" && value.startsWith("Select ")) {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters[key];
        return updatedFilters;
      });
      return;
    }
    if (key === "category" && Array.isArray(value) && value.length === 0) {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters[key];
        return updatedFilters;
      });
      setPage(1);
      return;
    }
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    setPage(1);
  };

  const handleClearFilter = (filterKey, value = null) => {
    if (filterKey === 'category') {
      const updatedCategory = value ? filters.category.filter((cat) => cat !== value) : [];
      setFilters((prev) => ({ ...prev, category: updatedCategory }));
      setSelectedCategory(updatedCategory);
    } else if (filterKey === 'dueDate') {
      setFilters((prev) => ({ ...prev, dueDate: null }));
    } else {
      setFilters((prev) => ({ ...prev, [filterKey]: '' }));
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSelectedCategory('');
  };

  function descendingComparator(a, b, orderBy) {
    const valA = a[orderBy];
    const valB = b[orderBy];

    if (typeof valA === "string" && typeof valB === "string") {
      return valB.trim().localeCompare(valA.trim()); // descending
    }

    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "asc"
      ? (a, b) => -descendingComparator(a, b, orderBy)
      : (a, b) => descendingComparator(a, b, orderBy);
  }

  // sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = [...(tasks || [])]?.sort(getComparator(order, orderBy));

  // all level of filtering
  const filteredData = sortedData
    ?.map((task) => {
      const {
        status,
        priority,
        assignee,
        searchTerm,
        dueDate,
        department,
        project,
        category,
      } = filters;

      const now = new Date();
      const normalizedSearchTerm = searchTerm?.toLowerCase();

      const resetInvalidFilters = () => {
        Object.keys(filters).forEach((key) => {
          const value = filters[key];
          if (
            value === "Select Department" ||
            value === "Select Status" ||
            value === "Select Priority" ||
            value === "Select Assignee" ||
            value === "Select Project"
          ) {
            filters[key] = "";
          }
        });
      };

      resetInvalidFilters();

      const isTaskDue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < now;
      };

      const matchesFilters = (item) => {
        const matchesCategory =
          !Array.isArray(category) ||
          category.length === 0 ||
          category.some((cat) => {
            if (cat.toLowerCase()?.includes("due")) {
              return isTaskDue(item?.DeadLineDate);
            } else if (cat.toLowerCase()?.includes("new")) {
              return item?.isnew == 1;
            }
            return (item?.category ?? "").toLowerCase() === cat.toLowerCase();
          });

        return (
          matchesCategory &&
          (status ? (item?.status)?.toLowerCase() === status?.toLowerCase() : true) &&
          (priority ? (item?.priority)?.toLowerCase() === priority?.toLowerCase() : true) &&
          (department ? (item?.taskDpt)?.toLowerCase() === department?.toLowerCase() : true) &&
          (project ? (item?.taskPr)?.toLowerCase() === project?.toLowerCase() : true) &&
          (dueDate ? formatDate2(item?.DeadLineDate) === formatDate2(dueDate) : true) &&
          (assignee
            ? item?.assignee?.some((a) => {
              const fullName = `${a?.firstname} ${a?.lastname}`?.toLowerCase();
              return fullName?.includes(assignee?.toLowerCase());
            })
            : true) &&
          (!searchTerm ||
            item?.taskname?.toLowerCase()?.includes(normalizedSearchTerm) ||
            item?.status?.toLowerCase()?.includes(normalizedSearchTerm) ||
            item?.priority?.toLowerCase()?.includes(normalizedSearchTerm) ||
            (Array.isArray(item?.assignee)
              ? item?.assignee?.some((a) =>
                `${a?.firstname} ${a?.lastname}`
                  ?.toLowerCase()
                  ?.includes(normalizedSearchTerm)
              )
              : item?.assignee?.toLowerCase()?.includes(normalizedSearchTerm)) ||
            item?.description?.toLowerCase()?.includes(normalizedSearchTerm) ||
            item?.DeadLineDate?.toLowerCase()?.includes(normalizedSearchTerm) ||
            item?.taskPr?.toLowerCase()?.includes(normalizedSearchTerm) ||
            item?.taskDpt?.toLowerCase()?.includes(normalizedSearchTerm))
        );
      };

      const filterRecursive = (item) => {
        const matches = matchesFilters(item);
        const filteredSubtasks = item?.subtasks
          ?.map(filterRecursive)
          .filter(Boolean) || [];

        if (matches || filteredSubtasks.length > 0) {
          return {
            ...item,
            subtasks: filteredSubtasks,
          };
        }
        return null;
      };

      return filterRecursive(task);
    })
    .filter(Boolean);

  const handleTabBtnClick = (button) => {
    setActiveButton(button);
    localStorage?.setItem('activeTaskTab', button);
  }

  const handleTaskFavorite = (taskToUpdates) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task?.taskid === taskToUpdates?.taskid) {
            const updatedTask = {
              ...task,
              isfavourite: task?.isfavourite ? 0 : 1,
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
    const assignees = Object.values(
      updatedRowData?.assignee?.reduce((acc, user) => {
        const dept = user.department;
        if (!acc[dept]) {
          acc[dept] = {
            department: dept,
            assignee: user.id.toString()
          };
        } else {
          acc[dept].assignee += `,${user.id}`;
        }
        return acc;
      }, {})
    );
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === updatedRowData.taskid) {
            const updatedTask = {
              ...task,
              departmentid: updatedRowData?.departmentid,
              assigneids: updatedRowData?.assigneids,
              assignee: updatedRowData?.assignee,
              departmentAssigneelist: assignees,
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (filteredData) {
      const maxPage = Math.ceil(filteredData.length / rowsPerPage);
      if (page > maxPage && maxPage > 0) {
        setPage(maxPage);
      }
    }
    setTaskDataLength(filteredData?.length);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math?.ceil(filteredData && filteredData?.length / rowsPerPage);

  // Get data for the current page
  const currentData = filteredData?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];


  return (
    <Box className="task-container">
      {/* Header Buttons */}
      <HeaderButtons
        activeButton={activeButton}
        onButtonClick={handleTabBtnClick}
        onFilterChange={handleFilterChange}
        isLoading={iswhMLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={taskProject}
        statusData={statusData}
        taskCategory={taskCategory}
        taskDepartment={taskDepartment}
        taskAssigneeData={taskAssigneeData}
      />

      {/* Divider */}
      {!isLaptop &&
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
                isLoading={iswhMLoading}
                masterData={masterData}
                priorityData={priorityData}
                statusData={statusData}
                assigneeData={taskAssigneeData}
                taskDepartment={taskDepartment}
                taskProject={taskProject}
                taskCategory={taskCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      }

      {isLaptop &&
        <FiltersDrawer {...filters}
          filters={filters}
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
          isLoading={iswhMLoading}
          masterData={masterData}
          priorityData={priorityData}
          statusData={statusData}
          assigneeData={taskAssigneeData}
          taskDepartment={taskDepartment}
          taskProject={taskProject}
          taskCategory={taskCategory}
        />
      }

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
                  currentData={currentData}
                  page={page}
                  order={order}
                  orderBy={orderBy}
                  rowsPerPage={rowsPerPage}
                  totalPages={totalPages}
                  isLoading={iswhTLoading}
                  masterData={masterData}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                  handleStatusChange={handleStatusChange}
                  handleAssigneeShortcutSubmit={handleAssigneeShortcutSubmit}
                  handleRequestSort={handleRequestSort}
                  handleChangePage={handleChangePage}
                />
              )}

              {activeButton === "kanban" && (
                <KanbanView
                  taskdata={filteredData ?? null}
                  isLoading={iswhTLoading}
                  masterData={masterData}
                  statusData={statusData}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                />
              )}

              {activeButton === "card" && (
                <CardView
                  isLoading={iswhTLoading}
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
