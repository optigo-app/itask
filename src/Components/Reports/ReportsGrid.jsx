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
  Pagination,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  TableSortLabel,
} from "@mui/material";
import {
  formatDate2,
  statusColors,
  getStatusColor,
  ImageUrl,
  background,
  getPerformanceStatus,
} from "../../Utils/globalfun";
import TaskDetailsModal from "./TaskDetailsModal"; // Import modal component
import TablePaginationFooter from "../ShortcutsComponent/Pagination/TablePaginationFooter";

const ReportsGrid = ({
  columns,
  data,
  totalPages,
  rowsPerPage = 10,
  page = 1,
  onPageChange,
  onPageSizeChange,
  sortConfig,
  onSortChange,
  viewMode
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
                width: 25,
                height: 25,
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
      const barColor = getStatusColor(numericValue);
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
            fontFamily: "Public Sans",
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
            fontFamily: "Public Sans",
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
      />
    </>
  );
};

export default ReportsGrid;
