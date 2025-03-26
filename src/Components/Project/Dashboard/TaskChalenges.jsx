import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import "./Styles/TaskChallenges.scss";
const challenges = [
    { id: 1, title: "Resource Allocation", description: "Difficulty in assigning the right resources to tasks efficiently." },
    { id: 2, title: "Time Management", description: "Delays due to unforeseen dependencies and scope creep." },
    { id: 3, title: "Communication Issues", description: "Lack of clear communication leading to misunderstandings." },
    { id: 4, title: "Technical Limitations", description: "Challenges with outdated or incompatible technologies." },
    { id: 5, title: "Budget Constraints", description: "Limited budget affecting project timelines and resources." },
    { id: 6, title: "Risk Management", description: "Identifying and mitigating project risks proactively." },
];

const TaskChallenges = () => {
    return (
        <div className="challenges-container">
            <TableContainer component={Paper} className="challenges-table-container">
                <Table className="challenges_table">
                    <TableHead>
                        <TableRow className="table-header">
                            <TableCell>ID</TableCell>
                            <TableCell>Challenge</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {challenges.map((challenge) => (
                            <TableRow key={challenge.id}>
                                <TableCell>{challenge.id}</TableCell>
                                <TableCell className="challenge-title">{challenge.title}</TableCell>
                                <TableCell className="challenge-description">{challenge.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default TaskChallenges;
