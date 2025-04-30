import React, { useEffect } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import ReusableTable from "./ReusableTable";
import { Add as AddIcon } from "@mui/icons-material";
import TeamSidebar from "./Team/TeamSidebar";
import { ImageUrl } from "../../../Utils/globalfun";

const teamMembers = [
    { id: 1, name: "John Doe", designation: "Project Manager", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Jane Smith", designation: "UI/UX Designer", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Alex Johnson", designation: "Software Engineer", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Emily Davis", designation: "QA Engineer", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Michael Brown", designation: "DevOps Engineer", avatar: "https://i.pravatar.cc/150?img=5" },
];

const TeamMembers = ({ taskAssigneeData, teamMemberData, decodedData, background }) => {
    const [open, setOpen] = React.useState(false);
    const [filteredTeamMembers, setFilteredTeamMembers] = React.useState([]);

    useEffect(() => {
        if (decodedData?.projectid && teamMemberData) {
            const projectId = String(decodedData.projectid); // Ensure key is string
            const members = teamMemberData[projectId] || [];
            setFilteredTeamMembers(members);
        }
    }, [decodedData, teamMemberData]);

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
                    { id: "name", label: "Team Member" },
                    { id: "designation", label: "Designation" },
                    { id: "role", label: "Role" }
                ]}
                data={filteredTeamMembers}
                renderCell={(columnId, row) => {
                    if (columnId === "name") {
                        return (
                            <div className="reusa_uploadedBy">
                                <Avatar src={ImageUrl(row)} alt={row.firstname} className="reusa_avatar"
                                    sx={{
                                        backgroundColor: background(row?.firstname),
                                    }}
                                />
                                <Typography>{row?.firstname + " " + row?.lastname}</Typography>
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
