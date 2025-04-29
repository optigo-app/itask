import React from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import ReusableTable from "./ReusableTable";
import { Add as AddIcon } from "@mui/icons-material";
import TeamSidebar from "./Team/TeamSidebar";

const teamMembers = [
    { id: 1, name: "John Doe", designation: "Project Manager", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Jane Smith", designation: "UI/UX Designer", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Alex Johnson", designation: "Software Engineer", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Emily Davis", designation: "QA Engineer", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Michael Brown", designation: "DevOps Engineer", avatar: "https://i.pravatar.cc/150?img=5" },
];

const TeamMembers = ({ taskAssigneeData }) => {
    const [open, setOpen] = React.useState(false);
    const handleSidebarOpen = () => {
        setOpen(true);
    }
    const handleSidebarClose = () => {
        setOpen(false);
    }

    const handleSave = (employee, role) => {
        console.log('Saved:', { employee, role });
        handleSidebarClose();
    };
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    className="buttonClassname"
                    onClick={handleSidebarOpen}
                >Add Team</Button>
            </Box>
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
            <TeamSidebar
                open={open}
                onClose={handleSidebarClose}
                taskAssigneeData={taskAssigneeData}
                onSave={handleSave}
            />
        </>
    );
};

export default TeamMembers;
