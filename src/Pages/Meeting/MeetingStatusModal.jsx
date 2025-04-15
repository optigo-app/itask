import React, { useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Grid,
    IconButton,
    Pagination,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";
import CircleIcon from '@mui/icons-material/Circle';

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    maxHeight: "65vh",
    height: "63vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    padding: "10px 20px",
    borderRadius: 2,
    outline: 'none'
};

const statusColors = {
    Accept: { background: "#E6F4EA", color: "#2E7D32" },
    Reject: { background: "#FCE8E6", color: "#D32F2F" },
    Pending: { background: "#FFF4E5", color: "#ED6C02" }
};

const ReadOnlyModal = ({ open, handleClose, handleFetchMeetingDetails }) => {
    const [rows, setRows] = useState([]);
    console.log('rows: ', rows);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const rowsPerPage = 5;
    const [attended, setAttended] = useState(false);

    const handleToggle = () => {
        setAttended(!attended);
    };

    const handleMeetingStatus = async () => {
        setIsLoading(true);
        try {
            const assigneeData = JSON.parse(sessionStorage.getItem('taskAssigneeData') ?? '[]');
            const rowData = await handleFetchMeetingDetails();

            const transformedRows = Object.entries(rowData)
                ?.filter(([key]) => !isNaN(Number(key)))
                ?.map(([_, item]) => {
                    return {
                        ...item,
                        status: item?.isAccept == 1
                            ? "Accept"
                            : item?.isAccept == 2
                                ? "Reject"
                                : "Pending",
                        userData: assigneeData?.find(a => a?.userid == item?.userid) ?? {}
                    };
                });

            setRows(transformedRows);
        } catch (error) {
            console.error("Error in handleMeetingStatus:", error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (open == true) {
            handleMeetingStatus();
        }
    }, [open]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleFilterChange = (event, newFilter) => {
        setFilterStatus(newFilter || "All");
        setPage(1);
    };

    const filteredRows = filterStatus === "All" ? rows : rows?.filter(row => row?.status === filterStatus) ?? [];
    const totalPages = Math?.ceil(filteredRows?.length / rowsPerPage) ?? 0;

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
            <Box sx={modalStyle}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography id="modal-title" variant="h6" fontWeight="bold">
                        Status Overview
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>
                <Box sx={{ textAlign: 'end' }}>
                    <div style={{
                        margin: "10px 0",
                        border: "1px dashed #7d7f85",
                        opacity: 0.3,
                    }}
                    />
                    <ToggleButtonGroup
                        value={filterStatus}
                        exclusive
                        onChange={handleFilterChange}
                        aria-label="filter status"
                        size="small"
                        className="toggle-button-group"
                    >
                        <ToggleButton value="All">All</ToggleButton>
                        <ToggleButton value="Accept">Accept</ToggleButton>
                        <ToggleButton value="Reject">Reject</ToggleButton>
                        <ToggleButton value="Pending">Pending</ToggleButton>
                        <ToggleButton value="Pending">Attend</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {!isLoading ? (
                    <>
                        {filteredRows?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;', borderRadius: '8px' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: '600' }}>Name</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: '600' }}>Status</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: '600' }}>Remark</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: '600' }}>Action</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredRows && filteredRows?.slice((page - 1) * rowsPerPage, page * rowsPerPage)?.map((row) => (
                                                <TableRow key={row.meetingid}>
                                                    <TableCell sx={{ minWidth: '150px' }}>
                                                        <Typography sx={{ fontSize: "14px" }}>{row?.userData?.firstname + " " + row?.userData?.lastname}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            sx={{
                                                                bgcolor: statusColors[row.status]?.background,
                                                                color: statusColors[row.status]?.color,
                                                                fontWeight: "bold",
                                                                fontFamily: '"Public Sans", sans-serif',
                                                                borderRadius: "4px",
                                                                padding: "4px 8px",
                                                                fontSize: "14px"
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "14px" }}>
                                                            {row?.Comment || "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={row?.ismeeting_attnd === 1 ? "Attended" : "Mark as Attended"}>
                                                            <IconButton
                                                                onClick={handleToggle}
                                                                size="small"
                                                                aria-label="meeting-attend"
                                                                aria-labelledby="meeting-attend"
                                                                sx={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    padding: '4px',
                                                                    boxShadow: row?.ismeeting_attnd === 1
                                                                        ? '0px 0px 8px rgba(0, 200, 83, 0.6)'
                                                                        : '0px 2px 8px rgba(99, 99, 99, 0.2)',
                                                                    transition: 'box-shadow 0.3s ease-in-out, background 0.3s ease-in-out',
                                                                    background: row?.ismeeting_attnd === 1 ? '#4CAF50' : '#fff',
                                                                    '&:hover': {
                                                                        boxShadow: row?.ismeeting_attnd === 1
                                                                            ? '0px 0px 12px rgba(0, 200, 83, 0.9)'
                                                                            : '0px 4px 12px rgba(99, 99, 99, 0.3)',
                                                                        background: row?.ismeeting_attnd === 1 ? '#43A047' : '#f5f5f5',
                                                                    },
                                                                }}
                                                                disabled={row?.ismeeting_attnd === 1}
                                                            >
                                                                {row?.ismeeting_attnd === 1 ? (
                                                                    <CircleIcon sx={{ fontSize: '20px', color: '#2E7D32' }} />
                                                                ) : (
                                                                    <CircleIcon sx={{ fontSize: '20px', color: '#9e9e9e' }} />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>

                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }}>
                                    <Typography variant="body2">
                                        Showing {(page - 1) * rowsPerPage + 1} to {Math?.min(page * rowsPerPage, filteredRows?.length)} of {filteredRows?.length} entries
                                    </Typography>
                                    <Pagination
                                        size="small"
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        variant="outlined"
                                        shape="rounded"
                                        sx={{
                                            ".MuiPaginationItem-root": {
                                                minHeight: "30px !important",
                                                fontFamily: '"Public Sans", sans-serif',
                                                color: "#444050",
                                                "&.Mui-selected": {
                                                    backgroundColor: "#7D7f85",
                                                    color: "#fff",
                                                    borderColor: "#7D7f85"
                                                }
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        ) :
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
                                <Typography variant="body2" sx={{ fontSize: "14px", color: "#444050" }}>
                                    No records found
                                </Typography>
                            </Box>
                        }
                    </>
                ) :
                    <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
                }
            </Box>
        </Modal>
    );
};

export default ReadOnlyModal;
