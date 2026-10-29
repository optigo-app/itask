import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Grid, Box, Typography, Button, ToggleButtonGroup, ToggleButton, IconButton, Tooltip } from '@mui/material';
import { Plus, CalendarDays, Layers, ListChecks, ChevronsDown, ChevronsUp } from 'lucide-react';

import Agenda from './Agenda';
import './homePage.scss';
import { fetchMettingListByLoginApi } from '../../Api/MeetingApi/MeetingListApi';
import TaskAPiCallWithFormat from '../../Utils/TaskList/TaskAPiCallWithFormat';
import { TaskData } from '../../Recoil/atom';
import { useRecoilValue } from 'recoil';
import { flattenTasks, getUserProfileData, showNotification, getDaysFromDeadline } from '../../Utils/globalfun';
import { useTabStore } from '../../Store/useTabStore';
import { useLocation } from 'react-router-dom';
import useSafeRedirect from '../../Utils/useSafeRedirect';

const UrgentTask = React.lazy(() => import('./UrgentTasks'));
const SummaryDashnoard = React.lazy(() => import('./TaskSummary'));
const Projects = React.lazy(() => import('./Projects'));
const MyDay = React.lazy(() => import('./MyDay'));
const BugsOverview = React.lazy(() => import('./BugsOverview'));
const TeamWorkload = React.lazy(() => import('./TeamWorkload'));
const ProjectHealth = React.lazy(() => import('./ProjectHealth'));
const BlockersBoard = React.lazy(() => import('./BlockersBoard'));
const UnassignedPool = React.lazy(() => import('./UnassignedPool'));

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
  const navigate = useSafeRedirect();
  const location = useLocation();
  const { fetchTaskData } = TaskAPiCallWithFormat();
  const task = useRecoilValue(TaskData);

  const [isLoding, setIsLoding] = useState(false);
  const [meetings, setMeetings] = useState(null);
  const [prTasksList, setPrTasksList] = useState(null);
  const [summaryView, setSummaryView] = useState('category');
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [summaryHidden, setSummaryHidden] = useState(0);
  const reminderIntervals = useRef({});

  const handleMeetingbyLogin = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi();
      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
      const taskStatusData = JSON.parse(localStorage.getItem('taskstatusData') || '[]');
      const topMeetings = data?.slice(0, 8);
      const currentTime = new Date();
      const todayStr = currentTime.toISOString().split('T')[0];

      const shownMeetings = getSessionArray('shownOverdueMeetings');
      const activeReminders = getSessionArray('activeReminders');

      const enhancedMeetings = topMeetings?.map((meeting) => {
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
          isToday,
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
  }, [location]);

  useEffect(() => {
    setPrTasksList(flattenTasks(task));
  }, [task]);

  const profileData = getUserProfileData();
  const isAdmin = (profileData?.designation || '').toLowerCase() === 'admin';

  const isDoneTask = (t) => (t?.status || '').toLowerCase() === 'completed' || t?.progress_per === 100;
  const isTaskOverdue = (t) => { const d = getDaysFromDeadline(t?.DeadLineDate); return d !== null && d < 0; };

  // Admin dashboard aggregates — computed once over the full flat task list
  const adminData = useMemo(() => {
    const empty = { teamWorkload: [], blockers: [], unassigned: [], projectHealth: [] };
    if (!isAdmin) return empty;
    const all = prTasksList || [];

    // Team workload — open task count + overdue count per assignee
    const wl = new Map();
    all.forEach((t) => {
      if (isDoneTask(t)) return;
      (t?.assignee || []).forEach((a) => {
        if (!a?.id) return;
        const e = wl.get(a.id) || { assignee: a, total: 0, overdue: 0 };
        e.total += 1;
        if (isTaskOverdue(t)) e.overdue += 1;
        wl.set(a.id, e);
      });
    });
    const teamWorkload = [...wl.values()].sort((a, b) => b.total - a.total).slice(0, 8);

    const blockers = all.filter((t) => t?.isblocker == 1 && !isDoneTask(t)).slice(0, 8);
    const unassigned = all.filter((t) => !(t?.assignee?.length) && !isDoneTask(t)).slice(0, 8);

    // Project health — done/total + overdue per project
    const ph = new Map();
    all.forEach((t) => {
      const pid = t?.projectid;
      if (!pid) return;
      const e = ph.get(pid) || { name: t?.taskPr || `Project ${pid}`, projectid: pid, total: 0, done: 0, overdue: 0 };
      e.total += 1;
      if (isDoneTask(t)) e.done += 1;
      else if (isTaskOverdue(t)) e.overdue += 1;
      ph.set(pid, e);
    });
    const projectHealth = [...ph.values()]
      .map((p) => ({ ...p, pct: p.total ? Math.round((p.done / p.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return { teamWorkload, blockers, unassigned, projectHealth };
  }, [prTasksList, isAdmin]);

  const prFilterData = prTasksList
    ?.filter((task) => {
      return (
        typeof task?.priority === 'string' &&
        (task.priority.toLowerCase().trim() === 'urgent' ||
          task.priority.toLowerCase().trim() === 'high') &&
        task?.assignee?.some((assignee) => assignee.id === profileData?.id)
      );
    })
    ?.slice(0, 8);

  // My Day — my tasks due today or overdue (not completed), overdue first
  const myDayTasks = prTasksList
    ?.filter((task) => {
      const days = getDaysFromDeadline(task?.DeadLineDate);
      return (
        days !== null &&
        days <= 0 &&
        (task?.status || '').toLowerCase() !== 'completed' &&
        task?.assignee?.some((assignee) => assignee.id === profileData?.id)
      );
    })
    ?.sort((a, b) => getDaysFromDeadline(a?.DeadLineDate) - getDaysFromDeadline(b?.DeadLineDate))
    ?.slice(0, 8);

  // taskid -> task lookup over the whole flat list (all levels present)
  const taskById = useMemo(() => {
    const map = new Map();
    prTasksList?.forEach((t) => map.set(Number(t?.taskid), t));
    return map;
  }, [prTasksList]);

  // QUICKLIST rows carry parentid but not RootTaskId/breadcrumbTitles —
  // walk the parent chain to the root module (parentid === 0).
  const resolveRootTask = (task) => {
    let current = task;
    let guard = 0;
    while (current?.parentid && Number(current.parentid) !== 0 && guard++ < 20) {
      const parent = taskById.get(Number(current.parentid));
      if (!parent) break;
      current = parent;
    }
    return current || task;
  };

  // Open the ROOT module's tab — same payload as a manual module click in
  // TaskTableList, so it dedups with an existing module tab.
  const handleTaskClick = (task) => {
    const root = resolveRootTask(task);
    const urlData = {
      module: root?.taskname || task?.taskname,
      project: root?.taskPr || task?.taskPr,
      taskid: root?.taskid,
      projectid: root?.projectid || task?.projectid,
      moduleid: root?.taskid,
      maingroupids: root?.maingroupids || task?.maingroupids,
      isLimited: 0,
      isreadonly: 0,
      breadcrumbTitles: root?.taskname ? [root.taskname] : undefined,
      // clicked task name → seeded as the module tab's search filter so the
      // subtask is findable inside large module datasets
      searchtask: task?.taskname,
    };
    useTabStore.getState().openTaskTab({
      title: root?.taskname || task?.taskname || 'Tasks',
      route: '/tasks',
      queryData: urlData,
    });
    navigate('/tasks');
  };

  const hour = new Date().getHours();
  // time-aware greeting + animated icon: sunrise → sun → sunset → moon
  const dayPart =
    hour >= 5 && hour < 12 ? 'Morning' :
    hour >= 12 && hour < 17 ? 'Afternoon' :
    hour >= 17 && hour < 21 ? 'Evening' : 'Night';
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box className="greetingBox">
          <Box>
            <Typography className="greetingTitle">
              Good {dayPart}, <span className="greetingName">{profileData?.firstname || 'there'}</span>
            </Typography>
            <Typography className="greetingSub">
              {todayLabel}
              {meetings?.length > 0 && ` · ${meetings.length} meeting${meetings.length > 1 ? 's' : ''} scheduled`}
              {isAdmin ? (
                <>
                  {adminData.blockers?.length > 0 && ` · ${adminData.blockers.length} blocker${adminData.blockers.length > 1 ? 's' : ''}`}
                  {adminData.unassigned?.length > 0 && ` · ${adminData.unassigned.length} unassigned`}
                </>
              ) : (
                <>
                  {prFilterData?.length > 0 && ` · ${prFilterData.length} urgent task${prFilterData.length > 1 ? 's' : ''}`}
                  {myDayTasks?.length > 0 && ` · ${myDayTasks.length} due today/overdue`}
                </>
              )}
            </Typography>
          </Box>
          <Box className="greetingActions">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={summaryView}
              onChange={(e, v) => v && setSummaryView(v)}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                padding: "3px",
                gap: "3px",
                "& .MuiToggleButton-root": {
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#666",
                  border: "none",
                  borderRadius: "8px",
                  lineHeight: 1.2,
                  padding: "6px 16px",
                  minHeight: "34px",
                  textTransform: "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.7)" },
                  "&.Mui-selected": {
                    backgroundColor: "#fff",
                    color: "#000",
                    fontWeight: 600,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    "&:hover": { backgroundColor: "#fff" },
                  },
                },
              }}
            >
              <ToggleButton value="category">
                <Layers size={17} />
                Category
              </ToggleButton>
              <ToggleButton value="status">
                <ListChecks size={17} />
                Status
              </ToggleButton>
            </ToggleButtonGroup>
            {summaryHidden > 0 && (
              <Tooltip title={summaryExpanded ? 'Show less' : `Show ${summaryHidden} more`} arrow>
                <IconButton
                  size="small"
                  onClick={() => setSummaryExpanded((e) => !e)}
                  sx={{
                    backgroundColor: '#f5f3ff',
                    color: '#7367f0',
                    borderRadius: '8px',
                    width: 34,
                    height: 34,
                    '&:hover': { backgroundColor: '#ede9fe' },
                  }}
                >
                  {summaryExpanded ? <ChevronsUp size={18} /> : <ChevronsDown size={18} />}
                </IconButton>
              </Tooltip>
            )}
            <Button
              variant="outlined"
              size="small"
              className="quickActionBtn"
              startIcon={<CalendarDays size={15} />}
              onClick={() => navigate('/meetings')}
            >
              Meeting
            </Button>
            <Button
              variant="contained"
              size="small"
              className="buttonClassname"
              startIcon={<Plus size={15} />}
              onClick={() => navigate('/tasks')}
            >
              Task
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <React.Suspense fallback={<div></div>}>
          <SummaryDashnoard view={summaryView} expanded={summaryExpanded} onMetaChange={setSummaryHidden} />
        </React.Suspense>
      </Grid>
      {isAdmin ? (
        <>
          <Grid item xs={12} md={5} spacing={2}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <TeamWorkload rows={adminData.teamWorkload} isLoding={isLoding} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <ProjectHealth projects={adminData.projectHealth} navigate={navigate} isLoding={isLoding} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <BugsOverview navigate={navigate} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Agenda agenda={meetings} navigate={navigate} isLoding={isLoding} />
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <BlockersBoard tasks={adminData.blockers} navigate={navigate} isLoding={isLoding} onTaskClick={handleTaskClick} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <UnassignedPool tasks={adminData.unassigned} navigate={navigate} isLoding={isLoding} onTaskClick={handleTaskClick} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} md={5} spacing={2}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Agenda agenda={meetings} navigate={navigate} isLoding={isLoding} />
              </Grid>
              <Grid item>
                <Projects projects={prTasksList} navigate={navigate} isLoding={isLoding} />
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <BugsOverview navigate={navigate} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <MyDay tasks={myDayTasks} navigate={navigate} isLoding={isLoding} onTaskClick={handleTaskClick} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<div></div>}>
                  <UrgentTask urgentTask={prFilterData} navigate={navigate} isLoding={isLoding} onTaskClick={handleTaskClick} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Home;
