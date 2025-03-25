import React, { useState, useEffect } from "react";
import "./Reports.scss";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ReportsGrid from "../../Components/Reports/ReportsGrid";
import Filters from "../../Components/Reports/Filters";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";
import { motion, AnimatePresence } from "framer-motion";
import reportsDataJson from "../../Data/reportsData.json";

const Reports = () => {
  const [filters, setFilters] = useState({});
  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportColumns, setReportColumns] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [filterColumns, setFilterColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterShow, setFilterShow] = useState(true);

  // Load reports list
  useEffect(() => {
    setReportsList(reportsDataJson.reportsList);
    if (reportsDataJson.reportsList.length > 0) {
      setSelectedReport(reportsDataJson.reportsList[0].id);
    }
  }, []);

  // Load report data & filters when report changes
  useEffect(() => {
    if (!selectedReport) return;

    setIsLoading(true);
    setTimeout(() => {
      const report = reportsDataJson[selectedReport] || { columns: [], rows: [] };
      setReportColumns(report.columns);
      setReportData(report.rows);

      // Extract filterable columns
      setFilterColumns(report.columns.filter((col) => col.filterable));
      setFilters({}); // Reset filters on change
      setIsLoading(false);
    }, 500);
  }, [selectedReport]);

  // Handle Report Change
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedReport(newValue);
    }
  };

  // Handle Dynamic Filters
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Apply Filters Dynamically
  const filteredData = reportData.filter((row) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return row[key]?.toString().toLowerCase().includes(value.toString().toLowerCase());
    });
  });

  return (
    <div className="reports_MainDiv">
      <Box className="reports_Box">
        <Box className="reports_ToggleBox">
          <ToggleButtonGroup
            value={selectedReport}
            exclusive
            onChange={handleChange}
            aria-label="report selection"
          >
            {reportsList.map((item) => (
              <ToggleButton key={item.id} value={item.id}>
                {item.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Filters filterShow={filterShow} setFilterShow={setFilterShow} filters={filters} handleFilterChange={handleFilterChange} filterColumns={filterColumns} />

        <FilterChips filters={filters} onClearFilter={(key) => setFilters((prev) => ({ ...prev, [key]: "" }))} onClearAll={() => setFilters({})} />

        <AnimatePresence mode="wait">
          <motion.div key={selectedReport} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Box className="report-contentData">
              {isLoading ? (
                <LoadingBackdrop isLoading="true" />
              ) : (
                <ReportsGrid columns={reportColumns} data={filteredData} />
              )}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </div>
  );
};

export default Reports;
