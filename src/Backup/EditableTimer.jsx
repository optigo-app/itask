import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";

const EditableTimer = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [time, setTime] = useState("00:30"); // Default time for testing

    const handleChange = (event) => {
        setTime(event.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        console.log("Updated time:", time);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleBlur();
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            {isEditing ? (
                <TextField
                    value={time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    autoFocus
                    sx={{ fontSize: "30px", width: "100px" }}
                />
            ) : (
                <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontSize: "30px", cursor: "pointer" }}
                    onClick={() => setIsEditing(true)}
                >
                    {time}
                </Typography>
            )}
        </div>
    );
};

export default EditableTimer;
