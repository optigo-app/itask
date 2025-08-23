import React, { useEffect, useState, useRef } from 'react';
import { Grid } from '@mui/material';
import Agenda from './Agenda';
import './homePage.scss';
import { fetchMettingListByLoginApi } from '../../Api/MeetingApi/MeetingListApi';
import TaskAPiCallWithFormat from '../../Utils/TaskList/TaskAPiCallWithFormat';
import { TaskData } from '../../Recoil/atom';
import { useRecoilValue } from 'recoil';
import { flattenTasks, showNotification } from '../../Utils/globalfun';
import { useLocation, useNavigate } from 'react-router-dom';

const UrgentTask = React.lazy(() => import('./UrgentTasks'));
const SummaryDashnoard = React.lazy(() => import('./TaskSummary'));
const Projects = React.lazy(() => import('./Projects'));

const getSessionArray = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const addToSessionArray = (key, value) => {
  const existing = getSessionArray(key);
  if (!existing.includes(value)) {
    existing.push(value);
    sessionStorage.setItem(key, JSON.stringify(existing));
  }
};

const removeFromSessionArray = (key, value) => {
  const existing = getSessionArray(key);
  const updated = existing.filter((item) => item !== value);
  sessionStorage.setItem(key, JSON.stringify(updated));
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchTaskData } = TaskAPiCallWithFormat();
  const task = useRecoilValue(TaskData);

  const [isLoding, setIsLoding] = useState(false);
  const [meetings, setMeetings] = useState(null);
  const [prTasksList, setPrTasksList] = useState(null);
  const reminderIntervals = useRef({});

  const handleMeetingbyLogin = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi();
      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
      const taskStatusData = JSON.parse(sessionStorage.getItem('taskstatusData') || '[]');
      const topFiveMeetings = data?.slice(0, 5);
      const currentTime = new Date();
      const todayStr = currentTime.toISOString().split('T')[0];

      const shownMeetings = getSessionArray('shownOverdueMeetings');
      const activeReminders = getSessionArray('activeReminders');

      const enhancedMeetings = topFiveMeetings?.map((meeting) => {
        const meetingTime = new Date(meeting.StartDate);
        const isOverdue = meetingTime < currentTime;
        const isToday = meetingTime.toISOString().split('T')[0] === todayStr;
        const notificationId = `meeting-${meeting.meetingid}`;
        const isCompleted = meeting?.status?.toLowerCase() === 'completed';

        if (isOverdue && isToday && !shownMeetings.includes(notificationId) && !isCompleted) {
          showNotification({
            title: 'Overdue Meeting!',
            body: `Your meeting "${meeting.meetingtitle}" was scheduled today and is overdue.`,
            icon: '/logo192.png',
            url: location.pathname,
            status: meeting?.status,
            actions: [
              { action: 'open', title: 'View Task' },
              { action: 'dismiss', title: 'Dismiss' }
            ],
            onAction: (action) => {
              if (action === 'open') {
                navigate(`/task/${meeting.taskid}`);
                if (reminderIntervals.current[notificationId]) {
                  clearInterval(reminderIntervals.current[notificationId]);
                  delete reminderIntervals.current[notificationId];
                  removeFromSessionArray('activeReminders', notificationId);
                }
              }

              if (action === 'dismiss') {
                if (!activeReminders.includes(notificationId)) {
                  const interval = setInterval(() => {
                    showNotification({
                      title: 'Reminder',
                      body: `"${meeting.meetingtitle}" is still overdue.`,
                      icon: '/logo192.png',
                      url: location.pathname,
                      status: meeting?.status,
                      actions: [{ action: 'dismiss', title: 'Dismiss' }],
                      onAction: (act) => {
                        if (act === 'dismiss') {
                          clearInterval(reminderIntervals.current[notificationId]);
                          delete reminderIntervals.current[notificationId];
                          removeFromSessionArray('activeReminders', notificationId);
                        }
                      }
                    });
                  }, 1 * 60 * 1000); // 1 min
                  reminderIntervals.current[notificationId] = interval;
                  addToSessionArray('activeReminders', notificationId);
                }
              }
            }
          });
          addToSessionArray('shownOverdueMeetings', notificationId);
        }

        return {
          ...meeting,
          guests: taskAssigneeData.filter((user) =>
            meeting?.assigneids?.split(',').map(Number).includes(user.id)
          ) || [],
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          status: taskStatusData.find((item) => item.taskid === meeting.statusid)?.labelname,
          isOverdue,
        };
      });

      setMeetings(enhancedMeetings);
    } catch (error) {
      console.error('Error fetching meeting list:', error);
    } finally {
      setIsLoding(false);
    }
  };

  const fetchTaskAPiData = async () => {
    setIsLoding(true);
    try {
      await fetchTaskData();
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    setIsLoding(true);
    handleMeetingbyLogin();
    fetchTaskAPiData();
  }, []);

  useEffect(() => {
    setPrTasksList(flattenTasks(task));
  }, [task]);

  const profileData = JSON.parse(localStorage.getItem('UserProfileData'));

  const prFilterData = prTasksList
    ?.filter((task) => {
      return (
        typeof task?.priority === 'string' &&
        (task.priority.toLowerCase().trim() === 'urgent' ||
          task.priority.toLowerCase().trim() === 'high') &&
        task?.assignee?.some((assignee) => assignee.id === profileData?.id)
      );
    })
    ?.slice(0, 10);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <React.Suspense fallback={<div></div>}>
          <SummaryDashnoard />
        </React.Suspense>
      </Grid>
      <Grid item xs={12} md={5} spacing={2}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Agenda agenda={meetings} navigate={navigate} isLoding={isLoding} />
          </Grid>
          <Grid item>
            <Projects projects={prTasksList} navigate={navigate} isLoding={isLoding} />
          </Grid>
        </Grid>
      </Grid>
      {prFilterData?.length > 0 && (
        <Grid item xs={12} md={7}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <React.Suspense fallback={<div></div>}>
                <UrgentTask urgentTask={prFilterData} navigate={navigate} isLoding={isLoding} />
              </React.Suspense>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default Home;
