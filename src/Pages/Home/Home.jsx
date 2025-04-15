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
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [isLoding, setIsLoding] = useState(false);
  const navigate = useNavigate();
  const { fetchTaskData } = TaskAPiCallWithFormat();
  const task = useRecoilValue(TaskData);
  const [meetings, setMeetings] = React.useState(null);
  const [prTasksList, setPrTasksList] = useState(null);
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

  const fetchTaskAPiData = async () => {
    setIsLoding(true);
    try {
      await fetchTaskData();
    } catch (error) {
      console.error("Error fetching task data:", error);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    setIsLoding(true);
    handleMeetingbyLogin();
    fetchTaskAPiData();
  }, [])

  useEffect(() => {
    setPrTasksList(flattenTasks(task));
  }, [task]);

  let profileData = JSON?.parse(localStorage.getItem("UserProfileData") || "[]");

  let prFilterData = prTasksList?.filter((task) => {
    return typeof task?.priority === 'string' && task.priority.toLowerCase().trim() === "high" && task?.assignee?.some((assignee) => assignee.id == profileData?.id);
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SummaryDashnoard />
        </Grid>
        <Grid item xs={12} md={5}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Agenda agenda={meetings} navigate={navigate} isLoding={isLoding}/>
            </Grid>

            <Grid item>
              <Projects projects={Project} navigate={navigate} isLoding={isLoding}/>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={7}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <UrgentTask urgentTask={prFilterData} navigate={navigate} isLoding={isLoding}/>
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
