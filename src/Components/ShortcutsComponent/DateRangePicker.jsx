import { useState, useEffect } from "react";
import { TextField, Box, Popover, InputAdornment, Button, Stack, IconButton, ThemeProvider } from "@mui/material";
import { DateRangePicker } from "mui-daterange-picker";
import { CalendarDays } from "lucide-react";
import ClearIcon from "@mui/icons-material/Clear";
import { commonTextFieldProps, Datetheme } from "../../Utils/globalfun";

const formatDate = (date) => {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d instanceof Date && !isNaN(d) ? d.toLocaleDateString("en-GB") : "";
};

const CustomDateRangePicker = ({ value = {}, onChange }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const toDate = (val) => val ? new Date(val) : null;

	const [tempRange, setTempRange] = useState({
		startDate: toDate(value?.startDate),
		endDate: toDate(value?.endDate),
	});

	useEffect(() => {
		setTempRange({
			startDate: toDate(value?.startDate),
			endDate: toDate(value?.endDate),
		});
	}, [value]);

	const handleOpen = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleDateChange = (range) => {
		setTempRange({
			startDate: range.startDate || "",
			endDate: range.endDate || "",
		});
	};

	const handleApply = () => {
		onChange({
			startDate: tempRange.startDate ? tempRange.startDate.toISOString() : "",
			endDate: tempRange.endDate ? tempRange.endDate.toISOString() : "",
		});
		handleClose();
	};

	const handleClear = (e) => {
		e.stopPropagation();
		setTempRange({ startDate: "", endDate: "" });
		onChange({ startDate: "", endDate: "" });
		handleClose();
	};

	const displayValue =
		value?.startDate && value?.endDate
			? `${formatDate(new Date(value.startDate))} - ${formatDate(new Date(value.endDate))}`
			: "";

	return (
		<ThemeProvider theme={Datetheme}>
			<Box display="flex" alignItems="center">
				<TextField
					placeholder="Date Range"
					value={displayValue}
					onClick={handleOpen}
					size="small"
					sx={{
						"& .MuiInputBase-input": {
							padding: "8.5px 12px",
						},
					}}
					{...commonTextFieldProps}
					readOnly
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<CalendarDays width={20} />
							</InputAdornment>
						),
						endAdornment: displayValue && (
							<InputAdornment position="end">
								<IconButton aria-label="ClearIcon" onClick={handleClear} color="default" size="small">
									<ClearIcon fontSize="small" />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>

				<Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }}>
					<Box p={2}>
						<DateRangePicker open toggle={handleClose} onChange={handleDateChange} initialDateRange={tempRange} closeOnClickOutside  wrapperClassName="dateRangePicker"/>
						<Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
							<Button onClick={handleClose} color="secondary">
								Cancel
							</Button>
							<Button onClick={handleApply} variant="contained" color="primary">
								Apply
							</Button>
						</Stack>
					</Box>
				</Popover>
			</Box>
		</ThemeProvider>
	);
};

export default CustomDateRangePicker;