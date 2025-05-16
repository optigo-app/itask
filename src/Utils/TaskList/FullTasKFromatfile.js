import React, { useEffect, useMemo, useState } from "react";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import { fetchMasterGlFunc, mapKeyValuePair, mapTaskLabels } from "../globalfun";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, projectDatasRState, TaskData } from "../../Recoil/atom";

const useFullTaskFormatFile = () => {
  const [iswhTLoading, setIsWhTLoading] = useState(null);
  const [iswhMLoading, setIsWhMLoading] = useState(null);
  const [taskFinalData, setTaskFinalData] = useState([]);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();
  const [taskAssigneeData, setTaskAssigneeData] = useState();
  const [callFetchTaskApi, setCallFetchTaskApi] = useRecoilState(fetchlistApiCall);
  const tasks = useRecoilValue(TaskData);
  const project = useRecoilValue(projectDatasRState);

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
    if (tasks?.length > 0 || project?.length > 0) {
      setIsWhTLoading(false);
    } else {
      setIsWhTLoading(true);
    }
    try {
      const taskData = await fetchTaskDataFullApi();
      const labeledTasks = mapKeyValuePair(taskData);
      const enhanceTask = (task) => {
        const priority = priorityData?.find(
          (item) => item?.id == task?.priorityid
        );
        const status = statusData?.find((item) => item?.id == task?.statusid);
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
          taskPr: project ? project?.labelname : "",
          taskDpt: department ? department?.labelname : "",
          assignee: matchedAssignees ?? [],
          category: category?.labelname,
        };
      };

      const data = labeledTasks?.map((task) => enhanceTask(task));
      const finalTaskData = formatDataToTree(data);
      setTaskFinalData(finalTaskData);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDataToTree = useMemo(() => {
    return (data) => {
      const taskMap = new Map();
      const teamMembersMap = new Map();
      const categoryMap = {};
      const category = {};
      const projectCategoryTasks = {};
      const projectMilestoneData = {};
      const ModuleList = [];

      // Step 0: Create category map from label list
      taskCategory?.forEach((label) => {
        const key = label?.labelname?.toLowerCase()?.replace(/\s+/g, '_');
        categoryMap[label.id] = key;
        category[key] = [];
      });

      // Step 1: Build task map and initialize subtasks
      data?.forEach((task) => {
        task.subtasks = [];
        taskMap.set(task.taskid, task);

        if (
          task.assignee &&
          Array.isArray(task.assignee) &&
          task.assignee.length > 0
        ) {
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

      // Step 2: Assign subtasks to parents
      data?.forEach((task) => {
        if (task.parentid !== 0) {
          const parent = taskMap.get(task.parentid);
          if (parent) parent.subtasks.push(task);
        }
      });

      // Step 3: Extract Milestone Tree and calculate progress
      const extractMilestoneTree = (task) => {
        const clone = { ...task };
        let completed = 0;
        let total = 0;
        total++;
        if (task.status == "Completed") completed++;
        clone.subtasks = task?.subtasks?.map((child) => {
          if (child.ismilestone === 1) {
            return extractMilestoneTree(child);
          } else {
            total++;
            if (child.status == "Completed") completed++;
            return { statusid: child.statusid };
          }
        });
        clone.progress_per = total > 0 ? Math.round((completed / total) * 100) : 100;
        return clone;
      };


      // Step 4: Recursively group tasks by project and category, and calculate estimate totals
      const collectCategoryTasks = (task) => {
        const categoryKey = categoryMap[task.workcategoryid];
        const projectId = task.projectid;

        // Initialize totals
        let estimate_hrsT = 0;
        let estimate1_hrsT = 0;
        let estimate2_hrsT = 0;

        // Recursively calculate totals from children
        task.subtasks?.forEach((subtask) => {
          const childSums = collectCategoryTasks(subtask);
          estimate_hrsT += childSums.estimate_hrsT;
          estimate1_hrsT += childSums.estimate1_hrsT;
          estimate2_hrsT += childSums.estimate2_hrsT;
        });

        // Add current task's estimates
        estimate_hrsT += task.estimate_hrs || 0;
        estimate1_hrsT += task.estimate1_hrs || 0;
        estimate2_hrsT += task.estimate2_hrs || 0;

        // Store totals in the task object
        task.estimate_hrsT = estimate_hrsT;
        task.estimate1_hrsT = estimate1_hrsT;
        task.estimate2_hrsT = estimate2_hrsT;

        // Global category grouping
        if (categoryKey) {
          category[categoryKey].push(task);

          // Project-wise category grouping
          if (!projectCategoryTasks[projectId]) {
            projectCategoryTasks[projectId] = {};
          }
          if (!projectCategoryTasks[projectId][categoryKey]) {
            projectCategoryTasks[projectId][categoryKey] = [];
          }
          projectCategoryTasks[projectId][categoryKey].push(task);
        }

        // Return totals for parent's use
        return {
          estimate_hrsT,
          estimate1_hrsT,
          estimate2_hrsT,
        };
      };

      // Step 5: Collect top-level tasks and fill category groups
      const TaskData = data?.filter((task) => task.parentid === 0);
      TaskData.forEach((task) => {
        collectCategoryTasks(task);
      });

      // Step 6: Project-wise Milestone Data
      const allMilestones = data?.filter((task) => task.ismilestone === 1);
      allMilestones.forEach((milestone) => {
        const projectId = milestone.projectid;
        if (!projectMilestoneData[projectId]) {
          projectMilestoneData[projectId] = [];
        }
        projectMilestoneData[projectId].push(extractMilestoneTree(milestone));
      });

      // Step 7: Convert team member maps to arrays
      const TeamMembers = {};
      for (const [projectid, membersMap] of teamMembersMap?.entries()) {
        TeamMembers[projectid] = Array.from(membersMap.values());
      }

      // Step 8: Calculate project-wise average progress
      const ProjectProgress = {};
      for (const [projectId, milestones] of Object.entries(projectMilestoneData)) {
        const totalProgress = milestones?.reduce((sum, m) => sum + (m.progress_per || 0), 0);
        const avgProgress = milestones?.length > 0 ? Math.round(totalProgress / milestones.length) : 0;
        ProjectProgress[projectId] = avgProgress;
      }

      // Step 9: Build Module List (parentid = 0 only)
      TaskData?.forEach((module) => {
        const projectId = module.projectid;
        const projectProgress = ProjectProgress[projectId] || 0;

        ModuleList.push({
          ...module,
          projectProgress,
        });
      });


      setTimeout(() => {
        setIsWhTLoading(false);
      }, 20);
      return {
        TaskData,
        ProjectMilestoneData: projectMilestoneData,
        TeamMembers,
        ProjectCategoryTasks: projectCategoryTasks,
        ModuleList,
        ProjectProgress,
      };
    };
  }, [taskCategory]);

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
      taskAssigneeData
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
    callFetchTaskApi
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
    taskAssigneeData,
  };
};

export default useFullTaskFormatFile;
