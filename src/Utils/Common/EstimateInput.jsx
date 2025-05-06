import React, { useState, useEffect } from "react";
import { Grid, TextField, Box } from "@mui/material";

const EstimateInput = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        // Allow only numbers and decimal
        if (!/^\d*\.?\d*$/.test(newValue)) return;
        const numericValue = parseFloat(newValue);
        if (newValue !== "" && (isNaN(numericValue) || numericValue <= 0)) return;
        setInputValue(newValue);
        onChange(newValue);
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
                        inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default EstimateInput;
