import React from "react";
import ReusableTable from "./ReusableTable";
import IconButton from "@mui/material/IconButton";
import { priorityColors, statusColors } from "../../../Utils/globalfun";
import TaskPriority from "../../ShortcutsComponent/TaskPriority";
import { Eye } from "lucide-react";
import { selectedRowData } from "../../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";

const RnDTask = ({ handleDtopen, taskRnd, decodedData, onStatusChange }) => {
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const handleEyeClick = (row) => {
        setSelectedTask(row);
        handleDtopen(true);
    };

    return (
        <ReusableTable
            className="reusable-table-container"

            columns={[
                { id: "taskname", label: "Research Topic" },
                { id: "project/module", label: "Project/Module" },
                { id: "status", label: "Status" },
                { id: "priority", label: "Priority" },
                { id: "action", label: "Action" }
            ]}
            data={taskRnd?.map(row => ({
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

export default RnDTask;
