import React from "react";
import { Box, Typography, Select, MenuItem, Pagination } from "@mui/material";

const TablePaginationFooter = ({
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    onPageChange,
    onPageSizeChange,
}) => {
    const start = (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, totalCount);

    return (
        <Box
            className="TablePaginationBox"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={1}
        >
            <Typography className="paginationText">
                Showing {start} to {end} of {totalCount} entries
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" className="paginatedText">Rows per page:</Typography>
                    <Select
                        size="small"
                        value={rowsPerPage}
                        onChange={(e) => onPageSizeChange(e.target.value)}
                        className="custom-select"
                    >
                        {[10, 20, 50, 100].map((size) => (
                            <MenuItem key={size} value={size} className="custom-menu-item">
                                {size}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
                {totalPages > 0 && (
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => onPageChange(value)}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        siblingCount={1}
                        boundaryCount={1}
                        className="pagination"
                    />
                )}
            </Box>
        </Box>
    );
};

export default TablePaginationFooter;
