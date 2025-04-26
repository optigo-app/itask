import React from "react";
import ReusableTable from "./ReusableTable";
import IconButton from "@mui/material/IconButton";
import TaskPriority from "../../ShortcutsComponent/TaskPriority";
import { priorityColors } from "../../../Utils/globalfun";
import { Eye } from "lucide-react";

// Sample challenge data
const challenges = [
    { id: 1, title: "Resource Allocation", description: "Difficulty in assigning the right resources to tasks efficiently.", status: "In Progress", priority: "High" },
    { id: 2, title: "Time Management", description: "Delays due to unforeseen dependencies and scope creep.", status: "Completed", priority: "Medium" },
    { id: 3, title: "Communication Issues", description: "Lack of clear communication leading to misunderstandings.", status: "Not Started", priority: "Low" },
    { id: 4, title: "Technical Limitations", description: "Challenges with outdated or incompatible technologies.", status: "In Progress", priority: "High" },
    { id: 5, title: "Budget Constraints", description: "Limited budget affecting project timelines and resources.", status: "Completed", priority: "Medium" },
    { id: 6, title: "Risk Management", description: "Identifying and mitigating project risks proactively.", status: "Not Started", priority: "Low" },
];

// Render priority label
const renderPriorityLabel = (priority) => {
    const color = priority && priorityColors[priority]?.color || '#fff';
    const backgroundColor = priority && priorityColors[priority]?.backgroundColor || '#7d7f85a1';

    return (
        <div style={{
            color,
            backgroundColor,
            width: 'fit-content',
            padding: '0.2rem 0.8rem',
            borderRadius: '5px',
            textAlign: 'center',
            fontSize: '13.5px',
            fontWeight: '500',
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
        }}
            className="priority-label"
        >
            {priority ?? '-'}
        </div>
    );
};

const TaskChallenges = ({handleDtopen}) => {
    const handleEyeClick = (id) => {
        handleDtopen(true);
    };

    return (
        <ReusableTable
            className="reusable-table-container"
            columns={[
                { id: "id", label: "ID" },
                { id: "title", label: "Challenge" },
                { id: "description", label: "Description" },
                { id: "status", label: "Status" },
                { id: "priority", label: "Priority" },
                { id: "action", label: "Action" }
            ]}
            data={challenges.map(row => ({
                ...row,
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

export default TaskChallenges;
