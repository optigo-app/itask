import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Pagination,
  Typography,
  Box,
  Paper,
} from "@mui/material";

// Sample JSON Data
const jsonData = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  age: 20 + (index % 30),
}));

// Sorting Utility Functions
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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

const PaginatedTableWithSorting = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  // Calculate total pages
  const totalPages = Math.ceil(jsonData.length / rowsPerPage);

  // Handle sorting column and direction
  const handleSort = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort data using the provided comparator functions
  const sortedData = sortData(jsonData, getComparator(order, orderBy));

  // Get data for the current page
  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Paper sx={{ padding: 2 }}>
      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "age"}
                  direction={orderBy === "age" ? order : "asc"}
                  onClick={() => handleSort("age")}
                >
                  Age
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <Typography>
          Showing {rowsPerPage * (currentPage - 1) + 1} to{" "}
          {Math.min(rowsPerPage * currentPage, jsonData.length)} of{" "}
          {jsonData.length} entries
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ mt: 1 }}
        />
      </Box>
    </Paper>
  );
};

export default PaginatedTableWithSorting;
