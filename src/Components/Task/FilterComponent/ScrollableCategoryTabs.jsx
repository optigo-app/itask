import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import "./ScrollableCategoryTabs.scss";

const ScrollableCategoryTabs = ({ taskCategory = [], selectedCategory, handleFilterChange }) => {
  const filteredCategories = taskCategory.filter((category) => category.count > 0);
  const shouldScroll = filteredCategories.length > 6;

  return (
    <Box className="scrollable-tabs-container">
      <Tabs
        value={false}
        onChange={(event, newValue) => handleFilterChange("category", newValue)}
        variant={shouldScroll ? "scrollable" : "standard"}
        scrollButtons={shouldScroll ? "auto" : false}
        allowScrollButtonsMobile
        className="scrollable-tabs"
        aria-label="task category tabs"
      >
        {filteredCategories.map((category) => (
          <Tab
            key={category.id}
            label={`${category.labelname} (${category.count})`}
            value={category.labelname}
            className={selectedCategory?.includes(category.labelname) ? "active-tab" : "tab-item"}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ScrollableCategoryTabs;
