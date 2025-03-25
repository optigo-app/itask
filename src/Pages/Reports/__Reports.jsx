import React, { useState, useEffect } from "react";
import "./Reports.scss";
import { Box, ToggleButton, ToggleButtonGroup, CircularProgress } from "@mui/material";
import ReportsGrid from "../../Components/Reports/ReportsGrid";
import reportJson from "./reportsData.json";
import FilterReports from "../../Components/Reports/FilterReports";
import { formatDate, formatDate2 } from "../../Utils/globalfun";
import Filters from "../../Components/Reports/__Filters";
import { motion, AnimatePresence } from "framer-motion";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";

const reportsData = [
  { id: 1, name: "Daily Task Progress Report" },
  { id: 2, name: "Team Productivity Report" },
  { id: 3, name: "Issue & Blocker Report" },
  { id: 4, name: "Project Overview Report" },
];

const reportColumns = {
  "Daily Task Progress Report": [
    { key: "sr", label: "Sr" },
    { key: "teamMember", label: "Team Member Name" },
    { key: "taskName", label: "Task Name" },
    { key: "taskStatus", label: "Task Status" },
    { key: "category", label: "Category" },
    { key: "time", label: "Estimated vs. Actual Time" },
    { key: "blockers", label: "Blockers or Delays" },
    { key: "dueDate", label: "Due Date" },
  ],
  "Team Productivity Report": [
    { key: "sr", label: "Sr" },
    { key: "teamMember", label: "Team Member" },
    { key: "tasksCompleted", label: "Tasks Completed" },
    { key: "tasksPending", label: "Tasks Pending" },
    { key: "avgTimePerTask", label: "Avg Time per Task" },
  ],
  "Issue & Blocker Report": [
    { key: "sr", label: "Sr" },
    { key: "date", label: "Date" },
    { key: "teamMember", label: "Reported By" },
    { key: "issue", label: "Issue" },
    { key: "severity", label: "Severity" },
    { key: "taskStatus", label: "Status" },
  ],
  "Project Overview Report": [
    { key: "sr", label: "Sr" },
    { key: "projectName", label: "Project Name" },
    { key: "progress", label: "Progress (%)" },
    { key: "tasksCompleted", label: "Tasks Completed" },
    { key: "pendingTasks", label: "Pending Tasks" },
    { key: "dueDate", label: "Due Date" },
  ],
};

const timeRangeButtons = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const Reports = () => {
  const [filters, setFilters] = useState({});
  const [selectedReport, setSelectedReport] = useState(reportsData[0].name);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterShow, setFilterShow] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setReportData(reportJson[selectedReport] || []);
      setIsLoading(false);
    }, 500);
  }, [selectedReport]);

  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedReport(newValue);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "clearFilter" && value == null) {
      setFilters({});
      return;
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredData = reportData?.filter((task) => {
    const { status, priority, assignee, searchTerm, dueDate, department, project, category } = filters;
    const normalizedSearchTerm = searchTerm?.toLowerCase() || "";

    const matchesFilters = (task) => {
      return (
        (status ? (task?.taskStatus)?.toLowerCase() === status.toLowerCase() : true) &&
        (category ? (task?.category)?.toLowerCase() === category.toLowerCase() : true) &&
        (priority ? (task?.priority)?.toLowerCase() === priority.toLowerCase() : true) &&
        (department ? (task?.taskDpt)?.toLowerCase() === department.toLowerCase() : true) &&
        (project ? (task?.taskPr)?.toLowerCase() === project.toLowerCase() : true) &&
        (dueDate ? formatDate2(task?.DeadLineDate) === formatDate2(dueDate) : true) &&
        (assignee
          ? Array.isArray(task?.assignee)
            ? task.assignee.some((a) => a.toLowerCase() === assignee.toLowerCase())
            : task?.assignee?.toLowerCase() === assignee.toLowerCase()
          : true) &&
        (!searchTerm ||
          task?.taskName?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.category?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskStatus?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.priority?.toLowerCase().includes(normalizedSearchTerm) ||
          (Array.isArray(task?.assignee)
            ? task.assignee.some((a) => a?.name?.toLowerCase()?.includes(normalizedSearchTerm))
            : task?.assignee?.toLowerCase()?.includes(normalizedSearchTerm)) ||
          task?.description?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.DeadLineDate?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskPr?.toLowerCase().includes(normalizedSearchTerm) ||
          task?.taskDpt?.toLowerCase().includes(normalizedSearchTerm)) &&
        (dueDate ? formatDate(task?.DeadLineDate) === formatDate(dueDate) : true)
      );
    };

    return matchesFilters(task) || (task?.subtasks?.length > 0 && task.subtasks.some(matchesFilters));
  });

  const handleClearFilter = (filterKey) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: ''
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  return (
    <div className="reports_MainDiv">
      <Box
        className="reports_Box"
        sx={{
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
          padding: "20px",
          borderRadius: "8px",
          overflow: "hidden !important",
        }}
      >
        <Box className="reports_ToggleBox">
          <ToggleButtonGroup
            value={selectedReport}
            exclusive
            onChange={handleChange}
            aria-label="report selection"
            className="toggle-group"
          >
            {reportsData.map((item) => (
              <ToggleButton key={item.id} value={item.name} className="toggle-button">
                {item.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <div style={{ margin: "20px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />
        <Filters filterShow={filterShow} setFilterShow={setFilterShow} filters={filters} timeRangeButtons={timeRangeButtons} handleFilterChange={handleFilterChange} />
        <AnimatePresence mode="wait">
          {filterShow &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div style={{ margin: "20px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />
              <FilterReports filters={filters} handleFilterChange={handleFilterChange} />
            </motion.div>
          }
        </AnimatePresence>
        <div style={{ margin: "20px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />
        <FilterChips
          filters={filters}
          onClearFilter={handleClearFilter}
          onClearAll={handleClearAllFilters}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedReport}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: filterShow ? 0 : 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Box className="report-contentData">
              {isLoading ?
                <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
                :
                <ReportsGrid columns={reportColumns[selectedReport]} data={filteredData} />
              }
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </div>
  );
};

export default Reports;
