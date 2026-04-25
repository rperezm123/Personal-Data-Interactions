import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#141920',
      paper: '#1c2330',
    },
    text: {
      primary: '#e8edf5',
      secondary: '#6b7a99',
    },
  },
});

export default function BasicDateCalendar({ onDateChange }) {
  const [value, setValue] = React.useState(() => dayjs());

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            if (newValue && onDateChange) {
              onDateChange(newValue.format('YYYY-MM-DD'));
            }
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
