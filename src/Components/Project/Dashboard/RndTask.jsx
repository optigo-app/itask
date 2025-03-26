import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import "./Styles/RndTask.scss";

const rndData = [
    { id: 1, topic: "New Material Research", description: "Exploring eco-friendly materials for production." },
    { id: 2, topic: "AI Integration", description: "Investigating AI-driven automation for manufacturing." },
    { id: 3, topic: "Market Trends", description: "Analyzing current market demands and trends." },
    { id: 4, topic: "Process Optimization", description: "Enhancing production efficiency with lean methodologies." },
    { id: 5, topic: "Prototype Testing", description: "Conducting tests on new product prototypes." },
    { id: 6, topic: "Software Innovations", description: "Developing new software for operational improvements." },
];

const RnDTask = () => {
    return (
        <div className="rnd-container">
            <TableContainer component={Paper} className="rnd-table-container">
                <Table className="rnd_table">
                    <TableHead>
                        <TableRow className="table-header">
                            <TableCell>ID</TableCell>
                            <TableCell>Research Topic</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rndData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="rnd-topic">{item.topic}</TableCell>
                                <TableCell className="rnd-description">{item.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default RnDTask;
