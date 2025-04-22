import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SidebarDrawer from "../../FormComponent/Sidedrawer";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  fetchlistApiCall,
  formData,
  openFormDrawer,
  rootSubrootflag,
  selectedRowData,
  selectedCategoryAtom,
  filterDrawer,
  timerCompOpen,
  Advfilters,
} from "../../../Recoil/atom";
import { toast } from "react-toastify";
import {
  ChevronsDown,
  Kanban,
  List,
  SearchIcon,
  TimerIcon,
} from "lucide-react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useLocation } from "react-router-dom";
import "./Styles.scss";
import TaskTimeTrackerComp from "../../ShortcutsComponent/TaskTimeTrackerComp";
import ScrollableCategoryTabs from "./ScrollableCategoryTabs";
import { isMediumScreen, isSmallScreen } from "../../../Utils/globalfun";

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
  taskAssigneeData,
}) => {

  const isLaptop = useMediaQuery("(max-width:1150px)");
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:601px) and (max-width:960px)");
  const isLargeScreen = useMediaQuery("(min-width:961px)");
  const location = useLocation();
  const [filters, setFilters] = useRecoilState(Advfilters);
  const searchParams = new URLSearchParams(location.search);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setFormDataValue = useSetRecoilState(formData);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const setSelectedTask = useSetRecoilState(selectedRowData);
  const rootSubrootflagval = useRecoilValue(rootSubrootflag);
  const [view, setView] = useState(activeButton);
  const [selectedCategory, setSelectedCategory] =
    useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const encodedData = searchParams.get("data");

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({});
    setRootSubroot({ Task: "AddTask" });
    setOpenChildTask(false);
  };

  const handleFormSubmit = async (formValues, mode, module) => {
    let parsedData;
    if (encodedData) {
      const decodedString = decodeURIComponent(encodedData);
      const jsonString = atob(decodedString);
      parsedData = JSON.parse(jsonString);
    }
    const rootflag =
      rootSubrootflagval?.Task == "AddTask"
        ? { Task: "subroot" }
        : rootSubrootflagval;
    setOpenChildTask(false);
    const addTaskApi = await AddTaskDataApi(formValues, rootflag ?? {}, module);
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
  }, [location]);

  const handleTimerCompOpen = () => {
    setTimerComponentOpen(true);
  };

  const ViewToggleButtons = ({ view, onViewChange }) => {
    return (
      <ToggleButtonGroup
        size='small'
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label="view mode"
        
      >
        <ToggleButton value="table" aria-label="table view">
          <List className="iconbtn" size={20} />
        </ToggleButton>
        <ToggleButton value="kanban" aria-label="kanban view">
          <Kanban className="iconbtn" size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  return (
    <>
      <Box className="headerButtons">
        <Box className="FirstMainBox">
          {!isLaptop && (
            <ScrollableCategoryTabs
              taskCategory={taskCategory}
              selectedCategory={filters?.category}
              handleFilterChange={handleFilterChange}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <TextField
              placeholder="Search tasks..."
              value={filters?.searchTerm}
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
              aria-label="Search tasks..."
            />
          </Box>
          {!isLaptop ? (
            <Tooltip
              placement="top"
              title="Filter tasks"
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Filter tasks"
                onClick={handleFilterDrOpen}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: filterDrawerOpen ? "#ffd700" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <ChevronsDown size={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              placement="top"
              title="Filter tasks"
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Filter tasks"
                onClick={handleFilterDrOpen}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding:'7px',
                  backgroundColor: filterDrawerOpen ? "#ffd700" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <FilterAltIcon className="iconbtn" color="#0000008a" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box className="secondMainBox">
          {location?.pathname?.includes("/tasks") && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {location?.pathname?.includes("/tasks/") && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="buttonClassname"
                  onClick={handleDrawerToggle}
                  size={isSmallScreen ? "small" : isMediumScreen ? "medium" : "medium"}
                >
                  New
                </Button>
              )}
              <IconButton
                className="buttonClassname"
                onClick={handleTimerCompOpen}
                aria-label="Time Track Task button"
                size={isSmallScreen ? "small" : isMediumScreen ? "medium" : "medium"}
              >
                <TimerIcon className="iconbtn" sx={{ color: "#fff" }} />
              </IconButton>
              <ViewToggleButtons view={view} onViewChange={handleViewChange} />
            </Box>
          )}
          {location?.pathname?.includes("/projects") && (
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                className="buttonClassname"
                onClick={handleDrawerToggle}
              >
                New
              </Button>
            </Box>
          )}
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
