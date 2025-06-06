import React, { useEffect, useState } from "react";
import "./meeting.scss";
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
    Tooltip,
    Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";
import CircleIcon from '@mui/icons-material/Circle';

const statusColors = {
    Accept: { background: "#E6F4EA", color: "#2E7D32" },
    Reject: { background: "#FCE8E6", color: "#D32F2F" },
    Pending: { background: "#FFF4E5", color: "#ED6C02" }
};

const ReadOnlyModal = ({ open, mettingData, handleClose, handleFetchMeetingDetails }) => {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const rowsPerPage = 5;
    const [attended, setAttended] = useState(false);

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

    const filteredRows = filterStatus === "All"
        ? rows
        : filterStatus === "Attend"
            ? rows?.filter(row => row?.ismeeting_attnd == 1)
            : rows?.filter(row => row?.status === filterStatus) ?? [];
    const totalPages = Math?.ceil(filteredRows?.length / rowsPerPage) ?? 0;

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
            <Box className="meetingModal">
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography id="modal-title" variant="h6" fontWeight="bold">
                        {mettingData?.meetingtitle}
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>

                <Box className="divider-container">
                    <div className="dashed-divider" />
                    <Box className="mtStatusToggleBox">
                        <ToggleButtonGroup
                            value={filterStatus}
                            exclusive
                            onChange={handleFilterChange}
                            aria-label="filter status"
                            size="small"
                            className="toggle-group"
                        >
                            <ToggleButton className="toggle-button" value="All"><span className="toggle-label">All</span></ToggleButton>
                            <ToggleButton className="toggle-button" value="Accept"><span className="toggle-label">Accepted</span></ToggleButton>
                            <ToggleButton className="toggle-button" value="Reject"><span className="toggle-label">Rejected</span></ToggleButton>
                            <ToggleButton className="toggle-button" value="Pending"><span className="toggle-label">Pending</span></ToggleButton>
                            <ToggleButton className="toggle-button" value="Attend"><span className="toggle-label">Attending</span></ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                {!isLoading ? (
                    <>
                        {filteredRows?.length > 0 ? (
                            <Box className="table-wrapper">
                                <TableContainer component={Paper} className="custom-table-container">
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><Typography className="table-heading">Name</Typography></TableCell>
                                                <TableCell><Typography className="table-heading">Status</Typography></TableCell>
                                                <TableCell><Typography className="table-heading">Attendence</Typography></TableCell>
                                                <TableCell><Typography className="table-heading">Remark</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredRows?.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row) => (
                                                <TableRow key={row.meetingid}>
                                                    <TableCell className="name-cell">
                                                        <Typography className="table-text">{row?.userData?.firstname + " " + row?.userData?.lastname}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            className="status-chip"
                                                            sx={{
                                                                bgcolor: statusColors[row.status]?.background,
                                                                color: statusColors[row.status]?.color
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box className={`attendance-box ${row?.ismeeting_attnd === 1 ? 'present' : 'absent'}`}>
                                                            <CircleIcon className="attendance-icon" />
                                                            <Typography className="table-text">{row?.ismeeting_attnd === 1 ? 'Present' : 'Absent'}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography className="remark-text">
                                                            {row?.Comment || "—"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box className="pagination-wrapper">
                                    <Typography variant="body2" className="pagination-text">
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
                                        className="custom-pagination"
                                    />
                                </Box>
                            </Box>
                        ) : (
                            <Box className="no-record-box">
                                <Typography variant="body2" className="table-text">No records found</Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
                )}
            </Box>
        </Modal>

    );
};

export default ReadOnlyModal;
