import React, { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import './UnAssignedTaskList.scss';
import { CalendarDays } from "lucide-react";
import { priorityColors } from "../../../../Utils/globalfun";
import ConfirmationDialog from "../../../../Utils/ConfirmationDialog/ConfirmationDialog";

const UnAssignedTaskList = ({ unassignedTasks, onPickTask }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handlePickTaskClick = (task) => {
    setSelectedTask(task);
    setShowConfirmDialog(true);
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
    setSelectedTask(null);
  };

  const confirmPickTask = () => {
    if (selectedTask) {
      onPickTask(selectedTask.id);
      setShowConfirmDialog(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="UnAssignedtask-container">
      <Grid container spacing={2} className="task-grid">
        {unassignedTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card className="task-card">
              <CardHeader
                title={task.title}
                className="task-header"
                action={
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: `${priorityColors[task?.priority]?.color} !important`,
                      backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                      padding: "2px 6px",
                      marginRight: "10px",
                      borderRadius: "4px",
                    }}
                    className="task-priority"
                  >
                    {task.priority}
                  </Typography>
                }
              />
              <CardContent className="task-content">
                <Typography variant="body2" className="task-desc">
                  {task.description}
                </Typography>
                <div className="task-dates">
                  <Typography variant="body2">
                    <CalendarDays size={20} /> &nbsp; Start: {format(task.startDate, "MMM d, yyyy")}
                  </Typography>
                  <Typography variant="body2">
                    <CalendarDays size={20} /> &nbsp; Due: {format(task.dueDate, "MMM d, yyyy")}
                  </Typography>
                </div>
              </CardContent>
              <CardActions className="task-actions">
                <Button
                  size="small"
                  className="buttonClassname"
                  startIcon={<AddCircle />}
                  onClick={() => handlePickTaskClick(task)}
                >
                  Assign to Me
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ConfirmationDialog
        open={showConfirmDialog}
        onClose={handleCloseDialog}
        onConfirm={confirmPickTask}
        confirmLabel="Assign to Me"
        cancelLabel="Cancel"
        title="Confirm"
        content="Are you sure you want to pick this task?"
      />
    </div>
  );
};

export default UnAssignedTaskList;
