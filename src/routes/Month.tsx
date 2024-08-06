import { Alert, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, styled } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { calcDayKey, setDayInOffice, setUserData, state } from '../firestore'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { Dayjs } from 'dayjs'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import { runInAction } from 'mobx'

const calcBackgroundColor = (count: number, max: number) => {
  if (!count || !max || count < max - 1) return '#66bb6a'
  if (count < max) return '#ffa726'
  return '#f44336'
}

const Count = styled('div')(({ theme }) => ({
  position: 'absolute',
  textAlign: 'center',
  borderRadius: 9,
  lineHeight: '18px',
  fontSize: '12px',
  fontWeight: 'bold',
  width: 18,
  height: 18,
  color: theme.palette.primary.contrastText,
  backgroundColor: 'rgba(255,255,255,0.1)',
  bottom: -2,
  right: -2,
  userSelect: 'none',
  pointerEvents: 'none',
}))

const Day: React.FC<PickersDayProps<Dayjs>> = observer(({ day, ...other }) => {
  const dayKey = calcDayKey(day)
  const weekDay = day.day() !== 0 && day.day() !== 6
  const isActive = !!state.userDays[dayKey]
  const count = state.daysTableCounts[dayKey]?.[state.tableName]
  const countMax = state.spaceData.tableNameCounts[state.tableName]
  return <div style={{ position: 'relative' }}><PickersDay
    {...other}
    day={day}
    disabled={other.disabled || !weekDay}
    selected={isActive}
  />
    {weekDay && <Count
      style={{ backgroundColor: calcBackgroundColor(count, countMax) }}
    >
      {count}
    </Count>}
  </div>
})

const Month: React.FC = observer(() => {
  return (<>
    <Typography component='h1' variant='h5'>
      Office days
    </Typography>
    {state.tableName ?
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          onChange={(day) => setDayInOffice(day, state.userDays[calcDayKey(day)] ? null : state.tableName)}
          showDaysOutsideCurrentMonth
          displayWeekNumber
          slots={{ day: Day }}
          disablePast
          dayOfWeekFormatter={(day) => day.format('dd')}
          onMonthChange={(date) => runInAction(() => state.loadParams = { type: 'month', year: date.year(), month: date.month() })}
          views={['day']}
        />
      </LocalizationProvider>
      : <Typography variant='body1'>Please select a table to continue</Typography>
    }
    <TablePicker />
    {state.tableName && <Box marginTop={2}>
      <Alert severity='info'>
        Click on a day to toggle your presence in the office.
      </Alert>
      <Alert severity='info'>
        The number in the bottom right corner of each day shows how many people are already on your selected table.
      </Alert>
      <Alert severity='info'>
        The color indicates if there are still free seats (green), only one seat left (orange), or no more seats available (red) - overbooking is allowed.
      </Alert>
    </Box>}
  </>)
})

const TablePicker: React.FC = observer(() => {
  const handleChange = (event: SelectChangeEvent) => {
    setUserData({ tableName: event.target.value })
  }

  return <FormControl variant='standard' size='small' sx={{ m: 1, minWidth: 120 }}>
    <InputLabel id='table-label'>Table</InputLabel>
    <Select
      labelId='table-label'
      id='table'
      value={state.tableName}
      label='Table'
      onChange={handleChange}
    >
      {Object.entries(state.spaceData.tableNameCounts).map(([tableName, count]) =>
        <MenuItem key={tableName} value={tableName}>{tableName} ({count} Seats)</MenuItem>
      )}
    </Select>
  </FormControl>
})

export default Month