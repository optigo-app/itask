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
import { formatDate, isTaskToday } from "../../Utils/globalfun";
import { motion, AnimatePresence } from "framer-motion";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { TaskFrezzeApi } from "../../Api/TaskApi/TasKFrezzeAPI";
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import { toast } from "react-toastify";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";
import { useLocation } from "react-router-dom";

const TaskTable = React.lazy(() =>
  import("../../Components/Project/ListView/TableList")
);

const KanbanView = React.lazy(() =>
  import("../../Components/Project/KanbanView/KanbanView")
);

const Project = () => {
  const location = useLocation();
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(14);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [activeButton, setActiveButton] = useState("table");
  const [project, setProject] = useRecoilState(projectDatasRState);
  const [filters, setFilters] = useRecoilState(Advfilters);
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const [callFetchTaskApi, setCallFetchTaskApi] = useRecoilState(fetchlistApiCall);
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const now = new Date();
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
    if (!location?.pathname?.includes("/projects")) {
      setProject([])
    }
  }, [location])

  useEffect(() => {
    setTimeout(() => {
      if (taskFinalData) {
        setProject(taskFinalData?.ModuleList);
      }
    }, 0);

  }, [taskFinalData, callFetchTaskApi]);


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

  const filteredData = Array.isArray(project)
    ? project?.filter((task) => {
      const {
        status = "",
        priority = "",
        assignee = "",
        searchTerm = "",
        dueDate = null,
        startDate = null,
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

      const isTaskDue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < now;
      };
      const matchesFilters = (task) => {
        if (!task) return false;
        const matchesCategory =
          !Array.isArray(category) || category.length === 0 ||
          category.some((cat) => {
            if (cat.toLowerCase()?.includes("due")) {
              return isTaskDue(task?.DeadLineDate);
            } else if (cat.toLowerCase()?.includes("today tasks")) {
              return isTaskToday(task?.StartDate);
            } else if (cat.toLowerCase()?.includes("new")) {
              return task?.isnew == 1;
            }
            return (task?.category ?? "").toLowerCase() == cat.toLowerCase();
          });

        const matches =
          matchesCategory &&
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
          (!isValidFilter(startDate) ||
            formatDate(task?.StartDate) === formatDate(startDate)) &&
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
        return Array.isArray(task)
          ? task?.some(matchesFilters)
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



  return (
    <Box className="project-moduleMain">
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
        taskAssigneeData={taskAssigneeData}
        CategorySummary={taskFinalData?.ModulewiseCategoryTaskSummary}
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
              {/* {activeButton === "table" && ( */}
              <TaskTable
                data={filteredData ?? null}
                projectProgress={project?.projectProgress}
                page={page}
                rowsPerPage={rowsPerPage}
                isLoading={iswhTLoading}
                masterData={masterData}
                handleLockProject={handleLockProject}
                handleDeleteModule={handleDeleteModule}
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
