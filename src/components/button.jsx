import Button from '@mui/material/Button';
import React from "react";

export default function MyButton({ name, type = "button", ...rest }) {
  return (
    <Button
      type={type}
      variant="contained"
      color="inherit"
      style={{ backgroundColor: 'black', color: 'white' }}
      {...rest}
    >
      {name}
    </Button>
  );
}