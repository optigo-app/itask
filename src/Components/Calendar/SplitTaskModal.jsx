import React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
} from '@mui/material';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import { commonTextFieldProps } from '../../Utils/globalfun';

const SplitTaskModal = ({
    open,
    onClose,
    selectedTask,
    numberOfDaysToSplit,
    onNumberOfDaysToSplitChange,
    splitParts,
    onSplitPartChange,
    onConfirmSplit,
    totalSplitHours,
    originalTaskEstimate,
}) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const isTotalHoursExceeded = totalSplitHours > originalTaskEstimate;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Split Task: {selectedTask?.title}</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    label="Number of Days to Split"
                    type="number"
                    value={numberOfDaysToSplit === 0 ? '' : numberOfDaysToSplit}
                    onChange={onNumberOfDaysToSplitChange}
                    inputProps={{ min: 1 }}
                    sx={{ mb: 3 }}
                />

                {numberOfDaysToSplit > 0 && (
                    <>
                        <Typography variant="subtitle1" gutterBottom>
                            Original Task Estimate: <strong>{originalTaskEstimate} hr</strong>
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom color={isTotalHoursExceeded ? 'error' : 'textPrimary'}>
                            Total Split Hours: <strong>{totalSplitHours.toFixed(3)} hr</strong>
                            {isTotalHoursExceeded && (
                                <span style={{ marginLeft: '8px', color: 'red' }}>
                                    (Exceeds original estimate!)
                                </span>
                            )}
                        </Typography>

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Start Date & Time</strong></TableCell>
                                        <TableCell><strong>Hours</strong></TableCell>
                                        <TableCell><strong>End Date & Time</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {splitParts.map((part, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ minWidth: 250 }}>
                                                <CustomDateTimePicker
                                                    label={`Part ${index + 1} Start`}
                                                    name={`part${index + 1}StartDate`}
                                                    value={part.startDate ? dayjs(part.startDate).tz("Asia/Kolkata", true).local() : null}
                                                    width="100%"
                                                    styleprops={commonTextFieldProps}
                                                    onChange={(newValue) => onSplitPartChange(index, 'startDate', newValue)}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 250 }}>
                                                <CustomDateTimePicker
                                                    label="End (Auto)"
                                                    name={`part${index + 1}EndDate`}
                                                    value={part.endDate ? dayjs(part.endDate).tz("Asia/Kolkata", true).local() : null}
                                                    width="100%"
                                                    styleprops={commonTextFieldProps}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>
                                                <Box className="form-group">
                                                    <Typography
                                                        variant="subtitle1"
                                                        className="form-label"
                                                        htmlFor="title"
                                                    >
                                                        Split Hour
                                                    </Typography>
                                                    <TextField
                                                        name="splitHour"
                                                        placeholder="Enter hrs"
                                                        value={part.hours}
                                                        onChange={(e) => onSplitPartChange(index, 'hours', e.target.value)}
                                                        inputProps={{ inputMode: 'decimal', pattern: '^[0-9]{0,3}(\\.[0-9]{0,3})?$' }}
                                                        {...commonTextFieldProps}
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className='secondaryBtnClassname'>Cancel</Button>
                <Button
                    onClick={onConfirmSplit}
                    variant="contained"
                    className='buttonClassname'
                    disabled={isTotalHoursExceeded || numberOfDaysToSplit === 0 || !selectedTask}
                >
                    Confirm Split
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SplitTaskModal;
