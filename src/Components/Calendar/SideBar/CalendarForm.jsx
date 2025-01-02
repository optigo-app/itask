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
} from "@mui/material";
import { CircleX } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import "./SidebarDrawer.scss";
import { useRecoilValue } from "recoil";
import { CalformData, formData, openFormDrawer, rootSubrootflag } from "../../../Recoil/atom";
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    isLoading,
}) => {
    const theme = useTheme();
    const CalformDataValue = useRecoilValue(CalformData);

    const [formValues, setFormValues] = React.useState({
        id: '1',
        title: "",
        category: "",
        eventUrl: "",
        start: null,
        end: null,
        guests: [],
        description: "",
    });
    console.log('formValues: ', formValues);

    const filterRefs = {
        category: useRef(),
        guests: useRef(),
    };

    const guestOptions = [
        { label: 'John Doe', value: 'user1' },
        { label: 'Jane Smith', value: 'user2' },
        { label: 'Alice Johnson', value: 'user3' },
        { label: 'Bob Brown', value: 'user4' }
    ];

    const calendarsColor = {
        Personal: theme.palette.error.main,
        Business: theme.palette.primary.main,
        Family: theme.palette.warning.main,
        Holiday: theme.palette.success.main,
        ETC: theme.palette.info.main,
    };

    useEffect(() => {
        setTimeout(() => {
            if (CalformDataValue) {
                setFormValues({
                    id: CalformDataValue?.id ?? "",
                    title: CalformDataValue?.title ?? "",
                    category: CalformDataValue?.category ?? "",
                    eventUrl: CalformDataValue?.eventUrl ?? "",
                    start: CalformDataValue?.start ?? null,
                    end: CalformDataValue?.end ?? null,
                    guests: CalformDataValue?.guestsid ?? [],
                    description: CalformDataValue?.description ?? "",
                });
            }
        }, 300);
    }, [open, CalformDataValue]);

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
    }, [open,CalformDataValue]);

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
        onSubmit(formValues);
        handleClear();
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
            <Box className="drawer-container" sx={{ width: '400px !important' }}>
                {/* Header */}
                <Box className="drawer-header">
                    <Typography variant="h6" className="drawer-title">
                        Add Event
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
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="guests"
                            >
                                Guests
                            </Typography>
                            <Autocomplete
                                id="guests"
                                multiple
                                limitTags={2}
                                options={guestOptions}
                                getOptionLabel={(option) => option?.label || ""}
                                value={formValues.guests || []}
                                onChange={(event, newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        name="guests"
                                        placeholder="Select guests"
                                        {...commonTextFieldProps}
                                        // ref={filterRefs.guests}
                                    />
                                )}
                                sx={{ width: '400px' }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="guests"
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
                        <Box className="form-group">
                            <Typography className="form-label" variant="subtitle1">
                                Start Date
                            </Typography>
                            <DatePicker
                                name="startDate"
                                value={formValues.start ? dayjs(formValues.start) : null}
                                className="textfieldsClass"
                                onChange={(value) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        start: value,
                                    }))
                                }
                                sx={{ minWidth: 400 }}
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

                    <Grid item xs={12}>
                        <Box className="form-group">
                            <Typography className="form-label" variant="subtitle1">
                                Due Date
                            </Typography>
                            <DatePicker
                                name="dueDate"
                                value={formValues.end ? dayjs(formValues.end) : null}
                                className="textfieldsClass"
                                onChange={(value) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        end: value,
                                    }))
                                }
                                sx={{ minWidth: 400 }}
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
                        {isLoading ? "Adding..." : "Add"}
                    </Button>
                </Grid>
            </Box>
        </Drawer>
    );
};

export default CalendarForm;
