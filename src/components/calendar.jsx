import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export default function BasicDateCalendar({ onDateChange }) {
  const [value, setValue] = React.useState(dayjs('2026-04-07'));

  return (
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
  );
}
