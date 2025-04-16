import React, { useMemo, useState } from "react";
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
    TableSortLabel,
} from "@mui/material";
import "./Styles/MeetingGrid.scss";
import { getTimeLeft, ImageUrl, toISTDateTime } from "../../Utils/globalfun";
import { CircleCheck, Eye, Pencil } from "lucide-react";

const MeetingTable = ({ meeting, selectedTab, setMeetingDetailModalOpen, StatusCircles, handleAcceptMeeting, handleReject, handleAttendMeeting, handleDrawerToggle, setCalFormData, setFormData, background }) => {
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const handleFormatDate = (startDate) => {
        const date = toISTDateTime(startDate);
        const finalDate = getTimeLeft(date);
        return finalDate;
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const sortedMeetings = useMemo(() => {
        const sorted = [...meeting];
        const { key, direction } = sortConfig;
        if (!key) return sorted;

        sorted.sort((a, b) => {
            const getValue = (item) => {
                if (key === "taskname") return item.prModule?.taskname || "";
                if (key === "StartDate") return new Date(item.StartDate);
                return (item[key] || "").toString().toLowerCase();
            };

            const aVal = getValue(a);
            const bVal = getValue(b);
            return direction === "asc" ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
        });

        return sorted;
    }, [meeting, sortConfig]);

    const renderSortCell = (label, key) => (
        <TableSortLabel
            active={sortConfig.key === key}
            direction={sortConfig.direction}
            onClick={() => handleSort(key)}
        >
            {label}
        </TableSortLabel>
    );

    const renderAssigneeAvatars = (guests) => (
        <AvatarGroup
            max={10}
            spacing={2}
            sx={{
                justifyContent: "start",
                "& .MuiAvatar-root": {
                    width: 25, height: 25, fontSize: "0.8rem", cursor: "pointer", border: "none",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.2)", zIndex: 10 }
                }
            }}
        >
            {guests?.map((user) => (
                <Tooltip
                    key={user?.id}
                    title={`${user?.firstname} ${user?.lastname}`}
                    placement="top"
                    arrow
                    classes={{ tooltip: "custom-tooltip" }}
                >
                    <Avatar
                        src={ImageUrl(user) || ""}
                        alt={user?.firstname}
                        sx={{ backgroundColor: background(user) }}
                    >
                        {!user.avatar && user?.firstname?.[0]}
                    </Avatar>
                </Tooltip>
            ))}
        </AvatarGroup>
    );

    return (
        <TableContainer component={Paper} className="meeting-table-container">
            <Table className="meetinggrid_table">
                <TableHead>
                    <TableRow className="table-header">
                        <TableCell>{renderSortCell("Title", "meetingtitle")}</TableCell>
                        <TableCell>{renderSortCell("Project / Module", "taskname")}</TableCell>
                        <TableCell>{renderSortCell("Start", "StartDate")}</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className="table-body">
                    {sortedMeetings?.map((row) => (
                        <TableRow key={row.meetingid}>
                            <TableCell>{row.meetingtitle}</TableCell>
                            <TableCell>{row.prModule?.taskPr + "/" + row.prModule?.taskname}</TableCell>
                            <TableCell>{handleFormatDate(row.StartDate)}</TableCell>
                            <TableCell>{renderAssigneeAvatars(row.guests)}</TableCell>
                            <TableCell>
                                {StatusCircles(row, { redCount: 5, yellowCount: 10, greenCount: 50 })}
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    {row?.isAction && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Button className="btnAccept buttonClassname"
                                                variant="contained" size="small" color="primary" onClick={() => handleAcceptMeeting(row)}>
                                                Accept
                                            </Button>
                                            <Button className="btnReject dangerbtnClassname"
                                                variant="contained" size="small" color="error" onClick={() => handleReject(row)}>
                                                Reject
                                            </Button>
                                        </Box>
                                    )}
                                    {row?.isAttendBtn != 0 &&
                                        <Tooltip
                                            placement="top"
                                            title={row?.ismeeting_attnd == 1 ? "Attended" : "Mark as Attended"}
                                            arrow
                                            classes={{ tooltip: 'custom-tooltip' }}>
                                            <IconButton
                                                onClick={() => handleAttendMeeting(row)}
                                                size="small"
                                                aria-label="meeting-attend"
                                                aria-labelledby="meeting-attend"
                                                sx={{
                                                    color: row?.ismeeting_attnd == 1 ? '#ffffff' : '#7d7f85',
                                                    backgroundColor: row?.ismeeting_attnd == 1 ? '#7367f0' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: row?.ismeeting_attnd == 1 ? '#7367f0' : 'rgba(0, 0, 0, 0.04)',
                                                    },
                                                }}
                                            >
                                                <CircleCheck
                                                    sx={{
                                                        fontSize: '20px',
                                                        color: row?.ismeeting_attnd === 1 ? "#fff" : "#7d7f85"
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    {selectedTab == "Upcoming" &&
                                        <IconButton
                                            aria-label="edit-meeting"
                                            onClick={() => {
                                                handleDrawerToggle();
                                                setCalFormData(row);
                                            }}
                                            sx={{
                                                '&.Mui-disabled': {
                                                    color: 'rgba(0, 0, 0, 0.26)',
                                                },
                                            }}
                                        >
                                            <Pencil
                                                size={20}
                                                color={"#808080"}
                                            />
                                        </IconButton>
                                    }

                                    <IconButton
                                        aria-label="view-meeting"
                                        onClick={() => {
                                            setMeetingDetailModalOpen(true)
                                            setFormData(row);
                                        }}>
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
