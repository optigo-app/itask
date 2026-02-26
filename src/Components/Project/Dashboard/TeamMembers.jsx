import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Checkbox, IconButton, Typography, Chip, Tooltip, ToggleButtonGroup, ToggleButton, TextField, InputAdornment } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ReusableTable from "./ReusableTable";
import { Add as AddIcon } from "@mui/icons-material";
import TeamSidebar from "./Team/TeamSidebar";
import { ImageUrl } from "../../../Utils/globalfun";
import { AddPrTeamsApi } from "../../../Api/TaskApi/AddPrTeamsApi";
import { toast } from "react-toastify";
import { GetPrTeamsApi } from "../../../Api/TaskApi/prTeamListApi";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { Pencil, Trash2, Users, ShieldAlert, Eye, UserX, SearchIcon } from "lucide-react";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { DelPrTeamsApi } from "../../../Api/TaskApi/DelPrTeamsApi";
import TeamTemplateInfoButton from "../../ShortcutsComponent/TeamTemplate/TeamTemplateInfoButton";

const TeamMembers = ({ taskAssigneeData, decodedData, background }) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(null);
    const [selectedTeamMember, setSelectedTeamMember] = React.useState({});
    const [teamMemberData, setTeamMemberData] = React.useState([]);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const [permissionLoadingId, setPermissionLoadingId] = React.useState(null);
    const [filterValue, setFilterValue] = React.useState("all");
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            // Debounced search logic can be added here if needed
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput]);

    const filteredTeamData = React.useMemo(() => {
        let filtered = teamMemberData;

        // Apply permission filters
        if (filterValue === "limited") {
            filtered = filtered.filter(m => m.islimitedaccess === 1);
        }
        if (filterValue === "readonly") {
            filtered = filtered.filter(m => m.isreadonly === 1);
        }

        // Apply search filter
        if (searchInput.trim()) {
            const searchTerm = searchInput.toLowerCase().trim();
            filtered = filtered.filter(member =>
                member.firstname?.toLowerCase().includes(searchTerm) ||
                member.lastname?.toLowerCase().includes(searchTerm) ||
                member.designation?.toLowerCase().includes(searchTerm) ||
                member.rolename?.toLowerCase().includes(searchTerm) ||
                `${member.firstname} ${member.lastname}`?.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [teamMemberData, filterValue, searchInput]);

    const permissionCheckboxSx = {
        color: alpha(theme.palette.primary.main, 0.65),
        "&.Mui-checked": {
            color: theme.palette.primary.main,
        },
    };

    useEffect(() => {
        if (teamMemberData?.length > 0) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        handleGetTeamMembers();
    }, []);

    const handleSidebarOpen = () => {
        setOpen(true);
    };

    const handleSidebarClose = () => {
        setSelectedTeamMember([]);
        setOpen(false);
        setCnfDialogOpen(false);
    };

    const handleGetTeamMembers = async () => {
        const apiRes = await GetPrTeamsApi(decodedData);
        if (apiRes?.rd) {
            const assigneeMaster =
                JSON.parse(sessionStorage?.getItem("taskAssigneeData")) || [];
            const enrichedTeamMembers = apiRes.rd.map((member) => {
                const empDetails = assigneeMaster.find(
                    (emp) => emp.id === member.assigneeid
                );
                const islimitedaccess = member?.islimitedaccess ?? member?.isLimitedAccess ?? 0;
                const isreadonly = member?.isreadonly ?? member?.isReadonly ?? member?.isreadonlyaccess ?? 0;
                return {
                    ...member,
                    islimitedaccess,
                    isreadonly,
                    ...empDetails,
                };
            });
            setTeamMemberData(enrichedTeamMembers);
            setIsLoading(false);
        } else {
            toast.error("Something went wrong");
            setTeamMemberData([]);
        }
    };

    const handleEdit = (row) => {
        setSelectedTeamMember(row);
        setOpen(true);
    };

    const handleDeleteDialog = (row) => {
        setSelectedTeamMember(row);
        setCnfDialogOpen(true);
    };

    const handleFinalDelete = async () => {
        const apiRes = await DelPrTeamsApi(selectedTeamMember, decodedData);
        if (apiRes?.Status == 200) {
            toast.success("Team deleted successfully");
            const updatedList = teamMemberData.filter(
                (member) => member.id !== selectedTeamMember.id
            );
            setTeamMemberData(updatedList);
            setCnfDialogOpen(false);
        }
    }

    const handleSave = async (updatedList) => {
        setIsLoading(true);
        setOpen(false);
        try {
            const formattedTeamList = updatedList
                ?.map(
                    (member) =>
                        `${member.employee.id}#${member.role}#${member?.limitedAccess === true ? 1 : 0 ?? 0}#${member?.isReadonly === true ? 1 : 0 ?? 0}`
                )
                .join(",");
            const apiRes = await AddPrTeamsApi(formattedTeamList, decodedData);
            if (apiRes?.rd[0]?.stat === 1) {
                toast.success("Team added successfully");
                handleGetTeamMembers();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error("Error saving team:", error);
            toast.error("An error occurred while saving the team");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleLimitedAccess = async (row) => {
        if (!row?.assigneeid || !row?.rolename) return;
        if (permissionLoadingId === row.assigneeid) return;

        const nextLimited = row?.islimitedaccess === 1 ? 0 : 1;
        const formattedTeamList = `${row.assigneeid}#${row.rolename}#${nextLimited}`;

        try {
            setPermissionLoadingId(row.assigneeid);
            const apiRes = await AddPrTeamsApi(formattedTeamList, decodedData);

            if (apiRes?.rd?.[0]?.stat === 1) {
                toast.success(
                    nextLimited === 1
                        ? "Permission updated to Limited access"
                        : "Permission updated to Full access"
                );
                setTeamMemberData((prev) =>
                    prev.map((member) =>
                        member.assigneeid === row.assigneeid
                            ? { ...member, islimitedaccess: nextLimited }
                            : member
                    )
                );
            } else {
                toast.error("Failed to update permission");
            }
        } catch (error) {
            console.error("Error updating team permission:", error);
            toast.error("Error updating permission");
        } finally {
            setPermissionLoadingId(null);
        }
    };

    const handleQuickPermissionUpdate = async (row, updates) => {
        try {
            const assigneeId = row?.assigneeid ?? row?.id;
            const roleName = row?.rolename ?? "";
            const nextLimited = updates?.islimitedaccess ?? row?.islimitedaccess ?? 0;
            const nextReadonly = updates?.isreadonly ?? row?.isreadonly ?? 0;
            const formatted = `${assigneeId}#${roleName}#${nextLimited === 1 ? 1 : 0}#${nextReadonly === 1 ? 1 : 0}`;
            const apiRes = await AddPrTeamsApi(formatted, decodedData);
            if (apiRes?.rd[0]?.stat === 1) {
                toast.success("Permissions updated");
                setTeamMemberData((prev) =>
                    prev.map((member) =>
                        (member.assigneeid === assigneeId || member.id === assigneeId)
                            ? { ...member, ...updates }
                            : member
                    )
                );
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error("Error updating permissions:", error);
            toast.error("An error occurred while updating permissions");
        }
    };

    return (
        <>
            {isLoading || isLoading == null ? <LoadingBackdrop isLoading={true} />
                :
                <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <TextField
                            placeholder="Search team members..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            size="small"
                            className="textfieldsClass"
                            sx={{
                                minWidth: 250,
                                "@media (max-width: 600px)": { minWidth: "100%" },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
                                    </InputAdornment>
                                ),
                            }}
                            aria-label="Search team members..."
                        />
                        <Box className="teamHeaderBox" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Tooltip title="Show All" arrow placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => setFilterValue("all")}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: filterValue === "all" ? "#f0f0f0" : "#fafafa",
                                        color: "#424242",
                                        border: filterValue === "all" ? "2px solid #e0e0e0" : "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                        boxShadow: filterValue === "all" ? "0 2px 6px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.08)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5",
                                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                                            transform: "translateY(-1px)"
                                        }
                                    }}
                                >
                                    <Users size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Filter Limited Access" arrow placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => setFilterValue(filterValue === "limited" ? "all" : "limited")}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: filterValue === "limited" ? "#fff3e0" : "#fafafa",
                                        color: "#424242",
                                        border: filterValue === "limited" ? "2px solid #ff9800" : "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                        boxShadow: filterValue === "limited" ? "0 2px 6px rgba(255,152,0,0.2)" : "0 1px 3px rgba(0,0,0,0.08)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: filterValue === "limited" ? "#ffcc80" : "#f5f5f5",
                                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                                            transform: "translateY(-1px)"
                                        }
                                    }}
                                >
                                    <ShieldAlert size={18} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Filter Readonly Access" arrow placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => setFilterValue(filterValue === "readonly" ? "all" : "readonly")}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: filterValue === "readonly" ? "#fce4ec" : "#fafafa",
                                        color: "#424242",
                                        border: filterValue === "readonly" ? "2px solid #ff5722" : "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                        boxShadow: filterValue === "readonly" ? "0 2px 6px rgba(255,87,34,0.2)" : "0 1px 3px rgba(0,0,0,0.08)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: filterValue === "readonly" ? "#ffab91" : "#f5f5f5",
                                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                                            transform: "translateY(-1px)"
                                        }
                                    }}
                                >
                                    <Eye size={18} />
                                </IconButton>
                            </Tooltip>
                            <Box sx={{ ml: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <TeamTemplateInfoButton />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    className="buttonClassname"
                                    onClick={handleSidebarOpen}
                                >
                                    Add Team
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <ReusableTable
                        className="reusable-table-container"
                        columns={[
                            { id: "id", label: "ID" },
                            { id: "firstname", label: "Team Member" },
                            { id: "designation", label: "Designation" },
                            { id: "rolename", label: "Role" },
                            { id: "islimitedaccess", label: "Limited" },
                            { id: "isreadonly", label: "Readonly" },
                            { id: "action", label: "Action" },
                        ]}
                        data={filteredTeamData}
                        renderCell={(columnId, row) => {
                            if (columnId === "firstname") {
                                return (
                                    <div className="reusa_uploadedBy">
                                        <Avatar
                                            src={ImageUrl(row)}
                                            alt={row.firstname}
                                            className="reusa_avatar"
                                            sx={{ backgroundColor: background(row?.firstname) }}
                                        />
                                        <Typography>{row?.firstname + " " + row?.lastname}</Typography>
                                    </div>
                                );
                            }
                            if (columnId === "rolename") {
                                return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography>{row.rolename}</Typography>
                                    </Box>
                                );
                            }

                            if (columnId === "islimitedaccess") {
                                return (
                                    <Checkbox
                                        checked={row?.islimitedaccess === 1}
                                        sx={permissionCheckboxSx}
                                        onChange={(e) =>
                                            handleQuickPermissionUpdate(row, {
                                                islimitedaccess: e.target.checked ? 1 : 0,
                                                isreadonly: row?.isreadonly === 1 ? 1 : 0,
                                            })
                                        }
                                    />
                                );
                            }

                            if (columnId === "isreadonly") {
                                return (
                                    <Checkbox
                                        checked={row?.isreadonly === 1}
                                        sx={permissionCheckboxSx}
                                        onChange={(e) =>
                                            handleQuickPermissionUpdate(row, {
                                                islimitedaccess: row?.islimitedaccess === 1 ? 1 : 0,
                                                isreadonly: e.target.checked ? 1 : 0,
                                            })
                                        }
                                    />
                                );
                            }

                            if (columnId === "action") {
                                return (
                                    <div>
                                        <IconButton onClick={() => handleEdit(row)}>
                                            <Pencil size={18} />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteDialog(row)}>
                                            <Trash2 size={18} color="red" />
                                        </IconButton>
                                    </div>
                                );
                            }

                            return row[columnId];
                        }}
                    />
                </>
            }
            <TeamSidebar
                open={open}
                onClose={handleSidebarClose}
                taskAssigneeData={taskAssigneeData}
                selectedTeamMember={selectedTeamMember}
                teamMemberData={teamMemberData}
                onSave={handleSave}
                handleFinalSave={handleSave}
                handleDeleteDialog={handleDeleteDialog}
            />
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleSidebarClose}
                onConfirm={handleFinalDelete}
                title="Confirm"
                content="Are you sure you want to remove this Person?"
            />
        </>
    );
};

export default TeamMembers;
