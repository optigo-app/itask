import React from 'react';
import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import { commonTextFieldProps } from '../../Utils/globalfun';

const CustomAutocomplete = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  getOptionLabel = (option) => option?.labelname || '',
  disabled = false,
  refProp,
  error = false,
  helperText = '',
}) => {
  return (
    <Box className="form-group">
      <Typography className="form-label" variant="subtitle1">
        {label}
      </Typography>
      <Autocomplete
        disablePortal
        size='small'
        id={`autocomplete-${name}`}
        options={options || []}
        getOptionLabel={getOptionLabel}
        value={options?.find((opt) => opt.id === value) || null}
        onChange={(event, newValue) => {
          onChange({ target: { name, value: newValue?.id || '' } });
        }}
        {...commonTextFieldProps}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            inputRef={refProp}
            variant="outlined"
            fullWidth
            error={error}
            helperText={helperText}
          />
        )}
        disabled={disabled}
      />
    </Box>
  );
};

export default CustomAutocomplete;
