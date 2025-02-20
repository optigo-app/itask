import React, { useState, useRef, useEffect } from "react";
import { Grid, TextField, IconButton, Box } from "@mui/material";
import { Minus, Plus } from "lucide-react";

const MultiLineInput = ({ onChanges }) => {
    const [values, setValues] = useState([""]);
    const inputRefs = useRef([]);
    const maxInputs = 50;

    // Function to add a new field and focus on it
    const addField = () => {
        if (values.length < maxInputs) {
            setValues((prev) => {
                const newValues = [...prev, ""];
                return newValues;
            });

            setTimeout(() => {
                const lastIndex = inputRefs.current.length - 1;
                inputRefs.current[lastIndex]?.focus();
            }, 100);
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
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="textfieldsClass"
                        />
                    </Grid>
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
                </Grid>
            ))}
        </Box>
    );
};

export default MultiLineInput;
