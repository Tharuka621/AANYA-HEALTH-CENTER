import React from 'react';
import {
  TextField,
  TextFieldProps as MuiTextFieldProps,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps
} from '@mui/material';

interface FormInputProps extends Omit<MuiTextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  helperText?: string;
  error?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  variant = 'outlined',
  startIcon,
  endIcon,
  helperText,
  error,
  ...props
}) => {
  return (
    <TextField
      variant={variant}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : undefined,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : undefined,
      }}
      {...props}
    />
  );
};

interface FormSelectProps extends Omit<MuiSelectProps, 'variant'> {
  label: string;
  options: Array<{ value: string | number; label: string }>;
  helperText?: string;
  error?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  helperText,
  error,
  variant = 'outlined',
  ...props
}) => {
  return (
    <FormControl variant={variant} error={error} fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} {...props}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormInput;

