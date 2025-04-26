import React from "react";
import ReusableTable from "./ReusableTable";
import IconButton from "@mui/material/IconButton";
import { priorityColors, statusColors } from "../../../Utils/globalfun";
import TaskPriority from "../../ShortcutsComponent/TaskPriority";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import { Eye } from "lucide-react";

const rndData = [
    { id: 1, topic: "New Material Research", description: "Exploring eco-friendly materials for production.", status: "In Progress", priority: "High" },
    { id: 2, topic: "AI Integration", description: "Investigating AI-driven automation for manufacturing.", status: "Completed", priority: "Medium" },
    { id: 3, topic: "Market Trends", description: "Analyzing current market demands and trends.", status: "Not Started", priority: "Low" },
    { id: 4, topic: "Process Optimization", description: "Enhancing production efficiency with lean methodologies.", status: "In Progress", priority: "High" },
    { id: 5, topic: "Prototype Testing", description: "Conducting tests on new product prototypes.", status: "Completed", priority: "High" },
    { id: 6, topic: "Software Innovations", description: "Developing new software for operational improvements.", status: "Not Started", priority: "Medium" },
];

const RnDTask = ({handleDtopen}) => {
    const handleEyeClick = (id) => {
        handleDtopen(true);
    };

    return (
        <ReusableTable
            className="reusable-table-container"
            columns={[
                { id: "id", label: "ID" },
                { id: "topic", label: "Research Topic" },
                { id: "description", label: "Description" },
                { id: "status", label: "Status" },
                { id: "priority", label: "Priority" },
                { id: "action", label: "Action" }
            ]}
            data={rndData.map(row => ({
                ...row,
                // status: StatusBadge(row.status, statusColors),
                priority: TaskPriority(row.priority, priorityColors),
                action: (
                    <IconButton
                        aria-label="view Task button"
                        onClick={() => handleEyeClick(row?.id)}
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
