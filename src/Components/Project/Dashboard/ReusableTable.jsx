import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Typography,
    Box,
    Pagination,
    TableSortLabel,
} from "@mui/material";
import "./Styles/ReusableTable.scss";
import { useState, useMemo } from "react";
import TablePaginationFooter from "../../ShortcutsComponent/Pagination/TablePaginationFooter";

const ReusableTable = ({
    columns,
    data,
    renderCell,
    className,
    rowsPerPage = 10,
}) => {
    const [page, setPage] = useState(1);
    const [rowsPerPages, setRowsPerPages] = useState(rowsPerPage);
    const [sortConfig, setSortConfig] = useState({ key: "entrydate", direction: "desc" });

    const filteredColumns = columns?.filter((column) => column.id !== "id");

    const handleSort = (columnId) => {
        setPage(1);
        setSortConfig((prev) => {
            if (prev.key === columnId) {
                return { key: columnId, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                return { key: columnId, direction: "asc" };
            }
        });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            return sortConfig.direction === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData?.length / rowsPerPages);
    const currentData = sortedData?.slice((page - 1) * rowsPerPages, page * rowsPerPages);

    const handleChangePage = (event, newPage) => {
        setPage(event);
    };

    const handlePageSizeChnage = (event) => {
        setRowsPerPages(event ?? rowsPerPages);
        setPage(1);
      };

    return (
        <TableContainer component={Paper} className={className}>
            <Table className="reusable_table">
                <TableHead>
                    <TableRow>
                        {filteredColumns?.map((column, index) => (
                            <TableCell key={index}>
                                {column.id === "action" ? (
                                    column.label
                                ) : (
                                    <TableSortLabel
                                        active={sortConfig.key === column.id}
                                        direction={sortConfig.key === column.id ? sortConfig.direction : "asc"}
                                        onClick={() => handleSort(column.id)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentData?.length > 0 ? (
                        currentData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {filteredColumns?.map((column, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {renderCell ? renderCell(column.id, row) : row[column.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={filteredColumns?.length}>
                                <Typography align="center">No data available</Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    <TableRow>
                        <TableCell colSpan={6}>
                            {currentData?.length !== 0 && (
                                <TablePaginationFooter
                                    page={page}
                                    rowsPerPage={rowsPerPages}
                                    totalCount={currentData?.length}
                                    totalPages={totalPages}
                                    onPageChange={handleChangePage}
                                    onPageSizeChange={handlePageSizeChnage}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ReusableTable;
