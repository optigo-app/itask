import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Box, Card, CardContent, Typography, IconButton, Avatar, AvatarGroup, Button, LinearProgress } from "@mui/material";
import { Circle, CircleCheck, CircleDotDashed, CirclePlus, CircleX, Plus, StickyNote, Target, Volleyball, Workflow } from "lucide-react";
import { formatDate, formatDate2, getRandomAvatarColor, getStatusColor, priorityColors } from "../../../Utils/globalfun";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi"
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { deleteTaskDataApi } from "../../../Api/TaskApi/DeleteTaskApi";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag } from "../../../Recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";

function KanbanView({
  taskdata,
  isLoading,
  masterData,
  statusData }) {

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
  const taskStatusData = JSON?.parse(sessionStorage.getItem("taskStatusData")) || [];

  const handleToggleShowAll = () => {
    setShowAll(prevState => !prevState);
  };

  const handleDelete = (task) => {
    setCnfDialogOpen(true);
    setSelectedTask(task)
  }

  const handleConfirmRemoveAll = async () => {
    setCnfDialogOpen(false);
    try {
      const deleteTaskApi = await deleteTaskDataApi(selectedTask);
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
    columns: taskStatusData.reduce((acc, taskStatus) => {
      const filteredTasks = taskdata?.filter(task => task.status === taskStatus.labelname);
      acc[`column-${taskStatus.id}`] = {
        id: `column-${taskStatus.id}`,
        title: taskStatus.labelname,
        icon: getStatusIcon(taskStatus.labelname),
        tasks: filteredTasks,
      };

      return acc;
    }, {}),
    columnOrder: taskStatusData
      .filter(status => status.isdelete === 0)
      .sort((a, b) => a.displayorder - b.displayorder)
      .map(status => `column-${status.id}`),
  };

  useEffect(() => {
    setData(initialData);
  }, [taskdata]);

  const onDragStart = (start) => {
    setSourceColumnId(start.source.droppableId);
  };

  const onDragEnd = async (result) => {
    debugger
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

      let statusId = statusData.find(status => status.labelname?.toLowerCase() === endColumn?.title?.toLowerCase())?.id;
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
          project: updatedMovedTask.projectid,
          taskName: updatedMovedTask.taskname,
          dueDate: updatedMovedTask.DeadLineDate,
          priority: updatedMovedTask.priorityid,
          status: updatedMovedTask.statusid,
        };
        let rootSubrootflagval = "root"
        const addTaskApi = await AddTaskDataApi(formValues ?? {}, updatedMovedTask ?? {}, rootSubrootflagval ?? {});
      }
    }
  };

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({})
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
  debugger
  return (
    <>
      {(isLoading || !taskdata) ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) :
        <Box sx={{ width: '100%', overflow: "auto !important", padding: '0' }}>
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Box display="flex" gap={3} p={2}>
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
                          width: 300,
                          minWidth: '300px',
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
                              <Typography variant="h6" fontSize={16} fontWeight={600}>{column.title}</Typography>
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
                            <IconButton onClick={handleDrawerToggle}>
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
                                        alignItems: "flex-start",
                                        marginBottom: 1
                                      }}
                                    >
                                      <StickyNote size={18} style={{ marginRight: '8px', marginTop: '2px' }} />
                                      <Box>
                                        <Typography variant="subtitle1" sx={{ lineHeight: 1.4, flex: 1 }}>
                                          {task.taskPr}
                                        </Typography>
                                        <Typography variant="caption" sx={{ lineHeight: 1.4, flex: 1 }}>
                                          {formatDate2(task.DeadLineDate)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <div className="itask_separator" />
                                    <Box display="flex" alignItems="center" my={1}>
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
                                              transform: 'translateY(-8px)',
                                            }
                                          }
                                        }}
                                      >
                                        {task.assignee?.map((assignee, teamIdx) => (
                                          <Avatar
                                            key={teamIdx}
                                            alt={assignee}
                                            src={assignee.avatar}
                                            sx={{
                                              backgroundColor: background(assignee),
                                            }}
                                          >
                                            {!assignee.avatar && assignee.charAt(0)}
                                          </Avatar>
                                        ))}
                                      </AvatarGroup>
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
                                    <Box display="flex" alignItems="center" my={.5} gap={1}>
                                      <Box width="100%" position="relative">
                                        <LinearProgress
                                          variant="determinate"
                                          value={100}
                                          sx={{
                                            height: 5,
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
                                  </Box>
                                  {/* <Box position="relative">
                                    {task?.subtasks?.slice(0, showAll ? task.subtasks.length : 5).map((subtask, index) => (
                                      <Box
                                        key={subtask.taskid}
                                        display="flex"
                                        alignItems="center"
                                        mt={1}
                                        onClick={() => handleEditSubtask(subtask, { Task: 'root' })}
                                      >
                                        <Workflow size={16} color="#6058F7" style={{ marginRight: '8px' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {subtask.taskname}
                                        </Typography>
                                      </Box>
                                    ))}
                                    {task?.subtasks?.length > 5 && (
                                      <Button
                                        variant="text"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          right: 0,
                                          fontSize: '12px',
                                          marginTop: '5px',
                                          background: 'transparent !important',
                                          color: '#444050 !important',
                                          textTransform: 'capitalize !important',
                                          textDecoration: 'underline !important',
                                          transition: 'all 0.3s ease-in-out',
                                        }}
                                        onClick={handleToggleShowAll}
                                      >
                                        {showAll ? 'Show Less' : 'Show More'}
                                      </Button>
                                    )}
                                  </Box> */}
                                  {/* <Button
                                    onClick={() => handleAddTask(task, { Task: 'subroot' })}
                                    className="buttonClassname"
                                    sx={{
                                      fontSize: '12px',
                                      marginTop: '5px',
                                      background: 'transparent !important',
                                      color: '#6058F7 !important',
                                      textTransform: 'capitalize !important',
                                      textDecoration: 'underline !important',
                                      transition: 'all 0.3s ease-in-out',
                                      '&:hover': {
                                        backgroundColor: 'rgba(96, 88, 247, 0.1)',
                                        transform: 'scale(1.05)',
                                      },
                                    }}
                                  >
                                    Add Subtask
                                  </Button> */}
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
