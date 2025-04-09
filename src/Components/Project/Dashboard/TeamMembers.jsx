import React from "react";
import { Avatar, Typography } from "@mui/material";
import ReusableTable from "./ReusableTable";

const teamMembers = [
    { id: 1, task: "Project Planning", name: "John Doe", designation: "Project Manager", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, task: "Wireframing", name: "Jane Smith", designation: "UI/UX Designer", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, task: "Backend Development", name: "Alex Johnson", designation: "Software Engineer", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, task: "Testing & Debugging", name: "Emily Davis", designation: "QA Engineer", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, task: "Server Deployment", name: "Michael Brown", designation: "DevOps Engineer", avatar: "https://i.pravatar.cc/150?img=5" },
];

const TeamMembers = () => {
    return (
        <ReusableTable
            className="reusable-table-container"
            columns={[
                { id: "id", label: "ID" },
                { id: "task", label: "Task Module" },
                { id: "name", label: "Team Member" },
                { id: "designation", label: "Designation" }
            ]}
            data={teamMembers}
            renderCell={(columnId, row) => {
                if (columnId === "name") {
                    return (
                        <div className="reusa_uploadedBy">
                            <Avatar src={row.avatar} alt={row.name} className="reusa_avatar" />
                            <Typography>{row.name}</Typography>
                        </div>
                    );
                }
                return row[columnId];
            }}
        />
    );
};

export default TeamMembers;
