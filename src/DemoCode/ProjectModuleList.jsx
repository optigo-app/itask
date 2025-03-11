import React, { useState } from "react";
import { Card, CardHeader, CardContent, TextField, List, ListItem, Typography } from "@mui/material";
import "./ProjectModuleList.scss"; // SCSS file for styling
import { commonTextFieldProps } from "../Utils/globalfun";

const ProjectModuleList = ({ selectedModule, handleModuleClick }) => {
    // Sample Data - Realistic Project Modules
    const allModules = [
        "OptigoApps",
        "Simplification",
        "OptigoApp",
        "Ecom Website",
        "Hello App",
        "Admin App",
        "SalesRep App",
        "ProTransaction",
        "ProQC",
        "ProCasting",
        "iTask",
        "Print",
        "Excel",
    ];

    // State for search input
    const [searchTerm, setSearchTerm] = useState("");

    const filteredModules = allModules.filter((module) =>
        module.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="project-module-box">
            <Typography variant="h6" className="project-label">Project Modules</Typography>
            <Card className="module-card">
                <CardHeader
                    className="card-header"
                    title={
                        <TextField
                            variant="outlined"
                            placeholder="Search..."
                            size="small"
                            {...commonTextFieldProps}
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    }
                />
                <CardContent className="card-content">
                    <List className="module-list">
                        {filteredModules.length > 0 ? (
                            filteredModules.map((module, index) => (
                                <ListItem
                                    key={index}
                                    className={`module-item ${selectedModule === module ? "selected" : ""}`}
                                    onClick={() => handleModuleClick(module)}
                                >
                                    {module}
                                </ListItem>
                            ))
                        ) : (
                            <Typography className="no-results">No matching modules found</Typography>
                        )}
                    </List>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProjectModuleList;
