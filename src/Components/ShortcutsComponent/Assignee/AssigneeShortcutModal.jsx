import React, { useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    Grid,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DepartmentAssigneeAutocomplete from "./DepartmentAssigneeAutocomplete";

const modalStyle = (theme) => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 460,
    maxWidth: "95vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    [theme.breakpoints.down('sm')]: {
        width: '95vw',
        p: 2,
    },
});


const AssigneeShortcutModal = ({ taskData, open, onClose, handleAssigneSubmit }) => {
    const [taskAssigneeData, setTaskAssigneeData] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [formValues, setFormValues] = React.useState({});

    useEffect(() => {
        const assigneeMaster = JSON?.parse(sessionStorage.getItem("taskAssigneeData"));
        const departmentMaster = JSON?.parse(sessionStorage.getItem("taskDepartments"));
        setTaskAssigneeData(assigneeMaster);
        setTaskDepartment(departmentMaster);
    }, [])
    useEffect(() => {
        const data = {
            guests: taskData?.assignee,
        }
        setFormValues(data);

    }, [taskData])



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleFormSubmit = async () => {
        const idString = formValues?.guests?.map(user => user.id)?.join(",");
        const updatedRowData = {
            ...taskData,
            assigneids: idString ?? taskData.assigneids,
            assignee: formValues?.guests
        };
        handleAssigneSubmit(updatedRowData);
        onClose();
    };

    // departmentwise assignee
    const departmentId = formValues?.department;
    const departmentName = taskDepartment?.find(dept => dept.id == departmentId)?.labelname;
    const filterAssigneeData = departmentName ? taskAssigneeData?.filter((item) => item.department == departmentName) : taskAssigneeData;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={theme => modalStyle(theme)}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography id="modal-title" variant="h6" fontWeight="bold"
                    >
                        Assign Task
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>
                <div style={{
                    margin: "10px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }}
                />
                <Grid container spacing={2} className="form-row">
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <DepartmentAssigneeAutocomplete
                                value={formValues?.guests}
                                options={filterAssigneeData}
                                label="Assign To"
                                placeholder="Select assignee"
                                limitTags={2}
                                onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ textAlign: 'end', mt: 2 }}>
                    <Button className="buttonClassname" variant="contained" onClick={handleFormSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AssigneeShortcutModal;
