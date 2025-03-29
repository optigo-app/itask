import React, { useState, useEffect } from "react";
import { Grid, TextField, Box } from "@mui/material";

const EstimateInput = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
        setInputValue(value || ""); // Update if external value changes
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue); // Pass updated value to parent
    };

    return (
        <Box>
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Estimate"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="textfieldsClass"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default EstimateInput;
