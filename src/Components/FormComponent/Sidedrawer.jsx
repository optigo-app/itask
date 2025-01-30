import React, { useEffect, useRef, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    IconButton,
    Grid,
    Backdrop,
    useTheme,
} from "@mui/material";
import { CircleX } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData } from "../../Recoil/atom";
import dayjs from 'dayjs';
import { useLocation } from "react-router-dom";
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { toast } from "react-toastify";
import EstimateInput from "../../Utils/EstimateInput";

const SidebarDrawer = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    masterData,
    priorityData,
    projectData,
    taskCategory,
    statusData,
}) => {

    const location = useLocation();
    const theme = useTheme();
    let pathname = location.pathname;
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const [estimateValues, setEstimateValues] = useState([""]);
    const [actualValues, setActualValues] = useState([""]);

    const [formValues, setFormValues] = React.useState({});
    console.log('formValues: ', formValues);

    const [comments, setComments] = React.useState([]);

    const filterRefs = {
        priority: useRef(),
        project: useRef(),
        assignee: useRef(),
        progress: useRef(),
        status: useRef(),
        category: useRef(),
    };

    useEffect(() => {
        if (open && rootSubrootflagval?.Task === "root") {
            setFormValues({
                taskName: formDataValue?.taskname ?? "",
                dueDate: formDataValue?.DeadLineDate ?? null,
                assignee: formDataValue?.assigneeid ?? "",
                status: formDataValue?.statusid ?? "",
                priority: formDataValue?.priorityid ?? "",
                project: formDataValue?.projectid ?? "",
                remark: formDataValue?.remark ?? "",
                attachment: formDataValue?.attachment ?? null,
                comment: "",
                progress: formDataValue?.progress ?? "",
                startDate: formDataValue?.entrydate ?? null,
                category: formDataValue?.workcategoryid ?? "",
                estimate: formDataValue?.estimate ?? [""],
                actual: formDataValue?.actual ?? [""],
            });
        }
    }, [open, formDataValue, rootSubrootflagval]);


    useEffect(() => {
        setTimeout(() => {
            if (open && rootSubrootflagval?.Task !== "root") {
                Object.keys(filterRefs).forEach((key) => {
                    const element = filterRefs[key].current;
                    if (element) {
                        const span = element.querySelector(".notranslate");
                        if (span && !formValues[key]) {
                            span.textContent = `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        }
                    }
                });
            }
        }, 300);
    }, [open]);

    const handleRemoveEvent = () => {
        setCnfDialogOpen(true);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        try {
            const deleteTaskApi = await deleteTaskDataApi(formDataValue);
            if (deleteTaskApi) {
                setOpenChildTask(true);
                setSelectedTask(null);
                setFormDrawerOpen(false);
                setFormDataValue(null);
                toast.success("Task deleted successfully!");
            } else {
                console.error("Failed to delete task");
            }
        } catch (error) {
            console.error("Error while deleting task:", error);
        }
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // estimated and actual estimate

    const handleEstimateChange = (newValues) => {
        setEstimateValues(newValues);
        setFormValues((prev) => ({
            ...prev,
            estimate: newValues,
        }));
    };

    const handleActualChange = (newValues) => {
        setActualValues(newValues);
        setFormValues((prev) => ({
            ...prev,
            actual: newValues,
        }));
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setFormValues((prev) => ({ ...prev, attachment: e.target.files[0] }));
    };

    // Handle comment sending
    const handleSendComment = () => {
        if (formValues.comment.trim()) {
            setComments((prevComments) => [
                ...prevComments,
                { text: formValues.comment, id: Date.now() },
            ]);
            setFormValues((prev) => ({ ...prev, comment: "" }));
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        onSubmit(formValues, formDataValue);
        onClose();
        setFormValues({
            taskName: "",
            dueDate: null,
            assignee: "",
            priority: "",
            remark: "",
            attachment: null,
            comment: "",
            progress: "",
            startDate: null,
            repeat: "",
        });
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        setFormValues({
            taskName: "",
            dueDate: null,
            assignee: "",
            priority: "",
            remark: "",
            attachment: null,
            comment: "",
            progress: "",
            startDate: null,
            repeat: "",
        });
    }

    // DatePicker custom styles
    const customDatePickerProps = {
        slotProps: {
            popper: {
                sx: {
                    '& .MuiDateCalendar-root': {
                        borderRadius: '8px',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiButtonBase-root, .MuiPickersCalendarHeader-label, .MuiPickersYear-yearButton': {
                        color: '#444050',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiPickersDay-root, .MuiPickersYear-yearButton': {
                        '&:hover': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                        },
                    },
                    '& .MuiPickersDay-root.Mui-selected, .Mui-selected ': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                    '& .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton:hover': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                },
            },
        },
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
        <>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                open={open}
                onClick={handleClear}
            />
            <Drawer
                anchor="right"
                open={open}
                variant="persistent"
                onClose={handleClear}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                <Box className="drawer-container">
                    {/* Header */}
                    <Box className="drawer-header">
                        <Typography variant="h6" className="drawer-title">
                            {pathname == '/projects' ? "Add Project" : "Add Task"}
                        </Typography>
                        <IconButton onClick={handleClear}>
                            <CircleX />
                        </IconButton>
                    </Box>

                    <div
                        style={{
                            margin: "20px 0",
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                    />
                    <Grid container spacing={2} className="form-row">
                        {/* Task Name and Due Date */}
                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="taskName"
                                >
                                    Task Name
                                </Typography>
                                <TextField
                                    name="taskName"
                                    placeholder="Enter task name"
                                    value={formValues.taskName}
                                    onChange={handleChange}
                                    {...commonTextFieldProps}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography className="form-label" variant="subtitle1">
                                    Category
                                </Typography>
                                <TextField
                                    name="repeat"
                                    value={formValues.category || ""}
                                    onChange={handleChange}
                                    select
                                    {...commonTextFieldProps}
                                    {...commonSelectProps}
                                    ref={filterRefs.category}
                                >
                                    <MenuItem value="">
                                        <em>Select Category</em>
                                    </MenuItem>
                                    {taskCategory?.map((category) => (
                                        <MenuItem name={category?.id} key={category?.id} value={category?.id}>
                                            {category.labelname}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Grid>
                        {/* Assignee and Priority */}
                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="assignee"
                                >
                                    Assignee
                                </Typography>
                                <TextField
                                    name="assignee"
                                    value={formValues.assignee}
                                    onChange={handleChange}
                                    select
                                    {...commonTextFieldProps}
                                    {...commonSelectProps}
                                    ref={filterRefs.assignee}
                                >
                                    <MenuItem value="">
                                        <em>Select Assignee</em>
                                    </MenuItem>
                                    <MenuItem value="user1">John Doe</MenuItem>
                                    <MenuItem value="user2">Jane Smith</MenuItem>
                                    <MenuItem value="user3">Alice Johnson</MenuItem>
                                    <MenuItem value="user4">Bob Brown</MenuItem>
                                </TextField>
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography variant="subtitle1" className="form-label" htmlFor="status">
                                    Status
                                </Typography>
                                <TextField
                                    name="status"
                                    value={formValues?.status || ""}
                                    onChange={handleChange}
                                    select
                                    {...commonTextFieldProps}
                                    {...commonSelectProps}
                                    ref={filterRefs?.status}
                                >
                                    <MenuItem value="">
                                        <em>Select Status</em>
                                    </MenuItem>
                                    {statusData?.map((status) => (
                                        <MenuItem name={status?.id} key={status?.id} value={status?.id}>
                                            {status?.labelname}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography variant="subtitle1" className="form-label" htmlFor="priority">
                                    Priority
                                </Typography>
                                <TextField
                                    name="priority"
                                    value={formValues?.priority || ""}
                                    onChange={handleChange}
                                    select
                                    {...commonTextFieldProps}
                                    {...commonSelectProps}
                                    ref={filterRefs?.priority}
                                >
                                    <MenuItem value="">
                                        <em>Select Priority</em>
                                    </MenuItem>
                                    {priorityData?.map((priority) => (
                                        <MenuItem name={priority?.id} key={priority?.id} value={priority?.id}>
                                            {priority?.labelname}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Grid>

                        {/* Progress, Start Date, Repeat */}
                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="progress"
                                >
                                    Project
                                </Typography>
                                <TextField
                                    name="project"
                                    value={formValues?.project || ""}
                                    onChange={handleChange}
                                    select
                                    {...commonTextFieldProps}
                                    {...commonSelectProps}
                                    ref={filterRefs?.project}
                                >
                                    <MenuItem value="">
                                        <em>Select project</em>
                                    </MenuItem>
                                    {projectData?.map((project) => (
                                        <MenuItem name={project?.id} key={project?.id} value={project?.id}>
                                            {project?.labelname}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography className="form-label" variant="subtitle1">
                                    Start Date
                                </Typography>
                                <DatePicker
                                    name="startDate"
                                    value={formValues.startDate ? dayjs(formValues.startDate) : null}
                                    className="textfieldsClass"
                                    onChange={(value) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            startDate: value,
                                        }))
                                    }
                                    sx={{ minWidth: 320 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            fullWidth
                                            className="textfieldsClass"
                                            sx={{ padding: "0" }}
                                        />
                                    )}
                                    {...customDatePickerProps}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography className="form-label" variant="subtitle1">
                                    Due Date
                                </Typography>
                                <DatePicker
                                    name="dueDate"
                                    value={formValues.dueDate ? dayjs(formValues.dueDate) : null}
                                    className="textfieldsClass"
                                    onChange={(value) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            dueDate: value,
                                        }))
                                    }
                                    sx={{ minWidth: 320 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            fullWidth
                                            className="textfieldsClass"
                                            sx={{ padding: "0" }}
                                        />
                                    )}
                                    {...customDatePickerProps}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} className="form-row">
                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography className="form-label" variant="subtitle1">
                                    Estimate
                                </Typography>
                                <EstimateInput onChanges={handleEstimateChange} />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box className="form-group">
                                <Typography className="form-label" variant="subtitle1">
                                    Actual Estimate
                                </Typography>
                                <EstimateInput onChanges={handleActualChange} />
                            </Box>
                        </Grid>
                    </Grid>
                    {/* Comment & Remark */}
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography variant="subtitle1" className="form-label">
                                Remark
                            </Typography>
                            <TextField
                                name="remark"
                                value={formValues.remark}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                placeholder="Add a remark"
                                {...commonTextFieldProps}
                            />
                        </Box>
                    </Grid>

                    {/* File Upload */}
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="attachment"
                            >
                                Attachment
                            </Typography>
                            <Button variant="outlined" component="label" className="secondary-btn">
                                Upload File
                                <input
                                    type="file"
                                    hidden
                                    name="attachment"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {formValues.attachment && (
                                <Typography variant="body2" sx={{ marginTop: "8px" }}>
                                    {formValues.attachment.name}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12} sx={{ textAlign: "right" }}>
                        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                            {/* <Button
                                variant="contained"
                                onClick={() => handleRemoveEvent(formValues)}
                                sx={{ marginRight: "10px" }}
                                className="danger-btn"  
                                disabled={isLoading}
                            >
                                Delete
                            </Button> */}
                            <Box>
                                <Button
                                    variant="outlined"
                                    onClick={handleClear}
                                    sx={{ marginRight: "10px" }}
                                    className="secondary-btn"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="primary-btn"
                                >
                                    {isLoading ? "Saving..." : "Save Task"}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Box>
            </Drawer>
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this task?"
            />
        </>
    );
};

export default SidebarDrawer;
