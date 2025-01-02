import React, { useState } from "react";
import "./TaskTable.scss";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    TableSortLabel,
    Button,
    Box,
    Typography,
    Pagination,
    LinearProgress,
} from "@mui/material";
import {
    ArrowForwardIosSharp as ArrowForwardIosSharpIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { CirclePlus, Pencil } from "lucide-react";
import "react-resizable/css/styles.css";
import { useRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData } from "../../../Recoil/atom";
import { deleteTaskDataApi } from "../../../Api/TaskApi/DeleteTaskApi";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";
import { formatDate, getStatusColor } from "../../../Utils/globalfun";

const TableView = ({ data, isLoading }) => {
    const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const [rootSubroot, setRootSubroot] = useRecoilState(rootSubrootflag);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const [openChildTask, setOpenChildTask] = useRecoilState(fetchlistApiCall);
    const [selectedTask, setSelectedTask] = useRecoilState(selectedRowData);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths] = useState({
        project: 250,
        progress: 180,
        'start date': 150,
        'due date': 150,
        priority: 150,
        summary: 200,
        actions: 100,
    });
    const [cnfDialogOpen, setCnfDialogOpen] = useState(false);

    const priorityColors = {
        Low: {
            color: "#4caf50",
            backgroundColor: "#e8f5e9",
        },
        Medium: {
            color: "#ff9800",
            backgroundColor: "#fff3e0",
        },
        High: {
            color: "#f44336",
            backgroundColor: "#ffebee",
        },
        Urgent: {
            color: "#d32f2f",
            backgroundColor: "#ffcccb",
        },
        Critical: {
            color: "#ffffff",
            backgroundColor: "#b71c1c",
        },
    };

    const handleAddTask = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleMenuOpen = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        try {
            const deleteTaskApi = await deleteTaskDataApi(formDataValue);
            if (deleteTaskApi) {
                setOpenChildTask(false);
                setSelectedTask(null);
            } else {
                console.error("Failed to delete task");
            }
        } catch (error) {
            console.error("Error while deleting task:", error);
        }
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleEditTask = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleMenuItemClick = async (action, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setSelectedAction(action);

        switch (action) {
            case "Edit":
                setFormDataValue(selectedItem);
                setFormDrawerOpen(true);
                setSelectedTask(null);
                break;

            case "Delete":
                setFormDataValue(selectedItem);
                setCnfDialogOpen(true);
                break;

            case "View":
                setFormDataValue(selectedItem);
                break;

            default:
                console.warn("Unknown action:", action);
        }

        handleMenuClose();
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleRequestSort = (property) => {
        const fieldMapping = {
            name: 'taskname',
            due: 'DeadLineDate',
        };
        const mappedProperty = fieldMapping[property] || property;
        const isAscending = orderBy === mappedProperty && order === "asc";
        setOrder(isAscending ? "desc" : "asc");
        setOrderBy(mappedProperty);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

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

    let sortedData;
    if (data) {
        sortedData = sortData(data, getComparator(order, orderBy));
    }


    // for data logic or data manipulation
    // Calculate total pages
    const totalPages = Math?.ceil(data && data?.length / rowsPerPage);

    // Get data for the current page
    const currentData = sortedData?.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );



    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                    borderRadius: "8px",

                }}
                className="TaskTVMain"
            >
                <Table size="small" aria-label="task details"
                >
                    <TableHead>
                        <TableRow>
                            {Object.keys(columnWidths).map((key) => (
                                <TableCell key={key}
                                    sx={{
                                        width: columnWidths[key],
                                        maxWidth: columnWidths[key],
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <TableSortLabel
                                            active={orderBy === key}
                                            direction={order}
                                            onClick={() => handleRequestSort(key)}
                                        >
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </TableSortLabel>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <LoadingBackdrop isLoading={isLoading} />
                        ) :
                            <>
                                {data?.length != 0 ? (
                                    <>
                                        {currentData?.map((task, taskIndex) => (
                                            <React.Fragment key={taskIndex}>
                                                <TableRow>
                                                    <TableCell>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <div>
                                                                {task?.taskname}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2} width="100%">
                                                            <Box width="100%" position="relative">
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={100}
                                                                    sx={{
                                                                        height: 7,
                                                                        borderRadius: 5,
                                                                        backgroundColor: "#e0e0e0",
                                                                        "& .MuiLinearProgress-bar": {
                                                                            backgroundColor: getStatusColor(100),
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body2" minWidth={100}>
                                                                {`${100}%`}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{task?.StartDate ? formatDate(task.StartDate) : '-'}</TableCell>
                                                    <TableCell>{task?.DeadLineDate ? formatDate(task.DeadLineDate) : '-'}</TableCell>
                                                    <TableCell>
                                                        <div style={{
                                                            color: priorityColors[task?.priority]?.color,
                                                            backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                                                            width: 'fit-content',
                                                            padding: '0.2rem 0.8rem',
                                                            borderRadius: '5px',
                                                            textAlign: 'center',
                                                            fontSize: '13.5px',
                                                            fontWeight: '500',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}>
                                                            {task?.priority}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{task?.summary}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            id="actions"
                                                            aria-label="actions"
                                                            aria-labelledby="actions"
                                                            onClick={(e) => handleMenuOpen(e, task, { Task: 'root' })}
                                                            style={{ color: "#7d7f85" }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            id="edit"
                                                            aria-label="edit"
                                                            aria-labelledby="edit"
                                                            style={{ color: "#7d7f85" }}
                                                            onClick={() => handleEditTask(task, { Task: 'root' })}
                                                        >
                                                            <Pencil size={20} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) :
                                    <TableRow>
                                        <TableCell colSpan={7} >
                                            <Typography variant="body2">No tasks found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </>
                        }
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Button variant="text" size="small" onClick={() => handleAddTask()}>
                                    + Add Project
                                </Button>
                            </TableCell>
                        </TableRow>
                        {!isLoading &&
                            <TableRow>
                                <TableCell colSpan={7} >
                                    {currentData?.length !== 0 && (
                                        <Box className="TablePaginationBox">
                                            <Typography className="paginationText">
                                                Showing {(page - 1) * rowsPerPage + 1} to{' '}
                                                {Math.min(page * rowsPerPage, data?.length)} of {data?.length} entries
                                            </Typography>
                                            {totalPages > 0 && (
                                                <Pagination
                                                    size="large"
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
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    className: "MenuBtnPaperClass",
                    style: {
                        maxHeight: 48 * 4.5,
                        width: "20ch",
                    },
                }}
            >
                {/* <MenuItem onClick={() => handleMenuItemClick('Edit', { Task: 'root' })}>Edit</MenuItem> */}
                <MenuItem onClick={() => handleMenuItemClick('Delete', { Task: 'root' })}>Delete</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('View', { Task: 'root' })}>View</MenuItem>
            </Menu>
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this task?"
            />
        </>
    );
};

export default TableView;
