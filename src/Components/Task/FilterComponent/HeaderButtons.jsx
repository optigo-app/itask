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
import { getRandomAvatarColor, ImageUrl, getUserProfileData, getAuthData } from "../../../Utils/globalfun";
import {
  fetchlistApiCall,
  formData,
  openFormDrawer,
  rootSubrootflag,
  selectedCategoryAtom,
  filterDrawer,
  timerCompOpen,
  Advfilters,
  viewMode,
  copyRowData,
  completedTask,
  archivedTask,
} from "../../../Recoil/atom";
import { toast } from "react-toastify";
import {
  Calendar,
  CircleCheck,
  ClipboardPaste,
  Archive,
  Kanban,
  List,
  ListFilter,
  OctagonAlert,
  SearchIcon,
  Star,
  TimerIcon,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useLocation } from "react-router-dom";
import "./Styles.scss";
import TaskTimeTrackerComp from "../../ShortcutsComponent/TimerComponent/TaskTimeTrackerComp";
import ScrollableCategoryTabs from "./ScrollableCategoryTabs";
import { PERMISSIONS } from "../../Auth/Role/permissions";
import useAccess from "../../Auth/Role/useAccess";
import useSafeRedirect from "../../../Utils/useSafeRedirect";

const HeaderButtons = ({
  onFilterChange,
  onButtonClick,
  isLoading,
  masterData,
  priorityData,
  projectData,
  statusData,
  secStatusData,
  taskCategory,
  taskDepartment,
  taskAssigneeData,
  CategorySummary,
  handlePasteTask,
  handleCompletedTaskFilter,
  handleArchivedTaskFilter,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}) => {
  const { hasAccess } = useAccess();
  const navigate = useSafeRedirect()
  const profileData = getUserProfileData();
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
  const [lastNonArchiveView, setLastNonArchiveView] = useState('table');
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const [viewTaskMode, setViewTaskMode] = useRecoilState(viewMode);
  const archiveFlag = useRecoilValue(archivedTask);
  const encodedData = searchParams.get("data");
  const [parsedData, setParsedData] = useState();
  const [categoryMaster, setCategoryMaster] = useState([]);
  const [searchInput, setSearchInput] = useState(filters?.searchTerm || "");

  useEffect(() => {
    if (Array.isArray(CategorySummary)) {
      setCategoryMaster(CategorySummary);
    }
    const viewMode = 'table';
    setView(viewMode);
  }, [CategorySummary, location, isLoading]);

  useEffect(() => {
    if (encodedData) {
      const decodedString = decodeURIComponent(encodedData);
      const jsonString = atob(decodedString);
      setParsedData(JSON?.parse(jsonString));
    }
    if (sessionStorage?.getItem('viewTaskMode')) {
      setViewTaskMode(sessionStorage?.getItem('viewTaskMode'));
    }
  }, [])

  useEffect(() => {
    setSearchInput(filters?.searchTerm || "");
  }, [filters?.searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters?.searchTerm) {
        onFilterChange("searchTerm", searchInput);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, filters?.searchTerm, onFilterChange]);

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({});
    setRootSubroot({ Task: "AddTask" });
  };

  const handleFormSubmit = async (formValues, mode, module) => {
    const rootflag =
      rootSubrootflagval?.Task == "AddTask"
        ? { Task: "subroot" }
        : rootSubrootflagval;
    const addTaskApi = await AddTaskDataApi(formValues, rootflag ?? {}, module);
    if (addTaskApi && addTaskApi?.rd[0]?.stat == 1) {
      // Removed setFormDrawerOpen(false) here to allow Sidedrawer to finish its async work.
      // Sidedrawer will call onClose() (handleDrawerToggle) which will set formDrawerOpen to false.
      // setOpenChildTask(true); // Moved to Sidedrawer.jsx to avoid double refresh
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
    return addTaskApi;
  };

  const handleViewModeChange = (event, newView) => {
    if (newView !== null) {
      setViewTaskMode(newView);
      sessionStorage?.setItem('viewTaskMode', newView);
    }
  };

  const handleViewChange = (event, newView) => {
    if (!newView || newView === view) return;
    if (newView === "calendar") {
      navigate('/myCalendar');
    } else {
      if (newView !== 'archive') {
        setLastNonArchiveView(newView);
      }
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
        <ToggleButton value="bugview" aria-label="Bug View" sx={{ borderRadius: '8px' }}>
          <OctagonAlert className="iconbtn" size={20} />
        </ToggleButton>
        <ToggleButton value="Dynamic-Filter" aria-label="Dynamic Filter" sx={{ borderRadius: '8px' }}>
          <ListFilter className="iconbtn" size={20} />
        </ToggleButton>
        {/* <ToggleButton value="archive" aria-label="archive tasks" sx={{ borderRadius: '8px' }}>
          <Archive className="iconbtn" size={20} />
        </ToggleButton> */}
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
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <TextField
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          {!isLaptop && (
            <ScrollableCategoryTabs
              taskCategory={categoryMaster}
              selectedCategory={filters?.category}
              handleFilterChange={handleFilterChange}
              showArchive={archiveFlag}
            />
          )}
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
                padding: '4px',
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
              title={archiveFlag ? "Exclude Archive tasks" : "Include Archive Task"}
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="archived task"
                onClick={handleArchivedTaskFilter}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: '6px',
                  backgroundColor:
                    archiveFlag ? "#ffe0b2" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <Archive className="iconbtn"
                  color={
                    archiveFlag ? "#ef6c00" : "#0000008a"
                  } size={20} />
              </IconButton>
            </Tooltip>
          )}

          {location?.pathname?.includes("/projects") && (
            <Tooltip
              placement="top"
              title={showFavoritesOnly ? "Showing favourites" : "Show favourites first"}
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Favourite modules"
                onClick={onToggleFavoritesOnly}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: '4px',
                  backgroundColor: showFavoritesOnly ? "#FFD700" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <Star
                  className="iconbtn"
                  size={20}
                  fill={showFavoritesOnly ? "#fff" : "transparent"}
                  color={showFavoritesOnly ? "#fff" : "#0000008a"}
                />
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
                  disabled={parsedData?.isreadonly === 1 && profileData?.designation?.toLowerCase() !== "admin"}
                >
                  New
                </Button>
              )}
              <ToggleButtonGroup
                value={location?.pathname?.includes("/tasks/") ? viewTaskMode : null}
                exclusive
                size="small"
                onChange={location?.pathname?.includes("/tasks/") ? handleViewModeChange : null}
                aria-label="View mode"
                className="view-mode-toggle"
              >
                <Tooltip
                  title={!location?.pathname?.includes("/tasks/") ? "Available only when process with project to task page" : "My tasks view"}
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      value="me"
                      className="toggle-btn"
                      sx={{ borderRadius: '8px', minHeight: '40px' }}
                      disabled={!location?.pathname?.includes("/tasks/")}
                    >
                      <User size={20} className="toggle-icon" />
                    </ToggleButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    !location?.pathname?.includes("/tasks/")
                      ? "Available only when process with project to task page"
                      : parsedData?.isLimited == 1
                        ? "Access limited: Team view disabled"
                        : "Team tasks view"
                  }
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      disabled={!location?.pathname?.includes("/tasks/") || parsedData?.isLimited == 1}
                      value="team"
                      className="toggle-btn"
                      sx={{ borderRadius: '8px', minHeight: '40px' }}
                    >
                      <Users size={20} className="toggle-icon" />
                    </ToggleButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    !location?.pathname?.includes("/tasks/")
                      ? "Available only when process with project to task page"
                      : parsedData?.isLimited == 1
                        ? "Access limited: Created by view disabled"
                        : "Tasks created by me view"
                  }
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      disabled={!location?.pathname?.includes("/tasks/") || parsedData?.isLimited == 1}
                      value="createdby"
                      className="toggle-btn"
                      sx={{ borderRadius: '8px', minHeight: '40px' }}
                    >
                      <UserPlus size={20} className="toggle-icon" />
                    </ToggleButton>
                  </span>
                </Tooltip>
              </ToggleButtonGroup>
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
          secStatusData={secStatusData}
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
