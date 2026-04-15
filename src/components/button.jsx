import Button from '@mui/material/Button';
import React from "react";

export default function MyButton({name}) {
  return <Button variant="contained" color="inherit" style={{ backgroundColor: 'black', color: 'white' }}>{name}</Button>;
}