import React from "react";
import {
    Card, CardContent, CardMedia, IconButton, Avatar, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box
} from "@mui/material";
import { CloudDownload } from "lucide-react";
import "./Styles/ReferencePr.scss";
import placeholderImg from "../../../Assests/Attachment.webp";
import { formatDate2 } from "../../../Utils/globalfun";

const referenceData = {
    attachments: [
        {
            name: "Project Requirement Document",
            details: "Contains project specifications and guidelines",
            image: placeholderImg
        },
        {
            name: "System Architecture",
            details: "Blueprint of system design and components",
            image: placeholderImg
        }
    ],
    tasks: [
        {
            taskName: "Requirement Analysis",
            uploadedBy: "John Doe",
            avatar: "",
            uploadDate: "2025-03-25",
            fileLink: "#"
        },
        {
            taskName: "Design Document",
            uploadedBy: "Jane Smith",
            avatar: "",
            uploadDate: "2025-03-24",
            fileLink: "#"
        }
    ]
};

const ReferencePr = () => {
    return (
        <div className="ref_MainDiv">
            {/* Attachments List */}
            <div className="ref_attachments">
                {referenceData.attachments.map((attachment, index) => (
                    <Card key={index} className="ref_card">
                        <Box className="ref_cardBox">
                            <CardMedia
                                component="img"
                                image={attachment.image}
                                alt="Attachment"
                                className="ref_cardMedia"
                            />
                            <CardContent className="ref_cardContent">
                                <Typography className="typo">{attachment.name}</Typography>
                                <Typography className="subtypo">{attachment.details}</Typography>
                            </CardContent>
                        </Box>
                        <IconButton className="ref_iconButton">
                            <CloudDownload size={22} color="#7367f0" />
                        </IconButton>
                    </Card>
                ))}
            </div>

            {/* Task Table */}
            <TableContainer className="ref_tableContainer" component={Paper}>
                <Table className="ref_table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Task Name</TableCell>
                            <TableCell>Uploaded By</TableCell>
                            <TableCell>Upload Date</TableCell>
                            <TableCell>File</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {referenceData.tasks.map((task, index) => (
                            <TableRow key={index}>
                                <TableCell>{task.taskName}</TableCell>
                                <TableCell>
                                    <div className="ref_uploadedBy">
                                        <Avatar className="ref_avatar" src={task.avatar} alt={task.uploadedBy} />
                                        <Typography>{task.uploadedBy}</Typography>
                                    </div>
                                </TableCell>
                                <TableCell>{formatDate2(task.uploadDate)}</TableCell>
                                <TableCell>
                                    <a href={task.fileLink} className="ref_fileLink">
                                        View File
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ReferencePr;
