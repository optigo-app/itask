import React from 'react';
import './SplitTaskDialog.scss';
import {
    Drawer,
    Button,
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
    IconButton,
    Chip,
} from '@mui/material';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { commonTextFieldProps } from '../../Utils/globalfun';
import { CircleX } from 'lucide-react';

const SplitTaskDrawer = ({
    open,
    onClose,
    selectedTask,
    numberOfDaysToSplit,
    onNumberOfDaysToSplitChange,
    splitParts,
    onSplitPartChange,
    onConfirmSplit,
    totalSplitHours,
    handleAutoSplit
}) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const isTotalHoursExceeded = totalSplitHours > selectedTask?.estimate_hrs;

    return (
        <Drawer anchor="right" open={open} onClose={onClose} className="muiDrawerRight">
            <Box className="muiDrawerBox">
                <Box className="muiheadBox">
                    <Typography variant="h6">Split Task: {selectedTask?.taskname}</Typography>
                    <IconButton
                        onClick={onClose}
                    >
                        <CircleX />
                    </IconButton>
                </Box>
                <Box className="drawerContentBox">
                    <Box className="muispitDBox">
                        <Box className="form-group">
                            <Typography variant="subtitle1" className="form-label">
                                Split Days
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Number of Days to Split"
                                type="number"
                                value={numberOfDaysToSplit === 0 ? '' : numberOfDaysToSplit}
                                onChange={onNumberOfDaysToSplitChange}
                                {...commonTextFieldProps}
                            />
                        </Box>
                        <Chip
                            label={`Estimate: ${selectedTask?.estimate_hrs} hr`}
                            sx={{
                                backgroundColor: '##685dd87a',
                                color: '#fff',
                                fontWeight: 'bold',
                                padding: '8px',
                            }}
                            {...commonTextFieldProps}
                        />

                    </Box>
                    <Box className="muiTimeEstimateBox">
                        <Typography
                            variant="body1"
                            gutterBottom
                            color={isTotalHoursExceeded ? 'error' : 'textPrimary'}
                        >
                            Total Split Hours: <strong>{totalSplitHours} hr</strong>
                            {isTotalHoursExceeded && (
                                <span style={{ marginLeft: '8px', color: 'red' }}>
                                    (Exceeds original estimate!)
                                </span>
                            )}
                        </Typography>
                        <Button
                            size='small'
                            variant="outlined"
                            color="secondary"
                            onClick={handleAutoSplit}
                            className="buttonClassname"
                        >
                            Auto Split
                        </Button>
                    </Box>

                    {numberOfDaysToSplit > 0 && (
                        <Box className="tableCBox">
                            <TableContainer component={Paper} sx={{ mt: 2 }} className="tableContainer">
                                <Table className="muiTable">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Start Date & Time</strong></TableCell>
                                            <TableCell><strong>End Date & Time</strong></TableCell>
                                            <TableCell><strong>Hours</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {splitParts?.map((part, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <CustomDateTimePicker
                                                        label={`Part ${index + 1} Start`}
                                                        value={part.startDate ? dayjs(part.startDate).tz("Asia/Kolkata", true).local() : null}
                                                        onChange={(newValue) => onSplitPartChange(index, 'startDate', newValue)}
                                                        width="100%"
                                                        styleprops={commonTextFieldProps}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <CustomDateTimePicker
                                                        label="End (Auto)"
                                                        value={part.endDate ? dayjs(part.endDate).tz("Asia/Kolkata", true).local() : null}
                                                        width="100%"
                                                        styleprops={commonTextFieldProps}
                                                    />
                                                </TableCell>
                                                <TableCell width={100}>
                                                    <Box className="form-group">
                                                        <Typography variant="subtitle1" className="form-label">
                                                            Split Hours
                                                        </Typography>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            fullWidth
                                                            value={part.hours}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^\d*\.?\d*$/.test(value)) {
                                                                    onSplitPartChange(index, "hours", value);
                                                                }
                                                            }}
                                                            className="textfieldsClass"
                                                        />
                                                        {/* <TextField
                                                            placeholder="Enter hrs"
                                                            value={part.hours}
                                                            onChange={(e) => onSplitPartChange(index, 'hours', e.target.value)}
                                                            type="number"
                                                            inputProps={{
                                                                step: ".1",
                                                                min: "",
                                                            }}
                                                            fullWidth
                                                            {...commonTextFieldProps}
                                                        /> */}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Box>

                <Box className="drawerFooter">
                    <Button onClick={onClose} className="secondaryBtnClassname">
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirmSplit}
                        variant="contained"
                        className="buttonClassname"
                        disabled={isTotalHoursExceeded || numberOfDaysToSplit === 0 || !selectedTask}
                    >
                        Confirm Split
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default SplitTaskDrawer;
