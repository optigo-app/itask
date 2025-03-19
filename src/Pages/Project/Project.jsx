import React, { Suspense, useEffect, useState } from "react";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box } from "@mui/material";
import { useRecoilState } from "recoil";
import { filterDrawer1, masterDataValue, } from "../../Recoil/atom";
import { formatDate } from 'date-fns';
import { fetchMasterGlFunc, formatDate2 } from "../../Utils/globalfun";
import ProjectData from "../../Data/projects.json"
import { motion, AnimatePresence } from "framer-motion";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";


const TaskTable = React.lazy(() => import("../../Components/Project/ListView/TableList"));
const KanbanView = React.lazy(() => import("../../Components/Project/KanbanView/KanbanView"));

const Project = () => {
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
  const [project, setProject] = useState(ProjectData);
  const [filters, setFilters] = useState({});
  const [drawerOpen1, setDrawerOpen1] = useRecoilState(filterDrawer1);

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

  // master api call
  useEffect(() => {
    const init = sessionStorage.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
  }, []);

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
  const filteredData = project?.filter((task) => {
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
            ? task.assignee.some((a) => a?.name?.toLocaleLowerCase() === assignee.toLocaleLowerCase())
            : task?.assignee?.toLocaleLowerCase() === assignee.toLocaleLowerCase()
          : true) &&
        (!searchTerm ||
          task?.taskname?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.status?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.priority?.toLowerCase().includes(normalizedSearchTerm) ||
          (Array.isArray(task?.assignee)
            ? task.assignee.some((a) => a?.name?.toLowerCase()?.includes(normalizedSearchTerm))
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

  const handleLockProject = (id) => {
    debugger
    const updatedData = filteredData?.map((task) => {
      if (task.taskid === id) {
        return { ...task, isLocked: task.isLocked === 1 ? 0 : 1 };
      }
      return task;
    });
    setProject(updatedData);
  };

  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
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
      />

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
                  handleLockProject={handleLockProject}
                />
              )}

              {activeButton === "kanban" && (
                <KanbanView
                  taskdata={filteredData ?? null}
                  isLoading={isTaskLoading}
                  masterData={masterData}
                  statusData={statusData}
                  handleLockProject={handleLockProject}
                />
              )}

              {/* {activeButton === "card" && (
                <CardView
                  isLoading={isTaskLoading}
                  masterData={masterData}
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
