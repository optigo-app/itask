import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Box, Card, CardContent, Typography, IconButton, Avatar, AvatarGroup, Button, Tooltip } from "@mui/material";
import { Circle, CircleCheck, CircleDotDashed, CirclePlus, CircleX, Plus, StickyNote, Target, Volleyball, Workflow } from "lucide-react";
import { cleanDate, formatDate, formatDate2, getRandomAvatarColor, ImageUrl, mapKeyValuePair, priorityColors } from "../../../Utils/globalfun";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi"
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { deleteTaskDataApi } from "../../../Api/TaskApi/DeleteTaskApi";
import { fetchTaskDataFullApi } from "../../../Api/TaskApi/TaskDataFullApi";
import { EstimateCalApi } from "../../../Api/TaskApi/EstimateCalApi";
import { buildAncestorSumSplitestimate } from "../../../Utils/estimationUtils";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag } from "../../../Recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import KanbanCardSkeleton from "./KanbanSkelton";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { toast } from "react-toastify";

function KanbanView({
  taskdata,
  isLoading,
}) {

  const [data, setData] = useState();
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const [formDataValue, setFormDataValue] = useRecoilState(formData);
  const [selectedTask, setSelectedTask] = useState();
  const [sourceColumnId, setSourceColumnId] = useState(null);
  const [cnfDialogOpen, setCnfDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const taskStatusData = JSON?.parse(sessionStorage.getItem("taskstatusData")) || [];

  const handleToggleShowAll = (task) => {
    setShowAll(prevState => ({
      ...prevState,
      [task.taskid]: !prevState[task.taskid]
    }));
  };

  const handleDelete = (task) => {
    setCnfDialogOpen(true);
    setSelectedTask(task)
  }

  const handleConfirmRemoveAll = async () => {
    setCnfDialogOpen(false);
    try {
      const parentId = selectedTask?.parentid;
      let parentSumSplitestimate = '';

      if (parentId && String(parentId) !== '0') {
        const rootId = selectedTask?.projectid || parentId;
        try {
          const taskData = await fetchTaskDataFullApi({ taskid: rootId, teamid: '1' });
          if (taskData && taskData.rd1) {
            const labeledTasks = mapKeyValuePair(taskData);
            parentSumSplitestimate = buildAncestorSumSplitestimate(labeledTasks, {
              parentTaskId: parentId,
              childTaskId: selectedTask.taskid,
              isDelete: true,
            });
          }
        } catch (err) {
          console.error('Error fetching data for parent estimation before kanban delete:', err);
        }
      }

      const deleteTaskApi = await deleteTaskDataApi(selectedTask);
      if (deleteTaskApi && deleteTaskApi?.rd[0]?.stat == 1) {
        if (parentSumSplitestimate) {
          try {
            await EstimateCalApi(parentSumSplitestimate);
          } catch (err) {
            console.error('Error updating parent estimate after kanban delete:', err);
          }
        }

        setOpenChildTask(Date.now());
        setSelectedTask(null);
        toast.success("Task deleted successfully!");
      } else {
        console.error("Failed to delete task");
        toast.error("Something went wrong...");
      }
    } catch (error) {
      console.error("Error while deleting task:", error);
    }
  };

  const handleCloseDialog = () => {
    setCnfDialogOpen(false);
  };

  const background = (assignee) => {
    const avatarBackgroundColor = assignee?.avatar
      ? "transparent"
      : getRandomAvatarColor(assignee);
    return avatarBackgroundColor;
  };

  // Function to get the correct icon based on the task status
  const getStatusIcon = (labelName) => {
    switch (labelName) {
      case "Pending":
        return <Circle color="pink" strokeWidth={2} />;
      case "Running":
        return <CircleDotDashed color="#EFB036" strokeWidth={2} />;
      case "Completed":
        return <CircleCheck color="green" strokeWidth={2} />;
      default:
        return <Volleyball color="gray" strokeWidth={2} />;
    }
  };

  const initialData = {
    columns: taskStatusData?.reduce((acc, taskStatus) => {
      const filteredTasks = taskdata?.filter(task => task.status === taskStatus.labelname);
      acc[`column-${taskStatus.id}`] = {
        id: `column-${taskStatus.id}`,
        title: taskStatus.labelname,
        icon: getStatusIcon(taskStatus.labelname),
        tasks: filteredTasks,
      };

      return acc;
    }, {}),
    columnOrder: [6, 1, 3, 4, 2]
      .filter(id => taskStatusData?.some(status => status.id === id && status.isdelete === 0))
      .map(id => `column-${id}`),
  };

  useEffect(() => {
    setData(initialData);
  }, [taskdata]);

  const onDragStart = (start) => {
    setSourceColumnId(start.source.droppableId);
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;
    setSourceColumnId(null);

    // If dropped outside of a droppable area
    if (!destination) return;

    // If the task is moved within the same column
    const startColumn = data.columns[source.droppableId];
    const endColumn = data.columns[destination.droppableId];

    if (startColumn.id === endColumn.id) {
      const updatedTasks = Array.from(startColumn.tasks);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, movedTask);

      const updatedColumn = { ...startColumn, tasks: updatedTasks };
      setData((prevData) => ({
        ...prevData,
        columns: { ...prevData.columns, [updatedColumn.id]: updatedColumn },
      }));
    } else {
      // If the task is moved between columns
      const startTasks = Array.from(startColumn.tasks);
      const [movedTask] = startTasks.splice(source.index, 1);

      let statusId = taskStatusData.find(status => status.labelname?.toLowerCase() === endColumn?.title?.toLowerCase())?.id;
      const updatedMovedTask = { ...movedTask, status: endColumn?.title, statusid: statusId };

      const endTasks = Array.from(endColumn.tasks);
      endTasks.splice(destination.index, 0, updatedMovedTask);

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [startColumn.id]: { ...startColumn, tasks: startTasks },
          [endColumn.id]: { ...endColumn, tasks: endTasks },
        },
      }));

      if (endTasks) {
        let formValues = {
          ...updatedMovedTask,
          project: updatedMovedTask.projectid,
          taskName: updatedMovedTask.taskname,
          dueDate: updatedMovedTask.DeadLineDate,
          priority: updatedMovedTask.priorityid,
          status: updatedMovedTask.statusid,
        };
        let rootSubrootflagval = "root"
        const addTaskApi = await AddTaskDataApi(formValues ?? {}, rootSubrootflagval ?? {});
      }
    }
  };

  const handleDrawerToggle = (columnId) => {
    const status_id = columnId.split('-')[1];
    const status_name = taskStatusData?.find(status => status.id === Number(status_id))?.labelname;
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({})
    setFormDataValue((prev) => ({
      ...prev,
      status: status_name,
      statusid: Number(status_id),
    }));
    setRootSubroot({ Task: "AddTask" })
    setOpenChildTask(false);
    setSelectedTask({})

  };

  const handleAddTask = (task, additionalInfo) => {
    setRootSubroot(additionalInfo);
    setFormDataValue(task);
    setFormDrawerOpen(true);
    setSelectedTask(null);
  };

  const handleAddSubtask = (subtask, additionalInfo) => {
    setRootSubroot(additionalInfo);
    setFormDataValue(subtask);
    setFormDrawerOpen(true);
    setSelectedTask(null);
  }

  const handleEditTask = async (task, additionalInfo) => {
    setRootSubroot(additionalInfo);
    setFormDataValue(task);
    setFormDrawerOpen(true);
    setSelectedTask(null);
  };

  const handleEditSubtask = (subtask, additionalInfo) => {
    setRootSubroot(additionalInfo);
    setFormDataValue(subtask);
    setFormDrawerOpen(true);
    setSelectedTask(null);
  };
  return (
    <>
      {(isLoading || !taskdata) ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) :
        <Box sx={{ width: '100%', overflow: "auto !important", padding: '0' }}>
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Box display="flex" gap={2}>
              {data?.columnOrder?.map((columnId) => {
                const column = data.columns[columnId];
                return (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          backgroundColor: snapshot.isDraggingOver
                            ? "#E8F9FF"
                            : columnId === sourceColumnId
                              ? "#fce6e6"
                              : "#f4f4f4",
                          borderRadius: 2,
                          width: 302,
                          minWidth: '302px',
                          minHeight: '400px',
                          maxHeight: '800px',
                          overflow: 'auto !important',
                          boxShadow: 0,
                          transition: "background-color 0.3s",
                        }}
                      >
                        <Box
                          sx={{
                            position: 'sticky !important',
                            top: 0,
                            backgroundColor: '#f4f4f4',
                            zIndex: 1,
                            padding: '16px',
                            marginBottom: '16px',
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              {column.icon}
                              <Typography variant="h6" fontSize={18} fontWeight={600}>{column.title}</Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  background: '#C7C8CC',
                                  borderRadius: '6px',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                }}
                              >
                                {column?.tasks?.length}
                              </Typography>
                            </Box>
                            <IconButton onClick={() => handleDrawerToggle(columnId)}>
                              <Plus strokeWidth={2} />
                            </IconButton>
                          </Box>
                        </Box>
                        <div className="itask_separator" />
                        {column?.tasks?.map((task, index) => (
                          <Draggable
                            key={task.taskid}
                            draggableId={String(task.taskid)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onMouseEnter={() => setHoveredTaskId(task.taskid)}
                                onMouseLeave={() => setHoveredTaskId(null)}
                                sx={{
                                  m: 1,
                                  borderRadius: 2,
                                  backgroundColor: snapshot.isDragging ? "lightyellow" : "white",
                                  boxShadow: snapshot.isDragging ? 4 : 1,
                                  transition: "background-color 0.3s, box-shadow 0.3s",
                                  position: "relative",
                                  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px'
                                }}
                              >
                                <CardContent>
                                  <Box onClick={() => handleEditTask(task, { Task: 'root' })}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "start",
                                        marginBottom: 1
                                      }}
                                    >
                                      <StickyNote size={18} style={{ marginRight: '8px', flexShrink: 0 }} />
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle1" sx={{ lineHeight: 1.4 }}>
                                          {task.taskname}
                                        </Typography>
                                        <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                                          {task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                            ? formatDate2(cleanDate(task?.DeadLineDate))
                                            : '-'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <div className="itask_separator" />
                                    <Box display="flex" alignItems="center" mt={1}>
                                      <AvatarGroup max={10}
                                        sx={{
                                          '& .MuiAvatar-root': {
                                            width: 22,
                                            height: 22,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            border: 'none',
                                            transition: 'transform 0.3s ease-in-out',
                                            '&:hover': {
                                              transform: 'scale(1.2)',
                                              zIndex: 10
                                            }
                                          }
                                        }}
                                      >
                                        {task?.assignee?.map((assignee, teamIdx) => (
                                          <Tooltip
                                            placement="top"
                                            key={assignee?.id}
                                            title={assignee?.firstname + " " + assignee?.lastname}
                                            arrow
                                            classes={{ tooltip: 'custom-tooltip' }}
                                          >
                                            <Avatar
                                              key={teamIdx}
                                              alt={assignee?.firstname + " " + assignee?.lastname}
                                              src={ImageUrl(assignee) || null}
                                              sx={{
                                                backgroundColor: background(assignee?.firstname),
                                              }}
                                            >
                                              {!assignee.avatar && assignee?.firstname?.charAt(0)}
                                            </Avatar>
                                          </Tooltip>
                                        ))}
                                      </AvatarGroup>
                                    </Box>
                                    <Box display="flex" alignItems="center" my={.5}>
                                      <Target size={13} style={{ marginRight: '5px' }} />
                                      <Typography variant="subtitle1">{task.taskPr}</Typography>
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        color: `${priorityColors[task?.priority]?.color} !important`,
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
                                      }}
                                    >
                                      {task.priority}
                                    </Typography>
                                  </Box>
                                  <Box position="relative">
                                    {task?.subtasks?.slice(0, showAll[task.taskid] ? task.subtasks.length : 5).map((subtask, index) => (
                                      <Box
                                        key={subtask.taskid}
                                        display="flex"
                                        alignItems="flex-start"
                                        mt={1}
                                        onClick={() => handleEditSubtask(subtask, { Task: "root" })}
                                        sx={{ gap: 1 }}
                                      >
                                        <Box sx={{ flexShrink: 0, width: "16px", height: "16px", display: "flex", alignItems: "center" }}>
                                          <Workflow size={16} color="#6058F7" />
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{ wordBreak: "break-word", whiteSpace: "normal", flexGrow: 1 }}
                                        >
                                          {subtask.taskname}
                                        </Typography>
                                      </Box>
                                    ))}
                                    {task?.subtasks?.length > 5 && (
                                      <Button
                                        variant="text"
                                        sx={{
                                          position: 'absolute',
                                          top: -35,
                                          right: -15,
                                          fontSize: '12px',
                                          marginTop: '5px',
                                          background: 'transparent !important',
                                          color: '#444050 !important',
                                          textTransform: 'capitalize !important',
                                          textDecoration: 'underline !important',
                                          transition: 'all 0.3s ease-in-out',
                                        }}
                                        onClick={() => handleToggleShowAll(task)}
                                      >
                                        {showAll[task.taskid] ? 'Show Less' : 'Show More'}
                                      </Button>
                                    )}
                                  </Box>
                                  {/* <Button
                                    onClick={() => handleAddTask(task, { Task: 'subroot' })}
                                    className="buttonClassname"
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      fontSize: '12px',
                                      marginTop: '5px',
                                      background: 'transparent !important',
                                      color: '#6058F7 !important',
                                      textTransform: 'capitalize !important',
                                      transition: 'all 0.3s ease-in-out',
                                      '&:hover': {
                                        backgroundColor: 'rgba(96, 88, 247, 0.1)',
                                        transform: 'scale(1.05)',
                                      },
                                    }}
                                  >
                                    Add Subtask
                                  </Button> */}
                                  <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                                    <IconButton
                                      onClick={() => handleAddTask(task, { Task: 'subroot' })}
                                      size="small"
                                      sx={{
                                        fontSize: '12px',
                                        marginTop: '5px',
                                        background: '#6058F7 !important',
                                        color: '#fff !important',
                                        borderRadius: '50%',
                                        textTransform: 'capitalize !important',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                          backgroundColor: 'rgba(96, 88, 247, 0.1)',
                                          transform: 'scale(1.05)',
                                        },
                                      }}
                                    >
                                      <Plus width={20} height={20} />
                                    </IconButton>
                                  </Box>
                                </CardContent>
                                <IconButton
                                  size="small"
                                  sx={{
                                    visibility: hoveredTaskId === task?.taskid ? "visible" : "hidden",
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    transition: "visibility 0.2s ease-in-out",
                                    opacity: hoveredTaskId === task?.taskid ? 1 : 0,
                                  }}

                                  onClick={() => handleDelete(task)}
                                >
                                  <CircleX size={18} />
                                </IconButton>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                );
              })}
            </Box>
          </DragDropContext>
        </Box>
      }

      <ConfirmationDialog
        open={cnfDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRemoveAll}
        title="Confirm"
        content="Are you sure you want to delete this task?"
      />
    </>
  );
}

export default KanbanView;
