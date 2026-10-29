import { Box, Typography, Avatar } from "@mui/material";
import { getAvatarColors, getInitials, ImageUrl } from "../../../Utils/globalfun";
import SafeAvatar from "../../ShortcutsComponent/SafeAvatar";

/* ----------------------------- Helper Utils ----------------------------- */
const normalizeBoolean = (value) =>
    value === 1 || value === "1" || value === true;

const getEmployeeName = (emp, fallbackId) =>
    emp
        ? `${emp?.firstname || ""} ${emp?.lastname || ""}`.trim()
        : String(fallbackId ?? "");

const getAvatarStyle = (assignee, name) => {
    return assignee?.avatar ? { backgroundColor: 'transparent' } : getAvatarColors(name);
};

/* --------------------------- Main Component ---------------------------- */

const DailyReportAttendanceList = ({
    rows = [],
    attendanceByDate = {},
    loggedInUserId = null,
    scrollable = true,
}) => {
    if (!rows.length) {
        return (
            <Box sx={styles.emptyContainer}>
                <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.7 }}>
                    No attendance records found
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                ...styles.container,
                ...(scrollable ? {} : { maxHeight: 'none', overflowY: 'visible' }),
            }}
        >
            {rows.map((row, index) => {
                const emp = row?.__employee;
                const dateKey = row?.__dateKey;
                const takerId = row?.TakenByEmpID;

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
                        sx={styles.row}
                    >
                        {/* Avatar Section */}
                        <SafeAvatar
                            alt={name}
                            src={ImageUrl(emp) || null}
                            sx={{
                                ...styles.avatar,
                                ...getAvatarStyle(emp, name),
                            }}
                        >
                            {!emp?.avatar && getInitials(name)}
                        </SafeAvatar>

                        <Box sx={styles.contentWrapper}>
                            <Box sx={styles.headerRow}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={styles.name}>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-block',
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                backgroundColor: isDone ? '#4caf50' : '#f44336',
                                                mr: 0.75,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        {name} {isMe && <Typography component="span" sx={styles.meLabel}>(You)</Typography>}
                                    </Typography>
                                    <Typography sx={styles.date}>
                                        {dateKey}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography
                                        sx={{
                                            ...styles.statusBadge,
                                            ...(isDone ? styles.doneBadge : styles.notDoneBadge),
                                        }}
                                    >
                                        {isDone ? "Done" : "Pending"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Remarks Section */}
                            {!!remark.trim() && (
                                <Box sx={styles.remarkContainer}>
                                    <Typography sx={styles.remark}>
                                        {remark}
                                    </Typography>
                                </Box>
                            )}
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
        maxHeight: 450,
        overflowY: "auto",
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        backgroundColor: '#f8f9fa', // Subtle background to make cards pop
        borderRadius: '8px',
    },

    emptyContainer: {
        py: 6,
        textAlign: "center",
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px dashed rgba(0,0,0,0.1)'
    },

    row: {
        display: "flex",
        gap: 2,
        px: 2,
        py: 1.5,
        alignItems: "flex-start",
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
            transform: 'translateY(-1px)'
        },
    },

    avatar: {
        width: 42,
        height: 42,
        fontSize: 16,
        fontWeight: 600,
        border: '2px solid #fff',
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },

    meLabel: {
        fontSize: 12,
        color: '#1976d2',
        fontWeight: 500,
        ml: 0.5
    },

    contentWrapper: {
        flex: 1,
        minWidth: 0,
    },

    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 0.5,
    },

    name: {
        fontWeight: 600,
        fontSize: '0.95rem',
        color: '#2c3e50',
        lineHeight: 1.2,
    },

    date: {
        fontSize: 12,
        color: "#7f8c8d",
    },

    statusBadge: {
        px: 1.5,
        py: 0.4,
        borderRadius: "6px",
        fontWeight: 700,
        fontSize: "10px",
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: '1px solid',
    },

    doneBadge: {
        backgroundColor: "rgba(76, 175, 80, 0.08)",
        color: "#2e7d32",
        borderColor: "rgba(76, 175, 80, 0.3)",
    },

    notDoneBadge: {
        backgroundColor: "rgba(244, 67, 54, 0.08)",
        color: "#d32f2f",
        borderColor: "rgba(244, 67, 54, 0.3)",
    },

    remarkContainer: {
        mt: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.8,
        backgroundColor: '#f1f3f4',
        p: 1,
        borderRadius: '6px',
    },

    remark: {
        fontSize: 13,
        color: "#444",
        lineHeight: 1.4,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    },
};