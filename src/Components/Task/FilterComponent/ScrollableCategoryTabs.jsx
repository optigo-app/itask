import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import "./ScrollableCategoryTabs.scss";

const ScrollableCategoryTabs = ({ taskCategory = [], selectedCategory, handleFilterChange }) => {
    const shouldScroll = taskCategory.length > 8;
    const selectedValue = taskCategory.some(cat => cat.labelname === selectedCategory) ? selectedCategory : false;

    return (
        <Box className="scrollable-tabs-container">
            <Tabs
                value={selectedValue}
                onChange={(event, newValue) => handleFilterChange("category", newValue)}
                variant={shouldScroll ? "scrollable" : "standard"}
                scrollButtons={shouldScroll ? "auto" : false}
                allowScrollButtonsMobile
                className="scrollable-tabs"
                aria-label="task category tabs"
            >
                {taskCategory.map((category) => (
                    <Tab
                        key={category.id}
                        label={category.labelname}
                        value={category.labelname}
                        className={selectedCategory === category.labelname ? "active-tab" : "tab-item"}
                    />
                ))}
            </Tabs>
        </Box>
    );
};

export default ScrollableCategoryTabs;
