import React from 'react';
import { Autocomplete, TextField, Typography, Box, Checkbox, ListItemText } from '@mui/material';
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
  width = '100%',
  error = false,
  helperText = '',
  // multi-select support: returns an array of getOptionLabel strings
  multiple = false,
  limitTags = 2,
  // 'id' (default): match/return option.id — 'label': match/return getOptionLabel
  valueMode = 'id',
  // popper portal — default keeps old behavior; set false when parent clips (drawer)
  disablePortal = true,
}) => {
  const optionLabelOf = (opt) => getOptionLabel(opt);

  const resolvedValue = multiple
    ? (options || []).filter((opt) => (Array.isArray(value) ? value : []).includes(optionLabelOf(opt)))
    : valueMode === 'label'
      ? (options || []).find((opt) => optionLabelOf(opt) === value) || null
      : options?.find((opt) => opt.id === value) || null;

  return (
    <Box className="form-group">
      <Typography className="form-label" variant="subtitle1">
        {label}
      </Typography>
      <Autocomplete
        disablePortal={disablePortal}
        size='small'
        id={`autocomplete-${name}`}
        options={options || []}
        getOptionLabel={getOptionLabel}
        multiple={multiple}
        disableCloseOnSelect={multiple || undefined}
        limitTags={limitTags}
        isOptionEqualToValue={(a, b) =>
          valueMode === 'label' || multiple
            ? optionLabelOf(a) === optionLabelOf(b)
            : a?.id === b?.id
        }
        {...(multiple && {
          renderOption: (props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                checked={selected}
                sx={{ p: 0.5, mr: 0.5, color: '#7367f0', '&.Mui-checked': { color: '#7367f0' } }}
                size="small"
              />
              <ListItemText primary={optionLabelOf(option)} />
            </li>
          ),
        })}
        value={resolvedValue}
        onChange={(event, newValue) => {
          if (multiple) {
            onChange({ target: { name, value: (newValue || []).map(optionLabelOf) } });
          } else if (valueMode === 'label') {
            onChange({ target: { name, value: newValue ? optionLabelOf(newValue) : '' } });
          } else {
            onChange({ target: { name, value: newValue?.id || '' } });
          }
        }}
        {...commonTextFieldProps}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            inputRef={refProp}
            variant="outlined"
            sx={{ width: width}}
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
