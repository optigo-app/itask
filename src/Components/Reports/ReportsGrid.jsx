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
} from "@mui/material";
import { formatDate2, statusColors } from "../../Utils/globalfun";

const ReportsGrid = ({ columns, data, rowsPerPage = 10 }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const getFormattedValue = (colKey, value) => {
    const lowerKey = colKey.toLowerCase();
    if (lowerKey.includes("date")) return formatDate2(value);
    return value;
  };

  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <TableContainer component={Paper} className="reports_tableContainer">
      <Table className="reports_table">
        <TableHead>
          <TableRow>
            {columns.map(({ key, label }) => (
              <TableCell key={key}>
                <strong>{label}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map(({ key }) => {
                const lowerKey = key.toLowerCase();
                const value = row[key];
                const isStatusColumn = lowerKey.includes("taskstatus");
                const statusStyles = isStatusColumn
                  ? {
                    color: statusColors[value]?.color || "#000",
                    backgroundColor: statusColors[value]?.backgroundColor || "#ddd",
                    width: "fit-content",
                    padding: "0.2rem 0.8rem",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "13.5px",
                    fontWeight: "500",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                  }
                  : null;

                return (
                  <TableCell key={key}>
                    {isStatusColumn ? (
                      <span style={statusStyles}>{value}</span>
                    ) : (
                      getFormattedValue(key, value)
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box className="TablePaginationBox">
        <Typography className="paginationText" sx={{ pl: 1 }}>
          Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, data.length)} of {data.length} entries
        </Typography>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            variant="outlined"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            className="pagination"
            sx={{ pr: 1 }}
          />
        )}
      </Box>
    </TableContainer>
  );
};

export default ReportsGrid;