import { Alert, Box, FormControl, InputLabel, Link, MenuItem, Select, SelectChangeEvent, Stack, Typography, styled } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { calcDayKey, setDayInOffice, setUserData, state, TEAM_KEY } from '../firestore'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { Dayjs } from 'dayjs'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import { runInAction } from 'mobx'
import { size } from '../utils/size'
import { Link as RouterLink } from 'react-router-dom'

const calcBackgroundColor = (count: number, max: number) => {
  if (!count || !max || count < max - 1) return '#66bb6a'
  if (count < max) return '#ffa726'
  return '#f44336'
}

const countBubbleStyle: React.CSSProperties = {
  textAlign: 'center',
  borderRadius: 9,
  lineHeight: '15px',
  fontSize: '11px',
  fontWeight: 'bold',
  width: 14,
  height: 14,
}

const ColorBubble = styled('div')(({ theme }) => ({
  ...countBubbleStyle,
  display: 'inline-block',
  transform: 'scale(1.4)',
  margin: '0 3px',
  color: theme.palette.primary.contrastText,
}))

const Count = styled('div')(({ theme }) => ({
  ...countBubbleStyle,
  position: 'absolute',
  color: theme.palette.primary.contrastText,
  backgroundColor: 'rgba(255,255,255,0.1)',
  bottom: -2,
  userSelect: 'none',
  pointerEvents: 'none',
}))

const Day: React.FC<PickersDayProps<Dayjs>> = observer(({ day, ...other }) => {
  const dayKey = calcDayKey(day)
  const weekDay = day.day() !== 0 && day.day() !== 6
  const isActive = !!state.userDays[dayKey]
  const count = state.daysTableCounts[dayKey]?.[state.tableName]
  const countMax = state.spaceData.tableNamesSeats[state.tableName]
  return <div style={{ position: 'relative' }}><PickersDay
    {...other}
    day={day}
    disabled={other.disabled || !weekDay}
    selected={isActive}
  />
    {weekDay && <Count
      style={{
        backgroundColor: calcBackgroundColor(count, countMax),
        opacity: other.disabled ? 0.4 : 1,
        right: 2,
      }}
    >
      {count}
    </Count>}
    {state.teamUIds && weekDay && <Count
      style={{
        backgroundColor: '#6093e6',
        opacity: other.disabled ? 0.6 : 1,
        left: 2,
      }}
    >
      {state.daysTableCounts[dayKey]?.[TEAM_KEY]}
    </Count>}
  </div>
})

const Month: React.FC = observer(() => {
  const ref = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) {
      const scale = Math.min(size.width / 350, 2)
      ref.current.style.transform = `scale(${scale})`
      ref.current.style.margin = `${130 * (scale - 1)}px`
    }
  }, [ref, size.width])

  return (<>
    <Typography component='h1' variant='h5'>
      Office days
    </Typography>
    {!state.tableName &&
      <Typography variant='body1'>
        Please select a table to continue
      </Typography>
    }
    {state.tableName &&
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
          ref={ref}
        />
      </LocalizationProvider>
    }
    <Stack direction="row" spacing={2}>
      <TablePicker />
      <TeamInfo />
    </Stack>
    {state.tableName && <Box marginTop={2}>
      <Alert severity='info'>
        Click on a day to toggle your presence in the office.
      </Alert>
      <Alert severity='info'>
        <ColorBubble style={{ backgroundColor: calcBackgroundColor(0, 2) }}>X</ColorBubble> = X seats on the table are already taken<br />
        {state.teamUIds && <><ColorBubble style={{ backgroundColor: '#6093e6' }}>Y</ColorBubble> = Y team members are in the office (self included)<br /></>}
      </Alert>
      <Alert severity='info'>
        <ColorBubble style={{ backgroundColor: calcBackgroundColor(0, 2) }} /> free seats at the currently selected table<br />
        <ColorBubble style={{ backgroundColor: calcBackgroundColor(1, 2) }} /> only one seat left<br />
        <ColorBubble style={{ backgroundColor: calcBackgroundColor(2, 2) }} /> no more seats available (red) - overbooking is allowed
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
      {Object.entries(state.spaceData.tableNamesSeats).map(([tableName, count]) =>
        <MenuItem key={tableName} value={tableName}>{tableName} ({count} Seats)</MenuItem>
      )}
    </Select>
  </FormControl>
})

const TeamInfo: React.FC = observer(() => {
  return <Stack>
    <Typography variant='body1'>Team Members: {state.teamUIds?.length ?? 0}</Typography>
    <Typography variant='caption'><RouterLink to='../team'><Link>click here to edit</Link></RouterLink></Typography>
  </Stack>
})

export default Month