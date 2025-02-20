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
    ListItemIcon,
    Autocomplete,
    Stack,
    Switch,
} from "@mui/material";
import { CircleX } from "lucide-react";
// import "./SidebarDrawer.scss";
import { useRecoilValue } from "recoil";
import { CalformData } from "../../../Recoil/atom";
import { styled, useTheme } from '@mui/material/styles';
import CustomDateTimePicker from "../../../Utils/DateComponent/CustomDateTimePicker"
import { convertToIST } from "../../../Utils/Common/convertToIST";
import MultiSelectChipWithLimit from "../../../DemoCode/AssigneeAutocomplete";
import { useLocation } from "react-router-dom";
import CustomSwitch from "../../../Utils/Common/CustomSwitch";
import { commonSelectProps, commonTextFieldProps } from "../../../Utils/globalfun";

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    onRemove,
    isLoading,
}) => {
    const location = useLocation();
    const theme = useTheme();
    const CalformDataValue = useRecoilValue(CalformData);
    const [assignees, setAssignees] = React.useState([]);
    const [formValues, setFormValues] = React.useState({
        id: '',
        title: "",
        category: "",
        eventUrl: "",
        start: null,
        end: null,
        guests: [],
        description: "",
        allDay: false
    });

    const filterRefs = {
        category: useRef(),
        guests: useRef(),
    };

    const calendarsColor = {
        Personal: theme.palette.error.main,
        Business: theme.palette.primary.main,
        Family: theme.palette.warning.main,
        Holiday: theme.palette.success.main,
        ETC: theme.palette.info.main,
    };

    // set value when edit
    useEffect(() => {
        const assigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData'));
        setAssignees(assigneeData);
        setTimeout(() => {
            if (CalformDataValue) {
                setFormValues({
                    id: CalformDataValue?.id ?? "",
                    title: CalformDataValue?.title ?? "",
                    category: CalformDataValue?.category ?? "Personal",
                    eventUrl: CalformDataValue?.eventUrl ?? "",
                    start: CalformDataValue?.start ?? null,
                    end: CalformDataValue?.end ?? null,
                    guests: CalformDataValue?.guests ?? [],
                    description: CalformDataValue?.description ?? "",
                    allDay: CalformDataValue?.allDay ?? false
                });
            }
        }, 300);
    }, [open, CalformDataValue]);

    // set placeholder in select menu
    useEffect(() => {
        setTimeout(() => {
            if (open && CalformDataValue) {
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
    }, [open, CalformDataValue]);

    // Handle form value changes
    const generateRandomId = () => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            id: prev.id || generateRandomId(),
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = () => {
        if (formValues?.category !== '' && formValues?.title !== '' && formValues?.start !== null && formValues?.end !== null) {
            onSubmit(formValues);
            handleClear();
        }
    };

    // for close and clear form
    const handleClear = () => {
        onClose();
        setFormValues({
            title: "",
            category: "",
            eventUrl: "",
            start: null,
            end: null,
            guests: [],
            description: "",
            allDay: false
        });
    }

    // remove event
    const handleRemoveEvent = () => {
        onRemove(formValues);
        handleClear();
    };

    const getFormTitle = () => {
        const isMeetingPath = location.pathname.includes('meeting');
        const isUpdate = CalformDataValue?.id && CalformDataValue.id !== '';

        if (isMeetingPath) {
            return isUpdate ? "Update Meeting" : "Add Meeting";
        } else {
            return isUpdate ? "Update Event" : "Add Event";
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={handleClear} className="MainDrawer">
            <Box className="drawer-container" sx={{ width: '440px !important' }}>
                {/* Header */}
                <Box className="drawer-header">
                    <Typography variant="h6" className="drawer-title">
                        {getFormTitle()}
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
                <Grid container spacing={1} className="form-row">
                    {/* Task Name and Due Date */}
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="title"
                            >
                                Title
                            </Typography>
                            <TextField
                                name="title"
                                placeholder="Enter task name"
                                value={formValues.title}
                                onChange={handleChange}
                                {...commonTextFieldProps}
                            />
                        </Box>
                    </Grid>

                    {/* guests and Priority */}
                    <Grid item xs={12}>
                        <MultiSelectChipWithLimit
                            options={assignees}
                            label="Assign To"
                            placeholder="Select assignees"
                            limitTags={3}
                            onChange={(newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                        />
                    </Grid>

                    {/* Event category */}
                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="category"
                            >
                                Label
                            </Typography>
                            <TextField
                                name="category"
                                value={formValues.category}
                                onChange={handleChange}
                                select
                                {...commonTextFieldProps}
                                {...commonSelectProps}
                                ref={filterRefs.category}
                                required
                                sx={{
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                }}
                            >

                                {Object.keys(calendarsColor).map((category) => (
                                    <MenuItem
                                        key={category}
                                        value={category}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: '20px !important' }}>
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: calendarsColor[category],
                                                    display: 'inline-block',
                                                }}
                                            />
                                        </ListItemIcon>
                                        <Typography variant="body1">{category}</Typography>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Grid>

                    {/* Progress, Start Date, Repeat */}
                    <Grid item xs={12}>
                        <CustomDateTimePicker
                            label="Start Date & Time"
                            name="startDateTime"
                            value={formValues.start}
                            width='440px'
                            styleprops={commonTextFieldProps}
                            onChange={(value) => {
                                if (value) {
                                    const isIst = convertToIST(value);
                                    setFormValues((prev) => ({
                                        ...prev,
                                        start: isIst,
                                    }))
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomDateTimePicker
                            label="End Date & Time"
                            name="endDateTime"
                            value={formValues.end}
                            width='440px'
                            styleprops={commonTextFieldProps}
                            onChange={(value) => {
                                if (value) {
                                    const isIst = convertToIST(value);
                                    setFormValues((prev) => ({
                                        ...prev,
                                        end: isIst,
                                    }))
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                {/* all day flag for drag and drop */}
                <Grid item xs={12}>
                    <Box className="form-group">
                        <Typography
                            variant="subtitle1"
                            className="form-label"
                            htmlFor="title"
                        >
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                        >
                            {/* <AntSwitch
                                checked={formValues.allDay}
                                inputProps={{ 'aria-label': 'ant design' }}
                                onChange={(event) => {
                                    setFormValues((prev) => ({
                                        ...prev,
                                        allDay: event.target.checked,
                                    }))
                                }}
                            /> */}
                            <CustomSwitch checked={formValues.allDay} onChange={(event) => {
                                setFormValues((prev) => ({
                                    ...prev,
                                    allDay: event.target.checked,
                                }))
                            }} />
                            <Typography>All Day</Typography>
                        </Stack>
                    </Box>
                </Grid>

                {/* Comment & description */}
                <Grid item xs={12}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            description
                        </Typography>
                        <TextField
                            name="description"
                            value={formValues.description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            placeholder="Add a description"
                            {...commonTextFieldProps}
                        />
                    </Box>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="primary-btn"
                        >
                            {CalformDataValue?.id && CalformDataValue?.id !== ''
                                ? (isLoading ? "Updating..." : "Update")
                                : (isLoading ? "Adding..." : "Add")
                            }

                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleClear}
                            sx={{ marginLeft: "10px" }}
                            className="secondary-btn"
                        >
                            Cancel
                        </Button>
                    </Box>
                    {CalformDataValue?.id && CalformDataValue?.id != '' &&
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleRemoveEvent(formValues)}
                            disabled={isLoading}
                            className="danger-btn"
                        >
                            Delete
                        </Button>
                    }
                </Grid>
            </Box>
        </Drawer>
    );
};

export default CalendarForm;
