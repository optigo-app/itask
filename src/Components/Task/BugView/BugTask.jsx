import "./bugTask.scss";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TableSortLabel,
} from '@mui/material';
import { flattenTasks, formatDate2, isValidTaskNo, priorityColors, statusColors } from "../../../Utils/globalfun";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import PriorityBadge from "../../ShortcutsComponent/PriorityBadge";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { assigneeId } from "../../../Recoil/atom";
import AssigneeAvatarGroup from "../../ShortcutsComponent/Assignee/AssigneeAvatarGroup";
import TablePaginationFooter from "../../ShortcutsComponent/Pagination/TablePaginationFooter";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { Eye } from "lucide-react";

const initialColumns = [
    { id: "taskname", label: "Bug Title", width: 280 },
    { id: "taskno", label: "Task No", width: 60 },
    { id: "assignee", label: "Assignee", width: 100 },
    { id: "view", label: "View", width: 90 },
    { id: "status", label: "Status", width: 100 },
    { id: "solvedBy", label: "Solved By", width: 100 },
    { id: "upload", label: "Upload", width: 70 },
    { id: "priority", label: "Priority", width: 80 },
    { id: "recheckStatus", label: "Recheck Status", width: 100 },
    { id: "DeadLineDate", label: "Deadline", width: 90 },
];

const BugTask = ({
    data,
    currentData,
    page,
    order,
    orderBy,
    rowsPerPage,
    totalPages,
    handleChangePage,
    handleRequestSort,
    handleStatusChange,
    handlePriorityChange,
    handlePageSizeChnage,
    isLoading
}) => {
    const [bugTask, setBugTask] = useState([]);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredColumnname, setHoveredColumnName] = useState('');
    const setAssigneeId = useSetRecoilState(assigneeId);


    useEffect(() => {
        if (!currentData) return;
        const flat = flattenTasks(currentData);
        const filtered = flat.filter(task => isValidTaskNo(task?.taskno));
        setBugTask(filtered);
    }, [currentData]);


    const handleTaskMouseEnter = (taskId, value) => {
        setHoveredColumnName(value?.Tbcell)
        setHoveredTaskId(taskId);
    };

    const handleTaskMouseLeave = () => {
        setHoveredTaskId(null);
        setHoveredColumnName('')
    };

    const onStatusChange = (task, newStatus, flag) => {
        handleStatusChange(task, newStatus, flag);
    };

    const onPriorityChange = (task, newPriority) => {
        handlePriorityChange(task, newPriority);
    };

    const hanldePAvatarClick = (task, id) => {
        setAssigneeId(id);
    }

    const renderAssigneeAvatars = (assignees, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick) => (
        <AssigneeAvatarGroup
            assignees={assignees}
            task={task}
            maxVisible={3}
            showAddButton={true}
            hoveredTaskId={hoveredTaskId}
            hoveredColumnName={hoveredColumnname}
            onAvatarClick={hanldePAvatarClick}
            size={30}
            spacing={0.5}
        />
    );

    return (
        <Box>
            {(isLoading == null || isLoading == true || (!data && isLoading !== false)) ? (
                <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
            ) :
                <TableContainer component={Paper} className="muiTableTaContainer">
                    <Table aria-label="bug task table" className="muiTable">
                        <TableHead className="muiTableHead">
                            <TableRow>
                                {initialColumns?.map((column) => (
                                    <TableCell
                                        key={column?.id}
                                        style={{
                                            width: `${column.width}px`,
                                            minWidth: `${column.width}px`,
                                            maxWidth: `${column.width}px`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <TableSortLabel
                                            active={
                                                column.id !== "view" &&
                                                column.id !== "assignee" &&
                                                orderBy === column.id
                                            }
                                            direction={order}
                                            onClick={() => {
                                                if (column.id !== "estimate" && column.id !== "actions") {
                                                    handleRequestSort(column?.id);
                                                }
                                            }}
                                            hideSortIcon={column.id === "view" || column.id === "assignee"}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bugTask?.map((bug) => {
                                const access = bug?.isFreez == 1;
                                return (
                                    <TableRow key={bug.id} hover>
                                        <TableCell>{bug.taskname}</TableCell>
                                        <TableCell>{bug.taskno}</TableCell>
                                        <TableCell
                                            onMouseEnter={() => handleTaskMouseEnter(bug?.taskid, { Tbcell: 'Assignee' })}
                                            onMouseLeave={handleTaskMouseLeave}>
                                            {renderAssigneeAvatars(bug?.assignee, bug, hoveredTaskId, hoveredColumnname, hanldePAvatarClick)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="view Task button"
                                            // onClick={() => handleViewTask(task, { Task: "root" })}
                                            >
                                                <Eye
                                                    size={20}
                                                    color="#808080"
                                                    className="iconbtn"
                                                />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge task={bug} statusColors={statusColors} onStatusChange={onStatusChange} disable={access ? true : false} />
                                        </TableCell>
                                        <TableCell>{bug.solvedBy ?? "shivam"}</TableCell>
                                        <TableCell>
                                            {bug.uploadVersion ?? "R75"}
                                        </TableCell>
                                        <TableCell>
                                            <PriorityBadge task={bug} priorityColors={priorityColors} onPriorityChange={onPriorityChange} disable={access ? true : false} />
                                        </TableCell>
                                        <TableCell><StatusBadge task={bug} statusColors={statusColors} onStatusChange={onStatusChange} disable={access ? true : false} flag="secondaryStatus" /></TableCell>
                                        <TableCell>{formatDate2(bug.DeadLineDate)}</TableCell>
                                    </TableRow>
                                )
                            })}
                            {!isLoading && data?.length !== 0 && (
                                <TableRow>
                                    <TableCell colSpan={initialColumns?.length}>
                                        {currentData?.length !== 0 && (
                                            <TablePaginationFooter
                                                page={page}
                                                rowsPerPage={rowsPerPage}
                                                totalCount={data?.length}
                                                totalPages={totalPages}
                                                onPageChange={handleChangePage}
                                                onPageSizeChange={handlePageSizeChnage}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </Box >
    );
};

export default BugTask;