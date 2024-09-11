import React from "react";
import TextField from "@mui/material/TextField";

const CustomTextField = ({
  id,
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
  autoFocus,
}) => {
  return (
    <TextField
      id={id}
      label={label}
      type={type}
      variant="outlined"
      margin="normal"
      required={required}
      fullWidth
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
    />
  );
};

export default CustomTextField;
