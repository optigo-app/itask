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
import { fetchMasterGlFunc, formatDate, getCategoryTaskSummary, isTaskToday, mapTaskLabels } from "../../Utils/globalfun";
import { motion, AnimatePresence } from "framer-motion";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { TaskFrezzeApi } from "../../Api/TaskApi/TasKFrezzeAPI";
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import { toast } from "react-toastify";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";

const TaskTable = React.lazy(() =>
  import("../../Components/Project/ListView/TableList")
);

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
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
  const callFetchTaskApi = useRecoilValue(fetchlistApiCall);
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);
  const [CategoryTSummary, setCategoryTSummary] = useState([]);
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (!location?.pathname?.includes("/projects")) {
      setProject([])
    }
    const paramValue = searchParams.get('filter');
    setFilters({
      searchTerm: paramValue,
    })
  }, [location])

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
    if (priorityData && statusData && taskProject && taskDepartment) {
      fetchModuleData();
    }
  }, [priorityData, statusData, taskProject, taskDepartment, location]);

  const fetchModuleData = async () => {
    debugger
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
      setTimeout(() => {
        if (project) {
          const summary = getCategoryTaskSummary(enhancedTasks, taskCategory);
          setCategoryTSummary(summary);
        }
      }, 0);
      setProject(enhancedTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTaskLoading(false);
    }
  };

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
    } else if (searchParams.get('filter')) {
      navigate('/projects')
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
    if (searchParams.get('filter')) {
      navigate('/projects')
    }
  };

  const filteredData = Array.isArray(project)
    ? project.filter((task) => {
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

      const now = new Date();

      const isValidFilter = (value) =>
        value &&
        ![
          "Select Status",
          "Select Priority",
          "Select Assignee",
          "Select Project",
          "Select Department",
        ].includes(value);

      const normalizedSearchTerm = searchTerm?.trim()?.toLowerCase() || "";
      const isQuoted =
        (normalizedSearchTerm.startsWith('"') && normalizedSearchTerm.endsWith('"')) ||
        (normalizedSearchTerm.startsWith("'") && normalizedSearchTerm.endsWith("'"));
      const cleanSearchTerm = isQuoted
        ? normalizedSearchTerm.slice(1, -1)
        : normalizedSearchTerm;

      const isTaskDue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < now;
      };

      const exactMatch = (text) =>
        typeof text === "string"
          ? new RegExp(`\\b${cleanSearchTerm}\\b`, "i").test(text)
          : false;

      const partialMatch = (text) =>
        typeof text === "string"
          ? text.toLowerCase().includes(cleanSearchTerm)
          : false;

      const matchText = (text) =>
        isQuoted ? exactMatch(text) : partialMatch(text);

      const isUnsetDeadline = (dateStr) => {
        const date = new Date(dateStr);
        return !dateStr || date.toISOString().slice(0, 10) === "1900-01-01";
      };

      const matchesFilters = (task) => {
        if (!task) return false;
        const matchesCategory =
          !Array.isArray(category) ||
          category.length === 0 ||
          category.some((cat) => {
            const catLower = cat.toLowerCase();
            if (catLower.includes("due")) {
              return isTaskDue(task?.DeadLineDate) && !isUnsetDeadline(task?.DeadLineDate);
            }
            if (catLower.includes("unset deadline")) {
              return isUnsetDeadline(task?.DeadLineDate);
            }
            if (catLower.includes("today")) {
              return isTaskToday(task?.StartDate);
            }
            if (catLower.includes("new")) {
              return task?.isnew == 1;
            }
            return (task?.category ?? "").toLowerCase() === catLower;
          });


        const matchesSearch =
          !searchTerm ||
          matchText(task?.taskname) ||
          matchText(task?.status) ||
          matchText(task?.priority) ||
          (Array.isArray(task?.assignee)
            ? task?.assignee?.some((a) => matchText(a?.name))
            : matchText(task?.assignee)) ||
          matchText(task?.description) ||
          matchText(task?.taskPr) ||
          matchText(task?.taskDpt) ||
          (task?.DeadLineDate ? formatDate(task?.DeadLineDate).includes(cleanSearchTerm) : false);

        return (
          matchesCategory &&
          (!isValidFilter(status) ||
            (task?.status ?? "").toLowerCase() === status.toLowerCase()) &&
          (!isValidFilter(priority) ||
            (task?.priority ?? "").toLowerCase() === priority.toLowerCase()) &&
          (!isValidFilter(department) ||
            (task?.taskDpt ?? "").toLowerCase() === department.toLowerCase()) &&
          (!isValidFilter(projectFilter) ||
            (task?.taskPr ?? "").toLowerCase() === projectFilter.toLowerCase()) &&
          (!isValidFilter(dueDate) ||
            formatDate(task?.DeadLineDate) === formatDate(dueDate)) &&
          (!isValidFilter(startDate) ||
            formatDate(task?.StartDate) === formatDate(startDate)) &&
          (!isValidFilter(assignee) ||
            (Array.isArray(task?.assignee)
              ? task.assignee.some(
                (a) => (a?.name ?? "").toLowerCase() === assignee.toLowerCase()
              )
              : (task?.assignee ?? "").toLowerCase() === assignee.toLowerCase())) &&
          matchesSearch
        );
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
    setPage(event);
  };

  const handlePageSizeChnage = (event) => {
    setRowsPerPage(event ?? rowsPerPage);
    setPage(1);
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
        isLoading={isTaskLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={taskProject}
        statusData={statusData}
        taskCategory={taskCategory}
        taskAssigneeData={assigneeData}
        CategorySummary={CategoryTSummary}
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
              <TaskTable
                data={filteredData ?? null}
                page={page}
                rowsPerPage={rowsPerPage}
                isLoading={isTaskLoading}
                masterData={masterData}
                handleLockProject={handleLockProject}
                handleDeleteModule={handleDeleteModule}
                handleChangePage={handleChangePage}
                handlePageSizeChnage={handlePageSizeChnage}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Project;
