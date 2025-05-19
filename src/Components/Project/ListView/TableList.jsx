import React, { useEffect, useState } from "react";
import "./projectTable.scss";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Box,
    Typography,
    Pagination,
    LinearProgress,
    IconButton,
    Tooltip,
    AvatarGroup,
    Avatar,
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import "react-resizable/css/styles.css";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { cleanDate, convertWordsToSpecialChars, formatDate2, getRandomAvatarColor, getStatusColor, ImageUrl, priorityColors } from "../../../Utils/globalfun";
import { Eye, Lock, Paperclip, Pencil, Trash, Unlock } from "lucide-react";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { assigneeId, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import SidebarDrawerFile from "../../ShortcutsComponent/Attachment/SidebarDrawerFile";
import ProfileCardModal from "../../ShortcutsComponent/ProfileCard";
import AssigneeShortcutModal from "../../ShortcutsComponent/Assignee/AssigneeShortcutModal";

const TableView = ({ data, projectProgress, page, rowsPerPage, handleChangePage, isLoading, handleLockProject, handleDeleteModule, handleAssigneeShortcutSubmit }) => {
    console.log('isLoading: ', isLoading);
    const navigate = useNavigate();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("projectName");
    const [projectData, setProjectData] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const setActionMode = useSetRecoilState(taskActionMode);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const setFormDataValue = useSetRecoilState(formData);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const setAssigneeId = useSetRecoilState(assigneeId);
    const [openfileDrawerOpen, setFileDrawerOpen] = useState(false);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const [cnfDelDialogOpen, setCnfDelDialogOpen] = React.useState(false);
    const [hoveredColumnname, setHoveredColumnName] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [openAssigneeModal, setOpenAssigneeModal] = useState(false);
    const columns = [
        { id: "projectName", label: "Project/Module", width: 350 },
        { id: "progress", label: "Progress", width: 180 },
        { id: "assignee", label: "Assignee", width: 100 },
        { id: "StartDate", label: "Start Date", width: 100 },
        { id: "DeadLineDate", label: "Deadline", width: 100 },
        { id: "priority", label: "Priority", width: 100 },
        { id: "actions", label: "Actions", width: 150 },
    ];

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };
    const [toggleState, setToggleState] = useState({});
    const handleToggle = (projectId) => {
        setToggleState((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };
    const handleMouseEnter = (taskId, value) => {
        setHoveredTaskId(taskId);
        setHoveredColumnName(value?.Tbcell)
    };
    const handleMouseLeave = () => {
        setHoveredTaskId(null);
    };

    const hanldePAvatarClick = (task, id) => {
        setAssigneeId(id);
        setSelectedRow(task);
        setProfileOpen(true);
    }

    const handleAssigneeShortcut = (task, additionalInfo) => {
        setSelectedRow(task);
        setRootSubroot(additionalInfo);
        setOpenAssigneeModal(true);
    }

    const handleCloseAssigneeModal = () => {
        setOpenAssigneeModal(false);
        setSelectedRow(null);
    }

    const handleAssigneSubmit = (updatedRowData) => {
        handleAssigneeShortcutSubmit(updatedRowData)
    }

    const handleOpenCnfDialog = (task) => {
        setSelectedRow(task);
        setCnfDialogOpen(true);
    };

    const groupByProject = (tasks) => {
        const grouped = {};

        tasks.forEach((task) => {
            const projectId = task.projectid;
            if (!grouped[projectId]) {
                grouped[projectId] = {
                    projectid: projectId,
                    projectName: task.taskPr,
                    projectProgress: task?.projectProgress,
                    tasks: []
                };
            }
            grouped[projectId].tasks.push(task);
        });

        // Add taskcount to each group
        const result = Object.values(grouped).map(group => ({
            ...group,
            taskcount: group.tasks.length
        }));

        return result;
    };

    useEffect(() => {
        const groupedTasks = groupByProject(data);
        setProjectData(groupedTasks);
    }, [data]);

    const handleViewPrDashboard = (task) => {
        setSelectedRow(task);
        setSelectedTask(task);
        let urlData = {
            project: task.projectName,
            projectid: task?.projectid,
        }
        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        navigate(`/projects/dashboard/?data=${encodedFormData}`);
    }

    const handleCloseCnfDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleCloseCnfDelDialog = () => {
        setCnfDelDialogOpen(false);
    };

    const handleCnfPrlUnl = async () => {
        setCnfDialogOpen(false);
        handleLockProject(selectedRow?.taskid);
    };

    const handleOpenFileDrawer = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFileDrawerOpen(true);
        setSelectedTask(task);
    }

    const handleRemovePr = async () => {
        setCnfDelDialogOpen(false);
        handleDeleteModule(selectedRow?.taskid);
    };

    const handleEditProject = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setActionMode("edit");
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(task);
    };

    const handleDeleteProject = async (task, additionalInfo) => {
        setCnfDelDialogOpen(true);
        setRootSubroot(additionalInfo);
        setActionMode("delete");
        setSelectedRow(task);
    }

    function descendingComparator(a, b, orderBy) {
        const valA = a[orderBy];
        const valB = b[orderBy];

        if (typeof valA === "string" && typeof valB === "string") {
            return valB.trim().localeCompare(valA.trim());
        }

        if (valB < valA) return -1;
        if (valB > valA) return 1;
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === "asc"
            ? (a, b) => -descendingComparator(a, b, orderBy)
            : (a, b) => descendingComparator(a, b, orderBy);
    }

    // sorting
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };


    const sortedData = [...(projectData || [])]?.sort(getComparator(order, orderBy));

    const totalPages = Math?.ceil(
        sortedData && sortedData?.length / rowsPerPage
    );

    // Get data for the current page
    const currentData =
        sortedData?.slice((page - 1) * rowsPerPage, page * rowsPerPage) || [];

    console.log('currentData: ', currentData);
    const handleNavigate = (task) => {
        let urlData = {
            module: task?.taskname,
            project: task.taskPr,
            taskid: task?.taskid,
            projectid: task?.projectid,
        }

        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        const formattedPrName = task?.taskPr?.trim()?.replace(/\s+/g, '-') || '';
        const formattedTaskName = task?.taskname?.trim()?.replace(/\s+/g, '-') || '';
        const url = `/tasks/${formattedPrName}/${formattedTaskName}?data=${encodedFormData}`;
        navigate(url);
        // window.open(url, '_blank');
    };

    const LockButton = ({ isLocked, onClick }) => {
        const Icon = isLocked ? Lock : Unlock;
        const label = isLocked ? 'Lock' : 'Unlock';

        return (
            <Tooltip
                placement="top"
                title={`${label} Module`}
                classes={{ tooltip: 'custom-tooltip' }}
            >
                <IconButton
                    id={`pr${label}`}
                    aria-label={`pr${label}`}
                    onClick={onClick}
                    sx={{
                        color: isLocked ? '#ffffff' : '#7d7f85',
                        backgroundColor: isLocked ? '#7367f0' : 'transparent',
                        '&:hover': {
                            backgroundColor: isLocked ? '#7367f0' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    <Icon size={20} color={isLocked ? "#fff" : "#7d7f85"} className="iconbtn" />
                </IconButton>
            </Tooltip>
        );
    };

    const renderTaskButtons = (task) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LockButton
                    isLocked={task?.isFreez === 1}
                    onClick={() => handleOpenCnfDialog(task)}
                    id={task?.taskid}
                />
                <IconButton
                    aria-label="View Module button"
                    onClick={() => handleOpenFileDrawer(task, { Task: "root" })}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <Paperclip size={20} color="#808080" className="iconbtn" />
                </IconButton>
                {/* <IconButton
                    aria-label="View Module button"
                    onClick={() => handleViewPrDashboard(task)}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <Eye size={20} color="#808080" className="iconbtn" />
                </IconButton> */}
                <IconButton
                    aria-label="Edit-Task button"
                    disabled={task?.isFreez === 1}
                    onClick={() => handleEditProject(task, { Task: "root" })}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <Pencil
                        size={20}
                        color={task?.isFreez === 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                        className="iconbtn"
                    />
                </IconButton>
                <IconButton
                    aria-label="Delete Task button"
                    disabled={task?.isFreez === 1}
                    onClick={() => handleDeleteProject(task, { Task: "sub" })}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <Trash
                        size={20}
                        color={task?.isFreez === 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                        className="iconbtn"
                    />
                </IconButton>
            </Box>
        );
    };

    const renderPriorityLabel = (task) => {
        const priorityColor = priorityColors[task?.priority] || {};
        return (
            <div
                style={{
                    color: priorityColor.color,
                    backgroundColor: priorityColor.backgroundColor,
                    width: 'fit-content',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '5px',
                    textAlign: 'center',
                    fontSize: '13.5px',
                    fontWeight: '500',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                className="priorityLabel"
            >
                {task?.priority}
            </div>
        );
    };

    const renderAssigneeAvatars = (assignees, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup
                max={6}
                spacing={2}
                sx={{
                    '& .MuiAvatar-root': {
                        width: 25,
                        height: 25,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.2)',
                            zIndex: 10,
                        },
                    },
                }}
            >
                {assignees?.map((assignee, teamIdx) => (
                    <Tooltip
                        placement="top"
                        key={assignee?.id}
                        title={`${assignee?.firstname} ${assignee?.lastname}`}
                        arrow
                        classes={{ tooltip: 'custom-tooltip' }}
                    >
                        <Avatar
                            key={teamIdx}
                            alt={`${assignee?.firstname} ${assignee?.lastname}`}
                            src={ImageUrl(assignee) || null}
                            sx={{
                                backgroundColor: background(assignee?.firstname),
                            }}
                            onClick={() => hanldePAvatarClick(assignees, assignee?.id)}
                        >
                            {!assignee.avatar && assignee?.firstname?.charAt(0)}
                        </Avatar>
                    </Tooltip>
                ))}
            </AvatarGroup>

            {/* <IconButton
                id="add-task"
                aria-label="add-task"
                aria-labelledby="add-task"
                size="small"
                onClick={() => handleAssigneeShortcut(task, { Task: 'root' })}
                style={{
                    visibility: hoveredTaskId === task?.taskid && hoveredColumnname === 'Assignee' ? 'visible' : 'hidden',
                }}
            >
                <CirclePlus size={20} color="#7367f0" />
            </IconButton> */}
        </Box>
    );

    return (
        <>
            {(isLoading === null || isLoading || (!data && isLoading !== false)) ? (
                <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
            ) :
                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                        borderRadius: "8px",

                    }}
                    className="ProjectTVMain"
                >

                    <Table size="small" aria-label="task details"
                    >
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            width: column.width,
                                            maxWidth: column.width,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        className={column.id === "actions" ? "sticky-last-col" : ""}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <TableSortLabel
                                                active={
                                                    column.id !== "actions" && orderBy === column.id
                                                }
                                                direction={order}
                                                onClick={() => {
                                                    if (column.id !== "actions") {
                                                        handleRequestSort(column.id);
                                                    }
                                                }}
                                                hideSortIcon={column.id === "actions"}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data?.length !== 0 ? (
                                <>
                                    {currentData?.map((project) => (
                                        <React.Fragment key={project.projectid}>
                                            {/* Render Project Name Row with Toggle Icon */}
                                            <TableRow>
                                                <TableCell colSpan={1}>
                                                    <Box display="flex" alignItems="center" gap={.5}>
                                                        {/* Toggle IconButton */}
                                                        <IconButton
                                                            id="toggle-task"
                                                            aria-label="toggle-task"
                                                            aria-labelledby="toggle-task"
                                                            size="small"
                                                            onClick={() => handleToggle(project.projectid, project)}
                                                        >
                                                            <PlayArrowIcon
                                                                style={{
                                                                    color: toggleState[project.projectid] ? "#444050" : "#c7c7c7",
                                                                    fontSize: "1rem",
                                                                    transform: toggleState[project.projectid] ? "rotate(90deg)" : "rotate(0deg)",
                                                                    transition: "transform 0.2s ease-in-out",
                                                                }}
                                                            />
                                                        </IconButton>
                                                        {/* Project Name */}
                                                        <Typography variant="body" className="prNameTypo" sx={{ cursor: "pointer" }} onClick={() => handleToggle(project.projectid, project)}>
                                                            {project.projectName} {project?.taskcount != 0 && (
                                                                <span className="pr-md_count">
                                                                    {project?.taskcount}
                                                                </span>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell colSpan={1}>
                                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                                        <Box width="100%" position="relative">
                                                            <LinearProgress
                                                                aria-label="Task progress status"
                                                                variant="determinate"
                                                                value={project?.projectProgress}
                                                                sx={{
                                                                    height: 7,
                                                                    borderRadius: 5,
                                                                    backgroundColor: "#e0e0e0",
                                                                    "& .MuiLinearProgress-bar": {
                                                                        backgroundColor: getStatusColor(project?.projectProgress),
                                                                    },
                                                                }}
                                                                className="progressBar"
                                                            />
                                                        </Box>
                                                        <Typography className="progressBarText" variant="body2" minWidth={100}>
                                                            {`${project?.projectProgress}%`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell colSpan={4} />
                                                <TableCell colSpan={1} sx={{ textAlign: "right" }}>
                                                    <IconButton
                                                        aria-label="View Module button"
                                                        onClick={() => handleViewPrDashboard(project)}
                                                        sx={{
                                                            '&.Mui-disabled': {
                                                                color: 'rgba(0, 0, 0, 0.26)',
                                                            },
                                                        }}
                                                    >
                                                        <Eye size={20} color="#808080" className="iconbtn" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>

                                            {/* Conditionally Render Tasks for the Project */}
                                            {toggleState[project.projectid] && project.tasks.map((task, taskIndex) => (
                                                <React.Fragment key={task.taskid}>
                                                    <TableRow
                                                        sx={{
                                                            backgroundColor: hoveredTaskId === task?.taskid ? '#f5f5f5' : 'inherit',
                                                        }}
                                                        onMouseEnter={() => handleMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        <TableCell sx={{ paddingLeft: '55px' }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <div className="projectModuleName">
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            if (!task?.isLocked) {
                                                                                handleNavigate(task);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span>{convertWordsToSpecialChars(task?.taskname)}</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <span className="prShDesc">{convertWordsToSpecialChars(task?.descr)}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {/* <Box display="flex" alignItems="center" gap={2} width="100%">
                                                                <Box width="100%" position="relative">
                                                                    <LinearProgress
                                                                        aria-label="Task progress status"
                                                                        variant="determinate"
                                                                        value={task?.progress_per}
                                                                        sx={{
                                                                            height: 7,
                                                                            borderRadius: 5,
                                                                            backgroundColor: "#e0e0e0",
                                                                            "& .MuiLinearProgress-bar": {
                                                                                backgroundColor: getStatusColor(task?.progress_per),
                                                                            },
                                                                        }}
                                                                        className="progressBar"
                                                                    />
                                                                </Box>
                                                                <Typography className="progressBarText" variant="body2" minWidth={100}>
                                                                    {`${task?.progress_per}%`}
                                                                </Typography>
                                                            </Box> */}
                                                        </TableCell>
                                                        <TableCell
                                                            onMouseEnter={() => handleMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                            onMouseLeave={handleMouseLeave}>
                                                            {renderAssigneeAvatars(task?.assignee, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {task?.StartDate && cleanDate(task?.StartDate)
                                                                ? formatDate2(cleanDate(task?.StartDate))
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                                                ? formatDate2(cleanDate(task?.DeadLineDate))
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {renderPriorityLabel(task)}
                                                        </TableCell>
                                                        <TableCell className="sticky-last-col">
                                                            {renderTaskButtons(task)}
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: '#7d7f85 !important' }}>
                                            No Project/Module found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && data?.length !== 0 &&
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        {currentData?.length !== 0 && (
                                            <Box className="TablePaginationBox">
                                                <Typography className="paginationText">
                                                    Showing {(page - 1) * rowsPerPage + 1} to{' '}
                                                    {Math.min(page * rowsPerPage, sortedData?.length)} of {sortedData?.length} entries
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
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseCnfDialog}
                onConfirm={handleCnfPrlUnl}
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel={selectedRow?.isFreez == 1 ? "Unlock" : "Lock"}
                content={selectedRow?.isFreez == 1 ? 'Are you sure you want to unlock this project?' : 'Are you sure you want to lock this project?'}
            />
            <ConfirmationDialog
                open={cnfDelDialogOpen}
                onClose={handleCloseCnfDelDialog}
                onConfirm={handleRemovePr}
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel="Remove"
                content='Are you sure you want to Remove this project/module?'
            />

            <AssigneeShortcutModal
                taskData={selectedRow}
                open={openAssigneeModal}
                onClose={handleCloseAssigneeModal}
                handleAssigneSubmit={handleAssigneSubmit}
            />

            <ProfileCardModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                profileData={selectedRow}
                background={background}
            />

            <SidebarDrawerFile
                open={openfileDrawerOpen}
                onClose={() => setFileDrawerOpen(false)}
            />
        </>
    );
};

export default TableView;
