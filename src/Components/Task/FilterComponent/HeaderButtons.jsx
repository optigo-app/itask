import React, { useState } from "react";
import { Box, Button, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SidebarDrawer from "../../FormComponent/Sidedrawer";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, selectedCategoryAtom } from "../../../Recoil/atom";
import { toast } from "react-toastify";
import { Kanban, List, SearchIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import './Styles.scss'

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
    <Box className="headerButtons">
      <Box sx={{ display: "flex", gap: 2 }}>
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
  );
};

export default HeaderButtons;
