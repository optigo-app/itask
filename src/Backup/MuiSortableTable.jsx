import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TableSortLabel, Paper
} from "@mui/material";

const createData = (name, age, city) => ({ name, age, city });

const rows = [
  createData("Alice", 25, "New York"),
  createData("Bob", 30, "Los Angeles"),
  createData("Charlie", 22, "Chicago"),
  createData("David", 28, "Houston"),
  createData("Eva", 26, "Phoenix"),
  createData("Frank", 29, "San Diego"),
  createData("Grace", 27, "Dallas"),
  createData("Helen", 24, "Austin"),
  createData("Ian", 31, "San Jose"),
  createData("Jack", 23, "San Francisco"),
  createData("Kathy", 33, "Seattle"),
  createData("Leo", 21, "Boston"),
];

const headCells = [
  { id: "name", label: "Name" },
  { id: "age", label: "Age" },
  { id: "city", label: "City" },
];

function descendingComparator(a, b, orderBy) {
  if (a[orderBy] < b[orderBy]) return -1;
  if (a[orderBy] > b[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "asc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const MuiSortableTable = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const sortedRows = rows.sort(getComparator(order, orderBy));
  console.log('rows: ', rows);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.city}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        rowsPerPageOptions={[10]}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
};

export default MuiSortableTable;
