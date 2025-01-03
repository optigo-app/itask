import React, { useEffect, useRef } from "react";
import {
    Drawer,
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    IconButton,
    Grid,
} from "@mui/material";
import { CircleX } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./SidebarDrawer.scss";
import { useRecoilValue } from "recoil";
import { formData, openFormDrawer, rootSubrootflag } from "../../Recoil/atom";
import dayjs from 'dayjs';

const SidebarDrawer = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    masterData,
    priorityData,
    projectData,
    statusData,
}) => {

    const formDataValue = useRecoilValue(formData);
    const formdrawerOpen = useRecoilValue(openFormDrawer);
    const rootSubrootflagval = useRecoilValue(rootSubrootflag)

    const [formValues, setFormValues] = React.useState({});
    console.log('formValues: ', formValues);

    const [comments, setComments] = React.useState([]);

    const filterRefs = {
        priority: useRef(),
        project: useRef(),
        assignee: useRef(),
        progress: useRef(),
        status: useRef(),
        repeat: useRef(),
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
                repeat: formDataValue?.repeatid ?? "",
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

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

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
        <Drawer anchor="right" open={open} onClose={handleClear} className="MainDrawer">
            <Box className="drawer-container">
                {/* Header */}
                <Box className="drawer-header">
                    <Typography variant="h6" className="drawer-title">
                        Add Task
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

                    <Grid item xs={6}>
                        <Box className="form-group">
                            <Typography className="form-label" variant="subtitle1">
                                Repeat
                            </Typography>
                            <TextField
                                name="repeat"
                                value={formValues.repeat}
                                onChange={handleChange}
                                select
                                {...commonTextFieldProps}
                                {...commonSelectProps}
                                ref={filterRefs.repeat}
                            >
                                <MenuItem value="">
                                    <em>Select Repeat Option</em>
                                </MenuItem>
                                {priorityData?.map((priority) => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.labelname}
                                    </MenuItem>
                                ))}
                            </TextField>
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

                {/* <Grid item xs={12}>
                    <Box className="form-group" sx={{ position: 'relative' }}>
                        <Typography variant="subtitle1" className="form-label">
                            Comment
                        </Typography>
                        <TextField
                            name="comment"
                            value={formValues.comment}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            placeholder="Add a comment"
                            {...commonTextFieldProps}
                            sx={{ width: '100%' }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            className="secondary-btn"
                            sx={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                            }}
                            onClick={handleSendComment}
                        >
                            Send
                        </Button>
                    </Box>

                    {comments.length > 0 && (
                        <Box sx={{ marginTop: 2 }}>
                            {comments.map((comment) => (
                                <Box key={comment.id} sx={{ marginBottom: 1 }}>
                                    <Typography>{comment.text}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Grid> */}

                {/* Submit Button */}
                <Grid item xs={12} sx={{ textAlign: "right" }}>
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
                </Grid>
            </Box>
        </Drawer>
    );
};

export default SidebarDrawer;
