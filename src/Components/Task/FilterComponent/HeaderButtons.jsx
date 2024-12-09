import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SidebarDrawer from "../../FormComponent/Sidedrawer";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData } from "../../../Recoil/atom";
import { toast } from "react-toastify";

const HeaderButtons = ({ activeButton, onButtonClick, isLoading, masterData, priorityData, projectData, statusData }) => {
  const buttonNames = ["Table", "Kanban"];
  const [rootSubroot, setRootSubroot] = useRecoilState(rootSubrootflag);
  const [formDataValue, setFormDataValue] = useRecoilState(formData);
  const [openChildTask, setOpenChildTask] = useRecoilState(fetchlistApiCall);
  const [selectedTask, setSelectedTask] = useRecoilState(selectedRowData);
  const rootSubrootflagval = useRecoilValue(rootSubrootflag)


  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setFormDataValue({})
    setRootSubroot({ Task: "AddTask" })
    setOpenChildTask(false);
    setSelectedTask({})

  };

  const handleFormSubmit = async (formValues, formDataValue) => {
    setOpenChildTask(false);
    const addTaskApi = await AddTaskDataApi(formValues ?? {}, formDataValue ?? {}, rootSubrootflagval ?? {});
    if (addTaskApi) {
      setFormDrawerOpen(false);
      setOpenChildTask(true);
      setSelectedTask({})
      setTimeout(() => {
        if (rootSubrootflagval?.Task === "SubTask") {
          toast.success("Sub Task Added Successfully...")
        } else {
          toast.success("Task Updated Successfully...")
        }
      }, 100);

    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
        // background: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {buttonNames.map((buttonName) => (
          <Button
            key={buttonName}
            variant="contained"
            onClick={() => onButtonClick(buttonName)}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              opacity: activeButton === buttonName ? .8 : 0.3,
              color: "black",
              fontWeight: "bold",
              boxShadow: 'none',
              "&:hover": { opacity: activeButton === buttonName ? 1 : 0.3 },
            }}
          >
            {buttonName}
          </Button>
        ))}
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        className="buttonClassname"
        onClick={handleDrawerToggle}
      >
        New
      </Button>
      <SidebarDrawer
        open={formdrawerOpen}
        onClose={handleDrawerToggle}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        masterData={masterData}
        priorityData={priorityData}
        projectData={projectData}
        statusData={statusData}
      />
    </Box>
  );
};

export default HeaderButtons;
