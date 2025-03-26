import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Typography } from "@mui/material";
import "./Styles/TeamMembers.scss";

const teamMembers = [
    { id: 1, task: "Project Planning", name: "John Doe", designation: "Project Manager", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, task: "Wireframing", name: "Jane Smith", designation: "UI/UX Designer", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, task: "Backend Development", name: "Alex Johnson", designation: "Software Engineer", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, task: "Testing & Debugging", name: "Emily Davis", designation: "QA Engineer", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, task: "Server Deployment", name: "Michael Brown", designation: "DevOps Engineer", avatar: "https://i.pravatar.cc/150?img=5" },
];

const TeamMembers = () => {
    return (
        <div className="team-container">
            <TableContainer component={Paper} className="team-table-container">
                <Table className="teamMember_table">
                    <TableHead>
                        <TableRow className="table-header">
                            <TableCell>ID</TableCell>
                            <TableCell>Task</TableCell>
                            <TableCell>Team Member</TableCell>
                            <TableCell>Designation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teamMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.id}</TableCell>
                                <TableCell className="member-task">{member.task}</TableCell>
                                <TableCell>
                                    <div className="team_uploadedBy">
                                        <Avatar src={member.avatar} alt={member.name} className="team-avatar" />
                                        <Typography>{member.name}</Typography>
                                    </div>
                                </TableCell>
                                <TableCell className="member-designation">{member.designation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default TeamMembers;
