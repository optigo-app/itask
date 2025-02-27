import React, { useEffect, useState } from 'react'
import UnAssignedTaskList from '../../../Components/Task/ListView/UnAssignedTask/UnAssignedTaskList'
import { Box } from '@mui/material'
import Filters from '../../../Components/Task/FilterComponent/Filters'
import { toast } from 'react-toastify'
import { masterDataValue } from '../../../Recoil/atom'
import { useRecoilState } from 'recoil'
import { fetchMasterGlFunc } from '../../../Utils/globalfun'

const initialTasks = [
  {
    id: 1,
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new website landing page",
    priority: "High",
    startDate: new Date(2024, 1, 27),
    dueDate: new Date(2024, 2, 5),
    status: "unassigned",
  },
  {
    id: 2,
    title: "Implement user authentication",
    description: "Add login and registration functionality with OAuth support",
    priority: "Medium",
    startDate: new Date(2024, 1, 28),
    dueDate: new Date(2024, 2, 10),
    status: "unassigned",
  },
  {
    id: 3,
    title: "Write API documentation",
    description: "Document all API endpoints and their usage with examples",
    priority: "Low",
    startDate: new Date(2024, 2, 1),
    dueDate: new Date(2024, 2, 15),
    status: "unassigned",
  },
]

const UnassignedTaskList = () => {
  const [unassignedTasks, setUnassignedTasks] = useState(initialTasks);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [masterData, setMasterData] = useRecoilState(masterDataValue);
  const [priorityData, setPriorityData] = useState();
  const [statusData, setStatusData] = useState();
  const [assigneeData, setAssigneeData] = useState();
  const [taskDepartment, setTaskDepartment] = useState();
  const [taskProject, setTaskProject] = useState();
  const [taskCategory, setTaskCategory] = useState();

  const retrieveAndSetData = (key, setter) => {
    const data = sessionStorage.getItem(key);
    if (data) {
      setter(JSON.parse(data));
    }
  };

  // master data fetching and setting
  const fetchMasterData = async () => {
    setIsLoading(true);
    try {
      const masterData = sessionStorage.getItem('masterData');
      const result = JSON.parse(masterData);
      if (!result) {
        fetchMasterGlFunc();
      } else {
        setMasterData(result);
        retrieveAndSetData('taskAssigneeData', setAssigneeData);
        retrieveAndSetData('taskStatusData', setStatusData);
        retrieveAndSetData('taskPriorityData', setPriorityData);
        retrieveAndSetData('taskDepartmentData', setTaskDepartment);
        retrieveAndSetData('taskProjectData', setTaskProject);
        retrieveAndSetData('taskCategoryData', setTaskCategory);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // master api call
  useEffect(() => {
    const init = sessionStorage.getItem('taskInit');
    if (init) {
      fetchMasterData();
    }
  }, []);

  const handlePickTask = (taskId) => {
    setUnassignedTasks(unassignedTasks.filter((task) => task.id !== taskId));
    toast.success("Task Picked Successfully...");
  };

  // Filter change handler
  const handleFilterChange = (key, value) => {
    if (key === 'clearFilter' && value == null) {
      setFilters([]);
      return;
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "30px 20px",
        borderRadius: "8px",
        overflow: "hidden !important",
      }}
    >
      <Filters {...filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        statusData={statusData}
        assigneeData={assigneeData}
        taskDepartment={taskDepartment}
        taskProject={taskProject}
        taskCategory={taskCategory}
      />

      {/* Divider */}
      <div
        style={{
          margin: "20px 0",
          border: "1px dashed #7d7f85",
          opacity: 0.3,
        }}
      />
      <UnAssignedTaskList unassignedTasks={unassignedTasks} onPickTask={handlePickTask} />
    </Box>
  )
}

export default UnassignedTaskList