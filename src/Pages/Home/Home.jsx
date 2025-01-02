import React from 'react'
import { Grid } from '@mui/material'
import Card1 from './Agenda'
import Card2 from './Projects'
import Card3 from './UrgentTasks'
import Card4_1 from './Comments'
import Card4_2 from './Teams'
import './homePage.scss'
import { getRandomAvatarColor } from '../../Utils/globalfun'

const Home = () => {
  const Project = [
    {
      "projectId": "p1",
      "projectName": "Project Alpha",
      "description": "This is a description for Project Alpha.",
      "status": "In Progress",
      "startDate": "2024-08-01",
      "endDate": "2024-12-31",
      "team": [
        {
          "userId": "t1",
          "name": "John Doe",
          "role": "Frontend Developer",
          "avatar": "https://via.placeholder.com/150"
        },
        {
          "userId": "t2",
          "name": "Jane Smith",
          "role": "Backend Developer",
          "avatar": ""
        },
        {
          "userId": "t3",
          "name": "Michael Lee",
          "role": "Project Manager",
          "avatar": "https://example.com/michael-lee.jpg"
        }
      ],
      "tasks": ["t1", "t2", "t3"]
    },
    {
      "projectId": "p2",
      "projectName": "Project Beta",
      "description": "This is a description for Project Beta.",
      "status": "Completed",
      "startDate": "2023-10-01",
      "endDate": "2024-04-30",
      "team": [
        {
          "userId": "t4",
          "name": "Alice Brown",
          "role": "UI/UX Designer",
          "avatar": "https://example.com/alice-brown.jpg"
        },
        {
          "userId": "t5",
          "name": "David Green",
          "role": "Full Stack Developer",
          "avatar": "https://example.com/david-green.jpg"
        },
        {
          "userId": "t6",
          "name": "Emma White",
          "role": "QA Engineer",
          "avatar": ""
        }
      ],
      "tasks": ["t4", "t5", "t6"]
    },
    {
      "projectId": "p3",
      "projectName": "Project Gamma",
      "description": "This is a description for Project Gamma.",
      "status": "Not Started",
      "startDate": "2024-11-01",
      "endDate": "2025-05-31",
      "team": [
        {
          "userId": "t7",
          "name": "Chris Black",
          "role": "Data Analyst",
          "avatar": "https://example.com/chris-black.jpg"
        },
        {
          "userId": "t8",
          "name": "Sophia Red",
          "role": "Product Owner",
          "avatar": ""
        }
      ],
      "tasks": ["t7", "t8"]
    }
  ]

  const urgentTask = [
    {
      "taskId": "t1",
      "taskName": "Urgent Task for Project Alpha",
      "description": "This task needs to be completed as soon as possible.",
      "priority": "High",
      "dueDate": "2024-12-10",
      "assignedTo": "t1",
      "status": "Pending"
    },
    {
      "taskId": "t2",
      "taskName": "Fix Critical Bug in Project Beta",
      "description": "There is a critical bug in Project Beta that needs immediate attention.",
      "priority": "High",
      "dueDate": "2024-12-15",
      "assignedTo": "t2",
      "status": "In Progress"
    },
    {
      "taskId": "t3",
      "taskName": "Prepare Report for Project Gamma",
      "description": "The final report for Project Gamma needs to be prepared by the end of this week.",
      "priority": "Medium",
      "dueDate": "2024-12-12",
      "assignedTo": "t3",
      "status": "Pending"
    },
    {
      "taskId": "t4",
      "taskName": "Review Code for Project Delta",
      "description": "Code review for Project Delta is due and must be completed by the team.",
      "priority": "Medium",
      "dueDate": "2024-12-08",
      "assignedTo": "t1",
      "status": "Completed"
    }
  ]


  const newComment = [
    {
      commentId: "c1",
      taskId: "t1",
      commentText: "This task is very urgent and must be prioritized.",
      author: {
        userId: "u1",
        name: "John Doe",
        image: "https://via.placeholder.com/150"
      },
      createdAt: "2024-12-05T14:30:00Z"
    },
    {
      commentId: "c2",
      taskId: "t2",
      commentText: "We should focus on this task after the current sprint.",
      author: {
        userId: "u2",
        name: "Jane Smith",
        image: ""
      },
      createdAt: "2024-12-04T10:15:00Z"
    },
    {
      commentId: "c3",
      taskId: "t1",
      commentText: "Please ensure all dependencies are resolved before proceeding.",
      author: {
        userId: "u3",
        name: "Michael Lee",
        image: "https://via.placeholder.com/150"
      },
      createdAt: "2024-12-03T16:45:00Z"
    }
  ];


  const teamDir = [
    {
      userId: "u1",
      name: "John Doe",
      role: "Frontend Developer",
      photo: "https://via.placeholder.com/150"
    },
    {
      userId: "u2",
      name: "Jane Smith",
      role: "Backend Developer",
      photo: ""
    },
    {
      userId: "u3",
      name: "Michael Lee",
      role: "Project Manager",
      photo: "https://via.placeholder.com/150"
    }
  ]

  const agenda = [
    {
      "agendaId": "a1",
      "taskTitle": "Complete Project Alpha Report",
      "description": "Finish compiling the final report for Project Alpha before the deadline.",
      "time": "2024-12-08T14:00:00Z",
      "project": "Project Alpha"
    },
    {
      "agendaId": "a2",
      "taskTitle": "Design User Interface for Project Beta",
      "description": "Create the initial mockups and user interface designs for Project Beta.",
      "time": "2024-12-09T10:00:00Z",
      "project": "Project Beta"
    },
    {
      "agendaId": "a3",
      "taskTitle": "Review Project Gamma Progress",
      "description": "Assess the current progress and provide feedback on Project Gamma.",
      "time": "2024-12-10T15:30:00Z",
      "project": "Project Gamma"
    }
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Card1 agenda={agenda}/>
          </Grid>

          <Grid item>
            <Card2 projects={Project} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Card3 urgentTask={urgentTask} />
          </Grid>

          <Grid item>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card4_1 comments={newComment} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Card4_2 teamData={teamDir} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Home
