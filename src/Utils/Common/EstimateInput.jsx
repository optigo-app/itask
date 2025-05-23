import React, { useState, useEffect } from "react";
import { Grid, TextField, Box } from "@mui/material";

const EstimateInput = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(
        value && value > 0 ? value.toString() : ""
    );

    useEffect(() => {
        setInputValue(value && value > 0 ? value.toString() : "");
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (!/^\d{0,2}(\.\d{0,2})?$/.test(newValue)) return;
        setInputValue(newValue);
    
        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue) && numericValue > 0) {
            onChange(numericValue);
        } else {
            onChange("");
        }
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
                        inputProps={{
                            inputMode: "decimal",
                            pattern: "^\\d*\\.?\\d{0,2}$"
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default EstimateInput;
