import React, { useEffect, useState } from "react";
import { Box, Button, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SidebarDrawer from "../../FormComponent/Sidedrawer";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, selectedCategoryAtom, filterDrawer, timerCompOpen } from "../../../Recoil/atom";
import { toast } from "react-toastify";
import { ChevronsDown, FilterIcon, Kanban, List, SearchIcon, TimerIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import './Styles.scss'
import TaskTimeTrackerComp from "../../ShortcutsComponent/TaskTimeTrackerComp";
import ScrollableCategoryTabs from "./ScrollableCategoryTabs";

const HeaderButtons = ({
  searchTerm,
  activeButton,
  onFilterChange,
  onButtonClick,
  isLoading,
  masterData,
  priorityData,
  projectData,
  statusData,
  taskCategory,
  taskDepartment,
  taskAssigneeData }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setFormDataValue = useSetRecoilState(formData);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const setSelectedTask = useSetRecoilState(selectedRowData);
  const rootSubrootflagval = useRecoilValue(rootSubrootflag)
  const [view, setView] = useState(activeButton ?? 'table');
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const encodedData = searchParams.get("data");

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({})
    setRootSubroot({ Task: "AddTask" })
    setOpenChildTask(false);
  };

  const handleFormSubmit = async (formValues, mode, module) => {
    let parsedData;
    if (encodedData) {
      const decodedString = decodeURIComponent(encodedData);
      const jsonString = atob(decodedString);
      parsedData = JSON.parse(jsonString);
    }
    const rootflag = rootSubrootflagval?.Task == 'AddTask' ? { Task: "subroot" } : rootSubrootflagval;
    setOpenChildTask(false);
    const addTaskApi = await AddTaskDataApi(formValues, rootflag ?? {}, module);
    console.log('addTaskApi: ', addTaskApi);
    if (addTaskApi?.rd[0]?.stat == 1) {
      setFormDrawerOpen(false);
      setOpenChildTask(true);
      setTimeout(() => {
        let message = "Task Added Successfully...";
        if (rootSubrootflagval?.Task === "SubTask") {
          message = "Sub Task Added Successfully...";
        } else if (rootSubrootflagval?.Task === "AddTask") {
        } else if (formValues?.taskid) {
          message = "Task Updated Successfully...";
        }

        toast.success(message);
      }, 100);

    } else {
      toast.error("Something went wrong...");
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      onButtonClick(newView);
    }
  };

  const handleFilterChange = (key, value) => {
    setSelectedCategory(value);
    onFilterChange(key, value);
  };

  const handleFilterDrOpen = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };


  useEffect(() => {
    setFilterDrawerOpen(false);
  }, [location])

  const handleTimerCompOpen = () => {
    setTimerComponentOpen(true);
  };

  const ViewToggleButtons = ({ view, onViewChange }) => {
    return (
      <ToggleButtonGroup
        size="small"
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label="view mode"
      >
        <ToggleButton value="table" aria-label="table view">
          <List size={20} />
        </ToggleButton>
        <ToggleButton value="kanban" aria-label="kanban view">
          <Kanban size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  return (
    <>
      <Box className="headerButtons">
        <Box className="FirstMainBox" sx={{ display: "flex", justifyContent: 'start', alignItems: 'end', gap: 2 }}>
          <ScrollableCategoryTabs
            taskCategory={taskCategory}
            selectedCategory={selectedCategory}
            handleFilterChange={handleFilterChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <TextField
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onFilterChange("searchTerm", e.target.value)}
              size="small"
              className="textfieldsClass"
              sx={{
                minWidth: 250,
                "@media (max-width: 600px)": { minWidth: "100%" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
                  </InputAdornment>
                ),
              }}
              aria-label='Search tasks...'
            />
          </Box>
          <Tooltip
            placement="top"
            title="Filter tasks"
            arrow
            classes={{ tooltip: 'custom-tooltip' }}
          >
            <IconButton
              aria-label="Filter tasks"
              onClick={handleFilterDrOpen}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: filterDrawerOpen ? '#ffd700' : 'white',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <ChevronsDown size={20} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box className="secondMainBox">
          {location?.pathname?.includes('/tasks') &&
            <Box sx={{ display: "flex", gap: 2 }}>
              {location?.pathname?.includes('/tasks/') &&
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="buttonClassname"
                  onClick={handleDrawerToggle}
                >
                  New
                </Button>
              }
              <IconButton
                size='medium'
                className="buttonClassname"
                onClick={handleTimerCompOpen}
              >
                <TimerIcon sx={{ color: '#fff' }} />
              </IconButton>
              <ViewToggleButtons view={view} onViewChange={handleViewChange} />
            </Box>
          }
          {location?.pathname?.includes('/projects') &&
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                className="buttonClassname"
                onClick={handleDrawerToggle}
              >
                New
              </Button>
            </Box>
          }
        </Box>
        <SidebarDrawer
          open={formdrawerOpen}
          onClose={handleDrawerToggle}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          masterData={masterData}
          priorityData={priorityData}
          projectData={projectData}
          statusData={statusData}
          taskCategory={taskCategory}
          taskDepartment={taskDepartment}
          taskAssigneeData={taskAssigneeData}
        />
      </Box>
      <TaskTimeTrackerComp />
    </>
  );
};

export default HeaderButtons;
