import React, { useEffect, useState } from "react";
import { fetchTaskDataFullApi } from "../Api/TaskApi/TaskDataFullApi";
import { fetchMasterGlFunc } from "../Utils/globalfun";

const FullTasKFromatfile = () => {
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
      const labeledTasks = mapTaskLabels(taskData);
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
      console.log("finalTaskData: ", finalTaskData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  function formatDataToTree(data) {
    const taskMap = new Map();
    const teamMembersMap = new Map();

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
          teamMembersMap.set(task.projectid, new Map()); // Use Map to avoid duplicate IDs
        }
        const projectMembers = teamMembersMap.get(task.projectid);

        task.assignee.forEach((member) => {
          if (member.id && member.firstname) {
            // Ensure member has valid data
            projectMembers.set(member.id, member); // Store full member object
          }
        });
      }
    });

    // Step 2: Assign subtasks to parents
    data.forEach((task) => {
      if (task.parentid !== 0) {
        const parent = taskMap?.get(task.parentid);
        if (parent) parent?.subtasks?.push(task);
      }
    });

    // Step 3: Recursively extract Milestone tree and calculate progress_per
    const extractMilestoneTree = (task) => {
      const clone = { ...task };
      let completed = 0;
      let total = 0;

      clone.subtasks = task.subtasks.map((child) => {
        if (child.ismilestone === 1) {
          const childClone = extractMilestoneTree(child);
          return childClone;
        } else {
          total++;
          if (child.statusid === 2) {
            completed++;
          }
          return { statusid: child.statusid };
        }
      });

      // Set progress_per: if there are subtasks, otherwise 100%
      clone.progress_per =
        total > 0 ? Math?.round((completed / total) * 100) : 100;
      return clone;
    };

    // Convert team member sets to arrays
    const TeamMembers = {};
    for (const [projectid, membersMap] of teamMembersMap.entries()) {
      TeamMembers[projectid] = Array.from(membersMap.values()); // Only values (array of member objects)
    }

    // Final structured result
    return {
      TaskData: data?.filter((task) => task.parentid === 0),
      MilestoneData: data
        ?.filter((task) => task.ismilestone === 1)
        ?.map(extractMilestoneTree),
      RndTask: data.filter((task) => task.workcategoryid === 2),
      ChallengesTask: data.filter((task) => task.workcategoryid === 10),
      TeamMembers,
    };
  }

  function mapTaskLabels(data) {
    const labels = data?.rd[0];
    const tasks = data?.rd1;
    const labelMap = {};
    Object.keys(labels).forEach((key, index) => {
      labelMap[index + 1] = key;
    });
    function convertTask(task) {
      let taskObj = {};
      for (let key in task) {
        if (task.hasOwnProperty(key)) {
          const label = labelMap[key];
          if (label) {
            taskObj[label] = task[key];
          }
        }
      }
      return taskObj;
    }
    let taskData = tasks?.map((task) => convertTask(task));
    return taskData;
  }

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
  };
};

export default FullTasKFromatfile;
