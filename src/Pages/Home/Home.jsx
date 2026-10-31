import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Grid, Box, Typography, Button, ToggleButtonGroup, ToggleButton, IconButton, Tooltip, Card, CardContent } from '@mui/material';
import { Plus, CalendarDays, Layers, ListChecks, ChevronsDown, ChevronsUp } from 'lucide-react';

import Agenda from './Agenda';
import RowSkeleton from './RowSkeleton';
import './homePage.scss';
import { fetchMettingListByLoginApi } from '../../Api/MeetingApi/MeetingListApi';
import { fetchAdminDashboardApi } from '../../Api/TaskApi/AdminDashboardApi';
import { setTabDataCache, getTabDataCache } from '../../Utils/IndexedDB/taskDataCache';
import TaskAPiCallWithFormat from '../../Utils/TaskList/TaskAPiCallWithFormat';
import { TaskData } from '../../Recoil/atom';
import { useRecoilValue } from 'recoil';
import { flattenTasks, getUserProfileData, showNotification, getDaysFromDeadline, cleanDate } from '../../Utils/globalfun';
import { useTabStore } from '../../Store/useTabStore';
import { useLocation } from 'react-router-dom';
import useSafeRedirect from '../../Utils/useSafeRedirect';

const UrgentTask = React.lazy(() => import('./UrgentTasks'));
const SummaryDashnoard = React.lazy(() => import('./TaskSummary'));
const Projects = React.lazy(() => import('./Projects'));
const MyDay = React.lazy(() => import('./MyDay'));
const BugsOverview = React.lazy(() => import('./BugsOverview'));
const TeamWorkload = React.lazy(() => import('./TeamWorkload'));
const TeamToday = React.lazy(() => import('./TeamToday'));
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
  const [adminRows, setAdminRows] = useState(null);
  const [summaryView, setSummaryView] = useState('category');
  const [myDayMode, setMyDayMode] = useState('start');
  const [teamTodayMode, setTeamTodayMode] = useState('start');
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [summaryHidden, setSummaryHidden] = useState(0);
  const reminderIntervals = useRef({});

  const handleMeetingbyLogin = async () => {
    setIsLoding(true);
    try {
      // Agenda is this week only — today through the next 6 days.
      // API response cached in IndexedDB (5 min) so repeated Home visits
      // skip the call; enhancement still runs fresh each time.
      const cachedMeetings = await getTabDataCache(MEETINGS_CACHE_KEY);
      let meetingApiRes;
      if (cachedMeetings?.data && Date.now() - cachedMeetings.cachedAt < HOME_CACHE_TTL) {
        meetingApiRes = cachedMeetings.data;
      } else {
        const fmtDay = (d) => d.toISOString().slice(0, 10);
        const weekTo = new Date();
        weekTo.setDate(weekTo.getDate() + 6);
        meetingApiRes = await fetchMettingListByLoginApi(null, {
          startdatefrom: fmtDay(new Date()),
          startdateto: fmtDay(weekTo),
        });
        setTabDataCache('home', MEETINGS_CACHE_KEY, meetingApiRes || {});
      }
      const taskAssigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
      const taskStatusData = JSON.parse(localStorage.getItem('taskstatusData') || '[]');
      const taskWorkCategoryData = JSON.parse(sessionStorage.getItem('taskworkcategoryData') || localStorage.getItem('taskworkcategoryData') || '[]');
      // Agenda shows only Meeting-category records — meetings linked to
      // maintenance/other-category tasks are filtered out
      const meetingCatIds = new Set(
        taskWorkCategoryData
          .filter((c) => (c?.labelname || '').trim().toLowerCase() === 'meeting')
          .map((c) => Number(c.id))
      );
      const data = meetingCatIds.size > 0
        ? (meetingApiRes?.rd || []).filter((m) => meetingCatIds.has(Number(m?.workcategoryid)))
        : (meetingApiRes?.rd || []);
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
      setMeetings([]); // settle — error must not hold pageLoading forever
    } finally {
      setIsLoding(false);
    }
  };

  const fetchTaskAPiData = async () => {
    // TaskData atom survives route changes — skip the API when it already
    // has data fetched inside the TTL window.
    const lastTs = Number(sessionStorage.getItem('homeTaskFetchTs') || 0);
    if (task?.length && Date.now() - lastTs < HOME_CACHE_TTL) return;
    setIsLoding(true);
    try {
      await fetchTaskData();
      sessionStorage.setItem('homeTaskFetchTs', String(Date.now()));
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setIsLoding(false);
    }
  };

  // Admin dashboard aggregates come ready-made from the SP (mode='admindashboard')
  // — no full tasklist/treelist download needed.
  const ADMIN_DASH_CACHE_KEY = 'admin_dashboard_v2';
  const MEETINGS_CACHE_KEY = 'meetings';
  const HOME_CACHE_TTL = 5 * 60 * 1000; // 5 min

  const fetchAdminDash = async () => {
    try {
      // Serve from IndexedDB cache on repeated Home visits — skip the API
      // when the snapshot is fresh; otherwise fetch and refresh the cache.
      const cached = await getTabDataCache(ADMIN_DASH_CACHE_KEY);
      if (cached?.data && Date.now() - cached.cachedAt < HOME_CACHE_TTL) {
        setAdminRows(cached.data);
        return;
      }
      const res = await fetchAdminDashboardApi();
      setAdminRows(res || {});
      setTabDataCache('admin_home', ADMIN_DASH_CACHE_KEY, res || {});
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    }
  };

  const profileData = getUserProfileData();
  const isAdmin = (profileData?.designation || '').toLowerCase() === 'admin';

  useEffect(() => {
    setIsLoding(true);
    handleMeetingbyLogin();
    // admin aggregates come from the admindashboard SP — the tasklist call
    // (user-bound data) is only needed for the non-admin cards
    if (isAdmin) {
      fetchAdminDash();
    } else {
      fetchTaskAPiData();
    }
  }, [location]);

  useEffect(() => {
    setPrTasksList(flattenTasks(task));
  }, [task]);

  // wait for every source — meetings + task list (or admin rows for admins)
  // + in-flight fetches — before any card leaves its skeleton (no pop-in)
  const pageLoading = isAdmin
    ? isLoding || meetings === null || adminRows === null
    : isLoding || prTasksList === null || meetings === null;
  const meetingsLoading = meetings === null; // agenda tracks only its own fetch

  // Admin dashboard aggregates — computed SP-side; here we only attach
  // display names (assignee objects, project labels) from master data.
  const adminData = useMemo(() => {
    const empty = { teamWorkload: [], blockers: [], unassigned: [], projectHealth: [], blockerTotal: 0, unassignedTotal: 0 };
    if (!isAdmin || !adminRows) return empty;
    const taskAssigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
    const taskProjectData = JSON.parse(sessionStorage.getItem('taskprojectData') || localStorage.getItem('taskprojectData') || '[]');

    const mapAssignees = (csv) =>
      (csv || '').split(',').map(Number).filter(Boolean)
        .map((id) => taskAssigneeData.find((u) => u.id === id))
        .filter(Boolean);

    const enhanceRow = (r) => ({
      ...r,
      assignee: mapAssignees(r?.assigneids),
      taskPr: taskProjectData.find((p) => p.id == r?.projectid)?.labelname || '',
      roottaskPr: taskProjectData.find((p) => p.id == r?.rootprojectid)?.labelname || '',
    });

    const teamWorkload = (adminRows?.rd || [])
      .map((w) => ({
        assignee: taskAssigneeData.find((u) => u.id == w?.assigneeid),
        total: w?.total ?? 0,
        overdue: w?.overdue ?? 0,
        today: w?.duetoday ?? 0,
        week: w?.dueweek ?? 0,
        month: w?.duemonth ?? 0,
        year: w?.dueyear ?? 0,
        startToday: w?.starttoday ?? 0,
      }))
      .filter((w) => w.assignee);

    const projectHealth = (adminRows?.rd1 || []).map((p) => ({
      ...p,
      name: taskProjectData.find((pr) => pr.id == p?.projectid)?.labelname || `Project ${p?.projectid}`,
      pct: p?.total ? Math.round((p.done / p.total) * 100) : 0,
    }));

    const blockers = (adminRows?.rd2 || []).map(enhanceRow);
    const unassigned = (adminRows?.rd3 || []).map(enhanceRow);

    return {
      teamWorkload,
      blockers,
      unassigned,
      projectHealth,
      blockerTotal: adminRows?.rd4?.[0]?.blockers ?? blockers.length,
      unassignedTotal: adminRows?.rd4?.[0]?.unassigned ?? unassigned.length,
    };
  }, [adminRows, isAdmin]);

  // Team Today (admin) — per-employee today-task count. Mode switches between
  // StartDate-today and DeadLineDate-today; row click opens /myTasks filtered.
  const teamToday = useMemo(() => {
    if (!isAdmin) return [];
    return (adminData.teamWorkload || [])
      .map((w) => ({
        assignee: w.assignee,
        count: teamTodayMode === 'start' ? w.startToday : w.today,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [adminData, teamTodayMode, isAdmin]);

  // Urgent Tasks — my (assignee or creator) very-high priority
  // tasks due this week or already overdue
  const prFilterData = prTasksList
    ?.filter((task) => {
      const isMine = task?.assignee?.some((assignee) => assignee.id === profileData?.id)
        || Number(task?.createdbyid) === Number(profileData?.id);
      const p = typeof task?.priority === 'string' ? task.priority.toLowerCase().trim() : '';
      const days = getDaysFromDeadline(task?.DeadLineDate);
      return (
        p === 'very high' &&
        days !== null &&
        days <= 6 &&
        isMine
      );
    })
    ?.slice(0, 8);

  // My Day — child tasks only (parentid>0, not module roots). "Start" mode:
  // start date is today; "Deadline" mode: due today or already overdue.
  // Mine = I'm an assignee OR I created the task.
  const myDayTasks = prTasksList
    ?.filter((task) => {
      if (Number(task?.parentid) <= 0) return false;
      const isMine = task?.assignee?.some((a) => a.id === profileData?.id)
        || Number(task?.createdbyid) === Number(profileData?.id);
      if (!isMine) return false;
      if ((task?.status || '').toLowerCase() === 'completed') return false;
      if (myDayMode === 'start') {
        const c = task?.StartDate && cleanDate(task.StartDate);
        if (!c) return false;
        const d = new Date(c), n = new Date();
        return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
      }
      const days = getDaysFromDeadline(task?.DeadLineDate);
      return days !== null && days <= 0;
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
    // admindashboard/today rows carry the root module inline — no parent walk needed
    const inlineRootId = task?.roottaskid || task?.RootTaskId;
    const root = inlineRootId
      ? {
          taskid: inlineRootId,
          taskname: task.roottaskname,
          projectid: task.rootprojectid || task?.projectid,
          maingroupids: task.rootmaingroupids || task?.maingroupids,
          taskPr: task.roottaskPr,
        }
      : resolveRootTask(task);
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
                  {adminData.blockerTotal > 0 && ` · ${adminData.blockerTotal} blocker${adminData.blockerTotal > 1 ? 's' : ''}`}
                  {adminData.unassignedTotal > 0 && ` · ${adminData.unassignedTotal} unassigned`}
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
        <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
          <SummaryDashnoard view={summaryView} expanded={summaryExpanded} onMetaChange={setSummaryHidden} />
        </React.Suspense>
      </Grid>
      {isAdmin ? (
        <>
          <Grid item xs={12} md={5} spacing={2}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <TeamWorkload rows={adminData.teamWorkload} isLoding={pageLoading} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <ProjectHealth projects={adminData.projectHealth} navigate={navigate} isLoding={pageLoading} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <BugsOverview navigate={navigate} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Agenda agenda={meetings} navigate={navigate} isLoding={pageLoading} />
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <TeamToday rows={teamToday} mode={teamTodayMode} onModeChange={setTeamTodayMode} isLoding={pageLoading} navigate={navigate} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <BlockersBoard tasks={adminData.blockers} totalCount={adminData.blockerTotal} navigate={navigate} isLoding={pageLoading} onTaskClick={handleTaskClick} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <UnassignedPool tasks={adminData.unassigned} totalCount={adminData.unassignedTotal} navigate={navigate} isLoding={pageLoading} onTaskClick={handleTaskClick} />
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
                <Agenda agenda={meetings} navigate={navigate} isLoding={pageLoading} />
              </Grid>
              <Grid item>
                <Projects projects={prTasksList} navigate={navigate} isLoding={pageLoading} />
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <BugsOverview navigate={navigate} />
                </React.Suspense>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <MyDay tasks={myDayTasks} navigate={navigate} isLoding={pageLoading} onTaskClick={handleTaskClick} mode={myDayMode} onModeChange={setMyDayMode} />
                </React.Suspense>
              </Grid>
              <Grid item>
                <React.Suspense fallback={<Card className="HomePageCom"><CardContent><RowSkeleton rows={4} chips={2} /></CardContent></Card>}>
                  <UrgentTask urgentTask={prFilterData} navigate={navigate} isLoding={pageLoading} onTaskClick={handleTaskClick} />
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
