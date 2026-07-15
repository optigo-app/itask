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
import { getUserProfileData } from "../../../Utils/globalfun";
import {
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
  Flag,
  Kanban,
  List,
  ListFilter,
  SearchIcon,
  Star,
  TimerIcon,
  User,
  UserPlus,
  Users,
  RefreshCw,
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
  showMilestonesOnly,
  onToggleMilestonesOnly,
  filters: filtersProp,
  queryData: queryDataProp,
  completedFlag: completedFlagProp,
  archivedFlag: archivedFlagProp,
  viewMode: viewModeProp,
  onViewModeChange: onViewModeChangeProp,
  formDrawerOpen: formDrawerOpenProp,
  onToggleFormDrawer: onToggleFormDrawerProp,
  onNewTask,
  formDataOverride: formDataOverrideProp,
  rootSubrootOverride: rootSubrootOverrideProp,
  isActive,
  onAfterSubmit,
  onRefresh,
}) => {
  const { hasAccess } = useAccess();
  const navigate = useSafeRedirect()
  const profileData = getUserProfileData();
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:601px) and (max-width:960px)");
  const location = useLocation();
  const globalFilters = useRecoilValue(Advfilters);
  const filters = filtersProp ?? globalFilters;
  const copyData = useRecoilValue(copyRowData);
  const searchParams = new URLSearchParams(location.search);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setFormDataValue = useSetRecoilState(formData);
  const globalRootSubroot = useRecoilValue(rootSubrootflag);
  const rootSubrootflagval = rootSubrootOverrideProp ?? globalRootSubroot;
  const [view, setView] = useState('');
  const [lastNonArchiveView, setLastNonArchiveView] = useState('table');
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryAtom);
  const [filterDrawerOpen, setFilterDrawerOpen] = useRecoilState(filterDrawer);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);
  const [globalFormDrawerOpen, setGlobalFormDrawerOpen] = useRecoilState(openFormDrawer);
  const formdrawerOpen = formDrawerOpenProp ?? globalFormDrawerOpen;

  const [globalViewTaskMode, setGlobalViewTaskMode] = useRecoilState(viewMode);
  const viewTaskMode = viewModeProp ?? globalViewTaskMode;
  const setViewTaskMode = onViewModeChangeProp ? (v) => onViewModeChangeProp(v) : setGlobalViewTaskMode;
  const globalArchiveFlag = useRecoilValue(archivedTask);
  const globalCompletedFlag = useRecoilValue(completedTask);
  const archiveFlag = archivedFlagProp ?? globalArchiveFlag;
  const completedFlag = completedFlagProp ?? globalCompletedFlag;
  const encodedData = searchParams.get("data");
  const [parsedData, setParsedData] = useState();
  const [categoryMaster, setCategoryMaster] = useState([]);
  const [searchInput, setSearchInput] = useState(filters?.searchTerm || "");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resolvedQueryData = queryDataProp ?? parsedData;
  const isTaskView = location?.pathname?.includes("/tasks/") || !!queryDataProp;

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
    if (onToggleFormDrawerProp) {
      onToggleFormDrawerProp();
    } else {
      setGlobalFormDrawerOpen(!globalFormDrawerOpen);
    }
    if (!queryDataProp) {
      setFormDataValue({});
      setRootSubroot({ Task: "AddTask" });
    }
  };

  const handleNewButtonClick = () => {
    if (onNewTask && queryDataProp) {
      onNewTask();
    } else {
      handleDrawerToggle();
    }
  };

  const handleFormSubmit = async (formValues, mode, module) => {
    const rootflag = rootSubrootflagval ?? {};
    const addTaskApi = await AddTaskDataApi(formValues, rootflag, module);
    if (addTaskApi && addTaskApi?.rd[0]?.stat == 1) {
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
      if (onViewModeChangeProp) {
        onViewModeChangeProp(newView);
      } else {
        setGlobalViewTaskMode(newView);
      }
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
        <ToggleButton value="Dynamic-Filter" aria-label="Dynamic Filter" sx={{ borderRadius: '8px' }}>
          <ListFilter className="iconbtn" size={20} />
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
              <FilterAltIcon className="iconbtn" color="#0000008a" fontSize="20px" />
            </IconButton>
          </Tooltip>
          {onRefresh && (
            <Tooltip
              placement="top"
              title={isRefreshing ? "Refreshing..." : "Refresh data"}
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Refresh data"
                disabled={isRefreshing}
                onClick={() => {
                  setIsRefreshing(true);
                  onRefresh();
                  // Keep spinning for at least 800ms so user sees feedback
                  // (onRefresh is sync state setter; actual loading is in parent)
                  setTimeout(() => setIsRefreshing(false), 800);
                }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: '4px',
                  backgroundColor: "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <RefreshCw
                  className={`iconbtn ${isRefreshing ? 'spin-icon' : ''}`}
                  color="#0000008a"
                  size={20}
                />
              </IconButton>
            </Tooltip>
          )}
          {location?.pathname?.includes("/tasks") && (
            <Tooltip
              placement="top"
              title={completedFlag ? "Hide completed tasks" : "Show completed tasks"}
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
                  padding: '4px',
                  backgroundColor: completedFlag ? "#28C76F" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <CircleCheck className="iconbtn" color={completedFlag ? "#ffff" : "#0000008a"} size={22} />
              </IconButton>
            </Tooltip>
          )}
          {location?.pathname?.includes("/tasks") && (
            <Tooltip
              placement="top"
              title={showFavoritesOnly ? "Show all tasks" : "Show favorite tasks only"}
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Favorite tasks"
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
          {location?.pathname?.includes("/tasks") && (
            <Tooltip
              placement="top"
              title={showMilestonesOnly ? "Show all tasks" : "Show milestones only"}
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <IconButton
                aria-label="Milestone tasks"
                onClick={onToggleMilestonesOnly}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: '4px',
                  backgroundColor: showMilestonesOnly ? "#7367f0" : "white",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    backgroundColor: showMilestonesOnly ? "#5a52c8" : "#f5f5f5",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <Flag
                  className="iconbtn"
                  size={20}
                  fill={showMilestonesOnly ? "#fff" : "transparent"}
                  color={showMilestonesOnly ? "#fff" : "#0000008a"}
                />
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
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.0.15)",
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
                onClick={() => handlePasteTask(resolvedQueryData, "main")}
                className="pasteButton"
                size={isSmallScreen ? "small" : isMediumScreen ? "medium" : "medium"}
              >
                Paste
              </Button>
            </Box>
          )}
          {location?.pathname?.includes("/tasks") && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {isTaskView && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="buttonClassname"
                  onClick={handleNewButtonClick}
                  size={isSmallScreen ? "small" : isMediumScreen ? "medium" : "medium"}
                  disabled={resolvedQueryData?.isreadonly === 1 && profileData?.designation?.toLowerCase() !== "admin"}
                >
                  New
                </Button>
              )}
              <ToggleButtonGroup
                value={isTaskView ? viewTaskMode : null}
                exclusive
                size="small"
                onChange={isTaskView ? handleViewModeChange : null}
                aria-label="View mode"
                className="view-mode-toggle"
              >
                <Tooltip
                  title={!isTaskView ? "Available only when process with project to task page" : "My tasks view"}
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      value="me"
                      className="toggle-btn"
                      sx={{ borderRadius: '8px', minHeight: '40px' }}
                      disabled={!isTaskView}
                    >
                      <User size={20} className="toggle-icon" />
                    </ToggleButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    !isTaskView
                      ? "Available only when process with project to task page"
                      : resolvedQueryData?.isLimited == 1
                        ? "Access limited: Team view disabled"
                        : "Team tasks view"
                  }
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      disabled={!isTaskView || resolvedQueryData?.isLimited == 1}
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
                    !isTaskView
                      ? "Available only when process with project to task page"
                      : resolvedQueryData?.isLimited == 1
                        ? "Access limited: Created by view disabled"
                        : "Tasks created by me view"
                  }
                  arrow
                  placement="top"
                  classes={{ tooltip: 'custom-tooltip' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ToggleButton
                      disabled={!isTaskView || resolvedQueryData?.isLimited == 1}
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
                  onClick={handleNewButtonClick}
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
          isActive={isActive}
          onAfterSubmit={onAfterSubmit}
          formDataOverride={formDataOverrideProp}
          rootSubrootOverride={rootSubrootOverrideProp}
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
