import React, { useState } from "react";
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
    TextField,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { commonTextFieldProps } from "../../Utils/globalfun";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    padding: "10px 20px",
    borderRadius: 2,
    outline: 'none'
};

const rows = [
    { id: 1, name: "Arjun Sharma", status: "Accept", remark: "Verified" },
    { id: 2, name: "Priya Patel", status: "Reject", remark: "This update ensures that long remarks wrap properly to the next line instead of overflowing." },
    { id: 3, name: "Ravi Kumar", status: "Pending", remark: "Waiting for approval" },
    { id: 4, name: "Vivek Patel", status: "Accept", remark: "" },
    { id: 5, name: "Rahul Mehta", status: "Pending", remark: "Review in progress" },
    { id: 6, name: "Anjali Sharma", status: "Accept", remark: "Checked" },
    { id: 7, name: "Neha Verma", status: "Reject", remark: "Incorrect documents submitted, please re-upload the valid proof." }
];

const statusColors = {
    Accept: { background: "#E6F4EA", color: "#2E7D32" },
    Reject: { background: "#FCE8E6", color: "#D32F2F" },
    Pending: { background: "#FFF4E5", color: "#ED6C02" }
};

const ReadOnlyModal = ({ open, handleClose }) => {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const rowsPerPage = 5;

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleFilterChange = (event, newFilter) => {
        setFilterStatus(newFilter || "All");
        setPage(1);
    };

    // const filteredRows = rows.filter(row => row.name.toLowerCase().includes(searchText.toLowerCase()));
    // const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const filteredRows = filterStatus === "All" ? rows : rows.filter(row => row.status === filterStatus);
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

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
                    {/* <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search by name"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ mt: 2, width: "50%" }}
                        className="textfieldsClass"
                    /> */}
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
                    </ToggleButtonGroup>
                </Box>
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell sx={{ minWidth: '150px' }}>
                                        <Typography sx={{ fontSize: "14px" }}>{row.name}</Typography>
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
                                            {row.remark || "—"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }}>
                    <Typography variant="body2">
                        Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
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
        </Modal>
    );
};

export default ReadOnlyModal;
