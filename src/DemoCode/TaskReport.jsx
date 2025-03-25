import React, { useState } from "react";
import { Container, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress } from "@mui/material";

const sampleData = {
  role: "admin",
  date: "2025-03-22",
  admin: {
    total_tasks: 50,
    completed_tasks: 30,
    pending_tasks: 15,
    overdue_tasks: 5,
    team_performance: [
      {
        team_lead: "Alice Johnson",
        department: "Development",
        tasks_assigned: 15,
        tasks_completed: 12,
        pending_tasks: 3,
        overdue_tasks: 1,
      },
      {
        team_lead: "Michael Brown",
        department: "Design",
        tasks_assigned: 10,
        tasks_completed: 7,
        pending_tasks: 2,
        overdue_tasks: 1,
      }
    ]
  },
  team_lead: {
    name: "Alice Johnson",
    team: [
      {
        name: "John Doe",
        task_name: "Fix API Bugs",
        status: "Completed",
        estimated_time: "4h",
        actual_time: "3.5h",
        blockers: "None",
        due_date: "2025-03-22"
      },
      {
        name: "Jane Smith",
        task_name: "Develop Dashboard UI",
        status: "In Progress",
        estimated_time: "6h",
        actual_time: "4h",
        blockers: "Waiting for feedback",
        due_date: "2025-03-23"
      }
    ]
  },
  employee: {
    name: "John Doe",
    tasks: [
      {
        task_id: 301,
        title: "Fix API Bugs",
        status: "Completed",
        estimated_time: "4h",
        actual_time: "3.5h",
        blockers: "None",
        due_date: "2025-03-22"
      },
      {
        task_id: 302,
        title: "Optimize Database Queries",
        status: "Pending",
        estimated_time: "5h",
        actual_time: "0h",
        blockers: "Waiting for access",
        due_date: "2025-03-24"
      }
    ]
  }
};

// Status Color Helper
const getStatusChip = (status) => {
  switch (status) {
    case "Completed":
      return <Chip label="Completed" color="success" />;
    case "In Progress":
      return <Chip label="In Progress" color="warning" />;
    case "Pending":
      return <Chip label="Pending" color="error" />;
    default:
      return <Chip label="Unknown" color="default" />;
  }
};

const TaskReport = () => {
  const [role] = useState(sampleData.role);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Daily Task Report ({sampleData.date})
      </Typography>

      {/* ADMIN VIEW */}
      {role === "admin" && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={3}><Card><CardContent><Typography variant="h6">Total Tasks</Typography><Typography variant="h4">{sampleData.admin.total_tasks}</Typography></CardContent></Card></Grid>
            <Grid item xs={3}><Card><CardContent><Typography variant="h6">Completed</Typography><Typography variant="h4">{sampleData.admin.completed_tasks}</Typography></CardContent></Card></Grid>
            <Grid item xs={3}><Card><CardContent><Typography variant="h6">Pending</Typography><Typography variant="h4">{sampleData.admin.pending_tasks}</Typography></CardContent></Card></Grid>
            <Grid item xs={3}><Card><CardContent><Typography variant="h6">Overdue</Typography><Typography variant="h4">{sampleData.admin.overdue_tasks}</Typography></CardContent></Card></Grid>
          </Grid>

          <Typography variant="h5" mt={4}>Team Performance</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Lead</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Assigned Tasks</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>Overdue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleData.admin.team_performance.map((team, index) => (
                  <TableRow key={index}>
                    <TableCell>{team.team_lead}</TableCell>
                    <TableCell>{team.department}</TableCell>
                    <TableCell>{team.tasks_assigned}</TableCell>
                    <TableCell>{team.tasks_completed}</TableCell>
                    <TableCell>{team.pending_tasks}</TableCell>
                    <TableCell>{team.overdue_tasks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* TEAM LEAD VIEW */}
      {role === "team_lead" && (
        <>
          <Typography variant="h5" mt={4}>Team Tasks</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Member</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Estimated Time</TableCell>
                  <TableCell>Actual Time</TableCell>
                  <TableCell>Blockers</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleData.team_lead.team.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.task_name}</TableCell>
                    <TableCell>{getStatusChip(task.status)}</TableCell>
                    <TableCell>{task.estimated_time}</TableCell>
                    <TableCell>{task.actual_time}</TableCell>
                    <TableCell>{task.blockers}</TableCell>
                    <TableCell>{task.due_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* EMPLOYEE VIEW */}
      {role === "employee" && (
        <>
          <Typography variant="h5" mt={4}>Your Tasks</Typography>
          {sampleData.employee.tasks.map((task, index) => (
            <Card key={index} sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6">{task.title}</Typography>
              {getStatusChip(task.status)}
              <LinearProgress variant="determinate" value={task.status === "Completed" ? 100 : task.status === "In Progress" ? 50 : 0} sx={{ mt: 1 }} />
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default TaskReport;
