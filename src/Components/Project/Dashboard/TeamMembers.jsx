import React, { useEffect } from "react";
import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import ReusableTable from "./ReusableTable";
import { Add as AddIcon } from "@mui/icons-material";
import TeamSidebar from "./Team/TeamSidebar";
import { ImageUrl } from "../../../Utils/globalfun";
import { AddPrTeamsApi } from "../../../Api/TaskApi/AddPrTeamsApi";
import { toast } from "react-toastify";
import { GetPrTeamsApi } from "../../../Api/TaskApi/prTeamListApi";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { DelPrTeamsApi } from "../../../Api/TaskApi/DelPrTeamsApi";

const TeamMembers = ({ taskAssigneeData, decodedData, background }) => {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(null);
    const [selectedTeamMember, setSelectedTeamMember] = React.useState([]);
    const [teamMemberData, setTeamMemberData] = React.useState([]);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    console.log("teamMemberData: ", teamMemberData);

    useEffect(() => {
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
                return {
                    ...member,
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
        const formattedTeamList = updatedList
            ?.map((member) => `${member.employee.id}#${member.role}`)
            .join(",");
        const apiRes = await AddPrTeamsApi(formattedTeamList, decodedData);
        if (apiRes?.rd[0]?.stat == 1) {
            toast.success("Team added successfully");
            setOpen(false);
            handleGetTeamMembers();
        } else {
            toast.error("Something went wrong");
        }
    };
    return (
        <>
            {isLoading || isLoading == null ? <LoadingBackdrop isLoading={true} />
                :
                <>
                    <Box sx={{ display: "flex", justifyContent: "end", mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            className="buttonClassname"
                            onClick={handleSidebarOpen}
                        >
                            Add Team
                        </Button>
                    </Box>
                    <ReusableTable
                        className="reusable-table-container"
                        columns={[
                            { id: "id", label: "ID" },
                            { id: "name", label: "Team Member" },
                            { id: "designation", label: "Designation" },
                            { id: "rolename", label: "Role" },
                            { id: "action", label: "Action" },
                        ]}
                        data={teamMemberData}
                        renderCell={(columnId, row) => {
                            if (columnId === "name") {
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
