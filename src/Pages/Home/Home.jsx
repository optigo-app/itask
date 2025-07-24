import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import Agenda from './Agenda'
import './homePage.scss'
import { fetchMettingListByLoginApi } from '../../Api/MeetingApi/MeetingListApi'
import TaskAPiCallWithFormat from '../../Utils/TaskList/TaskAPiCallWithFormat'
import { TaskData } from '../../Recoil/atom'
import { useRecoilValue } from 'recoil'
import { flattenTasks } from '../../Utils/globalfun'
import { useNavigate } from 'react-router-dom'

const UrgentTask = React.lazy(() => import('./UrgentTasks'));
const SummaryDashnoard = React.lazy(() => import('./TaskSummary'));

const Home = () => {
  const [isLoding, setIsLoding] = useState(false);
  const navigate = useNavigate();
  const { fetchTaskData } = TaskAPiCallWithFormat();
  const task = useRecoilValue(TaskData);
  const [meetings, setMeetings] = React.useState(null);
  const [prTasksList, setPrTasksList] = useState(null);

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

  let profileData = JSON?.parse(localStorage.getItem("UserProfileData"));

  let prFilterData = prTasksList
    ?.filter((task) => {
      return (
        typeof task?.priority === 'string' &&
        task.priority.toLowerCase().trim() === "urgent" &&
        task?.assignee?.some((assignee) => assignee.id == profileData?.id)
      );
    })
    .slice(0, 10);


  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <React.Suspense fallback={<div></div>}>
            <SummaryDashnoard />
          </React.Suspense>
        </Grid>
        <Grid item xs={12} md={5}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Agenda agenda={meetings} navigate={navigate} isLoding={isLoding} />
            </Grid>

            {/* <Grid item>
              <Projects projects={Project} navigate={navigate} isLoding={isLoding} />
            </Grid> */}
          </Grid>
        </Grid>
        {prFilterData?.length > 0 &&
          <Grid item xs={12} md={7}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <UrgentTask urgentTask={prFilterData} navigate={navigate} isLoding={isLoding} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
        }
      </Grid>
    </>
  )
}

export default Home
