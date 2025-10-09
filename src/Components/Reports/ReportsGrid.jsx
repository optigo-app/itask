import React, { useState } from "react";
import "./ReportsGrid.scss";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  TableSortLabel,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  formatDate2,
  statusColors,
  getStatusColor,
  ImageUrl,
  background,
  getPerformanceStatus,
} from "../../Utils/globalfun";
import TaskDetailsModal from "./TaskDetailsModal";
import TablePaginationFooter from "../ShortcutsComponent/Pagination/TablePaginationFooter";

const ReportsGrid = ({
  columns,
  data,
  totalPages,
  rowsPerPage = 100,
  page = 1,
  onPageChange,
  onPageSizeChange,
  sortConfig,
  onSortChange,
  viewMode,
  reportType
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTaskRow, setSelectedTaskRow] = useState(null);  

  const paginatedData = data || [];


  const handleRowClick = (row) => {
    setSelectedTaskRow(row);
    setOpenModal(true);
  };

  const getCategoryCount = (summaryArray, categoryKey) => {
    if (!Array.isArray(summaryArray)) return 0;
    const item = summaryArray.find(
      (c) => c.categoryname.toLowerCase() === categoryKey.toLowerCase()
    );
    return item?.count || 0;
  };

  const getFormattedValue = (colKey, value, row) => {
    const lowerKey = colKey.toLowerCase();

    if (lowerKey === "firstname" && viewMode === "EmployeeWiseData") {
      if (row && typeof row === "object") {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={ImageUrl(row)}
              alt={row?.firstname}
              sx={{
                width: 30,
                height: 30,
                bgcolor: background(row?.firstname),
                fontSize: 14,
              }}
            />
            <Typography sx={{ textTransform: 'capitalize', color: '#6D6B77 !important', fontSize: '14px' }}>
              {row?.firstname} {row?.lastname}
            </Typography>
          </Box>
        );
      }
      return "Unknown Employee";
    }

    if (lowerKey.includes("date")) return formatDate2(value);

    if (["totalestimate", "totalactual", "totaldiff"].includes(lowerKey)) {
      const num = parseFloat(value || 0);
      return num.toFixed(2);
    }

    if (lowerKey === "progress") {
      const numericValue = typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
      const getCustomColor = (progress) => {
        if (progress >= 100) return "#c8e6c9";
        if (progress >= 50) return "#bbdefb";
        return "#e0e0e0";
      };
      
      const barColor = reportType === "pms-report-2" ? getCustomColor(numericValue) : getStatusColor(numericValue);
      
      // Use circular indicator for pms-report-2
      if (reportType === "pms-report-2") {
        const majorTasks = row?.TotalMajor || 0;
        const createTaskCircles = (count) => {
          const circles = [];
          const maxCircles = Math.min(count, 4);
          
          for (let i = 0; i < maxCircles; i++) {
            const isCompleted = i < (count * numericValue / 100);
            const completedColor = "#c8e6c9";
            const currentColor = isCompleted ? completedColor : barColor;
            const circleSize = 20;
            
            circles?.push(
              <Tooltip 
                key={i} 
                title={`Task ${i + 1} - ${isCompleted ? 'Completed' : 'Pending'}`} 
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: isCompleted ? '#c8e6c9' : '#666',
                      fontSize: '12px',
                      fontWeight: 500,
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    width: circleSize,
                    height: circleSize,
                    position: "relative",
                    margin: "2px",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    filter: `drop-shadow(0 3px 6px ${currentColor}50)`,
                    "&:hover": {
                      transform: isCompleted ? "scale(1.25)" : "scale(1.18)",
                      filter: `drop-shadow(0 6px 12px ${currentColor}70)`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: `
                        repeating-linear-gradient(
                          45deg,
                          rgba(0, 0, 0, 0.05),
                          rgba(0, 0, 0, 0.05) 4px,
                          transparent 4px,
                          transparent 10px
                        ),
                        ${currentColor}
                      `,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative"
                    }}
                  >
                    {/* {isCompleted && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "#333",
                          fontSize: "16px",
                          fontWeight: "bold",
                          zIndex: 2
                        }}
                      >
                        ✓
                      </Box>
                    )} */}
                  </Box>
                </Box>
              </Tooltip>
            );
          }
          if (count > 4) {
            circles.push(
              <Tooltip key="overflow" title={`+${count - 4} more tasks`} arrow>
                <Box
                  sx={{
                    width: 23,
                    height: 23,
                    borderRadius: "50%",
                    background: `
                      repeating-linear-gradient(
                        45deg,
                        rgba(0, 0, 0, 0.05),
                        rgba(0, 0, 0, 0.05) 4px,
                        transparent 4px,
                        transparent 10px
                      ),
                      ${barColor}
                    `,
                    // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    margin: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    "&:hover": {
                      transform: "scale(1.18)",
                      filter: `drop-shadow(0 6px 12px ${barColor}70)`,
                    }
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: "10px",
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.7)",
                      zIndex: 2
                    }}
                  >
                    +{count - 4}
                  </Typography>
                </Box>
              </Tooltip>
            );
          }
          
          return circles;
        };

        return (
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "4px",
              maxWidth: "180px",
              padding: "4px",
              minHeight: "32px",
            }}
          >
            {majorTasks > 0 ? createTaskCircles(majorTasks) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: "11px",
                  color: "#999",
                  fontStyle: "italic"
                }}
              >
                No tasks
              </Typography>
            )}
          </Box>
        );
      }
      
      // Default linear progress for other reports
      return (
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={numericValue}
            sx={{
              height: 7,
              borderRadius: 5,
              backgroundColor: "#e0e0e0",
              flexGrow: 1,
              "& .MuiLinearProgress-bar": {
                backgroundColor: barColor,
              },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5 }}>
            {numericValue}%
          </Typography>
        </Box>
      );
    }

    if (lowerKey === "performance") {
      const numericValue = typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
      const { meaning, color, bgColor } = getPerformanceStatus(numericValue);
      return (
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Chip
            label={`${numericValue}%`}
            sx={{
              backgroundColor: bgColor,
              color: color,
              fontWeight: 600,
              fontSize: "13px",
              height: "24px",
              fontFamily: "Public Sans",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color,
              fontWeight: 500,
              fontSize: "11px",
              mt: "2px",
            }}
          >
            {meaning}
          </Typography>
        </Box>
      );
    }

    if (lowerKey.includes("running")) {
      const count = getCategoryCount(row?.CategorySummary, "Running");
      return (
        <Chip
          label={`${count}`}
          sx={{
            fontWeight: 600,
            color: '#6D6B77',
            fontSize: "13px",
            height: "24px",
          }}
        />
      );
    }

    if (lowerKey.includes("onhold")) {
      const count = getCategoryCount(row?.CategorySummary, "OnHold");
      return (
        <Chip
          label={`${count}`}
          sx={{
            fontWeight: 600,
            color: '#6D6B77',
            fontSize: "13px",
            height: "24px",
          }}
        />
      );
    }

    if (lowerKey.includes("challenges")) {
      const count = getCategoryCount(row?.CategorySummary, "Challenges");
      return (
        <Chip
          label={`${count}`}
          sx={{
            fontWeight: 600,
            color: '#6D6B77',
            fontSize: "13px",
            height: "24px",
            fontFamily: "Public Sans",
          }}
        />
      );
    }

    return value;
  };

  return (
    <>
      <TableContainer component={Paper} className="reports_tableContainer">
        <Table className="reports_table">
          <TableHead>
            <TableRow>
              {columns.map(({ key, label, width }) => {
                const isSorted = sortConfig?.key === key;
                const isAsc = sortConfig?.direction === 'asc';

                return (
                  <TableCell
                    key={key}
                    style={{ width }}
                    sortDirection={isSorted ? sortConfig.direction : false}
                  >
                    <TableSortLabel
                      active={isSorted}
                      direction={isAsc ? 'asc' : 'desc'}
                      onClick={() => onSortChange(key)}
                    >
                      <strong>{label}</strong>
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData?.length > 0 ? (
              <>
                {paginatedData?.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    hover
                    onClick={() => handleRowClick(row)}
                    style={{ cursor: "pointer" }}
                  >
                    {columns?.map(({ key }) => {
                      const lowerKey = key.toLowerCase();
                      const value = row[key];
                      const isStatusColumn = lowerKey.includes("taskstatus");
                      const statusStyles = isStatusColumn
                        ? {
                          color: statusColors[value]?.color || "#000",
                          backgroundColor: statusColors[value]?.backgroundColor || "#ddd",
                          padding: "0.2rem 0.8rem",
                          borderRadius: "5px",
                          fontSize: "13.5px",
                          fontWeight: "500",
                        }
                        : null;

                      return (
                        <TableCell key={key}>
                          {isStatusColumn ? (
                            <span style={statusStyles}>{value}</span>
                          ) : (
                            getFormattedValue(key, value, row)
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ padding: '0px 10px' }}>
          {paginatedData?.length !== 0 && (
            <TablePaginationFooter
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={data?.length}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </Box>

      </TableContainer>

      {/* Modal Component */}
      <TaskDetailsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        employee={selectedTaskRow}
        reportType={reportType}
        viewMode={viewMode}
      />
    </>
  );
};

export default ReportsGrid;
