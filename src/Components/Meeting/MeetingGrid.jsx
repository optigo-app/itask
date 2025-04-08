import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    AvatarGroup,
    Tooltip,
    Avatar,
    Typography,
    Box,
} from "@mui/material";
import "./Styles/MeetingGrid.scss";
import { getRandomAvatarColor, getTimeLeft, ImageUrl, toISTDateTime } from "../../Utils/globalfun";
import { Eye } from "lucide-react";


const MeetingTable = ({ meeting, StatusCircles, background }) => {
    console.log('meeting: ', meeting);

    const handleFormatDate = (startDate) => {
        const date = toISTDateTime(startDate);
        const finalDate = getTimeLeft(date);
        return finalDate;
    };

    return (
        <TableContainer component={Paper} className="meeting-table-container">
            <Table className="meetinggrid_table">
                <TableHead>
                    <TableRow className="table-header">
                        <TableCell>Title</TableCell>
                        <TableCell>Project / Module</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className="table-body">
                    {meeting?.map((row) => (
                        <TableRow key={row.meetingid}>
                            <TableCell>{row.meetingtitle}</TableCell>
                            <TableCell>{row.prModule?.taskPr + "/" + row.prModule?.taskname}</TableCell>
                            <TableCell>{handleFormatDate(row.StartDate)}</TableCell>
                            <TableCell>
                                <AvatarGroup max={10}
                                    spacing={2}
                                    sx={{
                                        justifyContent: "start",
                                        '& .MuiAvatar-root': {
                                            width: 25,
                                            height: 25,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            border: 'none',
                                            transition: 'transform 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.2)',
                                                zIndex: 10
                                            }
                                        }
                                    }}
                                >
                                    {row?.guests?.map((participant) => (
                                        <Tooltip
                                            placement="top"
                                            key={participant?.id}
                                            title={participant?.firstname + " " + participant?.lastname}
                                            arrow
                                            classes={{ tooltip: 'custom-tooltip' }}
                                        >
                                            <Avatar
                                                key={participant?.id}
                                                alt={participant?.firstname + " " + participant?.lastname}
                                                src={ImageUrl(participant) || null}
                                                sx={{
                                                    backgroundColor: background(participant),
                                                }}
                                            >
                                                {!participant.avatar && participant?.firstname?.charAt(0)}
                                            </Avatar>
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                            </TableCell>
                            <TableCell>
                                {StatusCircles({ meeting, redCount: 5, yellowCount: 10, greenCount: 50 })}
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton >
                                        <Eye
                                            size={20}
                                            color={"#808080"}
                                        />
                                    </IconButton>
                                </Box>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MeetingTable;
