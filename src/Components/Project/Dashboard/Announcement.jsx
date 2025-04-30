import React from "react";
import ReusableTable from "./ReusableTable";
import IconButton from "@mui/material/IconButton";
import TaskPriority from "../../ShortcutsComponent/TaskPriority";
import { priorityColors, statusColors } from "../../../Utils/globalfun";
import { Eye } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { selectedRowData } from "../../../Recoil/atom";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";

const Announcement = ({ handleDtopen, taskAnnouncement, decodedData, onStatusChange }) => {
  const setSelectedTask = useSetRecoilState(selectedRowData);
  const handleEyeClick = (row) => {
    setSelectedTask(row);
    handleDtopen(true);
  };

  return (
    <ReusableTable
      className="reusable-table-container"
      columns={[
        { id: "taskname", label: "Announcement" },
        { id: "project/module", label: "Project/Module" },
        { id: "status", label: "Status" },
        { id: "priority", label: "Priority" },
        { id: "action", label: "Action" }
      ]}
      data={taskAnnouncement.map(row => ({
        ...row,
        status: <StatusBadge task={row} statusColors={statusColors} onStatusChange={onStatusChange} disable={true} />,
        "project/module": `${decodedData?.project}/${decodedData?.module}`,
        priority: TaskPriority(row.priority, priorityColors),
        action: (
          <IconButton
            aria-label="view Task button"
            onClick={() => handleEyeClick(row)}
          >
            <Eye
              size={20}
              color="#808080"
              className="iconbtn"
            />
          </IconButton>
        )
      }))}
    />
  );
};

export default Announcement;
