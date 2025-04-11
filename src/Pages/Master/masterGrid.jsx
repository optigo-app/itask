import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Pagination, IconButton, TableSortLabel } from '@mui/material';
import { Pencil, Trash, ArchiveRestore, Trash2 } from 'lucide-react';
import './Master.scss';

const Mastergrid = ({
    data,
    handleEditRow,
    handleDeleteRow,
    handleRestoreRow,
    handleFinalDelete,
    paginationCount,
    paginationPage,
    onPaginationChange,
    rowsPerPage,
    totalRows
}) => {
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    // Custom Footer Component for Pagination
    const CustomFooter = ({ totalRows, paginationCount, paginationPage, onPaginationChange }) => {
        const startEntry = (paginationPage - 1) * rowsPerPage + 1;
        const endEntry = Math.min(paginationPage * rowsPerPage, totalRows);

        return (
            <Box className="TablePaginationBox" sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" className="paginationText">
                    Showing {totalRows > 0 ? startEntry : 0} to {totalRows > 0 ? endEntry : 0} of {totalRows} entries
                </Typography>
                <Pagination
                    size="medium"
                    count={paginationCount}
                    page={paginationPage}
                    onChange={onPaginationChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                    className="pagination"
                    sx={{ '.MuiPaginationItem-root': { minHeight: '30px !important' } }}
                />
            </Box>
        );
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const sortedMaster = useMemo(() => {
        const sorted = [...data];
        const { key, direction } = sortConfig;
        if (!key) return sorted;

        sorted.sort((a, b) => {
            const getValue = (item) => {
                if (key === "labelname") return item?.labelname;
                return (item[key] || "").toString().toLowerCase();
            };

            const aVal = getValue(a);
            const bVal = getValue(b);
            return direction === "asc" ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
        });

        return sorted;
    }, [data, sortConfig]);

    const renderSortCell = (label, key) => (
        <TableSortLabel
            active={sortConfig.key === key}
            direction={sortConfig.direction}
            onClick={() => handleSort(key)}
        >
            {label}
        </TableSortLabel>
    );


    return (
        <Box>
            <TableContainer className='TableContainer' component={Paper} sx={{ marginTop: 2 }}>
                <Table className='Table'>
                    <TableHead>
                        <TableRow>
                            <TableCell width={80}>Sr#</TableCell>
                            <TableCell>{renderSortCell("Name", "labelname")}</TableCell>
                            <TableCell className='actionCell'>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedMaster?.map((row, index) => (
                            <TableRow key={row.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell style={{
                                    textDecoration: row.isdelete !== 0 ? 'line-through' : 'none',
                                    color: row.isdelete !== 0 ? '#ab003c' : '#444050',
                                    textTransform: 'capitalize'
                                }}>
                                    {row.labelname}
                                </TableCell>
                                <TableCell className='actionCell'>
                                    {row.isdelete == 0 &&
                                        <IconButton
                                            onClick={() => handleEditRow(row)}
                                            disabled={row.isdelete !== 0}
                                        >
                                            <Pencil
                                                size={18}
                                            />
                                        </IconButton>
                                    }
                                    {row.isdelete === 0 ? (
                                        <IconButton
                                            onClick={() => handleDeleteRow(row)}
                                            disabled={row.isdelete !== 0}
                                        >
                                            <Trash
                                                size={18}
                                                style={{ color: "#ab003c" }}
                                            />
                                        </IconButton>
                                    ) : (
                                        <>
                                            <IconButton
                                                onClick={() => handleRestoreRow(row)}
                                            >
                                                <ArchiveRestore
                                                    size={18}
                                                    style={{ color: "#ab003c" }}
                                                />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleFinalDelete(row)}
                                            >
                                                <Trash2
                                                    size={18}
                                                    style={{ color: "#ab003c" }}
                                                />
                                            </IconButton>
                                        </>

                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className='paginationRow'>
                            <TableCell colSpan={4}>
                                <CustomFooter
                                    totalRows={totalRows}
                                    paginationCount={paginationCount}
                                    paginationPage={paginationPage}
                                    onPaginationChange={onPaginationChange}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Mastergrid;
