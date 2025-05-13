import React, { useEffect, useMemo, useState } from "react";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import { fetchMasterGlFunc, mapKeyValuePair, mapTaskLabels } from "../globalfun";

const useFullTaskFormatFile = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [taskFinalData, setTaskFinalData] = useState([]);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();
  const [taskAssigneeData, setTaskAssigneeData] = useState();

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  const fetchMasterData = async () => {
    setIsLoading(true);
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
    }
  };

  const fetchTaskData = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

      // Step 0: Create category map from label list
      taskCategory.forEach((label) => {
        const key = label.labelname.toLowerCase().replace(/\s+/g, '_');
        categoryMap[label.id] = key;
        category[key] = [];
      });

      // Step 1: Build task map and initialize subtasks
      data.forEach((task) => {
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
      data.forEach((task) => {
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

        clone.subtasks = task.subtasks.map((child) => {
          if (child.ismilestone === 1) {
            return extractMilestoneTree(child);
          } else {
            total++;
            if (child.statusid === 2) completed++;
            return { statusid: child.statusid };
          }
        });

        clone.progress_per = total > 0 ? Math.round((completed / total) * 100) : 100;
        return clone;
      };

      // Step 4: Recursively group tasks by project and category
      const collectCategoryTasks = (task) => {
        const categoryKey = categoryMap[task.workcategoryid];
        const projectId = task.projectid;

        if (categoryKey) {
          // Global category grouping
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

        task.subtasks?.forEach((subtask) => {
          collectCategoryTasks(subtask);
        });
      };

      // Step 5: Collect top-level tasks and fill category groups
      const TaskData = data.filter((task) => task.parentid === 0);
      TaskData.forEach((task) => {
        collectCategoryTasks(task);
      });

      // Step 6: Project-wise Milestone Data
      const allMilestones = data.filter((task) => task.ismilestone === 1);
      allMilestones.forEach((milestone) => {
        const projectId = milestone.projectid;
        if (!projectMilestoneData[projectId]) {
          projectMilestoneData[projectId] = [];
        }
        projectMilestoneData[projectId].push(extractMilestoneTree(milestone));
      });

      // Step 7: Convert team member maps to arrays
      const TeamMembers = {};
      for (const [projectid, membersMap] of teamMembersMap.entries()) {
        TeamMembers[projectid] = Array.from(membersMap.values());
      }

      return {
        TaskData,
        ProjectMilestoneData: projectMilestoneData,
        TeamMembers,
        ProjectCategoryTasks: projectCategoryTasks,
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
  ]);

  return {
    isLoading,
    taskFinalData,
    taskAssigneeData,
  };
};

export default useFullTaskFormatFile;
