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
} from "@mui/material";
import "./Styles/ReusableTable.scss";
import { useState } from "react";

const ReusableTable = ({
    columns,
    data,
    renderCell,
    className,
    rowsPerPage = 10,
}) => {
    const [page, setPage] = useState(1);
    const filteredColumns = columns.filter((column) => column.id !== "id");

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentData = data.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <TableContainer component={Paper} className={className}>
            <Table className="reusable_table">
                <TableHead>
                    <TableRow>
                        {filteredColumns.map((column, index) => (
                            <TableCell key={index}>{column.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentData.length > 0 ? (
                        currentData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {filteredColumns.map((column, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {renderCell ? renderCell(column.id, row) : row[column.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={filteredColumns.length}>
                                <Typography align="center">No data available</Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    <TableRow>
                        <TableCell colSpan={filteredColumns.length}>
                            {currentData.length !== 0 && (
                                <Box className="TablePaginationBox">
                                    <Typography className="paginationText">
                                        Showing {(page - 1) * rowsPerPage + 1} to{" "}
                                        {Math.min(page * rowsPerPage, data.length)} of{" "}
                                        {data.length} entries
                                    </Typography>
                                    {totalPages > 0 && (
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
                                        />
                                    )}
                                </Box>
                            )}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ReusableTable;
