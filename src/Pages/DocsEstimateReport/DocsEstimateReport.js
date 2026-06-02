import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip,
    TableSortLabel,
} from '@mui/material';
import { fetchDocsEstimateReportApi } from '../../Api/TaskApi/fetchDocsEstimateReportApi';
import dayjs from 'dayjs';
import { useRecoilState } from "recoil";
import { Advfilters } from "../../Recoil/atom";
import { formatDate2, ImageUrl, background } from "../../Utils/globalfun";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";
import TablePaginationFooter from "../../Components/ShortcutsComponent/Pagination/TablePaginationFooter";
import DocsEstimateFilters from "./DocsEstimateFilters";
import "../../Components/Task/FullTaskView/FullTaskView.scss";
import "../../Components/Task/FilterComponent/Styles.scss";

const DocsEstimateReport = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useRecoilState(Advfilters);
    const [searchInput, setSearchInput] = useState(filters?.searchTerm || "");
    const [taskAssigneeData, setTaskAssigneeData] = useState([]);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("StDate");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    useEffect(() => {
        const taskassignee = JSON?.parse(sessionStorage.getItem("taskAssigneeData"));
        setTaskAssigneeData(taskassignee);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const apiFilters = {
                    search: filters?.searchTerm || "",
                };
                if (filters?.startDate?.startDate && filters?.startDate?.endDate) {
                    apiFilters.stdateStart = dayjs(filters.startDate.startDate).format("YYYY-MM-DD");
                    apiFilters.stdateEnd = dayjs(filters.startDate.endDate).format("YYYY-MM-DD");
                }
                apiFilters.Seniourid = filters?.seniour?.id?.toString() || "0";
                apiFilters.Empid = filters?.employee?.id?.toString() || "0";
                const sortStr = `order by ${orderBy} ${order}`;
                const response = await fetchDocsEstimateReportApi(sortStr, rowsPerPage.toString(), page.toString(), apiFilters);
                if (response) {
                    setData(response?.rd);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching DocsEstimateReport data:", error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [
        filters?.searchTerm,
        filters?.startDate?.startDate,
        filters?.startDate?.endDate,
        filters?.seniour?.id,
        filters?.employee?.id,
        order,
        orderBy,
        page,
        rowsPerPage
    ]);

    // Handle Search Debounce
    useEffect(() => {
        setSearchInput(filters?.searchTerm || "");
    }, [filters?.searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== filters?.searchTerm) {
                setFilters((prev) => ({ ...prev, searchTerm: searchInput }));
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput, filters?.searchTerm, setFilters]);

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    };

    const handleClearFilter = (filterKey, value = null) => {
        if (filterKey === 'startDate') {
            setFilters((prev) => ({ ...prev, startDate: null }));
        } else if (filterKey === 'seniour' || filterKey === 'employee') {
            setFilters((prev) => ({ ...prev, [filterKey]: '' }));
        } else {
            setFilters((prev) => ({ ...prev, [filterKey]: '' }));
        }
    };

    const handleClearAllFilters = () => {
        setFilters({});
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChnage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const totalPages = Math.ceil(data.length / rowsPerPage);

    const dateChipsConfig = [
        { key: 'Est', label: 'Est', field: 'EstDate', color: 'rgba(115, 103, 240, 0.08)', labelColor: '#a0a0a0', valueColor: '#7367f0' },
        { key: 'Start', label: 'Start', field: 'StDate', color: 'rgba(40, 199, 111, 0.08)', labelColor: '#a0a0a0', valueColor: '#28c76f' },
        { key: 'End', label: 'End', field: 'EndDate', color: 'rgba(234, 84, 85, 0.08)', labelColor: '#a0a0a0', valueColor: '#ea5455' },
    ];

    const nameChipsConfig = [
        { key: 'Sr', label: 'Sr', field: 'SeniourName', color: 'rgba(254, 176, 25, 0.08)', labelColor: '#a0a0a0', valueColor: '#feb019' },
        { key: 'Emp', label: 'Emp', field: 'EmpName', color: 'rgba(0, 207, 232, 0.08)', labelColor: '#a0a0a0', valueColor: '#00cfe8' },
    ];

    const estimateChipsConfig = [
        { key: 'Sr', label: 'Sr', field: 'SrEst', color: 'rgba(115, 103, 240, 0.08)', labelColor: '#a0a0a0', valueColor: '#7367f0' },
        { key: 'Act', label: 'Act', field: 'ActualHr', color: 'rgba(40, 199, 111, 0.08)', labelColor: '#a0a0a0', valueColor: '#28c76f' },
    ];

    const empEstimateChipsConfig = [
        { key: 'Emp', label: 'Emp', field: 'EmpEst', color: 'rgba(254, 176, 25, 0.08)', labelColor: '#a0a0a0', valueColor: '#feb019' },
        { key: 'Doc', label: 'Doc', field: 'DocEst', color: 'rgba(0, 207, 232, 0.08)', labelColor: '#a0a0a0', valueColor: '#00cfe8' },
        { key: 'Code', label: 'Code', field: 'CodeEst', color: 'rgba(234, 84, 85, 0.08)', labelColor: '#a0a0a0', valueColor: '#ea5455' },
    ];

    const resultChipsConfig = [
        { key: 'Est', label: 'Est', field: 'Result', color: 'rgba(115, 103, 240, 0.08)', labelColor: '#a0a0a0', valueColor: '#7367f0' },
        { key: 'Act', label: 'Act', field: 'actualResult', color: 'rgba(234, 84, 85, 0.08)', labelColor: '#a0a0a0', valueColor: '#ea5455' },
    ];

    const columns = [
        { id: 'SrNo', label: 'Sr#', width: '60px', minWidth: '30px' },
        { id: 'taskno', label: 'Task Name', width: '350px', minWidth: '380px' },
        { id: 'StDate', label: 'Date', width: '180px', minWidth: '180px' },
        { id: 'EmpName', label: 'Name', width: '150px', minWidth: '150px' },
        { id: 'EmpEst', label: 'Estimate', width: '180px', minWidth: '180px' },
        { id: 'Result', label: 'Result(%)', width: '120px', minWidth: '120px' },
    ];

    return (
        <Box className="fullTaskReportMain" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Inline Filters matching FullTaskView */}
            <DocsEstimateFilters
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onSearchEnter={() => setFilters((prev) => ({ ...prev, searchTerm: searchInput }))}
                filters={filters}
                onFilterChange={handleFilterChange}
                taskAssigneeData={taskAssigneeData}
            />

            <div
                style={{
                    margin: "20px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }}
            />


            {/* Active Filters */}
            <FilterChips
                filters={filters}
                onClearFilter={handleClearFilter}
                onClearAll={handleClearAllFilters}
            />

            <Box>
                <Box className="DocReportMain">
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, minHeight: '300px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} className='muiTableTaContainer'>
                            <Table aria-label="task table" className='muiTable'>
                                <TableHead className='muiTableHead'>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell key={column.id} style={{ width: column.width, minWidth: column.minWidth, overflow: 'hidden' }}>
                                                <div style={{ width: "100%", height: "100%", padding: "0px 0px 0px 10px", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600, display: "flex", alignItems: "center" }}>
                                                    <TableSortLabel active={orderBy === column.id} direction={order} onClick={() => handleRequestSort(column.id)}>
                                                        {column.label}
                                                    </TableSortLabel>
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.length > 0 ? (
                                        <>
                                            {data.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell style={{ paddingLeft: '16px' }}>
                                                        {row.SrNo || index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div className="tasknameCl" style={{ color: '#7367f0', fontWeight: 600, fontSize: '13px' }}>
                                                                {row.taskno}
                                                            </div>
                                                            <div className="tasknameCl" style={{ fontSize: '13px', color: '#5e5873', fontWeight: 500 }}>
                                                                {row.tasktitle}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {dateChipsConfig.map((chip) => (
                                                                <Chip
                                                                    key={chip.key}
                                                                    size="small"
                                                                    label={
                                                                        <span>
                                                                            <span style={{ color: chip.labelColor }}>{chip.label}:</span>
                                                                            <span style={{ color: chip.valueColor, marginLeft: '4px' }}>{formatDate2(row[chip.field])}</span>
                                                                        </span>
                                                                    }
                                                                    sx={{
                                                                        height: '24px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: chip.color,
                                                                        fontWeight: 500,
                                                                        borderRadius: '12px',
                                                                        padding: 0,
                                                                        width: 'fit-content'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {nameChipsConfig.map((chip) => (
                                                                <Chip
                                                                    key={chip.key}
                                                                    size="small"
                                                                    label={
                                                                        <span>
                                                                            <span style={{ color: chip.labelColor }}>{chip.label}:</span>
                                                                            <span style={{ color: chip.valueColor, marginLeft: '4px', textTransform: 'capitalize' }}>{row[chip.field]?.replace(/\(.*?\)\s*/, '')}</span>
                                                                        </span>
                                                                    }
                                                                    sx={{
                                                                        height: '24px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: chip.color,
                                                                        fontWeight: 500,
                                                                        borderRadius: '12px',
                                                                        padding: 0,
                                                                        width: 'fit-content'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {estimateChipsConfig.map((chip) => (
                                                                    <Chip
                                                                        key={chip.key}
                                                                        size="small"
                                                                        label={
                                                                            <span>
                                                                                <span style={{ color: chip.labelColor }}>{chip.label}:</span>
                                                                                <span style={{ color: chip.valueColor, marginLeft: '4px' }}>{row[chip.field]}</span>
                                                                            </span>
                                                                        }
                                                                        sx={{
                                                                            height: '24px',
                                                                            fontSize: '12px',
                                                                            backgroundColor: chip.color,
                                                                            fontWeight: 500,
                                                                            borderRadius: '12px',
                                                                            padding: 0,
                                                                            width: 'fit-content'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                                                {empEstimateChipsConfig.map((chip) => (
                                                                    <Chip
                                                                        key={chip.key}
                                                                        size="small"
                                                                        label={
                                                                            <span>
                                                                                <span style={{ color: chip.labelColor }}>{chip.label}:</span>
                                                                                <span style={{ color: chip.valueColor, marginLeft: '4px' }}>{row[chip.field]}</span>
                                                                            </span>
                                                                        }
                                                                        sx={{
                                                                            height: '24px',
                                                                            fontSize: '12px',
                                                                            backgroundColor: chip.color,
                                                                            fontWeight: 500,
                                                                            borderRadius: '12px',
                                                                            padding: 0,
                                                                            width: 'fit-content'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {resultChipsConfig.map((chip) => (
                                                                <Chip
                                                                    key={chip.key}
                                                                    size="small"
                                                                    label={
                                                                        <span>
                                                                            <span style={{ color: chip.labelColor }}>{chip.label}:</span>
                                                                            <span style={{ color: chip.valueColor, marginLeft: '4px' }}>{row[chip.field]}</span>
                                                                        </span>
                                                                    }
                                                                    sx={{
                                                                        height: '24px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: chip.color,
                                                                        fontWeight: 500,
                                                                        borderRadius: '12px',
                                                                        padding: 0,
                                                                        width: 'fit-content'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* <TableRow>
                                                <TableCell colSpan={6} style={{ borderBottom: 'none' }}>
                                                    <TablePaginationFooter
                                                        count={filteredData?.length || 0}
                                                        rowsPerPage={rowsPerPage}
                                                        page={page}
                                                        onPageChange={handleChangePage}
                                                        onRowsPerPageChange={handlePageSizeChnage}
                                                        totalPages={totalPages}
                                                    />
                                                </TableCell>
                                            </TableRow> */}
                                        </>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" style={{ padding: '40px 0', color: '#6e6b7b' }}>
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    <>
                        {!isLoading && (data?.length || 0) > 0 && (
                            <TablePaginationFooter
                                page={page}
                                rowsPerPage={rowsPerPage}
                                totalCount={data?.length || 0}
                                totalPages={totalPages}
                                onPageChange={handleChangePage}
                                onPageSizeChange={handlePageSizeChnage}
                                rowsPerPageOptions={[10, 50, 100, 150, 200]}
                            />
                        )}
                    </>
                </Box>
            </Box>
        </Box>
    );
};

export default DocsEstimateReport;
