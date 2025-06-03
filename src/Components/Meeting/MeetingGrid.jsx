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
import { formatDate2, formatDate3, getTimeLeft, ImageUrl, toISTDateTime } from "../../Utils/globalfun";
import { Eye, Pencil } from "lucide-react";

const MeetingTable = ({ meeting, selectedTab, setMeetingDetailModalOpen, StatusCircles, handleAcceptMeeting, handleReject, handleAttendMeeting, handleDrawerToggle, setCalFormData, setFormData, background, hanldePAvatarClick, handleOpenStatusModal }) => {
    const [sortConfig, setSortConfig] = useState({ key: "entrydate", direction: "desc" });
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

    const renderAssigneeAvatars = (guests, row) => (
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
                        sx={{ backgroundColor: background(`${user?.firstname + " " + user?.lastname}`) }}
                        onClick={() => hanldePAvatarClick(user, user.id)}
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
                        <TableCell>Participant</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell sx={{ width: '100px' }} className="sticky-last-col">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className="table-body">
                    {sortedMeetings?.map((row) => (
                        <TableRow key={row.meetingid}>
                            <TableCell>{row.meetingtitle}</TableCell>
                            <TableCell>{row.prModule?.taskPr + "/" + row.prModule?.taskname}</TableCell>
                            <TableCell>{formatDate3(row.StartDate)}</TableCell>
                            <TableCell>{renderAssigneeAvatars(row.guests, row)}</TableCell>
                            {/* <TableCell>
                                {StatusCircles(row, { redCount: 5, yellowCount: 10, greenCount: 50 })}
                            </TableCell> */}
                            <TableCell>
                                <a href="#"
                                     onClick={() => handleOpenStatusModal(row)} className="status-link">
                                    Check Status
                                </a>
                            </TableCell>
                            <TableCell align="center" sx={{ width: '100px' }} className="sticky-last-col">
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
                                        <Button className="buttonClassname"
                                            variant="contained" size="small" color="primary" onClick={() => handleAttendMeeting(row)}>
                                            Attend
                                        </Button>
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
