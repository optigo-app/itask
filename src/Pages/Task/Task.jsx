import React, { Suspense, useEffect, useState } from "react";
import "./Task.scss";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, Chip, Typography, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Advfilters, completedTask, copyRowData, fetchlistApiCall, filterDrawer, masterDataValue, selectedCategoryAtom, selectedRowData, TaskData, taskLength, viewMode } from "../../Recoil/atom";
import { filterNestedTasksByView, formatDate2, getCategoryTaskSummary, handleAddApicall, isTaskDue, isTaskToday } from "../../Utils/globalfun";
import { useLocation } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";
import { MoveTaskApi } from "../../Api/TaskApi/MoveTaskApi";
import CloseIcon from '@mui/icons-material/Close';


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));

const Task = () => {
  const date = new Date();
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const location = useLocation();
  const userProfile = JSON.parse(localStorage.getItem("UserProfileData"));
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("entrydate");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const searchParams = new URLSearchParams(location.search);
  const masterData = useRecoilValue(masterDataValue);
  const [activeButton, setActiveButton] = useState("table");
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const [filters, setFilters] = useRecoilState(Advfilters);
  console.log('filters: ', filters);
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const [tasks, setTasks] = useRecoilState(TaskData);
  const setTaskDataLength = useSetRecoilState(taskLength)
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const [selectedRow, setSelectedRow] = useRecoilState(selectedRowData);
  const [copiedData, setCopiedData] = useRecoilState(copyRowData);
  const [completedFlag, setCompletedFlag] = useRecoilState(completedTask);
  const encodedData = searchParams.get("data");
  const [CategoryTSummary, setCategoryTSummary] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const meTeamView = useRecoilValue(viewMode);
  const {
    iswhMLoading,
    iswhTLoading,
    taskFinalData,
    taskDepartment,
    taskProject,
    taskCategory,
    priorityData,
    statusData,
    secStatusData,
    taskAssigneeData } = useFullTaskFormatFile();

  useEffect(() => {
    setTasks([]);
  }, [location.pathname]);

  useEffect(() => {
    let parsedData = null;
    if (encodedData) {
      try {
        const decodedString = decodeURIComponent(encodedData);
        const jsonString = atob(decodedString);
        parsedData = JSON.parse(jsonString);
      } catch (error) {
        console.error("Error decoding or parsing encodedData:", error);
      }
    }
    const userId = userProfile?.id;
    const filterByStatus = (tasks) => {
      const isSameLocalDay = (utcDateString) => {
        if (!utcDateString) return false;
        const localDate = new Date(utcDateString);
        return (
          localDate.getFullYear() === date.getFullYear() &&
          localDate.getMonth() === date.getMonth() &&
          localDate.getDate() === date.getDate()
        );
      };
      return tasks?.filter((task) => {
        const status = task?.status?.toLowerCase?.() || '';
        if (completedFlag) {
          return (
            status === 'completed' &&
            !isSameLocalDay(task?.EndDate)
          );
        } else {
          return (
            status !== 'completed' ||
            isSameLocalDay(task?.EndDate)
          );
        }
      });
    };

    if (parsedData == null) {
      let rawTasks = taskFinalData?.TaskData || [];
      rawTasks = filterByStatus(rawTasks);
      const summary = getCategoryTaskSummary(rawTasks, taskCategory);
      setCategoryTSummary(summary);
      setTasks(rawTasks);
    } else {
      if (parsedData?.taskid) {
        const matchedTask = taskFinalData?.TaskData?.find(
          (task) => task.taskid === parsedData.taskid
        );
        if (matchedTask) {
          let filteredSubtasks = filterNestedTasksByView(matchedTask.subtasks || [], meTeamView, userId);
          filteredSubtasks = filterByStatus(filteredSubtasks);
          const summary = getCategoryTaskSummary(filteredSubtasks, taskCategory);
          setCategoryTSummary(summary);
          setTasks(filteredSubtasks);
          return;
        }
      }
      let fallbackTasks = taskFinalData?.TaskData || [];
      if (parsedData?.projectid) {
        fallbackTasks = fallbackTasks.filter(task => task.projectid === parsedData.projectid);
      }
      let filtered = filterNestedTasksByView(fallbackTasks, meTeamView, userId);
      filtered = filterByStatus(filtered);
      const summary = getCategoryTaskSummary(filtered, taskCategory);
      setCategoryTSummary(summary);
      setTasks(filtered);
    }
  }, [encodedData, taskFinalData, selectedRow, meTeamView, completedFlag]);

  useEffect(() => {
    const activeTab = localStorage?.getItem('activeTaskTab');
    if (activeTab) {
      setActiveButton(activeTab);
    }
  }, []);

  useEffect(() => {
    if (tasks) {
      setFilters({
        category: ['Today']
      });
    }
  }, [])

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
    } else if (filterKey === 'startDate') {
      setFilters((prev) => ({ ...prev, startDate: null }));
    } else {
      setFilters((prev) => ({ ...prev, [filterKey]: '' }));
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setFilters({
      category: [],
      searchTerm: '',
      status: '',
      priority: '',
      department: '',
      assignee: '',
      project: '',
      dueDate: null,
      startDate: null,
    })
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

  function recursiveSort(tasks = [], comparator) {
    return [...tasks]
      .sort(comparator)
      .map(task => ({
        ...task,
        subtasks: task.subtasks
          ? recursiveSort(task.subtasks, comparator)
          : []
      }));
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

  const sortedData = recursiveSort(tasks, getComparator(order, orderBy));

  // all level of filtering
  const filteredData = sortedData
    ?.map((task) => {
      const {
        status,
        priority,
        assignee,
        searchTerm,
        dueDate,
        startDate,
        department,
        project,
        category,
      } = filters;

      const normalizedSearchTerm = searchTerm?.trim()?.toLowerCase();
      const isQuoted =
        (normalizedSearchTerm?.startsWith('"') && normalizedSearchTerm?.endsWith('"')) ||
        (normalizedSearchTerm?.startsWith("'") && normalizedSearchTerm?.endsWith("'"));

      const cleanSearchTerm = isQuoted
        ? normalizedSearchTerm.slice(1, -1)
        : normalizedSearchTerm;

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

      const isUnsetDeadline = (dateStr) => {
        const date = new Date(dateStr);
        return !dateStr || date.toISOString().slice(0, 10) === "1900-01-01";
      };

      resetInvalidFilters();

      const matchesFilters = (item) => {
        const matchesCategory =
          !Array.isArray(category) ||
          category.length === 0 ||
          category.some((cat) => {
            const lowerCat = cat.toLowerCase();
            if (lowerCat.includes("due")) {
              return isTaskDue(item?.DeadLineDate) && !isUnsetDeadline(item?.DeadLineDate);
            } else if (lowerCat.includes("unset deadline")) {
              return isUnsetDeadline(item?.DeadLineDate);
            } else if (lowerCat.includes("today")) {
              return isTaskToday(item?.StartDate);
            } else if (lowerCat.includes("new")) {
              return item?.isnew == 1;
            }
            return (item?.category ?? "").toLowerCase() === lowerCat;
          });

        const fieldsToCheck = [
          item?.taskname,
          item?.status,
          item?.priority,
          item?.description,
          item?.DeadLineDate,
          item?.taskPr,
          item?.taskDpt,
        ];

        const assignees = Array.isArray(item?.assignee)
          ? item.assignee.map((a) => `${a?.firstname} ${a?.lastname}`)
          : [item?.assignee];

        const searchMatchFn = (value) => {
          if (!value) return false;
          const val = value.toLowerCase();

          if (isQuoted) {
            const exactWordRegex = new RegExp(`\\b${cleanSearchTerm}\\b`, "i");
            return exactWordRegex.test(val);
          } else {
            return val.includes(cleanSearchTerm);
          }
        };

        const matchesSearch =
          !searchTerm || [...fieldsToCheck, ...assignees].some(searchMatchFn);

        return (
          matchesCategory &&
          (status ? item?.status?.toLowerCase() === status?.toLowerCase() : true) &&
          (priority ? item?.priority?.toLowerCase() === priority?.toLowerCase() : true) &&
          (department ? item?.taskDpt?.toLowerCase() === department?.toLowerCase() : true) &&
          (project ? item?.taskPr?.toLowerCase() === project?.toLowerCase() : true) &&
          (dueDate ? formatDate2(item?.DeadLineDate) === formatDate2(dueDate) : true) &&
          (startDate ? formatDate2(item?.StartDate) === formatDate2(startDate) : true) &&
          (assignee
            ? item?.assignee?.some((a) => {
              const fullName = `${a?.firstname} ${a?.lastname}`?.toLowerCase();
              return fullName?.includes(assignee?.toLowerCase());
            })
            : true) &&
          matchesSearch
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
    ?.filter(Boolean);

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

  const handleCompletedTaskFilter = () => {
    setCompletedFlag(!completedFlag);
  };

  const handleStatusChange = (taskId, status, flag) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            let updatedTask;
            if (flag == "secondaryStatus") {
              updatedTask = {
                ...task,
                secstatusid: status?.id,
                secStatus: status?.labelname
              };
            } else {
              updatedTask = {
                ...task,
                statusid: status?.id,
                status: status?.labelname,
                EndDate: status?.labelname?.toLowerCase() === "completed" ? date.toISOString() : ""
              };
            }
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

  const handlePriorityChange = (taskId, priority) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            const updatedTask = {
              ...task,
              priorityid: priority?.id,
              priority: priority?.labelname
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

  const handleDeadlineDateChange = (taskId, DeadLineDate) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            const updatedTask = {
              ...task,
              DeadLineDate: DeadLineDate,
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
  }

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

  const handleChangePage = (event, newPage) => {
    setPage(event);
  };

  const handlePageSizeChnage = (event) => {
    setRowsPerPage(event ?? rowsPerPage);
    setPage(1);
  };

  const handleOpenRightMenu = (event, task) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      task: task,
    });
    setSelectedRow(task);
  };

  const handleCloseRightClickMenu = () => {
    setContextMenu(null);
  };

  const handleCopyTask = () => {
    if (contextMenu?.task) {
      const copiedTask = {
        ...JSON.parse(JSON.stringify(contextMenu.task)),
        isCopyActive: true
      };
      setCopiedData(copiedTask);
      setTasks((prevTasks) => {
        const markTaskRecursively = (tasks) =>
          tasks.map((task) => {
            if (task.taskid === copiedTask.taskid) {
              return { ...task, isCopyActive: true };
            }
            if (task.subtasks?.length > 0) {
              return {
                ...task,
                subtasks: markTaskRecursively(task.subtasks),
              };
            }
            return task;
          });

        return markTaskRecursively(prevTasks);
      });
      toast.success('Task copied successfully');
    }
    handleCloseRightClickMenu();
  };

  const handlePasteTask = async (parsedData, flag) => {
    const taskId = copiedData?.taskid
    const parentId = flag == "main" ? parsedData?.taskid : selectedRow?.taskid
    if (taskId && parentId) {
      const apiRes = await MoveTaskApi(taskId, parentId);
      if (apiRes) {
        setOpenChildTask(true);
        setTasks((prevTasks) => {
          const updateTasksRecursively = (tasks) => {
            return tasks?.map((task) => {
              if (task.taskid === parentId) {
                const updatedTask = {
                  ...task,
                  subtasks: [...task.subtasks, copiedData],
                };
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
        toast?.success("Task pasted successfully");
        setCopiedData({});
      }
    } else {
      toast.error('Please select a task to paste');
    }
    handleCloseRightClickMenu();
  };

  const handleRemoveCopiedData = () => {
    setCopiedData({});
  }

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);


  return (
    <Box className="task-container">
      {/* Header Buttons */}
      <HeaderButtons
        activeButton={activeButton}
        onButtonClick={handleTabBtnClick}
        onFilterChange={handleFilterChange}
        isLoading={iswhTLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={taskProject}
        statusData={statusData}
        secStatusData={secStatusData}
        taskCategory={taskCategory}
        taskDepartment={taskDepartment}
        taskAssigneeData={taskAssigneeData}
        CategorySummary={CategoryTSummary}
        handlePasteTask={handlePasteTask}
        handleCompletedTaskFilter={handleCompletedTaskFilter}
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
      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {copiedData && Object.keys(copiedData).length > 0 && (
          <Box className="filterCheckedBox">
            <Chip
              size="small"
              key={`category-`}
              label={
                <Typography>
                  <span className="filterKey">Cut Task:</span>{' '}
                  <span className="filterValue">{copiedData?.taskname}</span>
                </Typography>
              }
              onDelete={handleRemoveCopiedData}
              deleteIcon={<CloseIcon className="closeIcon" />}
              className="filterChip"
            />
          </Box>
        )}
        <FilterChips
          filters={filters}
          onClearFilter={handleClearFilter}
          onClearAll={handleClearAllFilters}
        />
      </Box>

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
                  copiedData={copiedData}
                  contextMenu={contextMenu}
                  handleCopy={handleCopyTask}
                  handlePaste={handlePasteTask}
                  handleContextMenu={handleOpenRightMenu}
                  handleCloseContextMenu={handleOpenRightMenu}
                  handleTaskFavorite={handleTaskFavorite}
                  handleFreezeTask={handleFreezeTask}
                  handleStatusChange={handleStatusChange}
                  handlePriorityChange={handlePriorityChange}
                  handleAssigneeShortcutSubmit={handleAssigneeShortcutSubmit}
                  handleRequestSort={handleRequestSort}
                  handleChangePage={handleChangePage}
                  handleDeadlineDateChange={handleDeadlineDateChange}
                  handlePageSizeChnage={handlePageSizeChnage}
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
