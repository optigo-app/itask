import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
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

const TaskTable = React.lazy(() =>
  import("../../Components/Project/ListView/TableList")
);
const KanbanView = React.lazy(() =>
  import("../../Components/Project/KanbanView/KanbanView")
);

const Project = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();
  const [activeButton, setActiveButton] = useState("table");
  const [project, setProject] = useRecoilState(projectDatasRState);
  const [filters, setFilters] = useState({});
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const refressPrModule = useRecoilValue(fetchlistApiCall);
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
      let storedStructuredData = sessionStorage.getItem("structuredMasterData");
      let structuredData = storedStructuredData
        ? JSON.parse(storedStructuredData)
        : null;
      if (!structuredData) {
        await fetchMasterGlFunc();
        storedStructuredData = sessionStorage.getItem("structuredMasterData");
        structuredData = storedStructuredData
          ? JSON.parse(storedStructuredData)
          : null;
      }
      if (structuredData) {
        setMasterData(structuredData);
        retrieveAndSetData("taskAssigneeData", setAssigneeData);
        retrieveAndSetData("taskstatusData", setStatusData);
        retrieveAndSetData("taskpriorityData", setPriorityData);
        retrieveAndSetData("taskdepartmentData", setTaskDepartment);
        retrieveAndSetData("taskprojectData", setTaskProject);
        retrieveAndSetData("taskworkcategoryData", setTaskCategory);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // master api call
  useEffect(() => {
    const init = sessionStorage.getItem("taskInit");
    if (init) {
      fetchMasterData();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchModuleData();
    }
  }, [
    isLoading,
    refressPrModule,
    priorityData,
    statusData,
    taskProject,
    taskDepartment,
  ]);

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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    setPage(1);
  };

  const handleClearFilter = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: "",
    }));
    setSelectedCategory("");
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSelectedCategory("");
  };

  // sorting
  const handleRequestSort = (property) => {
    console.log("property: ", property);
    const fieldMapping = {
      name: "taskname",
      due: "DeadLineDate",
    };
    const mappedProperty = fieldMapping[property] || property;
    const isAscending = orderBy === mappedProperty && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(mappedProperty);
  };

  const descendingComparator = (a, b, orderBy) => {
    const fieldMapping = {
      deadline: "DeadLineDate",
      due: "DeadLineDate",
      "Project/module": "taskname",
      "start date": "StartDate",
    };

    const mappedField = fieldMapping[orderBy] || orderBy;
    let aValue = a[mappedField];
    let bValue = b[mappedField];

    // Convert to Date if it's a deadline
    if (mappedField === "DeadLineDate") {
      aValue = aValue ? new Date(aValue) : new Date("2100-01-01");
      bValue = bValue ? new Date(bValue) : new Date("2100-01-01");
    } else if (mappedField === "start date") {
      aValue = aValue ? new Date(aValue) : new Date("2100-01-01");
      bValue = bValue ? new Date(bValue) : new Date("2100-01-01");
    } else if (mappedField === "progress_per") {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (mappedField === "Project/module") {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortData = (array, comparator) => {
    return [...array]?.sort(comparator);
  };

  let sortedData;
  if (project) {
    sortedData = sortData(project, getComparator(order, orderBy));
  }

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
        category = "",
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
          (!isValidFilter(category) ||
            (task?.category ?? "")?.toLowerCase() ===
            category?.toLowerCase()) &&
          (!isValidFilter(status) ||
            (task?.status ?? "")?.toLowerCase() === status?.toLowerCase()) &&
          (!isValidFilter(priority) ||
            (task?.priority ?? "")?.toLowerCase() ===
            priority?.toLowerCase()) &&
          (!isValidFilter(department) ||
            (task?.taskDpt ?? "")?.toLowerCase() ===
            department?.toLowerCase()) &&
          (!isValidFilter(projectFilter) ||
            (task?.taskPr ?? "")?.toLowerCase() ===
            projectFilter?.toLowerCase()) &&
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

  const totalPages = Math?.ceil(
    filteredData && filteredData?.length / rowsPerPage
  );

  // Get data for the current page
  const currentData = filteredData?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  return (
    <Box
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "30px 20px",
        borderRadius: "5px",
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
        taskAssigneeData={assigneeData}
      />

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
              )}

              {activeButton === "kanban" && (
                <KanbanView
                  taskdata={filteredData ?? null}
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  statusData={statusData}
                  handleLockProject={handleLockProject}
                  handleDeleteModule={handleDeleteModule}
                />
              )}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Project;
