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
import { convertToIST } from "../../../Utils/convertToIST";

const CalendarForm = ({
    open,
    onClose,
    onSubmit,
    onRemove,
    isLoading,
}) => {
    const theme = useTheme();
    const CalformDataValue = useRecoilValue(CalformData);

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

    const guestOptions = [
        { id: 1, label: 'John Doe', value: 'user1' },
        { id: 2, label: 'James Anderson', value: 'user2' },
        { id: 3, label: 'Alice Johnson', value: 'user3' },
        { id: 4, label: 'Bob Brown', value: 'user4' },
        { id: 5, label: 'Grace Martinez', value: 'user5' },
        { id: 6, label: 'Daniel Scott', value: 'user6' }
    ];

    const calendarsColor = {
        Personal: theme.palette.error.main,
        Business: theme.palette.primary.main,
        Family: theme.palette.warning.main,
        Holiday: theme.palette.success.main,
        ETC: theme.palette.info.main,
    };

    // set value when edit
    useEffect(() => {
        setTimeout(() => {
            if (CalformDataValue) {
                console.log('CalformDataValue: ', CalformDataValue);
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

    // Common TextField style properties
    const commonTextFieldProps = {
        fullWidth: true,
        size: "small",
        className: "textfieldsClass",
    };

    // custom select style properties
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

    // for switch button
    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 40,
        height: 22,
        padding: 0,
        display: 'flex',
        '&:active': {
            '& .MuiSwitch-thumb': {
                width: 18,
            },
            '& .MuiSwitch-switchBase.Mui-checked': {
                transform: 'translateX(15px)',
            },
        },
        '& .MuiSwitch-switchBase': {
            padding: 3,
            '&.Mui-checked': {
                transform: 'translateX(18px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: '#7367f0',
                },
            },
        },
        '& .MuiSwitch-thumb': {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 16,
            height: 16,
            borderRadius: 9,
            transition: theme.transitions.create(['width'], {
                duration: 200,
            }),
        },
        '& .MuiSwitch-track': {
            borderRadius: 12,
            opacity: 1,
            backgroundColor: 'rgba(0,0,0,.25)',
            boxSizing: 'border-box',
        },
    }));

    // remove event
    const handleRemoveEvent = () => {
        onRemove(formValues);
        handleClear();
    };

    return (
        <Drawer anchor="right" open={open} onClose={handleClear} className="MainDrawer">
            <Box className="drawer-container" sx={{ width: '400px !important' }}>
                {/* Header */}
                <Box className="drawer-header">
                    <Typography variant="h6" className="drawer-title">
                        {CalformDataValue?.id && CalformDataValue?.id != '' ? "Update Event" : "Add Event"}
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
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="guests"
                            >
                                Guests
                            </Typography>
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={guestOptions}
                                getOptionLabel={(option) => option.label}
                                value={formValues.guests || []}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(event, newValue) => handleChange({ target: { name: 'guests', value: newValue } })}
                                limitTags={2}
                                {...commonTextFieldProps}
                                renderOption={(props, option, { selected }) => (
                                    <li
                                        {...props}
                                        style={{
                                            fontFamily: '"Public Sans", sans-serif',
                                            margin: '5px 10px',
                                            borderRadius: "8px",
                                            backgroundColor: selected
                                                ? 'rgba(0, 0, 0, 0.05)'
                                                : 'transparent',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = selected
                                                ? '#7367f0'
                                                : '#7367f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = selected
                                                ? 'rgba(0, 0, 0, 0.05)'
                                                : 'transparent';
                                        }}
                                    >
                                        {option.label}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        name="guests"
                                        {...commonTextFieldProps}
                                        placeholder={!formValues.guests || formValues.guests.length === 0 ? 'Select guests' : ''}
                                    />
                                )}
                            />
                        </Box>
                    </Grid>

                    {/* Event category */}
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
                            <AntSwitch
                                checked={formValues.allDay}
                                inputProps={{ 'aria-label': 'ant design' }}
                                onChange={(event) => {
                                    console.log('ssssss', formValues.allDay);
                                    setFormValues((prev) => ({
                                        ...prev,
                                        allDay: event.target.checked,
                                    }))
                                }}
                            />
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
