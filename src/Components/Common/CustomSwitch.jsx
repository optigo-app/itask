import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const IOSSwitch = styled(Switch)(({ theme, switchcolor }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: switchcolor || '#7367f0',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? '#f3f4f6' : '#374151',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    backgroundColor: '#fff',
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#e9e9ea' : '#39393d',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  },
}));

const CustomSwitch = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  color = '#7367f0',
  labelPlacement = 'end',
  ...props
}) => {
  if (label) {
    return (
      <FormControlLabel
        control={
          <IOSSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            switchcolor={color}
            {...props}
          />
        }
        label={label}
        labelPlacement={labelPlacement}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontSize: '14px',
            fontWeight: 500,
            color: disabled ? 'text.disabled' : 'text.primary',
          },
        }}
      />
    );
  }

  return (
    <IOSSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      switchcolor={color}
      {...props}
    />
  );
};

export default CustomSwitch;
