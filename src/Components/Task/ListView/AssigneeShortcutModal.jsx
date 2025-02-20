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
import { fetchlistApiCall, formData, rootSubrootflag, selectedRowData } from "../../../Recoil/atom";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

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

const AssigneeShortcutModal = ({ open, onClose }) => {
    const rowData = useRecoilValue(selectedRowData);
    console.log('rowData: ', rowData);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    console.log('formDataValue: ', formDataValue);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag);
    const [assigneeMaster, setAssigneeMaster] = useState([]);
    const [taskDepartment, setTaskDepartment] = useState([]);
    const [formValues, setFormValues] = React.useState({});


    const filterRefs = {
        assignee: useRef(),
        department: useRef(),
    };

    useEffect(() => {
        if (open && rootSubrootflagval?.Task === "root") {
            setFormValues({
                taskName: rowData?.taskname ?? "",
                dueDate: rowData?.DeadLineDate ?? null,
                department: rowData?.departmentid ?? "",
                assignee: rowData?.assigneeid ?? "",
                status: rowData?.statusid ?? "",
                priority: rowData?.priorityid ?? "",
                project: rowData?.projectid ?? "",
                remark: rowData?.remark ?? "",
                attachment: rowData?.attachment ?? null,
                comment: "",
                progress: rowData?.progress ?? "",
                startDate: rowData?.entrydate ?? null,
                category: rowData?.workcategoryid ?? "",
                estimate: rowData?.estimate ?? [""],
                actual: rowData?.actual ?? [""],
            });
        }
    }, [open, rowData, rootSubrootflagval]);

    useEffect(() => {
        const assigneeMaster = JSON?.parse(sessionStorage.getItem("assigneeMaster"));
        setAssigneeMaster(assigneeMaster);
        const departmentMaster = JSON?.parse(sessionStorage.getItem("taskDepartmentData"));
        setTaskDepartment(departmentMaster);
    }, [])

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('jasakkkkkkkkk', name, value);
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleFormSubmit = async () => {
        const updatedRowData = {
            ...rowData,
            departmentid: formValues.department ?? ''
        };

        const addTaskApi = await AddTaskDataApi(formValues ?? {}, updatedRowData, rootSubrootflagval ?? {});
        if (addTaskApi) {
            setOpenChildTask(true);
            setTimeout(() => {
                if (rootSubrootflagval?.Task === "SubTask") {
                    toast.success("Sub Task Added Successfully...")
                } else {
                    toast.success("Task Updated Successfully...")
                }
            }, 100);
        }
    };

    // Common TextField style properties
    const commonTextFieldProps = {
        fullWidth: true,
        size: "small",
        className: "textfieldsClass",
    };

    const commonSelectProps = {
        select: true,
        fullWidth: true,
        size: "small",
        sx: {
            minWidth: 180,
            "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                    borderRadius: "8px",
                },
            },
        },
        SelectProps: {
            MenuProps: {
                PaperProps: {
                    sx: {
                        borderRadius: "8px",
                        "& .MuiMenuItem-root": {
                            fontFamily: '"Public Sans", sans-serif',
                            color: "#444050",
                            margin: "5px 10px",
                            "&:hover": {
                                borderRadius: "8px",
                                backgroundColor: "#7367f0",
                                color: "#fff",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "#80808033",
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "#7367f0",
                                    color: "#fff",
                                },
                            },
                        },
                    },
                },
            },
        },
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
                                ref={filterRefs.department}
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
                            <Typography className="form-label" variant="subtitle1">
                                Assignee
                            </Typography>
                            <TextField
                                name="assignee"
                                value={formValues.department || ""}
                                onChange={handleChange}
                                select
                                {...commonTextFieldProps}
                                {...commonSelectProps}
                                ref={filterRefs.department}
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
                </Grid>

                <Box sx={{ mt: 2 }}>
                    <Button className="buttonClassname" variant="contained" fullWidth onClick={handleFormSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AssigneeShortcutModal;
