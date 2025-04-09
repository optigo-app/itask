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
    Box,
    Button,
} from "@mui/material";
import "./Styles/MeetingGrid.scss";
import { getTimeLeft, ImageUrl, toISTDateTime } from "../../Utils/globalfun";
import { CircleCheck, Eye } from "lucide-react";
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';




const MeetingTable = ({ meeting, StatusCircles, handleAcceptMeeting, handleReject, handleAttendMeeting, background }) => {

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
                                {StatusCircles({ row, redCount: 5, yellowCount: 10, greenCount: 50 })}
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    {row?.isAction && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Button className="btnAccept buttonClassname"
                                                variant="contained" size="small" color="primary" onClick={handleAcceptMeeting}>
                                                Accept
                                            </Button>
                                            <Button className="btnReject dangerbtnClassname"
                                                variant="contained" size="small" color="error" onClick={handleReject}>
                                                Reject
                                            </Button>
                                        </Box>
                                    )}
                                    {row?.isAttendBtn != 0 &&
                                        <Tooltip
                                            placement="top"
                                            title={row?.isAttendBtn == 2 ? "Attended" : "Mark as Attended"}
                                            arrow
                                            classes={{ tooltip: 'custom-tooltip' }}>
                                            <IconButton
                                                onClick={() => handleAttendMeeting(row)}
                                                size="small"
                                                aria-label="meeting-attend"
                                                aria-labelledby="meeting-attend"
                                                sx={{
                                                    color: row?.isAttendBtn == 2 ? '#ffffff' : '#7d7f85',
                                                    backgroundColor: row?.isAttendBtn == 2 ? '#7367f0' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: row?.isAttendBtn == 2 ? '#7367f0' : 'rgba(0, 0, 0, 0.04)',
                                                    },
                                                }}
                                            >
                                                <CircleCheck
                                                    sx={{
                                                        fontSize: '20px',
                                                        color: row?.isAttendBtn === 2 ? "#fff" : "#7d7f85"
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    }
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
