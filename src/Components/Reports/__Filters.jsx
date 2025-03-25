import React from "react";
import { Box, TextField, InputAdornment, Tooltip, IconButton, Button } from "@mui/material";
import { ChevronsDown, SearchIcon } from "lucide-react";

const Filters = ({ filterShow, setFilterShow, filters, timeRangeButtons, handleFilterChange }) => {

    const handleFilterDrOpen = () => {
        setFilterShow(!filterShow);
    }

    return (
        <Box className="reports_filterMainBox">
            <Box className="reports_filterBox">
                {timeRangeButtons.map((button) => (
                    <Button
                        key={button.value}
                        variant="contained"
                        onClick={() => handleFilterChange("timeRange", button.value)}
                        className={`reports_categoryBtn ${filters?.timeRange === button.value ? 'active' : ''}`}
                    >
                        {button.label}
                    </Button>
                ))}
                <Tooltip
                    placement="top"
                    title="Filter tasks"
                    arrow
                    classes={{ tooltip: 'custom-tooltip' }}
                >
                    <IconButton
                        aria-label="Filter tasks"
                        onClick={handleFilterDrOpen}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: filterShow ? '#ffd700' : 'white',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                            }
                        }}
                    >
                        <ChevronsDown size={20} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <TextField
                    placeholder="Search tasks..."
                    value={filters?.searchTerm}
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    size="small"
                    className="textfieldsClass"
                    sx={{
                        minWidth: 250,
                        "@media (max-width: 600px)": { minWidth: "100%" },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
                            </InputAdornment>
                        ),
                    }}
                    aria-label='Search tasks...'
                />
            </Box>
        </Box>
    );
};

export default Filters;
