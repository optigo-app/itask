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
  viewMode,
  copyRowData,
  completedTask,
} from "../../../Recoil/atom";
import { toast } from "react-toastify";
import {
  Calendar,
  ChevronsDown,
  CircleCheck,
  ClipboardPaste,
  Kanban,
  List,
  SearchIcon,
  TimerIcon,
  User,
  Users,
} from "lucide-react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles.scss";
import TaskTimeTrackerComp from "../../ShortcutsComponent/TimerComponent/TaskTimeTrackerComp";
import ScrollableCategoryTabs from "./ScrollableCategoryTabs";
import { PERMISSIONS } from "../../Auth/Role/permissions";
import useAccess from "../../Auth/Role/useAccess";

const HeaderButtons = ({
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
  CategorySummary,
  handlePasteTask,
  handleCompletedTaskFilter
}) => {
  const { hasAccess } = useAccess();
  const navigate = useNavigate()
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:601px) and (max-width:960px)");
  const location = useLocation();
  const filters = useRecoilValue(Advfilters);
  const copyData = useRecoilValue(copyRowData);
  const searchParams = new URLSearchParams(location.search);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setFormDataValue = useSetRecoilState(formData);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const rootSubrootflagval = useRecoilValue(rootSubrootflag);
  const [view, setView] = useState('');
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const [viewTaskMode, setViewTaskMode] = useRecoilState(viewMode);
  const [completedFlag, setCompletedFlag] = useRecoilState(completedTask);
  const encodedData = searchParams.get("data");
  const [parsedData, setParsedData] = useState();
  const [categoryMaster, setCategoryMaster] = useState([]);

  useEffect(() => {
    if (Array.isArray(CategorySummary)) {
      setCategoryMaster(CategorySummary);
    }
  }, [CategorySummary, location, isLoading]);

  useEffect(() => {
    if (encodedData) {
      const decodedString = decodeURIComponent(encodedData);
      const jsonString = atob(decodedString);
      setParsedData(JSON?.parse(jsonString));
    }
  }, [])



  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({});
    setRootSubroot({ Task: "AddTask" });
    setOpenChildTask(false);
  };

  const handleFormSubmit = async (formValues, mode, module) => {
    const rootflag =
      rootSubrootflagval?.Task == "AddTask"
        ? { Task: "subroot" }
        : rootSubrootflagval;
    setOpenChildTask(false);
    const addTaskApi = await AddTaskDataApi(formValues, rootflag ?? {}, module);
    if (addTaskApi && addTaskApi?.rd[0]?.stat == 1) {
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

  const handleViewModeChange = (event, newView) => {
    if (newView !== null) setViewTaskMode(newView);
  };


  const handleViewChange = (event, newView) => {
    if (!newView || newView === view) return;
    if (newView === "calendar") {
      navigate('/calendar');
    } else {
      setView(newView);
      onButtonClick(newView);
    }
  };


  const handleFilterChange = (key, value) => {
    if (key === "category") {
      const updatedCategory = selectedCategory.includes(value)
        ? selectedCategory.filter((category) => category !== value)
        : [...selectedCategory, value];
      setSelectedCategory(updatedCategory);
      onFilterChange(key, updatedCategory);
    } else {
      onFilterChange(key, value);
    }
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
        <ToggleButton value="table" aria-label="table view" sx={{ borderRadius: '8px' }}>
          <List className="iconbtn" size={20} />
        </ToggleButton>
        <ToggleButton value="kanban" aria-label="kanban view" sx={{ borderRadius: '8px' }}>
          <Kanban className="iconbtn" size={20} />
        </ToggleButton>
        <ToggleButton value="calendar" aria-label="Calendar view" sx={{ borderRadius: '8px' }}>
          <Calendar className="iconbtn" size={20} />
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
              taskCategory={categoryMaster}
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
                padding: '7px',
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
          {location?.pathname?.includes("/tasks") && (
            <Tooltip
              placement="top"
              title="Completed tasks"
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Completed tasks"
                onClick={handleCompletedTaskFilter}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: '7px',
                  backgroundColor:
                    completedFlag ? "#dcedc8" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <CircleCheck className="iconbtn"
                  color={
                    completedFlag ? "#388e3c" : "#0000008a"
                  } />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box className="secondMainBox">
          {copyData && Object.keys(copyData).length > 0 && (
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ClipboardPaste size={20} />}
                onClick={() => handlePasteTask(parsedData, "main")}
                className="pasteButton"
                size={isSmallScreen ? "small" : isMediumScreen ? "medium" : "medium"}
              >
                Paste
              </Button>
            </Box>
          )}
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
              {location?.pathname?.includes("/tasks/") && (
                <ToggleButtonGroup
                  value={viewTaskMode}
                  exclusive
                  size="small"
                  onChange={handleViewModeChange}
                  aria-label="View mode"
                  className="view-mode-toggle"
                >
                  <ToggleButton value="me" className="toggle-btn" sx={{ borderRadius: '8px' }}>
                    <User size={20} className="toggle-icon" />
                  </ToggleButton>
                  <Tooltip
                    title={parsedData?.isLimited == 1 ? "Access limited: Team view disabled" : ""}
                    arrow
                    disableHoverListener={!parsedData?.isLimited == 1}
                    placement="top"
                    classes={{ tooltip: 'custom-tooltip' }}
                  >
                    <ToggleButton
                      disabled={parsedData?.isLimited == 1}
                      value="team"
                      className="toggle-btn"
                      sx={{ borderRadius: '8px' }}
                    >
                      <Users size={20} className="toggle-icon" />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
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
              {hasAccess(PERMISSIONS.canLockPrModule) &&
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="buttonClassname"
                  onClick={handleDrawerToggle}
                >
                  New
                </Button>
              }
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
