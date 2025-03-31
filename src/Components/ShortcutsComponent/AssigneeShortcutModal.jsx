import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Grid,
    IconButton,
} from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, rootSubrootflag, selectedRowData } from "../../Recoil/atom";
import { AddTaskDataApi } from "../../Api/TaskApi/AddTaskApi";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import { commonSelectProps, commonTextFieldProps } from "../../Utils/globalfun";
import MultiSelectChipWithLimit from "./AssigneeAutocomplete";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
};

const AssigneeShortcutModal = ({ taskData, open, onClose, handleAssigneSubmit }) => {
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag);
    const [assigneeMaster, setAssigneeMaster] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [formValues, setFormValues] = React.useState({});
    console.log('formValues: ', formValues);

    useEffect(() => {
        const data = {
            department: taskData?.departmentid,
            guests: taskData?.assignee,
        }
        setFormValues(data);

    }, [taskData])


    useEffect(() => {
        const assigneeMaster = JSON?.parse(sessionStorage.getItem("taskAssigneeData"));
        setAssigneeMaster(assigneeMaster);
        const departmentMaster = JSON?.parse(sessionStorage.getItem("taskdepartmentData"));
        setTaskDepartment(departmentMaster);
    }, [])

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
            departmentid: formValues.department ?? taskData.departmentid,
            assigneids: idString ?? taskData.assigneids,
            assignee: formValues?.guests
        };
        handleAssigneSubmit(updatedRowData);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography id="modal-title" variant="h6" fontWeight="bold">
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
                            <Typography className="form-label" variant="subtitle1">
                                Department
                            </Typography>
                            <TextField
                                name="department"
                                value={formValues.department || ""}
                                onChange={handleChange}
                                select
                                {...commonTextFieldProps}
                                {...commonSelectProps}
                            >
                                <MenuItem value="">
                                    <em>Select Department</em>
                                </MenuItem>
                                {taskDepartment?.map((department) => (
                                    <MenuItem name={department?.id} key={department?.id} value={department?.id}>
                                        {department.labelname}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <MultiSelectChipWithLimit
                                value={formValues?.guests}
                                options={assigneeMaster}
                                label="Assign To"
                                placeholder="Select assignees"
                                limitTags={2}
                                onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{textAlign:'end', mt: 2 }}>
                    <Button className="buttonClassname" variant="contained" onClick={handleFormSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AssigneeShortcutModal;
