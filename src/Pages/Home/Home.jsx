import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import Agenda from './Agenda'
import Projects from './Projects'
import UrgentTask from './UrgentTasks'
import Card4_1 from './Comments'
import Card4_2 from './Teams'
import './homePage.scss'
import SummaryDashnoard from './TaskSummary'
import { fetchMettingListByLoginApi } from '../../Api/MeetingApi/MeetingListApi'
import TaskAPiCallWithFormat from '../../Utils/TaskList/TaskAPiCallWithFormat'
import { TaskData } from '../../Recoil/atom'
import { useRecoilValue } from 'recoil'
import { flattenTasks } from '../../Utils/globalfun'

const Home = () => {
  const { fetchTaskData } = TaskAPiCallWithFormat();
  const task = useRecoilValue(TaskData);
  console.log('task: ', task);
  const [isLoding, setIsLoding] = React.useState(false);
  const [meetings, setMeetings] = React.useState([]);
  const [prTasksList, setPrTasksList] = useState([]);
  console.log('prTasksList: ', prTasksList);
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
          "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/10.png"
        },
        {
          "userId": "t2",
          "name": "Jane Smith",
          "role": "Backend Developer",
          "avatar": "	https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/3.png"
        },
        {
          "userId": "t3",
          "name": "Michael Lee",
          "role": "Project Manager",
          "avatar": "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/2.png"
        },
        {
          "userId": "t4",
          "name": "Alice Brown",
          "role": "UI/UX Designer",
          "avatar": "URL_ADDRESS"
        },
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

  const handleMeetingbyLogin = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi();
      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON.parse(sessionStorage.getItem("taskAssigneeData") || "[]");
      const topFiveMeetings = data?.slice(0, 5);
      const currentTime = new Date();
      const enhancedMeetings = topFiveMeetings?.map((meeting) => {
        const meetingTime = new Date(meeting.StartDate);
        const isOverdue = meetingTime < currentTime;

        return {
          ...meeting,
          guests: taskAssigneeData.filter((user) =>
            meeting?.assigneids?.split(",").map(Number).includes(user.id)
          ) || [],
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          isOverdue: isOverdue
        };
      });

      setMeetings(enhancedMeetings);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleProjectFun = () => {

  }

  useEffect(() => {
    handleMeetingbyLogin();
    fetchTaskData();
  }, [])

  useEffect(() => {
    setPrTasksList(flattenTasks(task));
  }, [task]);

  let profileData = JSON?.parse(localStorage.getItem("UserProfileData") || "[]");

  let prFilterData = prTasksList?.filter((task) => {
    return typeof task?.priority === 'string' && task.priority.toLowerCase().trim() === "high" && task?.assignee?.some((assignee) => assignee.id == profileData?.id);
  });
  console.log('prTasksList: ', prTasksList);
  console.log('prFilterData: ', prFilterData);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SummaryDashnoard />
        </Grid>
        <Grid item xs={12} md={5}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Agenda agenda={meetings} />
            </Grid>

            <Grid item>
              <Projects projects={Project} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={7}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <UrgentTask urgentTask={prFilterData} />
            </Grid>

            {/* <Grid item>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card4_1 comments={newComment} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card4_2 teamData={teamDir} />
                </Grid>
              </Grid>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Home
