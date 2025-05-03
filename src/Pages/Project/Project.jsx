import React, { Suspense, useEffect, useState } from "react";
import "./Project.scss";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  Advfilters,
  fetchlistApiCall,
  filterDrawer,
  masterDataValue,
  projectDatasRState,
  selectedCategoryAtom,
} from "../../Recoil/atom";
import { fetchMasterGlFunc, formatDate } from "../../Utils/globalfun";
import { motion, AnimatePresence } from "framer-motion";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";
import { TaskFrezzeApi } from "../../Api/TaskApi/TasKFrezzeAPI";
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import { toast } from "react-toastify";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";

const TaskTable = React.lazy(() =>
  import("../../Components/Project/ListView/TableList")
);
const KanbanView = React.lazy(() =>
  import("../../Components/Project/KanbanView/KanbanView")
);

const Project = () => {
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("entrydate");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
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
  const [project, setProject] = useRecoilState(projectDatasRState);
  const [filters, setFilters] = useRecoilState(Advfilters);
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const [callFetchTaskApi, setCallFetchTaskApi] = useRecoilState(fetchlistApiCall);
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);

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
        retrieveAndSetData('taskDepartments', setTaskDepartment);
        retrieveAndSetData('taskprojectData', setTaskProject);
        retrieveAndSetData('taskworkcategoryData', setTaskCategory);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModuleData = async () => {
    if (project?.length == 0) {
      setIsTaskLoading(true);
    }
    try {
      if (!priorityData || !statusData || !taskProject || !taskDepartment) {
        setIsTaskLoading(false);
        return;
      }

      const taskData = await fetchModuleDataApi();
      const labeledTasks = mapTaskLabels(taskData);
      const finalTaskData = [...labeledTasks];

      const enhanceTask = (task) => {
        const priority = priorityData?.find(
          (item) => item?.id == task?.priorityid
        );
        const status = statusData?.find((item) => item?.id == task?.statusid);
        const project = taskProject?.find(
          (item) => item?.id == task?.projectid
        );
        const department = taskDepartment?.find(
          (item) => item?.id == task?.departmentid
        );
        const category = taskCategory?.find(
          (item) => item?.id == task?.workcategoryid
        );

        return {
          ...task,
          priority: priority ? priority?.labelname : "",
          status: status ? status?.labelname : "",
          taskPr: project ? project?.labelname : "",
          taskDpt: department ? department?.labelname : "",
          category: category?.labelname,
        };
      };

      const enhancedTasks = finalTaskData?.map((task) => enhanceTask(task));
      setProject(enhancedTasks);
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
          taskObj.subtasks = parsedSubtasks?.map((subtask) => {
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
    let taskData = tasks?.map((task) => convertTask(task));

    return taskData;
  }

    // master api call
    useEffect(() => {
      const init = sessionStorage?.getItem('taskInit');
      if (init) {
        fetchMasterData();
      }
      setCallFetchTaskApi(true);
    }, []);
  
    useEffect(() => {
      setTimeout(() => {
        if (priorityData && statusData && taskProject && taskDepartment) {
          if (callFetchTaskApi) {
            fetchModuleData();
          }
        } else {
          fetchMasterData();
        }
      }, 10);
    }, [callFetchTaskApi, priorityData,statusData,taskProject,taskDepartment]);

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
    setFilters({
      category: [],
      searchTerm: '',
      status: '',
      priority: '',
      department: '',
      assignee: '',
      project: '',
      dueDate: null,
    });
    setSelectedCategory([])
  };

  function descendingComparator(a, b, orderBy) {
    const valA = a[orderBy];
    const valB = b[orderBy];

    if (typeof valA === "string" && typeof valB === "string") {
      return valB.trim().localeCompare(valA.trim());
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


  const sortedData = [...(project || [])]?.sort(getComparator(order, orderBy));

  const filteredData = Array.isArray(sortedData)
    ? sortedData?.filter((task) => {
      const {
        status = "",
        priority = "",
        assignee = "",
        searchTerm = "",
        dueDate = "",
        department = "",
        project: projectFilter = "",
        category = [],
      } = filters || {};

      const isValidFilter = (value) =>
        value &&
        ![
          "Select Status",
          "Select Priority",
          "Select Assignee",
          "Select Project",
          "Select Department",
        ].includes(value);

      const normalizedSearchTerm = searchTerm?.toLowerCase() || "";

      const matchesFilters = (task) => {
        if (!task) return false;

        const matches =
          (!Array.isArray(category) || category.length === 0 ||
            category.some(
              (cat) =>
                (task?.category ?? "").toLowerCase() === cat.toLowerCase()
            )) &&
          (!isValidFilter(status) ||
            (task?.status ?? "").toLowerCase() === status.toLowerCase()) &&
          (!isValidFilter(priority) ||
            (task?.priority ?? "").toLowerCase() === priority.toLowerCase()) &&
          (!isValidFilter(department) ||
            (task?.taskDpt ?? "").toLowerCase() === department.toLowerCase()) &&
          (!isValidFilter(projectFilter) ||
            (task?.taskPr ?? "").toLowerCase() ===
            projectFilter.toLowerCase()) &&
          (!isValidFilter(dueDate) ||
            formatDate(task?.DeadLineDate) === formatDate(dueDate)) &&
          (!isValidFilter(assignee) ||
            (Array.isArray(task?.assignee)
              ? task.assignee.some(
                (a) =>
                  (a?.name ?? "").toLowerCase() === assignee.toLowerCase()
              )
              : (task?.assignee ?? "").toLowerCase() ===
              assignee.toLowerCase())) &&
          (!searchTerm ||
            (task?.taskname ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm) ||
            (task?.status ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm) ||
            (task?.priority ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm) ||
            (Array.isArray(task?.assignee)
              ? task.assignee.some((a) =>
                (a?.name ?? "").toLowerCase().includes(normalizedSearchTerm)
              )
              : (task?.assignee ?? "")
                .toLowerCase()
                .includes(normalizedSearchTerm)) ||
            (task?.description ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm) ||
            (task?.DeadLineDate
              ? formatDate(task?.DeadLineDate)
              : ""
            ).includes(normalizedSearchTerm) ||
            (task?.taskPr ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm) ||
            (task?.taskDpt ?? "")
              .toLowerCase()
              .includes(normalizedSearchTerm));

        if (matches) {
          return true;
        }
        return Array.isArray(task?.subtasks)
          ? task.subtasks.some(matchesFilters)
          : false;
      };

      return matchesFilters(task);
    })
    : [];


  const handleTabBtnClick = (button) => {
    setActiveButton(button);
    localStorage?.setItem("activeTaskTab", button);
  };

  useEffect(() => {
    const activeTab = localStorage?.getItem("activeTaskTab");
    if (activeTab) {
      setActiveButton(activeTab);
    }
  }, []);

  const handleLockProject = async (id) => {
    const taskToUpdate = filteredData?.find((task) => task.taskid === id);
    if (!taskToUpdate) return;
    const isFreez = taskToUpdate.isFreez ? 0 : 1;
    try {
      const response = await TaskFrezzeApi({ taskid: id, isFreez });
      if (response?.rd[0]?.stat == 1) {
        setProject((prevData) =>
          prevData.map((task) =>
            task.taskid === id ? { ...task, isFreez: isFreez } : task
          )
        );
      }
    } catch (error) {
      console.error("Error freezing task:", error);
    }
  };

  const handleDeleteModule = async (id) => {
    const taskToDelete = filteredData?.find((task) => task.taskid === id);
    if (!taskToDelete) return;
    try {
      const response = await deleteTaskDataApi({ taskid: id });
      if (response?.rd[0]?.stat == 1) {
        setProject((prevData) => prevData.filter((task) => task.taskid !== id));
        toast.success("Project Module deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

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
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math?.ceil(
    filteredData && filteredData?.length / rowsPerPage
  );

  // Get data for the current page
  const currentData =
    filteredData?.slice((page - 1) * rowsPerPage, page * rowsPerPage) || [];

  return (
    <Box className="project-moduleMain">
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
        taskAssigneeData={assigneeData}
      />

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
      }

      {isLaptop &&
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
              {/* {activeButton === "table" && ( */}
              <TaskTable
                data={filteredData ?? null}
                currentData={currentData}
                page={page}
                order={order}
                orderBy={orderBy}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                isLoading={isTaskLoading}
                masterData={masterData}
                handleLockProject={handleLockProject}
                handleDeleteModule={handleDeleteModule}
                handleRequestSort={handleRequestSort}
                handleChangePage={handleChangePage}
              />
              {/* )} */}

              {/* {activeButton === "kanban" && (
                <KanbanView
                  taskdata={filteredData ?? null}
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  statusData={statusData}
                  handleLockProject={handleLockProject}
                  handleDeleteModule={handleDeleteModule}
                />
              )} */}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Project;
