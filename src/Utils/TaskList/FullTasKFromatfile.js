import { useEffect, useMemo, useState } from "react";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import {
  fetchMasterGlFunc,
  mapKeyValuePair,
} from "../globalfun";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  actualTaskData,
  fetchlistApiCall,
  projectDatasRState,
  TaskData,
} from "../../Recoil/atom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const useFullTaskFormatFile = () => {
  const location = useLocation();
  const [iswhTLoading, setIsWhTLoading] = useState(null);
  const [iswhMLoading, setIsWhMLoading] = useState(null);
  const [taskFinalData, setTaskFinalData] = useState([]);
  const [actualData, setActualData] = useRecoilState(actualTaskData);
  const [priorityData, setPriorityData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [secStatusData, setSecStatusData] = useState([]);
  const [taskDepartment, setTaskDepartment] = useState([]);
  const [taskProject, setTaskProject] = useState([]);
  const [taskCategory, setTaskCategory] = useState([]);
  const [taskAssigneeData, setTaskAssigneeData] = useState([]);
  const callFetchTaskApi = useRecoilValue(fetchlistApiCall);
  const tasks = useRecoilValue(TaskData);
  const project = useRecoilValue(projectDatasRState);
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get("data");

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  const fetchMasterData = async () => {
    setIsWhMLoading(true);
    try {
      let storedStructuredData = sessionStorage.getItem("structuredMasterData");
      let structuredData = storedStructuredData
        ? JSON.parse(storedStructuredData)
        : null;
      if (!structuredData) {
        await fetchMasterGlFunc();
        storedStructuredData = sessionStorage.getItem("structuredMasterData");
        structuredData = storedStructuredData
          ? JSON.parse(storedStructuredData)
          : null;
      }
      if (structuredData) {
        retrieveAndSetData("taskstatusData", setStatusData);
        retrieveAndSetData("tasksecstatusData", setSecStatusData);
        retrieveAndSetData("taskpriorityData", setPriorityData);
        retrieveAndSetData("taskdepartmentData", setTaskDepartment);
        retrieveAndSetData("taskprojectData", setTaskProject);
        retrieveAndSetData("taskworkcategoryData", setTaskCategory);
        retrieveAndSetData("taskAssigneeData", setTaskAssigneeData);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsWhMLoading(false);
    }
  };

  const fetchTaskData = async () => {
    const filterCon = location?.pathname?.includes("/projects")
      ? project
      : tasks;
    if (filterCon?.length > 0) {
      setIsWhTLoading(false);
    } else {
      setIsWhTLoading(true);
    }
    let parsedData = null;
    if (encodedData) {
      const decodedString = decodeURIComponent(encodedData);
      const jsonString = atob(decodedString);
      parsedData = JSON.parse(jsonString);
    }
    try {
      const taskData = await fetchTaskDataFullApi(parsedData);
      if (taskData?.rd[0]?.stat == 0) {
        setIsWhTLoading(false);
        return toast.error(taskData?.rd[0]?.stat_msg);
      }
      const labeledTasks = mapKeyValuePair(taskData);
      const enhanceTask = (task) => {
        const priority = priorityData?.find(
          (item) => item?.id == task?.priorityid
        );
        const status = statusData?.find((item) => item?.id == task?.statusid);
        const secstatus = secStatusData?.find((item) => item?.id == task?.secstatusid);

        const project = taskProject?.find(
          (item) => item?.id == task?.projectid
        );
        const department = taskDepartment?.find(
          (item) => item?.id == task?.departmentid
        );
        const category = taskCategory?.find(
          (item) => item?.id == task?.workcategoryid
        );
        const assigneeIdArray = task?.assigneids
          ?.split(",")
          ?.map((id) => Number(id));
        const matchedAssignees = taskAssigneeData?.filter((user) =>
          assigneeIdArray?.includes(user.id)
        );
        return {
          ...task,
          priority: priority ? priority?.labelname : "",
          status: status ? status?.labelname : "",
          secStatus: secstatus ? secstatus?.labelname : "",
          taskPr: project ? project?.labelname : "",
          taskDpt: department ? department?.labelname : "",
          assignee: matchedAssignees ?? [],
          category: category?.labelname,
        };
      };
      const data = labeledTasks?.map((task) => enhanceTask(task));
      const finalTaskData = formatDataToTree(data, parsedData, 'Today');
      setTaskFinalData(finalTaskData);
      setActualData(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================================================== Format task Data =================================================================================================

  // Chunk 1: Category and Map Initialization
  const initializeMapsAndCategories = (taskCategory) => {
    const categoryMap = {};
    const category = {};

    taskCategory?.forEach((label) => {
      const key = label?.labelname?.toLowerCase()?.replace(/\s+/g, "_");
      categoryMap[label.id] = key;
      category[key] = [];
    });

    return { categoryMap, category };
  };

  // Chunk 2: Task Map and Team Members Processing
  const buildTaskMapAndTeamMembers = (data) => {
    const taskMap = new Map();
    const teamMembersMap = new Map();

    data?.forEach((task) => {
      task.subtasks = [];
      taskMap.set(task.taskid, task);

      if (task.assignee?.length > 0) {
        if (!teamMembersMap.has(task.projectid)) {
          teamMembersMap.set(task.projectid, new Map());
        }
        const projectMembers = teamMembersMap.get(task.projectid);

        task.assignee.forEach((member) => {
          if (member.id && member.firstname) {
            projectMembers.set(member.id, member);
          }
        });
      }
    });

    // Build subtask relationships
    data?.forEach((task) => {
      if (task.parentid !== 0) {
        const parent = taskMap.get(task.parentid);
        if (parent) parent.subtasks.push(task);
      }
    });

    return { taskMap, teamMembersMap };
  };

  // Chunk 3: Progress Calculation Utilities
  const calculateProgress = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const extractMilestoneTree = (task) => {
    const clone = { ...task };
    let completed = 0;
    let total = 1;

    if (task.status === "Completed") completed++;

    clone.subtasks = task?.subtasks?.map((child) => {
      if (child.ismilestone === 1) {
        return extractMilestoneTree(child);
      } else {
        total++;
        if (child.status === "Completed") completed++;
        return { statusid: child.statusid };
      }
    });

    clone.progress_per = calculateProgress(completed, total);
    return clone;
  };

  const TASK_TYPES = {
    MODULE: "module",
    MAJOR: "major",
    MINOR: "minor",
  };

  // Chunk 4: Category Tasks Collection with Optimization
  const collectCategoryTasks = (task, categoryMap, category, projectCategoryTasks, path = []) => {
    const categoryKey = categoryMap[task.workcategoryid];
    const projectId = task.projectid;
    const currentPath = [...path, task.taskname];

    task.breadcrumbTitles = currentPath;

    // ✅ Decide type based on parentId and children
    if (task.parentid === 0) {
      task.type = TASK_TYPES.MODULE;
    } else {
      const hasChildren = task.subtasks && task.subtasks.length > 0;
      task.type = hasChildren ? TASK_TYPES.MAJOR : TASK_TYPES.MINOR;
    }

    // Initialize totals
    let totals = {
      estimate_hrsT: task.estimate_hrs || 0,
      estimate1_hrsT: task.estimate1_hrs || 0,
      estimate2_hrsT: task.estimate2_hrs || 0,
      workingHrt: task.workinghr || 0,
      completed: task.status === "Completed" ? 1 : 0,
      total: 1
    };

    // Process subtasks recursively
    task.subtasks?.forEach((subtask) => {
      const childTotals = collectCategoryTasks(subtask, categoryMap, category, projectCategoryTasks, currentPath);

      // Aggregate totals
      Object.keys(totals).forEach(key => {
        totals[key] += childTotals[key];
      });
    });

    // Set calculated values
    Object.assign(task, {
      progress_per: calculateProgress(totals.completed, totals.total),
      isNotShowProgress: !task.subtasks || task.subtasks.length === 0,
      estimate_hrsT: totals.estimate_hrsT,
      estimate1_hrsT: totals.estimate1_hrsT,
      estimate2_hrsT: totals.estimate2_hrsT,
      workingHrt: totals.workingHrt,
    });

    // Category grouping
    if (categoryKey) {
      category[categoryKey].push(task);

      // Lazy initialization for project categories
      if (!projectCategoryTasks[projectId]) {
        projectCategoryTasks[projectId] = {};
      }
      if (!projectCategoryTasks[projectId][categoryKey]) {
        projectCategoryTasks[projectId][categoryKey] = [];
      }
      projectCategoryTasks[projectId][categoryKey].push(task);
    }

    return totals;
  };

  // Chunk 5: Milestone Processing
  const processMilestones = (data) => {
    const projectMilestoneData = {};
    const milestones = data?.filter(task => task.ismilestone === 1) || [];

    milestones.forEach((milestone) => {
      const projectId = milestone.projectid;
      if (!projectMilestoneData[projectId]) {
        projectMilestoneData[projectId] = [];
      }
      projectMilestoneData[projectId].push(extractMilestoneTree(milestone));
    });

    return projectMilestoneData;
  };

  // Chunk 6: Team Members Conversion
  const convertTeamMembers = (teamMembersMap) => {
    const TeamMembers = {};
    for (const [projectid, membersMap] of teamMembersMap.entries()) {
      TeamMembers[projectid] = Array.from(membersMap.values());
    }
    return TeamMembers;
  };

  // Chunk 7: Project Progress Calculation
  const calculateProjectProgress = (projectMilestoneData) => {
    const ProjectProgress = {};

    Object.entries(projectMilestoneData).forEach(([projectId, milestones]) => {
      const totalProgress = milestones.reduce((sum, m) => sum + (m.progress_per || 0), 0);
      ProjectProgress[projectId] = milestones.length > 0
        ? Math.round(totalProgress / milestones.length)
        : 0;
    });

    return ProjectProgress;
  };

  // Chunk 8: Module List Generation
  const generateModuleList = (TaskData, ProjectProgress) => {
    return TaskData?.map((module) => {
      const projectProgress = ProjectProgress[module.projectid] || 0;
      const { subtasks, ...moduleWithoutSubtasks } = module;

      return {
        ...moduleWithoutSubtasks,
        projectProgress,
      };
    }) || [];
  };

  // Chunk 9: Module Data Processing
  const processModuleData = (TaskData, categoryMap, taskCategory) => {
    const ModuleCategoryTasks = {};
    const ModuleMilestoneData = {};
    const ModuleProgress = {};
    const ModuleTeamMembers = {};

    TaskData?.forEach((module) => {
      const moduleId = module.taskid;
      const moduleName = module.taskname;
      const moduleTasks = [];

      // Collect all tasks under this module
      const collectModuleTasks = (task) => {
        task.moduleid = moduleId;
        task.moduleName = moduleName;
        moduleTasks.push(task);
        task.subtasks?.forEach(collectModuleTasks);
      };
      collectModuleTasks(module);

      // Process category tasks
      ModuleCategoryTasks[moduleId] = {};
      moduleTasks.forEach((task) => {
        const categoryKey = categoryMap[task.workcategoryid];
        if (categoryKey) {
          if (!ModuleCategoryTasks[moduleId][categoryKey]) {
            ModuleCategoryTasks[moduleId][categoryKey] = [];
          }
          ModuleCategoryTasks[moduleId][categoryKey].push(task);
        }
      });

      // Process milestones
      const milestones = moduleTasks.filter(task => task.ismilestone === 1);
      ModuleMilestoneData[moduleId] = milestones.map(extractMilestoneTree);

      // Calculate progress
      const totalProgress = ModuleMilestoneData[moduleId].reduce(
        (sum, m) => sum + (m.progress_per || 0), 0
      );
      ModuleProgress[moduleId] = milestones.length > 0
        ? Math.round(totalProgress / milestones.length)
        : 0;

      // Process team members
      const memberMap = new Map();
      moduleTasks.forEach((task) => {
        task.assignee?.forEach((member) => {
          if (member.id) memberMap.set(member.id, member);
        });
      });
      ModuleTeamMembers[moduleId] = Array.from(memberMap.values());
    });

    return { ModuleCategoryTasks, ModuleMilestoneData, ModuleProgress, ModuleTeamMembers };
  };

  // Main optimized function
  const formatDataToTree = useMemo(() => {
    return (data, parsedData, dateFilter = 'All', customRange = {}) => {
      // Early return for empty data
      if (!data || data.length === 0) {
        setTimeout(() => setIsWhTLoading(false), 50);
        return {
          TaskData: [],
          ProjectMilestoneData: {},
          TeamMembers: {},
          ProjectCategoryTasks: {},
          ModuleList: [],
          ProjectProgress: {},
          ModuleCategoryTasks: {},
          ModuleMilestoneData: {},
          ModuleProgress: {},
          ModuleTeamMembers: {},
          // EmployeeWiseData: [],
          // ModuleWiseData: [],
        };
      }

      // Initialize maps and categories
      const { categoryMap, category } = initializeMapsAndCategories(taskCategory);
      const { taskMap, teamMembersMap } = buildTaskMapAndTeamMembers(data);

      // Initialize data structures
      const projectCategoryTasks = {};

      // Determine TaskData based on parsedData
      let TaskData;
      if (parsedData?.taskid) {
        const matchedTask = data.find(task => task.taskid === parsedData.taskid);
        TaskData = matchedTask ? [matchedTask] : [];
      } else {
        TaskData = data.filter(task => task.parentid === 0);
      }

      // Process tasks and collect category data
      TaskData.forEach(task => {
        collectCategoryTasks(task, categoryMap, category, projectCategoryTasks);
      });

      // Process milestones and calculate project progress
      const projectMilestoneData = processMilestones(data);
      const TeamMembers = convertTeamMembers(teamMembersMap);
      const ProjectProgress = calculateProjectProgress(projectMilestoneData);

      // Generate module list
      const ModuleList = generateModuleList(TaskData, ProjectProgress);

      // Process module-specific data
      const {
        ModuleCategoryTasks,
        ModuleMilestoneData,
        ModuleProgress,
        ModuleTeamMembers
      } = processModuleData(TaskData, categoryMap, taskCategory);

      // Set loading state
      setTimeout(() => setIsWhTLoading(false), 50);

      return {
        TaskData,
        ProjectMilestoneData: projectMilestoneData,
        TeamMembers,
        ProjectCategoryTasks: projectCategoryTasks,
        ModuleList,
        ProjectProgress,
        ModuleCategoryTasks,
        ModuleMilestoneData,
        ModuleProgress,
        ModuleTeamMembers,
      };
    };
  }, [taskCategory, location.pathname]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (
      priorityData &&
      statusData &&
      taskDepartment &&
      taskProject &&
      taskCategory &&
      taskAssigneeData?.length > 0
    ) {
      fetchTaskData();
    }
  }, [
    priorityData,
    statusData,
    taskDepartment,
    taskProject,
    taskCategory,
    taskAssigneeData,
    callFetchTaskApi,
    location.pathname,
  ]);

  return {
    iswhMLoading,
    iswhTLoading,
    taskFinalData,
    taskDepartment,
    taskProject,
    taskCategory,
    priorityData,
    statusData,
    secStatusData,
    taskAssigneeData,
  };
};

export default useFullTaskFormatFile;
