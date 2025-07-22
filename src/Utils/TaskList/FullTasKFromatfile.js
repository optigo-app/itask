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

  // Chunk 4: Category Tasks Collection with Optimization
  const collectCategoryTasks = (task, categoryMap, category, projectCategoryTasks, path = []) => {
    const categoryKey = categoryMap[task.workcategoryid];
    const projectId = task.projectid;
    const currentPath = [...path, task.taskname];

    task.breadcrumbTitles = currentPath;

    // Initialize totals
    let totals = {
      estimate_hrsT: task.estimate_hrs || 0,
      estimate1_hrsT: task.estimate1_hrs || 0,
      estimate2_hrsT: task.estimate2_hrs || 0,
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
      estimate2_hrsT: totals.estimate2_hrsT
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

  // // helper function for date wise data get
  // const isWithinDateRange = (task, filterType, customRange = {}, taskDateField = 'DeadLineDate') => {
  //   if (filterType === 'All') return true;

  //   const dateRaw = task?.[taskDateField];
  //   if (!dateRaw || dateRaw === '1900-01-01T00:00:00.000Z') return false;

  //   const date = new Date(dateRaw);
  //   if (isNaN(date.getTime())) return false;

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(today.getDate() + 1);

  //   const startOfWeek = new Date(today);
  //   startOfWeek.setDate(today.getDate() - today.getDay());

  //   const endOfWeek = new Date(startOfWeek);
  //   endOfWeek.setDate(startOfWeek.getDate() + 6);

  //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //   const startOfYear = new Date(today.getFullYear(), 0, 1);
  //   const endOfYear = new Date(today.getFullYear(), 11, 31);

  //   switch (filterType) {
  //     case 'Today':
  //       return date.toDateString() === today.toDateString();
  //     case 'Tomorrow':
  //       return date.toDateString() === tomorrow.toDateString();
  //     case 'ThisWeek':
  //       return date >= startOfWeek && date <= endOfWeek;
  //     case 'ThisMonth':
  //       return date >= startOfMonth && date <= endOfMonth;
  //     case 'ThisYear':
  //       return date >= startOfYear && date <= endOfYear;
  //     case 'Custom': {
  //       const from = new Date(customRange.from);
  //       const to = new Date(customRange.to);
  //       if (isNaN(from) || isNaN(to)) return false;
  //       return date >= from && date <= to;
  //     }
  //     default:
  //       return true;
  //   }
  // };

  // // Chunk 10: Employee Data Processing
  // const processEmployeeData = (data, taskCategory, filterType, customRange, taskDateField = 'DeadLineDate') => {
  //   const EmployeeWiseDataMap = new Map();
  //   data?.forEach((task) => {
  //     if (!isWithinDateRange(task, filterType, customRange, taskDateField)) return;

  //     const estimate = task.estimate_hrs || 0;
  //     const actual = task.workinghr || 0;
  //     const status = (task.status || "").toLowerCase();

  //     if (Array.isArray(task.assignee)) {
  //       task.assignee.forEach((assignee) => {
  //         const empKey = assignee.userid || assignee.customercode || assignee.firstname;

  //         if (!EmployeeWiseDataMap.has(empKey)) {
  //           EmployeeWiseDataMap.set(empKey, {
  //             ...assignee,
  //             TotalTasks: 0,
  //             Completed: 0,
  //             InProgress: 0,
  //             TotalEstimate: 0,
  //             TotalActual: 0,
  //             Tasks: [],
  //             CategorySummaryMap: new Map(),
  //           });
  //         }

  //         const emp = EmployeeWiseDataMap.get(empKey);
  //         emp.TotalTasks += 1;
  //         emp.TotalEstimate += estimate;
  //         emp.TotalActual += actual;
  //         emp.Tasks.push(task);

  //         if (status === "completed") emp.Completed += 1;
  //         if (status === "running") emp.InProgress += 1;

  //         const labelObj = taskCategory?.find(c => c.id === task.workcategoryid);
  //         const labelName = labelObj?.labelname || "Unknown";
  //         const currentCount = emp.CategorySummaryMap.get(labelName) || 0;
  //         emp.CategorySummaryMap.set(labelName, currentCount + 1);
  //       });
  //     }
  //   });

  //   return Array.from(EmployeeWiseDataMap.values()).map((emp) => {
  //     const progress = calculateProgress(emp.Completed, emp.TotalTasks);
  //     const diff = emp.TotalActual - emp.TotalEstimate;
  //     const performance = emp.TotalEstimate > 0
  //       ? Math.round((emp.TotalActual / emp.TotalEstimate) * 100)
  //       : 100;

  //     const CategorySummary = Array.from(emp.CategorySummaryMap.entries()).map(
  //       ([categoryname, count]) => ({ categoryname, count })
  //     );

  //     const { CategorySummaryMap, ...empData } = emp;

  //     return {
  //       ...empData,
  //       Progress: `${progress}%`,
  //       TotalDiff: diff,
  //       Performance: `${performance}%`,
  //       CategorySummary
  //     };
  //   });
  // };

  // // Chunk 11: Module-wise Data Processing
  // const processModuleWiseData = (data, ModuleList, taskCategory, filterType, customRange, taskDateField = 'DeadLineDate') => {
  //   const ModuleWiseDataMap = new Map();

  //   data?.forEach((task) => {
  //     if (!isWithinDateRange(task, filterType, customRange, taskDateField)) return;

  //     const moduleId = task.moduleid;
  //     if (!moduleId) return;

  //     if (!ModuleWiseDataMap.has(moduleId)) {
  //       ModuleWiseDataMap.set(moduleId, {
  //         moduleid: moduleId,
  //         modulename: ModuleList?.find(m => m.taskid === moduleId)?.taskname || "Unknown",
  //         TotalTasks: 0,
  //         Completed: 0,
  //         InProgress: 0,
  //         TotalEstimate: 0,
  //         TotalActual: 0,
  //         Tasks: [],
  //         CategorySummaryTemp: new Map(),
  //       });
  //     }

  //     const mod = ModuleWiseDataMap.get(moduleId);
  //     const status = (task.status || "").toLowerCase();

  //     mod.TotalTasks += 1;
  //     mod.TotalEstimate += task.estimate_hrs || 0;
  //     mod.TotalActual += task.workinghr || 0;
  //     mod.Tasks.push(task);

  //     if (status === "completed") mod.Completed += 1;
  //     if (status === "running") mod.InProgress += 1;

  //     const labelObj = taskCategory?.find(c => c.id === task.workcategoryid);
  //     const labelName = labelObj?.labelname || "Unknown";
  //     const currentCount = mod.CategorySummaryTemp.get(labelName) || 0;
  //     mod.CategorySummaryTemp.set(labelName, currentCount + 1);
  //   });

  //   return Array.from(ModuleWiseDataMap.values()).map((mod) => {
  //     const progress = calculateProgress(mod.Completed, mod.TotalTasks);
  //     const diff = mod.TotalActual - mod.TotalEstimate;
  //     const performance = mod.TotalEstimate > 0
  //       ? Math.round((mod.TotalActual / mod.TotalEstimate) * 100)
  //       : 100;

  //     const CategorySummary = Array.from(mod.CategorySummaryTemp.entries()).map(
  //       ([categoryname, count]) => ({ categoryname, count })
  //     );

  //     const { CategorySummaryTemp, ...modData } = mod;

  //     return {
  //       ...modData,
  //       Progress: `${progress}%`,
  //       TotalDiff: diff,
  //       Performance: `${performance}%`,
  //       CategorySummary
  //     };
  //   });
  // };

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

      // let EmployeeWiseData = [];
      // let ModuleWiseData = [];
      // if (location?.pathname?.includes("/reports")) {
      //   EmployeeWiseData = processEmployeeData(data, taskCategory, dateFilter, customRange);
      //   ModuleWiseData = processModuleWiseData(data, ModuleList, taskCategory, dateFilter, customRange);
      // }

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
        // EmployeeWiseData,
        // ModuleWiseData,
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
