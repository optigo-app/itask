import React, { useEffect, useState } from 'react'
import { fetchTaskDataFullApi } from '../Api/TaskApi/TaskDataFullApi';
import { fetchMasterGlFunc } from '../Utils/globalfun';

const FullTasKFromatfile = () => {
  const [taskData, setTaskData] = useState([]);
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
    try {
      let storedStructuredData = sessionStorage.getItem('structuredMasterData');
      let structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
      if (!structuredData) {
        await fetchMasterGlFunc();
        storedStructuredData = sessionStorage.getItem('structuredMasterData');
        structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
      }
      if (structuredData) {
        retrieveAndSetData('taskstatusData', setStatusData);
        retrieveAndSetData('taskpriorityData', setPriorityData);
        retrieveAndSetData('taskdepartmentData', setTaskDepartment);
        retrieveAndSetData('taskprojectData', setTaskProject);
        retrieveAndSetData('taskworkcategoryData', setTaskCategory);
        retrieveAndSetData('taskAssigneeData', setTaskAssigneeData);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const fetchTaskData = async () => {
    try {
      const taskData = await fetchTaskDataFullApi();
      const labeledTasks = mapTaskLabels(taskData);
      console.log('labeledTasks: ', labeledTasks);
      debugger
      const enhanceTask = (task) => {
        console.log('task: ', task);
        const priority = priorityData?.find(item => item?.id == task?.priorityid);
        const status = statusData?.find(item => item?.id == task?.statusid);
        const project = taskProject?.find(item => item?.id == task?.projectid);
        const department = taskDepartment?.find(item => item?.id == task?.departmentid);
        const category = taskCategory?.find(item => item?.id == task?.workcategoryid);
        const assigneeIdArray = task?.assigneids?.split(',')?.map(id => Number(id));
        const matchedAssignees = taskAssigneeData?.filter(user => assigneeIdArray?.includes(user.id));
        return {
          ...task,
          priority: priority ? priority?.labelname : '',
          status: status ? status?.labelname : '',
          taskPr: project ? project?.labelname : '',
          taskDpt: department ? department?.labelname : '',
          assignee: matchedAssignees ?? [],
          category: category?.labelname,
        };
      };

      const data = labeledTasks?.map(task => enhanceTask(task));
      const finalTaskData = formatDataToTree(data);
      console.log('finalTaskData: ', finalTaskData);

    } catch (error) {
      console.error(error);
    }
  };

  console.log("taskData--->>>", taskData);

  // function formatDataToTree(data) {
  //     const taskMap = new Map();
  //     const parentMap = new Map();

  //     // Iterate through the data to build the tree structure
  //     data.forEach(task => {
  //         const {
  //             parentid, taskid, projectid, entrydate, taskname, StartDate, estimate_hrs, DeadLineDate,
  //             priorityid, statusid, workcategoryid, departmentid, isFreez, progress_per, ismilestone,
  //             estimate1_hrs, estimate2_hrs, isfavourite, isnew, isburning, ticketno, assigneids
  //         } = task;

  //         // Check if task already exists in the taskMap
  //         let currentTask = taskMap.get(taskid);

  //         if (!currentTask) {
  //             // If the task doesn't exist, create a new one
  //             currentTask = {
  //                 taskid, parentid, projectid, entrydate, taskname, StartDate, estimate_hrs, DeadLineDate,
  //                 priorityid, statusid, workcategoryid, departmentid, isFreez, progress_per, ismilestone,
  //                 estimate1_hrs, estimate2_hrs, isfavourite, isnew, isburning, ticketno, assigneids,
  //                 subtasks: []
  //             };
  //             taskMap.set(taskid, currentTask);
  //         } else {
  //             // If the task exists, only update the properties that might have changed
  //             currentTask.parentid = parentid;
  //             currentTask.projectid = projectid;
  //             currentTask.entrydate = entrydate;
  //             currentTask.taskname = taskname;
  //             currentTask.StartDate = StartDate;
  //             currentTask.estimate_hrs = estimate_hrs;
  //             currentTask.DeadLineDate = DeadLineDate;
  //             currentTask.priorityid = priorityid;
  //             currentTask.statusid = statusid;
  //             currentTask.workcategoryid = workcategoryid;
  //             currentTask.departmentid = departmentid;
  //             currentTask.isFreez = isFreez;
  //             currentTask.progress_per = progress_per;
  //             currentTask.ismilestone = ismilestone;
  //             currentTask.estimate1_hrs = estimate1_hrs;
  //             currentTask.estimate2_hrs = estimate2_hrs;
  //             currentTask.isfavourite = isfavourite;
  //             currentTask.isnew = isnew;
  //             currentTask.isburning = isburning;
  //             currentTask.ticketno = ticketno;
  //             currentTask.assigneids = assigneids;
  //         }

  //         // Handle parent-child relationship
  //         if (parentid !== 0) {
  //             let parentTask = taskMap.get(parentid);
  //             if (!parentTask) {
  //                 // If the parent task doesn't exist, create it as well
  //                 parentTask = { taskid: parentid, parentid: 0, subtasks: [] };
  //                 taskMap.set(parentid, parentTask);
  //             }
  //             parentTask.subtasks.push(currentTask);
  //         } else {
  //             // Add root-level tasks (parentid === 0)
  //             if (!parentMap.has(parentid)) {
  //                 parentMap.set(parentid, []);
  //             }
  //             parentMap.get(parentid).push(currentTask);
  //         }
  //     });

  //     // Return the root tasks
  //     return parentMap.get(0) || [];
  // }

  // Example usage:


  // function formatDataToTree(data) {
  //     // Initialize maps to store task and root-level task references
  //     const taskMap = new Map();
  //     const parentMap = new Map();

  //     // Iterate through the data to build the tree structure
  //     data.forEach(task => {
  //       const {
  //         parentid, taskid, projectid, entrydate, taskname, StartDate, estimate_hrs, DeadLineDate,
  //         priorityid, statusid, workcategoryid, departmentid, isFreez, progress_per, ismilestone,
  //         estimate1_hrs, estimate2_hrs, isfavourite, isnew, isburning, ticketno, assigneids
  //       } = task;

  //       let currentTask = taskMap.get(taskid);

  //       if (!currentTask) {
  //         currentTask = {
  //           taskid, parentid, projectid, entrydate, taskname, StartDate, estimate_hrs, DeadLineDate,
  //           priorityid, statusid, workcategoryid, departmentid, isFreez, progress_per, ismilestone,
  //           estimate1_hrs, estimate2_hrs, isfavourite, isnew, isburning, ticketno, assigneids,
  //           subtasks: []
  //         };
  //         taskMap.set(taskid, currentTask);
  //       }

  //       if (parentid !== 0) {
  //         let parentTask = taskMap.get(parentid);
  //         if (!parentTask) {
  //           parentTask = { taskid: parentid, parentid: 0, subtasks: [] };
  //           taskMap.set(parentid, parentTask);
  //         }
  //         parentTask.subtasks.push(currentTask);
  //       } else {
  //         if (!parentMap.has(parentid)) {
  //           parentMap.set(parentid, []);
  //         }
  //         parentMap.get(parentid).push(currentTask);
  //       }
  //     });

  //     // Function to filter and return only statusid for subtasks of ismilestone = 1
  //     const getSubtaskStatusIds = (task) => {
  //       if (task.ismilestone === 1) {
  //         return task.subtasks.map(subtask => ({
  //           statusid: subtask.statusid,
  //           subtasks: getSubtaskStatusIds(subtask) // Recursively check for further subtasks
  //         }));
  //       }
  //       return [];
  //     };

  //     // Traverse root tasks and collect subtasks status for ismilestone = 1
  //     const taskData = [];
  //     const milestoneData = [];

  //     parentMap.get(0)?.forEach(task => {
  //       const subtasksWithStatus = getSubtaskStatusIds(task);
  //       if (subtasksWithStatus.length > 0 || task.ismilestone === 1) {
  //         milestoneData.push({
  //           taskid: task.taskid,
  //           ...task,  // Include full parent task data here
  //           subtasks: subtasksWithStatus
  //         });
  //       }

  //       taskData.push({
  //         taskid: task.taskid,
  //         parentid: task.parentid,
  //         projectid: task.projectid,
  //         entrydate: task.entrydate,
  //         taskname: task.taskname,
  //         StartDate: task.StartDate,
  //         estimate_hrs: task.estimate_hrs,
  //         DeadLineDate: task.DeadLineDate,
  //         priorityid: task.priorityid,
  //         statusid: task.statusid,
  //         workcategoryid: task.workcategoryid,
  //         departmentid: task.departmentid,
  //         isFreez: task.isFreez,
  //         progress_per: task.progress_per,
  //         ismilestone: task.ismilestone,
  //         estimate1_hrs: task.estimate1_hrs,
  //         estimate2_hrs: task.estimate2_hrs,
  //         isfavourite: task.isfavourite,
  //         isnew: task.isnew,
  //         isburning: task.isburning,
  //         ticketno: task.ticketno,
  //         assigneids: task.assigneids,
  //         subtasks: task.subtasks // You can decide if you want subtasks in TaskData or not
  //       });
  //     });

  //     return {
  //       TaskData: taskData,
  //       MilestoneData: milestoneData
  //     };
  //   }

  function formatDataToTree(data) {
    console.log('data: ', data);
    const taskMap = new Map();
    const teamMembersMap = new Map();

    // Step 1: Build task map and initialize subtasks
    data.forEach(task => {
      task.subtasks = [];
      taskMap.set(task.taskid, task);

      // Collect team members per project
      //   if (task.assigneids && task.assigneids?.trim()) {
      //     const ids = task?.assigneids?.split(',')?.map(id => parseInt(id.trim()))?.filter(Boolean);
      //     if (!teamMembersMap?.has(task.projectid)) {
      //       teamMembersMap?.set(task.projectid, new Set());
      //     }
      //     ids.forEach(id => teamMembersMap?.get(task.projectid)?.add(id));
      //   }
      // });
      if (task.assignee && Array.isArray(task.assignee) && task.assignee.length > 0) {
        if (!teamMembersMap.has(task.projectid)) {
          teamMembersMap.set(task.projectid, new Map()); // Use Map to avoid duplicate IDs
        }
        const projectMembers = teamMembersMap.get(task.projectid);

        task.assignee.forEach(member => {
          if (member.id && member.firstname) {  // Ensure member has valid data
            projectMembers.set(member.id, member); // Store full member object
          }
        });
      }
    });

    // Step 2: Assign subtasks to parents
    data.forEach(task => {
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

      clone.subtasks = task.subtasks.map(child => {
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
      clone.progress_per = total > 0 ? Math?.round((completed / total) * 100) : 100;
      return clone;
    };

    // Convert team member sets to arrays
    const TeamMembers = {};
    for (const [projectid, membersMap] of teamMembersMap.entries()) {
      TeamMembers[projectid] = Array.from(membersMap.values()); // Only values (array of member objects)
    }

    // Final structured result
    return {
      TaskData: data?.filter(task => task.parentid === 0),
      MilestoneData: data
        ?.filter(task => task.ismilestone === 1)
        ?.map(extractMilestoneTree),
      RndTask: data.filter(task => task.workcategoryid === 2),
      ChallengesTask: data.filter(task => task.workcategoryid === 10),
      TeamMembers
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
      if (task.subtasks) {
        try {
          const parsedSubtasks = JSON.parse(task.subtasks);
          taskObj.subtasks = parsedSubtasks.map(subtask => {
            let subtaskObj = {};
            for (let key in subtask) {
              if (subtask.hasOwnProperty(key)) {
                const label = labelMap[key];
                if (label) {
                  subtaskObj[label] = subtask[key];
                }
              }
            }
            return subtaskObj;
          });
        } catch (error) {
          console.error("Error parsing subtasks:", error);
        }
      }

      return taskObj;
    }
    let taskData = tasks?.map(task => convertTask(task))

    return taskData;
  }

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (priorityData && statusData && taskDepartment && taskProject && taskCategory && taskAssigneeData) {
      fetchTaskData();
    }
  }, [priorityData, statusData, taskDepartment, taskProject, taskCategory, taskAssigneeData]);

  return (
    <div>FullTasKFromatfile</div>
  )
}

export default FullTasKFromatfile