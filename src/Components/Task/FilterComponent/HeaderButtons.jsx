import React, { useEffect, useState } from "react";
import { Box, Button, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SidebarDrawer from "../../FormComponent/Sidedrawer";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, selectedCategoryAtom, filterDrawer, filterDrawer1, timerCompOpen } from "../../../Recoil/atom";
import { toast } from "react-toastify";
import { ChevronsDown, FilterIcon, Kanban, List, SearchIcon, TimerIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import './Styles.scss'
import TaskTimeTrackerComp from "../../ShortcutsComponent/TaskTimeTrackerComp";

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
  taskDepartment }) => {
  const location = useLocation();
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setFormDataValue = useSetRecoilState(formData);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const setSelectedTask = useSetRecoilState(selectedRowData);
  const rootSubrootflagval = useRecoilValue(rootSubrootflag)
  const [view, setView] = useState(activeButton ?? 'table');
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const [filterDrawerOpen1, setFilterDrawerOpen1] = useRecoilState(filterDrawer1);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);


  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({})
    setRootSubroot({ Task: "AddTask" })
    setOpenChildTask(false);
    // setSelectedTask({})

  };

  const handleFormSubmit = async (formValues, formDataValue, mode) => {
    setOpenChildTask(false);
    const addTaskApi = await AddTaskDataApi(formValues ?? {}, formDataValue ?? {}, rootSubrootflagval ?? {}, mode);
    if (addTaskApi) {
      setFormDrawerOpen(false);
      setOpenChildTask(true);
      // setSelectedTask({})
      setTimeout(() => {
        if (rootSubrootflagval?.Task === "SubTask") {
          toast.success("Sub Task Added Successfully...")
        } else {
          toast.success("Task Updated Successfully...")
        }
      }, 100);

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

  const handleFilterDrOpen1 = () => {
    setFilterDrawerOpen1(!filterDrawerOpen1);
  }

  useEffect(() => {
    setFilterDrawerOpen1(false);
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
        <Box sx={{ display: "flex", justifyContent: 'start', alignItems: 'end', gap: 2 }}>
          {taskCategory?.map((category) => (
            <Button
              key={category?.id}
              value={category?.labelname}
              variant="contained"
              onClick={(e) => handleFilterChange("category", e.target.value)}
              className={`categoryFilBtn ${selectedCategory === category.labelname ? 'active' : ''}`}
            >
              {category?.labelname}
            </Button>
          ))}
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
          {/* <Tooltip
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
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            <FilterIcon size={20} />
          </IconButton>
        </Tooltip> */}
          <Tooltip
            placement="top"
            title="Filter tasks"
            arrow
            classes={{ tooltip: 'custom-tooltip' }}
          >
            <IconButton
              aria-label="Filter tasks"
              onClick={handleFilterDrOpen1}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: filterDrawerOpen1 ? '#ffd700' : 'white',
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
        <Box sx={{ display: "flex", gap: 2 }}>
          {location?.pathname?.includes('/tasks') &&
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
          {/* <IconButton
          id="actions"
          aria-label="actions"
          aria-labelledby="actions"
          // onClick={(e) => handleMenuOpen(e, task, { Task: 'root' })}
          style={{ color: "#7d7f85" }}
        >
          <MoreVerticalIcon />
        </IconButton> */}
        </Box>

        {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: "MenuBtnPaperClass",
          style: {
            maxHeight: 48 * 4.5,
            width: "20ch",
          },
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('Delete', { Task: 'root' })}>Delete</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('View', { Task: 'root' })}>View</MenuItem>
      </Menu> */}
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
        />
      </Box>
      <TaskTimeTrackerComp />
    </>
  );
};

export default HeaderButtons;
