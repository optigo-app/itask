import React, { useState } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';

const MultiSelectWithHoverStyle = () => {
  const options = [
    { label: 'Apple', id: 1 },
    { label: 'Banana', id: 2 },
    { label: 'Cherry', id: 3 },
    { label: 'Date', id: 4 },
    { label: 'Grapes', id: 5 },
    { label: 'Orange', id: 6 },
  ];

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (event, newValue) => {
    setSelectedOptions(newValue);
  };

  return (
    <Box sx={{ width: 400, margin: 'auto', paddingTop: '2rem' }}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        getOptionLabel={(option) => option.label}
        value={selectedOptions}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => handleChange(event, newValue)}
        limitTags={2} // Limits the displayed tags; excess are shown as "+n"
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            style={{
              fontWeight: selected ? 'bold' : 'normal',
              backgroundColor: selected
                ? 'rgba(0, 0, 255, 0.1)' // Selected option background
                : 'transparent',
              cursor: 'pointer', // Pointer cursor on hover
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = selected
                ? 'rgba(0, 0, 255, 0.3)' // Hover + selected
                : 'rgba(0, 0, 0, 0.05)'; // Hover only
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selected
                ? 'rgba(0, 0, 255, 0.1)' // Selected (remove hover)
                : 'transparent'; // Default (remove hover)
            }}
          >
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Select Fruits"
            placeholder="Select multiple options"
          />
        )}
      />
    </Box>
  );
};

export default MultiSelectWithHoverStyle;
