import React, { useState } from "react";
import { Grid, TextField, IconButton, Box } from "@mui/material";
import { Minus, Plus } from "lucide-react";

const EstimateInput = ({ onChanges, hideBtn }) => {
    console.log('hideBtn: ', hideBtn);
    const [values, setValues] = useState([""]);
    const maxInputs = 3;

    // Function to add a new field
    const addField = () => {
        if (values.length < maxInputs) {
            setValues([...values, ""]);
        }
    };

    // Function to handle input change
    const handleChange = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
        onChanges(newValues);
    };

    // Function to remove an input field
    const removeField = (index) => {
        const newValues = values.filter((_, i) => i !== index);
        setValues(newValues);
        onChanges(newValues);
    };

    return (
        <Box>
            {values.map((value, index) => (
                <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
                    <Grid item xs={10}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="textfieldsClass"
                        />
                    </Grid>
                    {hideBtn &&
                        <Grid item xs={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                            {/* Add Button (Only on last input) */}
                            {index === values.length - 1 && values.length < maxInputs && (
                                <IconButton onClick={addField} color="primary">
                                    <Plus color="#444050" />
                                </IconButton>
                            )}
                            {/* Remove Button (Always visible except for the first input) */}
                            {index !== values.length - 1 && values.length > 1 && (
                                <IconButton onClick={() => removeField(index)} color="error">
                                    <Minus />
                                </IconButton>
                            )}
                        </Grid>
                    }
                </Grid>
            ))}
        </Box>
    );
};

export default EstimateInput;
