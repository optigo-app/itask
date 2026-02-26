import { Box, Typography, Avatar } from "@mui/material";
import { getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";

/* ----------------------------- Helper Utils ----------------------------- */
const normalizeBoolean = (value) =>
    value === 1 || value === "1" || value === true;

const getEmployeeName = (emp, fallbackId) =>
    emp
        ? `${emp?.firstname || ""} ${emp?.lastname || ""}`.trim()
        : String(fallbackId ?? "");

const background = (assignee) => {
    const avatarBackgroundColor = assignee?.avatar ? 'transparent' :
        getRandomAvatarColor(assignee);
    return avatarBackgroundColor;
};

/* --------------------------- Main Component ---------------------------- */

const DailyReportAttendanceList = ({
    rows = [],
    attendanceByDate = {},
    loggedInUserId = null,
}) => {
    if (!rows.length) {
        return (
            <Box sx={styles.emptyContainer}>
                <Typography variant="body2">
                    No attendance records found
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            {rows.map((row, index) => {
                const emp = row?.__employee;
                const dateKey = row?.__dateKey;
                const takerId = row?.TakenByEmpID;

                // Only apply "live" local state if it's the current user's entry
                const isMe = String(takerId) === String(loggedInUserId);
                const liveState = isMe ? attendanceByDate?.[dateKey] : null;

                const isDone = liveState
                    ? liveState.checked
                    : normalizeBoolean(row?.isdone);

                const remark = liveState ? (liveState.remark ?? "") : (row?.remarks ?? "");

                const name = getEmployeeName(emp, row?.TakenByEmpID);

                return (
                    <Box
                        key={`${row?.ID}-${dateKey}-${row?.TakenByEmpID}`}
                        sx={{
                            ...styles.row,
                            borderTop:
                                index === 0
                                    ? "none"
                                    : "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        {/* Avatar */}
                        <Avatar
                            key={row?.ID}
                            alt={name}
                            src={ImageUrl(emp) || null}
                            sx={{
                                backgroundColor: background(name),
                                width: 36,
                                height: 36,
                                fontSize: 14,
                                mt: '2px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            }} >
                            {!emp.avatar && name?.charAt(0)}
                        </Avatar>

                        <Box sx={styles.contentWrapper}>
                            <Box sx={styles.headerRow}>
                                <Typography sx={styles.name}>
                                    {name}
                                </Typography>

                                <Typography sx={styles.date}>
                                    {dateKey || ""}
                                </Typography>
                            </Box>

                            <Box sx={styles.statusRow}>
                                <Typography
                                    sx={{
                                        ...styles.statusBadge,
                                        ...(isDone
                                            ? styles.doneBadge
                                            : styles.notDoneBadge),
                                    }}
                                >
                                    {isDone ? "Done" : "Not Done"}
                                </Typography>

                                {!!remark.trim() && (
                                    <Typography sx={styles.remark}>
                                        “{remark}”
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default DailyReportAttendanceList;

/* ------------------------------ Styles -------------------------------- */

const styles = {
    container: {
        maxHeight: 300,
        overflowY: "auto",
    },

    emptyContainer: {
        py: 4,
        textAlign: "center",
        color: "rgba(0,0,0,0.55)",
    },

    row: {
        display: "flex",
        gap: 1.25,
        px: 1.5,
        py: 1,
        alignItems: "flex-start",
        transition: "background-color 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(0,0,0,0.02)",
        },
    },

    avatar: {
        width: 36,
        height: 36,
        fontSize: 14,
        mt: "2px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    },

    contentWrapper: {
        flex: 1,
        minWidth: 0,
    },

    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 1,
        mb: 0.5,
    },

    name: {
        fontWeight: 700,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
    },

    date: {
        fontSize: 11,
        color: "rgba(0,0,0,0.55)",
        flexShrink: 0,
    },

    statusRow: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
    },

    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: "2px",
        borderRadius: "999px",
        fontWeight: 700,
        fontSize: "11px",
        lineHeight: 1,
    },

    doneBadge: {
        background: "rgba(76, 175, 80, 0.14)",
        color: "#2e7d32",
    },

    notDoneBadge: {
        background: "rgba(244, 67, 54, 0.12)",
        color: "#c62828",
    },

    remark: {
        color: "rgba(0,0,0,0.65)",
        fontStyle: "italic",
        wordBreak: "break-word",
        lineHeight: 1.3,
        flex: 1,
    },
};
