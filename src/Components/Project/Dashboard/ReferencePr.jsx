import React from "react";
import {
    Card, CardContent, CardMedia, IconButton, Avatar, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box
} from "@mui/material";
import { CloudDownload } from "lucide-react";
import "./Styles/ReferencePr.scss";
import placeholderImg from "../../../Assests/Attachment.webp";
import { formatDate2 } from "../../../Utils/globalfun";
import ReusableTable from "./ReusableTable";

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

            <ReusableTable
              className="reusable-table-container"
                columns={[
                    { id: "taskName", label: "Task Name" },
                    { id: "uploadedBy", label: "Uploaded By" },
                    { id: "uploadDate", label: "Upload Date" },
                    { id: "file", label: "File" }
                ]}
                data={referenceData.tasks}
                renderCell={(columnId, row) => {
                    if (columnId === "uploadedBy") {
                        return (
                            <div className="reusa_uploadedBy">
                                <Avatar className="reusa_avatar" src={row.avatar} alt={row.uploadedBy} />
                                <Typography>{row.uploadedBy}</Typography>
                            </div>
                        );
                    }
                    if (columnId === "uploadDate") {
                        return formatDate2(row.uploadDate);
                    }
                    if (columnId === "file") {
                        return <a href={row.fileLink} className="ref_fileLink">View File</a>;
                    }
                    return row[columnId];
                }}
            />

        </div>
    );
};

export default ReferencePr;
